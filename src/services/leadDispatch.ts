export interface LeadData {
  // Personal Information
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  
  // Location
  city?: string;
  state?: string;
  country?: string;
  
  // Project Details
  projectType?: string;
  facilitySize?: string;
  sports?: string[];
  buildMode?: string;
  timeline?: string;
  budget?: string;
  
  // Estimates/Results
  totalInvestment?: number;
  annualRevenue?: number;
  monthlyRevenue?: number;
  monthlyOpex?: number;
  roi?: number;
  paybackPeriod?: number;
  breakEvenMonths?: number;
  totalSquareFootage?: number;
  
  // Full report data for saving
  reportData?: any;
  
  // Metadata
  source: 'quick-estimate' | 'full-calculator' | 'easy-wizard' | string;
  timestamp?: string;
  userAgent?: string;
  referrer?: string;
}

export interface WebhookSettings {
  makeWebhookUrl?: string;
  enabled: boolean;
}

// Get webhook settings from localStorage
export const getWebhookSettings = (): WebhookSettings => {
  try {
    const settings = localStorage.getItem('webhook-settings');
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Error reading webhook settings:', error);
  }
  
  return { enabled: false };
};

// Save webhook settings to localStorage
export const saveWebhookSettings = (settings: WebhookSettings): void => {
  try {
    localStorage.setItem('webhook-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving webhook settings:', error);
  }
};

// Dispatch lead data to Supabase Edge Function (syncs to Google Sheets)
export const dispatchLead = async (leadData: LeadData): Promise<{ success: boolean; reportUrl?: string; leadId?: string; error?: string }> => {
  try {
    console.log('🚀 [dispatchLead] Starting lead dispatch...', leadData);

    // Prepare payload with consistent field names
    const payload = {
      name: leadData.name || `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim(),
      email: leadData.email,
      phone: leadData.phone,
      business: leadData.projectType,
      city: leadData.city,
      state: leadData.state,
      facilityType: leadData.projectType,
      facilitySize: leadData.facilitySize,
      sports: Array.isArray(leadData.sports) ? leadData.sports.join(', ') : leadData.sports,
      estimatedSquareFootage: leadData.totalSquareFootage,
      estimatedBudget: leadData.totalInvestment,
      estimatedMonthlyRevenue: leadData.monthlyRevenue || (leadData.annualRevenue ? leadData.annualRevenue / 12 : undefined),
      estimatedROI: leadData.roi,
      breakEvenMonths: leadData.breakEvenMonths,
      monthlyOpex: leadData.monthlyOpex,
      source: leadData.source,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      reportData: leadData.reportData, // Include full report data for saving
    };

    console.log('📤 [dispatchLead] Sending payload to sync-lead-to-sheets:', JSON.stringify(payload, null, 2));
    
    // Use Supabase client for reliable invocation
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://apdxtdarwacdcuhvtaag.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZHh0ZGFyd2FjZGN1aHZ0YWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDI1NjksImV4cCI6MjA3MDc3ODU2OX0.flGfUtz-B-RXJdPX4fnbUil8I23khgtyK29h3AnF0n0'
    );
    
    const { data, error } = await supabase.functions.invoke('sync-lead-to-sheets', {
      body: payload,
    });

    if (error) {
      console.error('❌ [dispatchLead] Lead sync failed with error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sync lead to Google Sheets'
      };
    }

    console.log('✅ [dispatchLead] Success! Result:', data);
    return { 
      success: true,
      reportUrl: data?.reportUrl,
      leadId: data?.leadId
    };

  } catch (error) {
    console.error('💥 [dispatchLead] Exception during lead dispatch:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Test webhook with sample data
export const testWebhook = async (): Promise<boolean> => {
  const testLead: LeadData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '555-0123',
    city: 'Test City',
    state: 'Test State',
    projectType: 'Test Facility',
    source: 'quick-estimate',
    timestamp: new Date().toISOString(),
  };

  const result = await dispatchLead(testLead);
  return result.success;
};