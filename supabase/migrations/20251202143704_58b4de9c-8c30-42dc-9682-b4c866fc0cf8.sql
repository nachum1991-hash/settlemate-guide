-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a restrictive policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a SECURITY DEFINER function to safely expose non-sensitive profile data for chat
-- This allows the chat feature to display user names without exposing emails
CREATE OR REPLACE FUNCTION public.get_profile_display_info(profile_user_id uuid)
RETURNS TABLE (
  full_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$$;