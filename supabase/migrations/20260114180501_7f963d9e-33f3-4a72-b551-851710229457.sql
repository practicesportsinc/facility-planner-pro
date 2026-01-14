-- Fix 1: Update set_owner_id to prevent owner_id bypass (always override for authenticated users)
CREATE OR REPLACE FUNCTION public.set_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always force owner_id for authenticated users (prevents impersonation)
  IF auth.uid() IS NOT NULL THEN
    NEW.owner_id := auth.uid();
  ELSE
    -- For anonymous users, generate deterministic UUID from email
    NEW.owner_id := extensions.uuid_generate_v5(
      '6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid,
      COALESCE(NEW.lead_email, 'anonymous@wizard.local')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 2: Add search_path to update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 3: Add search_path to update_product_pricing_updated_at
CREATE OR REPLACE FUNCTION public.update_product_pricing_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;