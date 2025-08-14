-- Create wizard_submissions table
CREATE TABLE public.wizard_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  lead_business TEXT,
  lead_phone TEXT,
  wizard_responses JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  financial_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wizard_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow inserts from anyone (for lead capture)
CREATE POLICY "Allow public inserts" 
ON public.wizard_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policies to allow reads for authenticated users only
CREATE POLICY "Allow authenticated reads" 
ON public.wizard_submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wizard_submissions_updated_at
  BEFORE UPDATE ON public.wizard_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();