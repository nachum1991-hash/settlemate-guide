# Security Hardening Plan

Fix all 5 findings from the security view.

## 1. Room-scoped chat reads (ERROR — `task_messages`)

Today any logged-in user can read every chat message. Switch to room-scoped access using a SECURITY DEFINER helper that checks the caller's profile against the room ID.

**Task ID patterns currently in use**
- `visa-{country}` — country room
- `pre-departure-{country}` — country room
- `{itemId}` (pre-departure per-task) — currently global, will be re-scoped (see below)
- `{stepId}-{city}` — city room (phase 2)
- `social-{city}` — city room (phase 3)

**SQL (single migration)**
- Add `public.can_read_chat_room(_task_id text) returns boolean` (SECURITY DEFINER, stable). Returns true if:
  - The task_id ends with `-{origin_country}` from the caller's profile, OR
  - The task_id ends with `-{city_code}` derived from `profiles.university` (mapped via a small SQL `CASE` matching the existing `cityData` keys), OR
  - The task_id starts with the caller's `origin_country` / `city_code`.
- Drop `Messages are viewable by authenticated users`.
- Add `SELECT` policy: `auth.uid() = user_id OR public.can_read_chat_room(task_id)`.

**UI refactor (small)**
- In `PreDepartureChecklist.tsx`, change `<TaskChat taskId={item.id} />` to `<TaskChat taskId={`${item.id}-${selectedCountry}`} />` so per-task chats are country-scoped (matches existing FloatingChat partitioning).
- Apply the same suffix pattern in `VisaWizard.tsx` for the inline `TaskChat` (already country-suffixed — no change).

## 2. Reaction visibility follows message visibility (WARN — `message_reactions`)
- Drop `Authenticated users can view reactions`.
- Add `SELECT` policy: `auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.task_messages m WHERE m.id = message_reactions.message_id AND (m.user_id = auth.uid() OR public.can_read_chat_room(m.task_id)))`.

## 3. Re-enable platform JWT verification (WARN)
- Remove the `[functions.send-chat-message]` and `[functions.toggle-reaction]` `verify_jwt = false` blocks from `supabase/config.toml` so Supabase enforces JWTs at the edge. Existing in-function `getUser()` checks remain as defense-in-depth.

## 4. Leaked password protection (WARN)
- Call `configure_auth` with `password_hibp_enabled: true`. Blocks signups/changes using known-breached passwords.

## 5. Drop duplicated email from `profiles` (INFO)
- Migration: `ALTER TABLE public.profiles DROP COLUMN email;` and update `handle_new_user` trigger to stop inserting it.
- Code: `EditProfileDialog.tsx` and any other reader source the email from `useAuth().user.email` instead of the profile row. `useProfile.ts` no longer references the column.

## Verification
- Run Supabase linter after migration.
- Smoke-test chat as two different users (different countries) to confirm room isolation.
- Confirm edge functions still succeed with `verify_jwt` removed (client already sends the bearer token).

## Out of scope
- No UI/visual redesign.
- No new chat features; this only tightens what is already there.
