-- Fix RLS policies to use has_role() function instead of JWT claims

-- ============================================
-- Fix wizard_submissions policies
-- ============================================

-- Drop existing policies that use JWT claims
DROP POLICY IF EXISTS "read_own_submissions" ON wizard_submissions;
DROP POLICY IF EXISTS "update_own_submissions" ON wizard_submissions;
DROP POLICY IF EXISTS "delete_own_submissions" ON wizard_submissions;

-- Recreate with correct role checking using has_role()
CREATE POLICY "read_own_submissions" ON wizard_submissions
FOR SELECT TO authenticated
USING (
  owner_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'ops'::app_role)
);

CREATE POLICY "update_own_submissions" ON wizard_submissions
FOR UPDATE TO authenticated
USING (
  owner_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'ops'::app_role)
)
WITH CHECK (
  owner_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'ops'::app_role)
);

CREATE POLICY "delete_own_submissions" ON wizard_submissions
FOR DELETE TO authenticated
USING (
  owner_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'ops'::app_role)
);

-- ============================================
-- Fix leads policy
-- ============================================

-- Drop existing policy that uses JWT claims
DROP POLICY IF EXISTS "Admins can read all leads" ON leads;

-- Recreate with correct role checking using has_role()
CREATE POLICY "Admins can read all leads" ON leads
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'ops'::app_role)
);