import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    
    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    console.log(`Retrying sync for lead ${leadId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the lead from database
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      throw new Error('Lead not found');
    }

    // Reset sync status
    await supabase
      .from('leads')
      .update({
        synced_to_google_sheets: false,
        sync_error: null,
        sync_attempted_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    // Prepare lead data for sync
    const leadData = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      business: lead.business_name,
      city: lead.city,
      state: lead.state,
      facilityType: lead.facility_type,
      facilitySize: lead.facility_size,
      sports: lead.sports,
      estimatedSquareFootage: lead.estimated_square_footage,
      estimatedBudget: lead.estimated_budget,
      estimatedMonthlyRevenue: lead.estimated_monthly_revenue,
      estimatedROI: lead.estimated_roi,
      source: lead.source,
      userAgent: lead.user_agent,
      referrer: lead.referrer,
    };

    // Perform the Google Sheets sync
    await syncToGoogleSheets(leadId, leadData, supabase);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Lead synced successfully to Google Sheets'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in retry-lead-sync:', error);
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

async function syncToGoogleSheets(leadId: string, leadData: any, supabase: any) {
  try {
    console.log(`Starting Google Sheets sync for lead ${leadId}`);

    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')!;
    const sheetId = Deno.env.get('GOOGLE_SHEET_ID')!;
    const tabName = Deno.env.get('GOOGLE_SHEET_TAB')!;

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Get access token
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
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('Successfully obtained Google access token');

    // Prepare row data
    const row = [
      new Date().toISOString(),
      leadData.name || '',
      leadData.email || '',
      leadData.phone || '',
      leadData.business || '',
      leadData.city || '',
      leadData.state || '',
      leadData.facilityType || '',
      leadData.facilitySize || '',
      leadData.sports || '',
      leadData.estimatedSquareFootage || '',
      leadData.estimatedBudget || '',
      leadData.estimatedMonthlyRevenue || '',
      leadData.estimatedROI || '',
      leadData.source || '',
      leadData.userAgent || '',
      leadData.referrer || '',
    ];

    // Append to Google Sheet
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tabName}!A:Z:append?valueInputOption=RAW`;
    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      throw new Error(`Failed to append to Google Sheet: ${errorText}`);
    }

    console.log(`Successfully synced lead ${leadId} to Google Sheets`);

    // Update lead status
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
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToBinary(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = base64UrlEncode(signature);
  return `${unsignedToken}.${encodedSignature}`;
}

function base64UrlEncode(data: string | ArrayBuffer): string {
  let binary: string;
  
  if (typeof data === 'string') {
    binary = btoa(unescape(encodeURIComponent(data)));
  } else {
    const bytes = new Uint8Array(data);
    binary = btoa(String.fromCharCode(...bytes));
  }
  
  return binary
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function pemToBinary(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return bytes.buffer;
}
