
-- =============================================
-- FIX 1: maintenance_plans — lock down direct access
-- =============================================
DROP POLICY IF EXISTS "Anyone can read maintenance plans by token" ON public.maintenance_plans;
DROP POLICY IF EXISTS "Anyone can update maintenance plans" ON public.maintenance_plans;
DROP POLICY IF EXISTS "Anyone can insert maintenance plans" ON public.maintenance_plans;

-- Deny all direct client access (edge function uses service role, bypasses RLS)
CREATE POLICY "Deny direct select on maintenance_plans" ON public.maintenance_plans
  FOR SELECT USING (false);

CREATE POLICY "Deny direct update on maintenance_plans" ON public.maintenance_plans
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE POLICY "Deny direct insert on maintenance_plans" ON public.maintenance_plans
  FOR INSERT WITH CHECK (false);

-- Allow admins to read for dashboard/support
CREATE POLICY "Admins can read maintenance_plans" ON public.maintenance_plans
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 2: maintenance_reminders — lock down direct access
-- =============================================
DROP POLICY IF EXISTS "Anyone can read maintenance reminders" ON public.maintenance_reminders;
DROP POLICY IF EXISTS "Anyone can update maintenance reminders" ON public.maintenance_reminders;
DROP POLICY IF EXISTS "Anyone can insert maintenance reminders" ON public.maintenance_reminders;

CREATE POLICY "Deny direct select on maintenance_reminders" ON public.maintenance_reminders
  FOR SELECT USING (false);

CREATE POLICY "Deny direct update on maintenance_reminders" ON public.maintenance_reminders
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE POLICY "Deny direct insert on maintenance_reminders" ON public.maintenance_reminders
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Admins can read maintenance_reminders" ON public.maintenance_reminders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 3: product_pricing — proper permissive policies
-- =============================================
DROP POLICY IF EXISTS "Admins can manage product pricing" ON public.product_pricing;
DROP POLICY IF EXISTS "Anyone can read product pricing" ON public.product_pricing;

-- Permissive read for all (pricing is public data)
CREATE POLICY "Public can read pricing" ON public.product_pricing
  FOR SELECT USING (true);

-- Admin-only writes (permissive)
CREATE POLICY "Admins can manage pricing" ON public.product_pricing
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
