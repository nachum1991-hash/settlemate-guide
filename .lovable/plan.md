
# Launch Readiness Plan

You already have Terms, Privacy, a Disclaimer, community chat, and document uploads. What's missing for a real launch are the **operator-side capabilities**: admin role, chat moderation, support inbox, and applicant verification. Below is what to add.

---

## 1. Terms & Conditions (legal polish)

The `Terms.tsx` and `Privacy.tsx` pages exist but need to be launch-grade.

- Review and finalize Terms with: governing law (Italy), liability disclaimer, refund policy (if paid), DMCA/abuse contact, account termination, age requirement.
- Update Privacy with full GDPR disclosures: data controller identity, lawful basis, data categories, retention, processor list (Lovable Cloud / Supabase EU-Frankfurt), user rights (access, deletion, portability), DPO contact, cookie notice.
- Add a **signup consent checkbox** ("I agree to Terms and Privacy") on `Auth.tsx`, storing `terms_accepted_at` on the profile.
- Add a **Cookie banner** (consent for any analytics).
- Add a **"Delete my account" button** in profile settings (GDPR right to erasure) that calls an edge function with service role to delete the auth user + cascade rows.

---

## 2. Admin role + Admin dashboard

Foundation for moderation, support, and verification.

- Migration: create `app_role` enum (`admin`, `moderator`, `user`), `user_roles` table, `has_role(uuid, app_role)` SECURITY DEFINER function (per the project's user-roles pattern — never store role on `profiles`).
- Add `/admin` route guarded by `has_role(auth.uid(), 'admin')`. Sidebar with tabs: **Chat**, **Support**, **Verification**, **Users**.
- Seed your own user as admin via a one-off SQL insert after the migration.

---

## 3. Chat moderation

Today messages stream into `task_messages` with no operator controls.

- Add columns to `task_messages`: `is_hidden boolean default false`, `hidden_by uuid`, `hidden_reason text`, `hidden_at timestamptz`.
- Add table `message_reports` (reporter_id, message_id, reason, status, created_at) + RLS so any authenticated user can insert, only admins/moderators can read/update.
- RLS update on `task_messages`: hide `is_hidden = true` messages from normal users; admins see all.
- UI:
  - "Report" button on each chat message (opens reason dialog).
  - Admin **Chat tab**: list of reported messages + a room browser (filter by `task_id`), with actions: hide message, delete message, ban user (sets `profiles.is_banned`), unban.
  - Add `is_banned boolean` to `profiles`; `send-chat-message` edge function rejects banned users.
- Optional: word-list / rate-limit tightening in the existing `send-chat-message` function.

---

## 4. Customer support

No support channel exists today; the footer email isn't enough for a launched product.

- New table `support_tickets`: `id`, `user_id`, `subject`, `category` (visa / codice fiscale / technical / billing / other), `status` (open / pending / resolved), `priority`, `created_at`, `updated_at`.
- New table `support_messages`: `ticket_id`, `sender_id`, `sender_role` (user / staff), `body`, `attachments`, `created_at`.
- User side: **"Help & Support"** page with "New ticket" form + list of their tickets and threaded replies. Realtime updates on the active ticket.
- Admin **Support tab**: queue of tickets sorted by status/priority, ticket detail with reply box, status changer, assignee.
- Email notifications via the Lovable auth-email/transactional pipeline:
  - User gets email on staff reply.
  - Staff get email on new ticket (single staff inbox alias).
- Replace the static `SUPPORT_EMAIL` footer link with a link to the in-app ticket form (keep mailto as fallback).

---

## 5. Applicant verification

You need to confirm a user is a real, enrolled (or accepted) student before unlocking sensitive features (e.g. community chat, buddy program).

- Add columns to `profiles`: `verification_status` (`unverified` | `pending` | `verified` | `rejected`), `verification_submitted_at`, `verification_reviewed_at`, `verification_reviewer_id`, `rejection_reason`.
- New table `verification_submissions`: `id`, `user_id`, `document_type` (acceptance_letter / enrollment_certificate / passport / visa), `storage_path`, `notes`, `status`, `created_at`. Files go to the existing private `user-documents` bucket under `verification/{user_id}/...`.
- User side: **"Verify your account"** page in onboarding/profile — upload acceptance letter + passport, submit. Status badge visible on profile.
- Admin **Verification tab**: queue of `pending` submissions, viewer with signed URL preview of each document, **Approve / Reject (with reason)** buttons. On approve, set `profiles.verification_status = 'verified'`.
- Gate sensitive UI on `verification_status === 'verified'` (configurable: e.g. community chat read-only until verified, or buddy matching only for verified users — you choose the gating level).
- Email the user on status change.

---

## 6. Pre-launch checklist (small but blocking)

- Enable **Leaked password protection (HIBP)** in Cloud auth settings.
- Configure **Google OAuth** provider (currently default-recommended but verify it's enabled).
- Confirm production **redirect URLs** in auth settings match the custom domain you'll launch on.
- Set up a **custom domain** in Project Settings → Domains after publishing.
- Add SEO basics on `Landing.tsx`: title <60 chars, meta description <160 chars, OG image, favicon.
- Smoke test: signup → onboarding → upload doc → post chat → submit support ticket → submit verification, end-to-end on the published URL.

---

## Suggested build order

1. Admin role + `/admin` shell (foundation).
2. Verification (highest trust impact).
3. Chat moderation (safety).
4. Support tickets (ongoing ops).
5. Legal polish + consent + delete-account.
6. Pre-launch checklist + publish.

Want me to start with step 1 (admin role + dashboard shell), or tackle a specific area first?
