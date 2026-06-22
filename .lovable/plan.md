
# Student Verification + Chat Gate — Implementation Plan

## 1. Database migrations

### 1a. Extend `profiles`
Add columns:
- `verified boolean NOT NULL DEFAULT false`
- `verification_method text` — CHECK in (`'email_domain'`, `'acceptance_letter'`, NULL)
- `verification_date timestamptz`
- `university_email text` (citext-style: store lowercased; separate from `auth.users.email`)
- `university_email_verified_at timestamptz`

Constraint: `CREATE UNIQUE INDEX profiles_university_email_verified_uniq ON profiles(lower(university_email)) WHERE university_email_verified_at IS NOT NULL` — prevents the same uni email verifying two accounts, while letting unverified attempts coexist.

### 1b. `university_domains` (editable allowlist)
```text
id uuid pk
base_domain text not null unique   -- stored lowercased, no '@', e.g. 'polimi.it'
tier int not null default 1
notes text
created_at, updated_at
```
- GRANTs: `SELECT` to `authenticated` (read needed by verify edge fn via service role anyway; keeping authenticated SELECT lets us also use it from client if useful, but plan is server-side only — so we can restrict to service_role only). Final choice: **service_role only + admins via has_role**. No anon.
- RLS: enable; policy `admins manage` via `has_role(auth.uid(),'admin')` for all ops. No authenticated read needed (verify runs in edge fn with service role).
- Seed list: user will provide separately; insert via `supabase--insert` later.

### 1c. `verification_otps` (server-side OTP store)
```text
id uuid pk
user_id uuid not null references auth.users on delete cascade
university_email text not null    -- lowercased
code_hash text not null            -- sha256 of 6-digit code + per-row salt
salt text not null
expires_at timestamptz not null    -- now() + 10 min
attempts int not null default 0    -- max 5
consumed_at timestamptz
created_at timestamptz default now()
```
- Index on `(user_id, created_at desc)` for rate-limit lookups.
- RLS enabled; **no policies** → only service role (edge function) touches it. GRANT to service_role only.
- Validation rule enforced in edge fn (not CHECK): expiry, attempts, rate limit (max 3 OTPs / 15 min per user, 30s resend cooldown).

### 1d. `verification_submissions` (Tier-2 review queue)
```text
id uuid pk
user_id uuid not null references auth.users on delete cascade
file_path text not null            -- storage path in user-documents bucket
status text not null default 'pending'  -- 'pending' | 'approved' | 'rejected'
reviewed_by uuid references auth.users
reviewed_at timestamptz
reject_reason text
created_at timestamptz default now()
```
- One pending per user: `CREATE UNIQUE INDEX ON verification_submissions(user_id) WHERE status='pending'`.
- GRANTs: `SELECT, INSERT` to authenticated (own row), `ALL` to service_role.
- RLS:
  - `own insert`: `auth.uid() = user_id` (insert + select own).
  - `own select`: `auth.uid() = user_id`.
  - `admins all`: `has_role(auth.uid(),'admin')`.

### 1e. profiles RLS tweak
Existing self-update policy already covers it, but explicitly block the user from setting `verified`, `verification_method`, `verification_date`, `university_email_verified_at` themselves. Two options — pick **B** for simplicity:
- A) column-level GRANTs (revoke UPDATE on those columns from authenticated).
- B) keep all writes in edge functions using service role; client `profiles` UPDATE policy stays as-is but we trust client only for non-sensitive fields. Add a BEFORE UPDATE trigger that, when `auth.uid() = id` (not service_role), reverts changes to the four protected columns. **Chosen: B (trigger guard)** — least disruption to existing UI updates of profile.

## 2. Storage
Reuse the existing private `user-documents` bucket.
- New path convention: `verification/{user_id}/{timestamp}-{rand}.{ext}` (10MB, pdf/jpg/png — same validator as `useDocumentUploads`).
- RLS on `storage.objects`:
  - Owner can `INSERT`/`SELECT`/`DELETE` their own files under `verification/{auth.uid()}/...` (path prefix check via `split_part(name,'/',2) = auth.uid()::text AND split_part(name,'/',1) = 'verification'`).
  - Admins (`has_role`) can `SELECT` + `DELETE` any `verification/...` file.
  - No public select.
- Hard rule: this is the ONLY upload surface for verification. Existing document-upload feature stays untouched.

## 3. Edge functions

### 3a. `verify-send-otp` (POST, JWT-validated)
Input: `{ university_email }`.
Logic:
1. Validate JWT → user.
2. zod-validate email (lowercased, max 254 chars).
3. Rate-limit: count rows in `verification_otps` for this user in last 15 min; reject if ≥3. Resend cooldown 30s.
4. Reject if `university_email` is already verified by ANOTHER user (query unique index target).
5. Generate 6-digit code (`crypto.getRandomValues`), 16-byte salt, store `sha256(code+salt)`. `expires_at = now()+10min`.
6. Invoke transactional email (see 3b) with code.
7. Return `{ ok: true, expires_at }`. Never return the code.

### 3b. `send-verification-email` (internal, called by 3a; swappable provider)
- Single-purpose edge fn so the provider/SMTP can be swapped without touching verify logic.
- Phase 1 (no provider yet): write to `email_outbox` table OR just `console.log` the rendered email so we can test the full flow. Plan adds a tiny `email_outbox(id, to, subject, body, created_at)` table (service_role only) so QA can read sent codes during dev.
- Phase 2 (when provider live): swap body of function to call Lovable Emails / Resend / Mailgun. **Recommend Lovable Emails** via `scaffold_transactional_email` + a `verification-code` template; the swap is just replacing the dev outbox write with `supabase.functions.invoke('send-transactional-email', ...)`. No callers change.
- Risk: arbitrary recipient email — bounces affect sender reputation. Mitigation: format check + MX optional later + rate limits + suppression list (Lovable Emails already handles suppression).

### 3c. `verify-confirm-otp` (POST, JWT-validated)
Input: `{ university_email, code }`.
Logic:
1. JWT → user. Lowercase email.
2. Load latest non-consumed OTP for `(user_id, university_email)` not expired. If missing → 400 `expired_or_missing`.
3. If `attempts >= 5` → 429 `too_many_attempts`.
4. Increment `attempts`. Compare `sha256(code+salt)` to `code_hash` in constant time. On mismatch → 400 `invalid_code`.
5. On match: mark `consumed_at=now()`. UPDATE profile via service role: `university_email = lower(email)`, `university_email_verified_at = now()`.
6. **Tier-1 auto-check**: extract suffix after `@`. Query `university_domains` and check `WHERE lower($1) LIKE '%.' || base_domain OR lower($1) = base_domain`. Use suffix-match: `right(domain, length(base_domain)+1) IN ('.'||base, base)` (effectively `endsWith` while preventing `evilpolimi.it` matching `polimi.it`). If matched → set `verified=true, verification_method='email_domain', verification_date=now()`.
7. Return `{ verified: boolean, requires_tier2: boolean }`.

### 3d. `verify-submit-letter` (POST, JWT-validated)
Input: `{ file_path }` (client uploads via supabase-js to `verification/{uid}/...` first, then calls this).
Logic:
1. JWT → user. Confirm path starts with `verification/{user.id}/`.
2. Confirm file exists in storage (head object).
3. Insert row into `verification_submissions` (pending). Unique index prevents duplicates → return existing if conflict.
4. Return `{ submission_id }`.
Note: we could do the upload inside the edge fn for stricter control, but signed-URL upload + post-confirm is simpler. The unique-pending index + path-prefix RLS prevents abuse.

### 3e. `verify-admin-decide` (POST, admin only)
Input: `{ submission_id, decision: 'approve'|'reject', reject_reason? }`.
Logic:
1. JWT → user; assert `has_role(uid,'admin')`.
2. Load submission (pending only).
3. If approve: UPDATE profile (`verified=true, verification_method='acceptance_letter', verification_date=now()`).
4. If reject: leave profile unverified; store `reject_reason`.
5. **In both cases**: `storage.from('user-documents').remove([file_path])` then UPDATE submission set status+reviewed_by+reviewed_at and `file_path = ''` (or NULL — make column nullable post-decision). GDPR: letter deleted at rest within the same transaction-equivalent flow.
6. Return `{ ok: true }`.
Risk: storage delete could fail after profile update → orphan. Mitigation: delete file FIRST, only then update DB; if DB update fails, log and admin can retry (file already gone, which is the safer failure mode).

### 3f. `send-chat-message` (existing) — add gate
Before insert, fetch caller's `profiles.verified`. If false → 403 `not_verified`. Mirror in `toggle-reaction` so unverified users can't react either.

## 4. Frontend

### 4a. New page: `src/pages/Verify.tsx`
3-step wizard inside the standard `<Card>` container:
1. **Email step**: input university email (separate, with helper "this can differ from your login email"). Calls `verify-send-otp`. Shows 30s resend cooldown + remaining attempts.
2. **Code step**: 6-digit OTP input (use existing `ui/input-otp.tsx`). Calls `verify-confirm-otp`. On success → if `verified` go to success screen with "Continue to chat"; else go to step 3.
3. **Letter step**: file dropzone (reuse logic from `useDocumentUploads` but pointed at `verification/...` path — no DB row in `document_uploads`). After upload, calls `verify-submit-letter`. Shows "Pending review — usually <48h" state.

Wired into routing in `src/App.tsx` as `/verify` behind `OnboardingGate` (signed-in only; onboarding completed not required — or required, decision: **require onboarding completed** since we need profile fields).

### 4b. `useVerification` hook
- Reads `profiles.verified`, `verification_method`, latest `verification_submissions` (pending?).
- Used by chat gate and Verify page.

### 4c. Chat gate
In `TaskChat.tsx` (and `FloatingChat.tsx`, `MessageReactions.tsx` send paths): when `!verified`, render a small inline card "Verify your student status to join the chat" + button → `/verify`. Read state via `useVerification` (no extra round-trip; falls out of profile fetch — extend `useProfile` to include the new columns).

### 4d. Admin Verification tab
Replace placeholder in `src/pages/Admin.tsx` → new component `src/components/admin/VerificationQueue.tsx`:
- Lists pending `verification_submissions` joined with profile (full_name, university_email).
- "View letter" → creates a 60s signed URL on demand (client uses authed supabase; RLS on storage allows admin SELECT).
- Approve / Reject buttons → call `verify-admin-decide`.
- After decision, row updates and file is gone; show toast.

## 5. Files added / changed

**Added**
- `supabase/functions/verify-send-otp/index.ts`
- `supabase/functions/verify-confirm-otp/index.ts`
- `supabase/functions/verify-submit-letter/index.ts`
- `supabase/functions/verify-admin-decide/index.ts`
- `supabase/functions/send-verification-email/index.ts` (swappable provider)
- `src/pages/Verify.tsx`
- `src/hooks/useVerification.ts`
- `src/components/admin/VerificationQueue.tsx`
- migration(s) for the 4 new tables + profile columns + trigger + storage RLS

**Changed**
- `src/App.tsx` (add `/verify` route)
- `src/components/TaskChat.tsx`, `FloatingChat.tsx`, `MessageReactions.tsx` (gate)
- `src/hooks/useProfile.ts` (expose new fields)
- `src/pages/Admin.tsx` (mount VerificationQueue)
- `supabase/functions/send-chat-message/index.ts` + `toggle-reaction/index.ts` (verified check)

**Untouched**: existing document upload (`useDocumentUploads`, `DocumentUpload.tsx`), all guides/FAQs, onboarding.

## 6. Security & risks (decisions surfaced)

1. **Suffix-match correctness**: must guard against `polimi.it.attacker.com` and against `xpolimi.it` matching `polimi.it`. Use `(domain = base) OR (domain LIKE '%.' || base)` — never bare `endsWith`.
2. **Self-verification bypass**: client must never write `verified`/`verification_method`. Enforced by trigger (1e). Edge functions use service role.
3. **Email reuse**: partial unique index on `lower(university_email) WHERE verified_at NOT NULL`. Edge fn pre-checks to return a clean error before sending OTP.
4. **OTP brute force**: 6 digits = 10⁶. Caps: 5 attempts/OTP, 3 OTPs/15min/user, 10min TTL, 30s resend cooldown. Codes hashed + salted at rest.
5. **OTP enumeration timing**: constant-time compare; always run a dummy hash if no OTP row exists.
6. **Arbitrary-address email risk**: until real provider is wired, dev outbox table only. When live, rely on Lovable Emails suppression list; rate-limit per user; consider per-IP rate limit via simple in-fn map keyed by `x-forwarded-for` (best-effort).
7. **GDPR letter deletion**: deletion happens BEFORE marking decision; if deletion fails, decision aborts and admin retries. No background job needed.
8. **Storage path forgery**: edge fn validates path begins with `verification/{auth.uid()}/`.
9. **Admin route**: already protected by `AdminRoute` + `user_roles`/`has_role`. Edge fn re-checks server-side.
10. **Onboarding requirement for /verify**: profile must exist. Decision: gate `/verify` behind OnboardingGate (signed in + onboarding done).
11. **Two-account email collision via case/+aliasing**: lowercase only; do NOT strip `+aliases` (university accounts rarely use them and stripping is risky).
12. **Realtime leak**: chat already uses realtime; unverified users could subscribe. Add RLS on `task_messages` SELECT requiring `profiles.verified = true` (security-definer helper to avoid recursion). Decision needed: **yes, gate read too** — otherwise unverified users see the room. Add `can_read_verified_chat()` SECURITY DEFINER.

## 7. Open items for you to confirm before build
- Confirm: also gate **reading** chat (not just posting) → I recommend yes.
- Confirm: `/verify` requires completed onboarding.
- Confirm: dev outbox table OK as placeholder until email provider chosen (Lovable Emails recommended).
- Seed list of `university_domains` base domains — provide separately; I'll insert via the insert tool.
