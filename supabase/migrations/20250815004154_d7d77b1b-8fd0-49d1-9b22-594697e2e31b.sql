-- 1) Add owner column (nullable for anonymous submissions)
ALTER TABLE public.wizard_submissions
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- 2) Add index for performance
CREATE INDEX IF NOT EXISTS wizard_submissions_owner_idx
  ON public.wizard_submissions(owner_id);

-- 3) Backfill owner_id for existing rows where email matches auth.users
UPDATE public.wizard_submissions ws
SET owner_id = au.id
FROM auth.users au
WHERE ws.owner_id IS NULL
  AND LOWER(ws.lead_email) = LOWER(au.email);

-- 4) Create trigger to set owner_id automatically on insert for authenticated users
CREATE OR REPLACE FUNCTION public.set_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_owner_id ON public.wizard_submissions;
CREATE TRIGGER trg_set_owner_id
BEFORE INSERT ON public.wizard_submissions
FOR EACH ROW
EXECUTE FUNCTION public.set_owner_id();

-- 5) Enable Row Level Security
ALTER TABLE public.wizard_submissions ENABLE ROW LEVEL SECURITY;

-- 6) Remove existing overly broad policies
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.wizard_submissions;
DROP POLICY IF EXISTS "Allow public inserts" ON public.wizard_submissions;

-- 7) Create secure policies
-- Read: users can read their own submissions, admins can read all
CREATE POLICY "read_own_submissions"
ON public.wizard_submissions
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  OR (auth.jwt() ->> 'app_role') IN ('admin','ops')
);

-- Update: users can update their own submissions, admins can update all
CREATE POLICY "update_own_submissions"
ON public.wizard_submissions
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() 
  OR (auth.jwt() ->> 'app_role') IN ('admin','ops')
)
WITH CHECK (
  owner_id = auth.uid() 
  OR (auth.jwt() ->> 'app_role') IN ('admin','ops')
);

-- Delete: users can delete their own submissions, admins can delete all
CREATE POLICY "delete_own_submissions"
ON public.wizard_submissions
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() 
  OR (auth.jwt() ->> 'app_role') IN ('admin','ops')
);

-- Insert: allow anonymous and authenticated inserts (trigger handles owner assignment)
CREATE POLICY "allow_inserts"
ON public.wizard_submissions
FOR INSERT
WITH CHECK (true);