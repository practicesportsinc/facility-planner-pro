export interface LeadData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
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
  source: 'quick-estimate' | 'full-calculator' | 'easy-wizard';
  timestamp: string;
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

// Dispatch lead data to Make.com webhook
export const dispatchLead = async (leadData: LeadData): Promise<boolean> => {
  const settings = getWebhookSettings();
  
  if (!settings.enabled || !settings.makeWebhookUrl) {
    console.log('Make.com webhook not configured or disabled');
    return false;
  }

  try {
    console.log('Dispatching lead to Make.com:', leadData);

    const payload = {
      ...leadData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'Direct',
      url: window.location.href,
    };

    const response = await fetch(settings.makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors', // Handle CORS for webhook
      body: JSON.stringify(payload),
    });

    // Since we're using no-cors, we can't read the response status
    // We'll assume success if no error was thrown
    console.log('Lead dispatched successfully to Make.com');
    return true;

  } catch (error) {
    console.error('Error dispatching lead to Make.com:', error);
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