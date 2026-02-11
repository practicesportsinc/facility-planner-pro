
-- =============================================
-- Maintenance Plans table
-- =============================================
CREATE TABLE public.maintenance_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  name text,
  location_city text,
  location_state text,
  location_zip text,
  selected_assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  plan_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan_version text,
  resume_token text UNIQUE,
  reminder_preferences jsonb,
  reminders_active boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can create a plan (no auth required)
CREATE POLICY "Anyone can insert maintenance plans"
  ON public.maintenance_plans FOR INSERT
  WITH CHECK (true);

-- Read/update only by resume_token match (checked in app code via filter)
CREATE POLICY "Anyone can read maintenance plans by token"
  ON public.maintenance_plans FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update maintenance plans"
  ON public.maintenance_plans FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_maintenance_plans_updated_at
  BEFORE UPDATE ON public.maintenance_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Maintenance Reminders table
-- =============================================
CREATE TABLE public.maintenance_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES public.maintenance_plans(id) ON DELETE CASCADE,
  cadence text NOT NULL,
  next_send_at timestamptz NOT NULL,
  recipients text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  last_sent_at timestamptz
);

-- Enable RLS
ALTER TABLE public.maintenance_reminders ENABLE ROW LEVEL SECURITY;

-- Insert for anon
CREATE POLICY "Anyone can insert maintenance reminders"
  ON public.maintenance_reminders FOR INSERT
  WITH CHECK (true);

-- Read/update via plan association
CREATE POLICY "Anyone can read maintenance reminders"
  ON public.maintenance_reminders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update maintenance reminders"
  ON public.maintenance_reminders FOR UPDATE
  USING (true)
  WITH CHECK (true);
