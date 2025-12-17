import { supabase } from "@/integrations/supabase/client";
import { leadSchema, sanitizeLeadData } from "./leadValidation";

interface EquipmentLineItem {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface EquipmentCategory {
  category: string;
  items: EquipmentLineItem[];
  subtotal: number;
}

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
  message?: string;
  // Equipment quote data
  equipmentItems?: EquipmentCategory[];
  equipmentSummary?: string;
  equipmentTotals?: {
    equipment: number;
    flooring: number;
    installation: number;
    grandTotal: number;
  };
  equipmentInputs?: {
    sport?: string;
    units?: number;
    spaceSize?: string;
  };
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

    // Send confirmation emails with equipment details
    try {
      const emailPayload = {
        customerEmail: sanitized.email,
        customerName: sanitized.name,
        leadData: {
          name: sanitized.name,
          email: sanitized.email,
          phone: sanitized.phone,
          city: sanitized.city,
          state: sanitized.state,
          message: data.message,
        },
        facilityDetails: {
          sport: data.facility_type,
          projectType: data.facility_type,
          size: data.facility_size,
        },
        estimates: data.estimated_budget ? {
          totalInvestment: data.estimated_budget,
          monthlyRevenue: data.estimated_monthly_revenue,
          roi: data.estimated_roi,
        } : undefined,
        equipmentItems: data.equipmentItems,
        equipmentTotals: data.equipmentTotals,
        source: data.source,
      };

      await supabase.functions.invoke('send-lead-emails', {
        body: emailPayload,
      });
      console.log('Confirmation emails sent successfully');
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
      // Don't fail the whole submission if email fails
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
