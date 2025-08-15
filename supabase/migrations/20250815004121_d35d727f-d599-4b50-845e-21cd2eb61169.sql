-- 0) Safety: ensure table exists
-- SELECT * FROM public.wizard_submissions LIMIT 1;

-- 1) Add owner column (nullable for backfill). Store the auth.user UUID.
ALTER TABLE public.wizard_submissions
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- 2) Optional: created_at index for perf (keep your existing indexes too)
CREATE INDEX IF NOT EXISTS wizard_submissions_owner_idx
  ON public.wizard_submissions(owner_id);

-- 3) Backfill owner_id for existing rows
-- Prefer your own mapping logic here. Example: if you store user_email on the row
-- and emails are unique in auth.users:
UPDATE public.wizard_submissions ws
SET owner_id = au.id
FROM auth.users au
WHERE ws.owner_id IS NULL
  AND LOWER(ws.lead_email) = LOWER(au.email);

-- 4) Make owner_id NOT NULL after backfill
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.wizard_submissions WHERE owner_id IS NULL) THEN
    RAISE EXCEPTION 'Backfill owner_id before enforcing NOT NULL';
  END IF;
END $$;

ALTER TABLE public.wizard_submissions
  ALTER COLUMN owner_id SET NOT NULL;

-- 5) Create trigger to set owner_id automatically on insert
-- (If clients don't pass owner_id; uses the authenticated user from JWT)
CREATE OR REPLACE FUNCTION public.set_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
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

-- 6) Enable Row Level Security
ALTER TABLE public.wizard_submissions ENABLE ROW LEVEL SECURITY;

-- 7) Remove any overly broad policies (optional)
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.wizard_submissions;
DROP POLICY IF EXISTS "Allow public inserts" ON public.wizard_submissions;

-- 8) Policies
-- Read: owners can read their own rows
CREATE POLICY "read_own_submissions"
ON public.wizard_submissions
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Update: owners can update their own rows
CREATE POLICY "update_own_submissions"
ON public.wizard_submissions
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Delete: owners can delete their own rows (optional)
CREATE POLICY "delete_own_submissions"
ON public.wizard_submissions
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Insert: any authenticated user may insert; trigger will set owner_id
CREATE POLICY "insert_as_owner"
ON public.wizard_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 9) Admin/ops override (JWT custom claim "app_role")
-- Give read/write to users whose JWT claim app_role ∈ {admin, ops}
CREATE POLICY "admin_read_all"
ON public.wizard_submissions
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'app_role') IN ('admin','ops')
  OR owner_id = auth.uid()
);

CREATE POLICY "admin_update_all"
ON public.wizard_submissions
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'app_role') IN ('admin','ops') OR owner_id = auth.uid())
WITH CHECK ((auth.jwt() ->> 'app_role') IN ('admin','ops') OR owner_id = auth.uid());

CREATE POLICY "admin_delete_all"
ON public.wizard_submissions
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'app_role') IN ('admin','ops') OR owner_id = auth.uid());