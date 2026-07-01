
-- =====================================================================
-- 1. New column on task_messages
-- =====================================================================
ALTER TABLE public.task_messages
  ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- =====================================================================
-- 2. chat_memberships
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_memberships (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id text NOT NULL,
  phase text NOT NULL,
  first_entered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task_id, phase)
);

GRANT SELECT, INSERT ON public.chat_memberships TO authenticated;
GRANT ALL ON public.chat_memberships TO service_role;

ALTER TABLE public.chat_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own memberships"
  ON public.chat_memberships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own memberships"
  ON public.chat_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_verified(auth.uid())
  );

-- =====================================================================
-- 3. chat_bans
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_bans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chat_bans TO authenticated;
GRANT ALL ON public.chat_bans TO service_role;

ALTER TABLE public.chat_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can see own ban"
  ON public.chat_bans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manages bans - insert"
  ON public.chat_bans FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manages bans - delete"
  ON public.chat_bans FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- 4. Helper functions (SECURITY DEFINER to bypass RLS inside policies)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.is_chat_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_bans WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.chat_first_entered_at(
  _user_id uuid, _task_id text, _phase text
)
RETURNS timestamptz
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT first_entered_at
  FROM public.chat_memberships
  WHERE user_id = _user_id AND task_id = _task_id AND phase = _phase;
$$;

-- Convenience RPC: upsert membership and return { first_entered_at, was_new }
CREATE OR REPLACE FUNCTION public.join_chat_channel(_task_id text, _phase text)
RETURNS TABLE(first_entered_at timestamptz, was_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_existing timestamptz;
  v_new boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT public.is_verified(v_uid) THEN
    RAISE EXCEPTION 'not_verified';
  END IF;
  IF public.is_chat_banned(v_uid) THEN
    RAISE EXCEPTION 'banned';
  END IF;

  SELECT cm.first_entered_at INTO v_existing
  FROM public.chat_memberships cm
  WHERE cm.user_id = v_uid AND cm.task_id = _task_id AND cm.phase = _phase;

  IF v_existing IS NULL THEN
    INSERT INTO public.chat_memberships (user_id, task_id, phase)
    VALUES (v_uid, _task_id, _phase)
    ON CONFLICT (user_id, task_id, phase) DO NOTHING
    RETURNING chat_memberships.first_entered_at INTO v_existing;
    v_new := true;
  END IF;

  RETURN QUERY SELECT v_existing, v_new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_chat_channel(text, text) TO authenticated;

-- =====================================================================
-- 5. chat_settings
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chat_settings (
  task_id text NOT NULL,
  phase text NOT NULL,
  welcome_message text,
  pinned_message text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, phase)
);

GRANT SELECT ON public.chat_settings TO authenticated;
GRANT ALL ON public.chat_settings TO service_role;

ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified users read channel settings"
  ON public.chat_settings FOR SELECT
  TO authenticated
  USING (
    public.is_verified(auth.uid())
    AND NOT public.is_chat_banned(auth.uid())
  );

CREATE POLICY "Admins manage channel settings - insert"
  ON public.chat_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage channel settings - update"
  ON public.chat_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage channel settings - delete"
  ON public.chat_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_chat_settings_updated_at
  BEFORE UPDATE ON public.chat_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- 6. task_messages RLS rewrite
-- =====================================================================
-- Drop every existing policy on task_messages
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'task_messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_messages', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.task_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: verified, not banned, and message sent at or after user's first entry
CREATE POLICY "Members read messages from their first entry"
  ON public.task_messages FOR SELECT
  TO authenticated
  USING (
    public.is_verified(auth.uid())
    AND NOT public.is_chat_banned(auth.uid())
    AND created_at >= public.chat_first_entered_at(auth.uid(), task_id, phase)
  );

-- INSERT: verified, not banned, own user_id, membership row exists
CREATE POLICY "Members post to joined channels"
  ON public.task_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_verified(auth.uid())
    AND NOT public.is_chat_banned(auth.uid())
    AND public.chat_first_entered_at(auth.uid(), task_id, phase) IS NOT NULL
  );

-- No end-user UPDATE policy — edits go through edge function (service role).

-- DELETE: admins only (owner deletes not in scope)
CREATE POLICY "Admins delete any message"
  ON public.task_messages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- 7. message_reactions RLS — add banned check
-- =====================================================================
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'message_reactions'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.message_reactions', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified non-banned users read reactions"
  ON public.message_reactions FOR SELECT
  TO authenticated
  USING (
    public.is_verified(auth.uid())
    AND NOT public.is_chat_banned(auth.uid())
  );

CREATE POLICY "Verified non-banned users add own reactions"
  ON public.message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_verified(auth.uid())
    AND NOT public.is_chat_banned(auth.uid())
  );

CREATE POLICY "Users remove own reactions"
  ON public.message_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================================
-- 8. Profile display helper — include university
-- =====================================================================
DROP FUNCTION IF EXISTS public.get_profile_display_info(uuid);

CREATE OR REPLACE FUNCTION public.get_profile_display_info(profile_user_id uuid)
RETURNS TABLE(full_name text, avatar_url text, university text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT p.full_name, p.avatar_url, p.university
  FROM public.profiles p
  WHERE p.id = profile_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_profile_display_info(uuid) TO authenticated;

-- =====================================================================
-- 9. Realtime publication + full row payload for UPDATE/DELETE
-- =====================================================================
ALTER TABLE public.task_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'task_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.task_messages';
  END IF;
END $$;

-- =====================================================================
-- 10. Wipe existing chat data
-- =====================================================================
DELETE FROM public.message_reactions;
DELETE FROM public.task_messages;
