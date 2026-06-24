-- Idempotently re-apply the live RLS policies on public.task_messages so they
-- live in the repo and survive a schema regeneration. No behavior change.
-- The can_read_chat_room() function is intentionally NOT modified here.

DROP POLICY IF EXISTS "Verified users read chat" ON public.task_messages;
CREATE POLICY "Verified users read chat"
  ON public.task_messages
  FOR SELECT
  TO authenticated
  USING (public.is_verified(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create messages" ON public.task_messages;
CREATE POLICY "Authenticated users can create messages"
  ON public.task_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_verified(auth.uid()));
