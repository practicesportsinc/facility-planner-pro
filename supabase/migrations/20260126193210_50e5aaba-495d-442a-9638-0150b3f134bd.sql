-- Add explicit policy to deny anonymous/public SELECT access to leads table
-- This ensures that even if RLS is misconfigured, anonymous users cannot read lead data

CREATE POLICY "Deny anonymous read access"
ON public.leads
FOR SELECT
TO anon
USING (false);