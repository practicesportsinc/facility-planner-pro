import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server-side validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validatePhone = (phone?: string): boolean => {
  if (!phone) return true;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 20;
};

const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 100;
};

const sanitizeString = (str: string | undefined): string | undefined => {
  if (!str) return str;
  return str.trim().substring(0, 255); // Limit length
};

const validateLeadData = (data: LeadData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || !validateName(data.name)) {
    errors.push('Invalid name: must be 2-100 characters, letters only');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  if (data.city && data.city.length > 100) {
    errors.push('City name too long');
  }

  if (data.state && data.state.length > 50) {
    errors.push('State name too long');
  }

  return { valid: errors.length === 0, errors };
};

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  business?: string;
  city?: string;
  state?: string;
  facilityType?: string;
  facilitySize?: string;
  sports?: string;
  estimatedSquareFootage?: number;
  estimatedBudget?: number;
  estimatedMonthlyRevenue?: number;
  estimatedROI?: number;
  breakEvenMonths?: number;
  monthlyOpex?: number;
  source: string;
  userAgent?: string;
  referrer?: string;
  reportData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const leadData: LeadData = await req.json();
    console.log('[sync-lead-to-sheets] ===== FUNCTION TRIGGERED =====');
    console.log('[sync-lead-to-sheets] Received lead data');

    // Validate lead data
    const validation = validateLeadData(leadData);
    if (!validation.valid) {
      console.error('[sync-lead-to-sheets] Validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid lead data', 
          details: validation.errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize string fields
    const sanitizedData: LeadData = {
      ...leadData,
      name: sanitizeString(leadData.name)!,
      email: sanitizeString(leadData.email)!.toLowerCase(),
      phone: sanitizeString(leadData.phone),
      business: sanitizeString(leadData.business),
      city: sanitizeString(leadData.city),
      state: sanitizeString(leadData.state),
    };

    console.log('[sync-lead-to-sheets] Data validated and sanitized successfully');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let reportId: string | null = null;

    // Save full report data if provided
    if (sanitizedData.reportData) {
      console.log('Saving full report data to wizard_submissions');
      const { data: reportSubmission, error: reportError } = await supabase
        .from('wizard_submissions')
        .insert({
          lead_name: sanitizedData.name,
          lead_email: sanitizedData.email,
          lead_phone: sanitizedData.phone,
          lead_business: sanitizedData.business,
          facility_type: sanitizedData.facilityType,
          facility_size: sanitizedData.facilitySize,
          selected_sports: sanitizedData.reportData.selectedSports || [sanitizedData.sports],
          total_square_footage: sanitizedData.estimatedSquareFootage,
          total_investment: sanitizedData.estimatedBudget,
          monthly_revenue: sanitizedData.estimatedMonthlyRevenue,
          monthly_opex: sanitizedData.monthlyOpex,
          break_even_months: sanitizedData.breakEvenMonths,
          roi_percentage: sanitizedData.estimatedROI,
          wizard_responses: sanitizedData.reportData.wizardResponses || {},
          recommendations: sanitizedData.reportData.recommendations || {},
          business_model: sanitizedData.reportData.businessModel,
          location_type: sanitizedData.reportData.locationType,
          timeline: sanitizedData.reportData.timeline,
          financial_metrics: sanitizedData.reportData.financialMetrics,
        })
        .select('id')
        .single();

      if (reportError) {
        console.error('Error saving report data:', reportError);
      } else {
        reportId = reportSubmission.id;
        console.log('Report saved with ID:', reportId);
      }
    }

    // Insert lead into database
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        business_name: sanitizedData.business,
        city: sanitizedData.city,
        state: sanitizedData.state,
        facility_type: sanitizedData.facilityType,
        facility_size: sanitizedData.facilitySize,
        sports: sanitizedData.sports,
        estimated_square_footage: sanitizedData.estimatedSquareFootage,
        estimated_budget: sanitizedData.estimatedBudget,
        estimated_monthly_revenue: sanitizedData.estimatedMonthlyRevenue,
        estimated_roi: sanitizedData.estimatedROI,
        source: sanitizedData.source,
        user_agent: sanitizedData.userAgent,
        referrer: sanitizedData.referrer,
        synced_to_google_sheets: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      throw insertError;
    }

    console.log('Lead inserted into database:', lead.id);

    // Generate report URL if we have a report ID
    const reportUrl = reportId 
      ? `https://4da7e89e-10c0-46bf-bb1a-9914ee136192.lovableproject.com/report/${reportId}`
      : undefined;

    console.log('[sync-lead-to-sheets] Report URL:', reportUrl);
    console.log('[sync-lead-to-sheets] About to sync to Google Sheets...');

    // TEMPORARY: Sync synchronously for debugging (will revert to background later)
    try {
      await syncToGoogleSheets(lead.id, leadData, reportUrl, supabase);
      console.log('[sync-lead-to-sheets] Google Sheets sync completed successfully');
    } catch (syncError) {
      console.error('[sync-lead-to-sheets] Google Sheets sync failed:', syncError);
      // Don't fail the whole request if sync fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        reportId: reportId,
        reportUrl: reportUrl,
        message: 'Lead captured and synced to Google Sheets'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in sync-lead-to-sheets:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function syncToGoogleSheets(
  leadId: string,
  leadData: LeadData,
  reportUrl: string | undefined,
  supabase: any
) {
  try {
    console.log(`[syncToGoogleSheets] ===== STARTING SYNC FOR LEAD ${leadId} =====`);
    
    // Get Google service account credentials
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      console.error('[syncToGoogleSheets] Missing GOOGLE_SERVICE_ACCOUNT_JSON');
      throw new Error('Google service account credentials not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log('[syncToGoogleSheets] Service account loaded:', serviceAccount.client_email);

    const sheetId = Deno.env.get('GOOGLE_SHEET_ID');
    const tabName = Deno.env.get('GOOGLE_SHEET_TAB');
    
    console.log(`[syncToGoogleSheets] Target Sheet ID: ${sheetId}`);
    console.log(`[syncToGoogleSheets] Target Tab: ${tabName}`);

    // Get access token
    console.log('[syncToGoogleSheets] Requesting access token...');
    const jwt = await createJWT(serviceAccount);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[syncToGoogleSheets] Token request failed:', errorText);
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('[syncToGoogleSheets] Access token obtained');

    // Prepare row data with report URL
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,
      leadData.name,
      leadData.email,
      leadData.phone || '',
      leadData.business || '',
      leadData.city || '',
      leadData.state || '',
      leadData.facilityType || '',
      leadData.facilitySize || '',
      leadData.sports || '',
      leadData.estimatedSquareFootage?.toString() || '',
      leadData.estimatedBudget?.toString() || '',
      leadData.estimatedMonthlyRevenue?.toString() || '',
      leadData.estimatedROI?.toString() || '',
      leadData.breakEvenMonths?.toString() || '',
      leadData.source,
      reportUrl || '', // Add report URL to sheet
    ];
    
    console.log('[syncToGoogleSheets] Row data prepared:', rowData);

    // Append to Google Sheet
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tabName}!A:Q:append?valueInputOption=RAW`;
    console.log('[syncToGoogleSheets] Appending to sheet:', appendUrl);

    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    });

    console.log('[syncToGoogleSheets] Append response status:', appendResponse.status);

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      console.error('[syncToGoogleSheets] Append failed:', errorText);
      throw new Error(`Failed to append to sheet: ${appendResponse.status} ${errorText}`);
    }

    const appendResult = await appendResponse.json();
    console.log('[syncToGoogleSheets] Append successful:', JSON.stringify(appendResult, null, 2));
    console.log(`[syncToGoogleSheets] ✅ Successfully synced lead ${leadId} to Google Sheets`);

    // Update lead sync status
    await supabase
      .from('leads')
      .update({
        synced_to_google_sheets: true,
        sync_attempted_at: new Date().toISOString(),
        sync_error: null,
      })
      .eq('id', leadId);

  } catch (error) {
    console.error(`Error syncing lead ${leadId} to Google Sheets:`, error);

    // Update lead with error
    await supabase
      .from('leads')
      .update({
        synced_to_google_sheets: false,
        sync_attempted_at: new Date().toISOString(),
        sync_error: error.message,
      })
      .eq('id', leadId);

    throw error;
  }
}

async function createJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Import private key
  const privateKey = serviceAccount.private_key;
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${signatureInput}.${encodedSignature}`;
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(
    typeof str === 'string' 
      ? str 
      : String.fromCharCode(...new Uint8Array(str as any))
  );
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
