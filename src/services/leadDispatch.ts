import { leadSchema, sanitizeLeadData, checkRateLimit, recordSubmission } from '@/utils/leadValidation';
import { z } from 'zod';

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
    console.log('🚀 [dispatchLead] Starting lead dispatch with validation...');

    // Check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime?.toLocaleTimeString();
      console.warn('⚠️ [dispatchLead] Rate limit exceeded');
      return {
        success: false,
        error: `Rate limit exceeded. Please try again after ${resetTime}`
      };
    }

    // Prepare name field
    const fullName = leadData.name || `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim();

    // Validate core lead fields using Zod schema
    const validatedData = leadSchema.parse({
      name: fullName,
      email: leadData.email,
      phone: leadData.phone || '',
      business_name: leadData.projectType || '',
      city: leadData.city || '',
      state: leadData.state || '',
      website: '', // Honeypot always empty for legitimate submissions
    });

    // Sanitize validated data
    const sanitized = sanitizeLeadData(validatedData);
      
    console.log('✅ [dispatchLead] Validation passed, preparing payload');

    // Prepare payload with sanitized and validated data
    const payload = {
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      business: sanitized.business_name,
      city: sanitized.city,
      state: sanitized.state,
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

      console.log('📤 [dispatchLead] Sending validated payload to sync-lead-to-sheets');
      
      // Record submission for rate limiting
      recordSubmission();
      
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
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error('❌ [dispatchLead] Validation failed:', errors);
      return {
        success: false,
        error: `Invalid lead data: ${errors}`
      };
    }
    
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