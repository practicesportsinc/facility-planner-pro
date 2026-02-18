-- Lock down business_plan_drafts: deny all direct client access
-- All legitimate access goes through edge functions using the service role key

DROP POLICY IF EXISTS "Anyone can insert drafts" ON public.business_plan_drafts;
DROP POLICY IF EXISTS "Anyone can read drafts by token" ON public.business_plan_drafts;
DROP POLICY IF EXISTS "Anyone can update drafts" ON public.business_plan_drafts;

-- Deny all direct access from anon and authenticated users
-- Edge functions (service role) bypass RLS and still have full access
CREATE POLICY "Deny direct client access to drafts"
ON public.business_plan_drafts
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);