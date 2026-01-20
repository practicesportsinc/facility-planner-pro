-- Add explicit policy to deny direct INSERT on profiles table
-- Profile creation is handled by the handle_new_user trigger (SECURITY DEFINER)
-- This prevents any attempt to create profiles directly via RLS bypass

CREATE POLICY "Deny direct profile creation"
ON public.profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (false);