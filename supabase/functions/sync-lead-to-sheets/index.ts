import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  source: string;
  userAgent?: string;
  referrer?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const leadData: LeadData = await req.json();
    console.log('Received lead data:', leadData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert lead into database
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        business_name: leadData.business,
        city: leadData.city,
        state: leadData.state,
        facility_type: leadData.facilityType,
        facility_size: leadData.facilitySize,
        sports: leadData.sports,
        estimated_square_footage: leadData.estimatedSquareFootage,
        estimated_budget: leadData.estimatedBudget,
        estimated_monthly_revenue: leadData.estimatedMonthlyRevenue,
        estimated_roi: leadData.estimatedROI,
        source: leadData.source,
        user_agent: leadData.userAgent,
        referrer: leadData.referrer,
        synced_to_google_sheets: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      throw insertError;
    }

    console.log('Lead inserted into database:', lead.id);

    // Sync to Google Sheets in background
    const syncPromise = syncToGoogleSheets(lead.id, leadData, supabase);
    
    // Use background task to continue syncing after response
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    if (typeof EdgeRuntime !== 'undefined') {
      // @ts-ignore
      EdgeRuntime.waitUntil(syncPromise);
    } else {
      // Fallback for local development
      syncPromise.catch(console.error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead captured and sync to Google Sheets initiated'
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
  supabase: any
) {
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
      leadData.source,
      leadData.userAgent || '',
      leadData.referrer || '',
    ];

    // Append to Google Sheet
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tabName}!A:Q:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      throw new Error(`Failed to append to Google Sheet: ${errorText}`);
    }

    console.log(`Successfully synced lead ${leadId} to Google Sheets`);

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
