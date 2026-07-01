
# Status

**Step 1 — Migration: DONE** ✅

The schema migration has been applied:
- `chat_memberships`, `chat_bans`, `chat_settings` created with RLS and grants.
- `task_messages.edited_at` column added.
- `task_messages` RLS fully rewritten:
  - SELECT: verified + not banned + `created_at >= chat_first_entered_at(uid, task_id, phase)`.
  - INSERT: verified + not banned + own `user_id` + membership row exists.
  - UPDATE: none (edits go through edge function via service role).
  - DELETE: `has_role(uid, 'admin')` only.
- `message_reactions` RLS refreshed with banned check.
- Helpers: `is_chat_banned`, `chat_first_entered_at`, `join_chat_channel` (upsert-and-return-was_new RPC).
- `get_profile_display_info` now also returns `university`.
- `task_messages` set to `REPLICA IDENTITY FULL` and confirmed in `supabase_realtime` publication (so UPDATE/DELETE payloads carry the full row).
- All existing rows deleted from `task_messages` and `message_reactions`.

Linter warnings surfaced were on pre-existing helpers, not on the new ones (all new definers set `search_path = public`). No action needed.

---

# Step 2 — Edge Functions (awaiting build mode)

Files to write / update:

1. **`send-chat-message`** (update): remove HTML pre-escaping, add ban check, add membership check, keep verification + rate limit + reply validation.
2. **`edit-chat-message`** (new): owner-only, 15-minute window, sets `edited_at`, service role updates the row.
3. **`admin-delete-message`** (new): checks `user_roles.role = 'admin'`, deletes reactions then the message row.
4. **`admin-ban-user`** (new): admin-only upsert into `chat_bans` with `banned_by = admin.id`, optional `reason`. Rejects self-ban.
5. **`admin-unban-user`** (new): admin-only delete from `chat_bans`.
6. **`upsert-chat-settings`** (new): admin-only upsert of welcome/pinned by `(task_id, phase)`.
7. **`toggle-reaction`** (update): add ban check alongside existing verification check.

All functions follow the existing pattern (JWT verified in code, service role for privileged ops, CORS). No `supabase/config.toml` changes needed — default `verify_jwt = false` at platform is fine since we validate in code, same as every other function in this project.

After these are written I'll **stop** — no `TaskChat.tsx` or `Admin.tsx` changes — so you can smoke-test the backend (curl-invoke `edit-chat-message`, `admin-delete-message`, `admin-ban-user`, `upsert-chat-settings`, and confirm the RLS SELECT gate blocks pre-membership rows).

Please switch to build mode to proceed with step 2.
