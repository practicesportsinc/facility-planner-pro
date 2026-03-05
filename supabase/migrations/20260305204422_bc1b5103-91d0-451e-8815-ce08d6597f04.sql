-- Fix 1: leads table - Replace restrictive-only SELECT policies with a proper permissive admin/ops policy
DROP POLICY IF EXISTS "Admins can read all leads" ON public.leads;
DROP POLICY IF EXISTS "Deny anonymous read access" ON public.leads;

CREATE POLICY "Only admins and ops can read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'ops'::app_role)
  );

-- Fix 2: wizard_submissions - Tighten INSERT policy
DROP POLICY IF EXISTS "allow_inserts" ON public.wizard_submissions;

CREATE POLICY "allow_authenticated_inserts"
  ON public.wizard_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_inserts"
  ON public.wizard_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);