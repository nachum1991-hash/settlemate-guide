
-- 1. Helper: can the current user read messages in this chat room?
CREATE OR REPLACE FUNCTION public.can_read_chat_room(_task_id text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country text;
  v_university text;
  v_city text;
BEGIN
  IF auth.uid() IS NULL OR _task_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT origin_country, university
    INTO v_country, v_university
  FROM public.profiles
  WHERE id = auth.uid();

  v_city := CASE v_university
    WHEN 'polimi'    THEN 'milano'
    WHEN 'unimi'     THEN 'milano'
    WHEN 'bocconi'   THEN 'milano'
    WHEN 'cattolica' THEN 'milano'
    WHEN 'sapienza'  THEN 'roma'
    WHEN 'polito'    THEN 'torino'
    WHEN 'unito'     THEN 'torino'
    WHEN 'unipv'     THEN 'pavia'
    WHEN 'other'     THEN 'milano'
    ELSE NULL
  END;

  IF v_country IS NOT NULL AND _task_id LIKE '%-' || v_country THEN
    RETURN true;
  END IF;

  IF v_city IS NOT NULL AND _task_id LIKE '%-' || v_city THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 2. task_messages: replace permissive SELECT with room-scoped policy
DROP POLICY IF EXISTS "Messages are viewable by authenticated users" ON public.task_messages;

CREATE POLICY "Users can view messages in their rooms"
ON public.task_messages
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.can_read_chat_room(task_id)
);

-- 3. message_reactions: only visible on messages the user can see
DROP POLICY IF EXISTS "Authenticated users can view reactions" ON public.message_reactions;

CREATE POLICY "Users can view reactions on visible messages"
ON public.message_reactions
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.task_messages m
    WHERE m.id = message_reactions.message_id
      AND (
        m.user_id = auth.uid()
        OR public.can_read_chat_room(m.task_id)
      )
  )
);

-- 4. Drop duplicated email column from profiles (email lives in auth.users)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- 5. Update signup trigger to no longer write email into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, onboarding_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    false
  );
  RETURN new;
END;
$$;
