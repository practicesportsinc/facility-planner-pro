-- Add additional columns to wizard_submissions for comprehensive data storage
ALTER TABLE public.wizard_submissions 
ADD COLUMN submission_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN facility_size TEXT,
ADD COLUMN location_type TEXT,
ADD COLUMN target_market JSONB,
ADD COLUMN revenue_model JSONB,
ADD COLUMN selected_sports JSONB,
ADD COLUMN timeline TEXT,
ADD COLUMN amenities JSONB,
ADD COLUMN operating_hours TEXT,
ADD COLUMN experience_level TEXT,
ADD COLUMN sports_breakdown JSONB,
ADD COLUMN total_square_footage INTEGER,
ADD COLUMN total_investment DECIMAL(12,2),
ADD COLUMN monthly_revenue DECIMAL(10,2),
ADD COLUMN monthly_opex DECIMAL(10,2),
ADD COLUMN break_even_months INTEGER,
ADD COLUMN roi_percentage DECIMAL(5,2),
ADD COLUMN facility_type TEXT,
ADD COLUMN business_model TEXT;

-- Add index for better query performance
CREATE INDEX idx_wizard_submissions_date ON public.wizard_submissions(submission_date);
CREATE INDEX idx_wizard_submissions_facility_type ON public.wizard_submissions(facility_type);
CREATE INDEX idx_wizard_submissions_total_investment ON public.wizard_submissions(total_investment);