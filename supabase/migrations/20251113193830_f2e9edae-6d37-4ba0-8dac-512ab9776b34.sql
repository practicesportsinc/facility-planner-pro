-- Create leads table to store all captured lead information
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Contact Information
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  
  -- Location
  city text,
  state text,
  
  -- Project Details
  facility_type text,
  facility_size text,
  sports text,
  estimated_square_footage integer,
  
  -- Financial Estimates
  estimated_budget numeric,
  estimated_monthly_revenue numeric,
  estimated_roi numeric,
  
  -- Metadata
  source text NOT NULL, -- 'quick_estimate', 'easy_wizard', 'calculator', etc.
  user_agent text,
  referrer text,
  
  -- Sync status
  synced_to_google_sheets boolean DEFAULT false,
  sync_attempted_at timestamp with time zone,
  sync_error text
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Only admins can read leads
CREATE POLICY "Admins can read all leads"
  ON public.leads
  FOR SELECT
  USING ((auth.jwt() ->> 'app_role'::text) = ANY (ARRAY['admin'::text, 'ops'::text]));

-- Anyone can insert leads (for lead capture forms)
CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_synced ON public.leads(synced_to_google_sheets, sync_attempted_at);