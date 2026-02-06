-- Drop the overly permissive rate_limits policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create a deny-all policy since only service role (which bypasses RLS) needs access
CREATE POLICY "Deny all direct access to rate limits"
ON public.rate_limits
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);