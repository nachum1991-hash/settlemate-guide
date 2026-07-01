
# Step 3 — Frontend build (plus one backend addition)

## Backend addition first

**New edge function `delete-own-message`**
- Verify JWT, parse `{ message_id }`.
- Service-role load message → require `msg.user_id === caller.id` (else 403).
- Delete `message_reactions` for that message, then delete the row.
- Return `{ success: true, id }`.

No new migration. RLS DELETE policy stays admin-only; owner deletes go through this function via service role.

---

## `src/components/TaskChat.tsx` — rewrite

**On mount (after `verified === true`, once per (taskId, phase)):**
1. Detect ban: query `chat_bans` for current user. If a row exists → render "You've been removed from this chat" notice, hide composer + list. Skip everything else.
2. Call `supabase.rpc('join_chat_channel', { _task_id: taskId, _phase: phase })`. Store `first_entered_at` and `was_new` in refs.
3. Fetch `chat_settings` for `(task_id, phase)`. Store `welcome_message` and `pinned_message`.
4. If `was_new && welcome_message` → open a shadcn `Dialog` once (guarded by a ref so remounts inside the session don't retrigger).
5. Fetch messages (RLS auto-filters to `>= first_entered_at`). Load reactions and sender info as today, using the extended `get_profile_display_info` (now returns `full_name, avatar_url, university`).

**Sender display helper** (module-level):
```ts
formatSender(fullName, universitySlug) → "Sara Levi · Politecnico di Milano" | "Sara Levi"
```
- Map `universitySlug` via existing `universities` array from `@/data/onboardingOptions` to its label.
- Applied on the author line **and** in `replyToMessage` previews.
- Store `university` alongside `full_name` in `profileMap`, `Message.profiles`, and `replyToMessage.profiles`.

**Message model additions:** `edited_at: string | null`, `university: string | null` inside `profiles`.

**Message row actions** (icon buttons revealed on hover, plus a `DropdownMenu` for mobile):
- Author + within 15 min of `created_at`: **Edit** → swaps message body for inline `Textarea` + Save/Cancel → calls `edit-chat-message` with `{ message_id, new_message }`.
- Author, any time: **Delete** → confirm dialog → `delete-own-message`.
- `useIsAdmin()`: **Delete (admin)** on any message → `admin-delete-message`; **Ban this user** on any message (except own) → confirm dialog → `admin-ban-user` with `{ target_user_id: msg.user_id }`.
- Show `(edited)` muted tag next to timestamp when `edited_at != null`.

**Realtime** — replace the current INSERT-only subscription with INSERT + UPDATE + DELETE on `task_messages`, filtered by `task_id`. Also keep a `phase` client-side filter:
- INSERT: fetch that single message's sender (via `get_profile_display_info`) + its reactions rows, hydrate to `Message`, append. This fixes the "Anonymous User / no reactions" flash for freshly-arrived remote messages.
- UPDATE: replace in-place by `id`, preserving `reactions` from prior state (payload doesn't include reactions).
- DELETE: filter out by `id`.
- Keep reactions realtime as today (unchanged) — reaction updates already re-render via `handleReactionToggle` optimistic + `toggle-reaction` invocation.

**Pinned banner**: if `pinned_message` present, render a sticky `<div>` between the header and `ScrollArea` with a `Pin` icon, muted background, wrapping text.

**Composer**: unchanged, still calls `send-chat-message`. Handle new error codes surfaced from the backend (`not_a_member`, `banned`, `not_verified`) with the existing toast. `banned` → also set local `isBanned` state so the ban notice takes over.

---

## `src/pages/Admin.tsx` — Chat Moderation tab

Replace the "chat" tab placeholder with a new component `<ChatModerationPanel />` (new file `src/components/admin/ChatModerationPanel.tsx`) containing two sections in stacked `Card`s:

### 1. Bans list
- Query `chat_bans` joined with `profiles` (via `get_profile_display_info` per row, keeping RLS-safe access) to show:
  - Full name of banned user + short user_id.
  - `banned_by` (resolve same way).
  - `reason` (or "—").
  - `created_at` relative time.
  - **Unban** button → confirm dialog → `admin-unban-user`, then refetch.
- Empty state: "No active bans."

### 2. Channel settings editor
- Two `Input`s for `task_id` and `phase` (free text with helper: "e.g. `visa-israel` / `phase-1`"). Rationale: task IDs are dynamic across countries/cities; a picker would go stale. This matches how the app already routes chat channels.
- A **Load** button fetches existing `chat_settings` row for that pair and populates the two `Textarea`s (`welcome_message`, `pinned_message`).
- A **Save** button calls `upsert-chat-settings`.
- Clear helper text: "Welcome shows once, the first time a user opens this channel. Pinned shows as a banner above the messages."

Styling matches existing admin panels (`Card border-2 shadow-elevated`, DM Sans, primary color for CTAs).

---

## Technical notes (for you, not the plan body)

- All 5 new/updated frontend calls (`join_chat_channel`, `edit-chat-message`, `delete-own-message`, `admin-delete-message`, `admin-ban-user`, `admin-unban-user`, `upsert-chat-settings`, `chat_settings` SELECT, `chat_bans` SELECT) match the RLS / role checks we shipped in steps 1 & 2.
- Supabase types are regenerated after migrations, so `join_chat_channel` and `chat_settings`/`chat_bans` are typed for the client already.
- The `MessageReactions` component keeps working — its prop shape is unchanged.
- After I finish, I'll pause. No `preview_ui--publish`, no viewport changes.

---

## Files touched

- **New:** `supabase/functions/delete-own-message/index.ts`
- **New:** `src/components/admin/ChatModerationPanel.tsx`
- **Rewrite:** `src/components/TaskChat.tsx`
- **Edit:** `src/pages/Admin.tsx` (swap chat placeholder for `<ChatModerationPanel />`)
