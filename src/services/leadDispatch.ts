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
  roi?: number;
  paybackPeriod?: number;
  
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
export const dispatchLead = async (leadData: LeadData): Promise<boolean> => {
  try {
    console.log('Dispatching lead to Google Sheets via Edge Function:', leadData);

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
      estimatedSquareFootage: undefined, // Not directly available in LeadData
      estimatedBudget: leadData.totalInvestment,
      estimatedMonthlyRevenue: leadData.annualRevenue ? leadData.annualRevenue / 12 : undefined,
      estimatedROI: leadData.roi,
      source: leadData.source,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
    };

    const response = await fetch(
      'https://apdxtdarwacdcuhvtaag.supabase.co/functions/v1/sync-lead-to-sheets',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZHh0ZGFyd2FjZGN1aHZ0YWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDI1NjksImV4cCI6MjA3MDc3ODU2OX0.flGfUtz-B-RXJdPX4fnbUil8I23khgtyK29h3AnF0n0',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Lead sync failed:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Lead dispatched successfully:', result);
    return true;

  } catch (error) {
    console.error('Error dispatching lead to Google Sheets:', error);
    return false;
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

  return await dispatchLead(testLead);
};