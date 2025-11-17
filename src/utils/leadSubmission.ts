import { supabase } from "@/integrations/supabase/client";
import { leadSchema, sanitizeLeadData } from "./leadValidation";

interface LeadSubmissionData {
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  city?: string;
  state?: string;
  facility_type?: string;
  facility_size?: string;
  sports?: string;
  estimated_square_footage?: number;
  estimated_budget?: number;
  estimated_monthly_revenue?: number;
  estimated_roi?: number;
  source: string;
  user_agent?: string;
  referrer?: string;
}

export const submitLeadToDatabase = async (data: LeadSubmissionData): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate core fields
    const validatedData = leadSchema.parse({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      business_name: data.business_name || '',
      city: data.city || '',
      state: data.state || '',
      website: '', // Honeypot always empty
    });

    // Sanitize validated data
    const sanitized = sanitizeLeadData(validatedData);

    // Insert into database
    const { error } = await supabase.from('leads').insert({
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone || null,
      business_name: sanitized.business_name || null,
      city: sanitized.city || null,
      state: sanitized.state || null,
      facility_type: data.facility_type || null,
      facility_size: data.facility_size || null,
      sports: data.sports || null,
      estimated_square_footage: data.estimated_square_footage || null,
      estimated_budget: data.estimated_budget || null,
      estimated_monthly_revenue: data.estimated_monthly_revenue || null,
      estimated_roi: data.estimated_roi || null,
      source: data.source,
      user_agent: data.user_agent || navigator.userAgent,
      referrer: data.referrer || document.referrer,
    });

    if (error) {
      console.error('Database insertion error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Lead submission validation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
};
