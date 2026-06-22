
-- 1) Profiles: verification columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_method text,
  ADD COLUMN IF NOT EXISTS verification_date timestamptz,
  ADD COLUMN IF NOT EXISTS university_email text,
  ADD COLUMN IF NOT EXISTS university_email_verified_at timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_verification_method_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_verification_method_check
  CHECK (verification_method IS NULL OR verification_method IN ('email_domain','acceptance_letter'));

CREATE UNIQUE INDEX IF NOT EXISTS profiles_university_email_verified_uniq
  ON public.profiles (lower(university_email))
  WHERE university_email_verified_at IS NOT NULL;

-- Trigger guard: prevent users from self-setting verification fields.
-- Service role bypasses RLS but ALSO bypasses this trigger because auth.uid() will be NULL.
CREATE OR REPLACE FUNCTION public.guard_profile_verification_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only restrict when called by an authenticated end-user (not service_role / not internal).
  IF auth.uid() IS NOT NULL THEN
    NEW.verified := OLD.verified;
    NEW.verification_method := OLD.verification_method;
    NEW.verification_date := OLD.verification_date;
    NEW.university_email := OLD.university_email;
    NEW.university_email_verified_at := OLD.university_email_verified_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_verification ON public.profiles;
CREATE TRIGGER profiles_guard_verification
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_verification_fields();

-- 2) university_domains (admin-editable allowlist)
CREATE TABLE IF NOT EXISTS public.university_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_domain text NOT NULL UNIQUE,
  tier int NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.university_domains TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.university_domains TO authenticated;

ALTER TABLE public.university_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage university_domains" ON public.university_domains;
CREATE POLICY "Admins manage university_domains"
ON public.university_domains
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_university_domains_updated_at ON public.university_domains;
CREATE TRIGGER update_university_domains_updated_at
BEFORE UPDATE ON public.university_domains
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) verification_otps (service-role only)
CREATE TABLE IF NOT EXISTS public.verification_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_email text NOT NULL,
  code_hash text NOT NULL,
  salt text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verification_otps_user_recent_idx
  ON public.verification_otps (user_id, created_at DESC);

GRANT ALL ON public.verification_otps TO service_role;
-- No grants for authenticated/anon. RLS enabled with no policies = no client access.

ALTER TABLE public.verification_otps ENABLE ROW LEVEL SECURITY;

-- 4) verification_submissions (Tier-2 queue)
CREATE TABLE IF NOT EXISTS public.verification_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verification_submissions_status_check
    CHECK (status IN ('pending','approved','rejected'))
);

CREATE UNIQUE INDEX IF NOT EXISTS verification_submissions_one_pending_per_user
  ON public.verification_submissions (user_id)
  WHERE status = 'pending';

GRANT SELECT, INSERT ON public.verification_submissions TO authenticated;
GRANT ALL ON public.verification_submissions TO service_role;

ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own submissions" ON public.verification_submissions;
CREATE POLICY "Users see own submissions"
ON public.verification_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users insert own submission" ON public.verification_submissions;
CREATE POLICY "Users insert own submission"
ON public.verification_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins update submissions" ON public.verification_submissions;
CREATE POLICY "Admins update submissions"
ON public.verification_submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_verification_submissions_updated_at ON public.verification_submissions;
CREATE TRIGGER update_verification_submissions_updated_at
BEFORE UPDATE ON public.verification_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) email_outbox (dev placeholder)
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.email_outbox TO service_role;
-- No grants to authenticated/anon. Admins read via service-role edge function if needed.

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read email_outbox" ON public.email_outbox;
CREATE POLICY "Admins read email_outbox"
ON public.email_outbox
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6) Storage policies for verification/* path in user-documents bucket
DROP POLICY IF EXISTS "Verification own insert" ON storage.objects;
CREATE POLICY "Verification own insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents'
  AND split_part(name, '/', 1) = 'verification'
  AND split_part(name, '/', 2) = auth.uid()::text
);

DROP POLICY IF EXISTS "Verification own select" ON storage.objects;
CREATE POLICY "Verification own select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND split_part(name, '/', 1) = 'verification'
  AND (
    split_part(name, '/', 2) = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

DROP POLICY IF EXISTS "Verification own delete" ON storage.objects;
CREATE POLICY "Verification own delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND split_part(name, '/', 1) = 'verification'
  AND (
    split_part(name, '/', 2) = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 7) Chat gate via SECURITY DEFINER helper to avoid recursion
CREATE OR REPLACE FUNCTION public.is_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT verified FROM public.profiles WHERE id = _user_id), false);
$$;

-- Replace task_messages SELECT policy with one that also requires verification.
-- Keep existing INSERT policy (server-side function already enforces verified too).
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT polname FROM pg_policy
           WHERE polrelid = 'public.task_messages'::regclass
             AND polcmd = 'r'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_messages', r.polname);
  END LOOP;
END $$;

CREATE POLICY "Verified users read chat"
ON public.task_messages
FOR SELECT
TO authenticated
USING (
  public.is_verified(auth.uid())
  AND public.can_read_chat_room(task_id)
);

-- message_reactions SELECT: also require verified
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT polname FROM pg_policy
           WHERE polrelid = 'public.message_reactions'::regclass
             AND polcmd = 'r'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.message_reactions', r.polname);
  END LOOP;
END $$;

CREATE POLICY "Verified users read reactions"
ON public.message_reactions
FOR SELECT
TO authenticated
USING (public.is_verified(auth.uid()));
