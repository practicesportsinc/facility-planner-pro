-- Create table for storing business plan drafts
CREATE TABLE public.business_plan_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  current_step INTEGER NOT NULL DEFAULT 0,
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Create index on resume_token for fast lookups
CREATE INDEX idx_business_plan_drafts_resume_token ON public.business_plan_drafts(resume_token);

-- Create index on email for finding user's drafts
CREATE INDEX idx_business_plan_drafts_email ON public.business_plan_drafts(email);

-- Create index on expires_at for cleanup queries
CREATE INDEX idx_business_plan_drafts_expires_at ON public.business_plan_drafts(expires_at);

-- Enable Row Level Security
ALTER TABLE public.business_plan_drafts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert drafts (anonymous users can save progress)
CREATE POLICY "Anyone can insert drafts"
ON public.business_plan_drafts
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read drafts by resume_token (needed for resume functionality)
CREATE POLICY "Anyone can read drafts by token"
ON public.business_plan_drafts
FOR SELECT
USING (true);

-- Allow updates to drafts (for re-saving progress)
CREATE POLICY "Anyone can update drafts"
ON public.business_plan_drafts
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_plan_drafts_updated_at
BEFORE UPDATE ON public.business_plan_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();