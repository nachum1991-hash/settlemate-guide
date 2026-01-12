-- Fix 1: Update get_profile_display_info to require authentication
CREATE OR REPLACE FUNCTION public.get_profile_display_info(profile_user_id uuid)
RETURNS TABLE (full_name text, avatar_url text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authentication to call this function
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = profile_user_id;
END;
$$;

-- Fix 2: Add restrictive write policies to task_faqs table
-- Deny all INSERT operations (FAQs are seeded via migrations only)
CREATE POLICY "Prevent FAQ insertions"
  ON public.task_faqs FOR INSERT
  WITH CHECK (false);

-- Deny all UPDATE operations
CREATE POLICY "Prevent FAQ updates"
  ON public.task_faqs FOR UPDATE
  USING (false);

-- Deny all DELETE operations
CREATE POLICY "Prevent FAQ deletions"
  ON public.task_faqs FOR DELETE
  USING (false);

-- Fix 3: Add message length constraint to task_messages
ALTER TABLE public.task_messages ADD CONSTRAINT message_length_check CHECK (length(message) <= 2000 AND length(message) >= 1);