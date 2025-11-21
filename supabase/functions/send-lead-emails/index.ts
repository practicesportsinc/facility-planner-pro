import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
import { z } from 'npm:zod@3.22.4';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { CustomerConfirmationEmail } from './_templates/customer-confirmation.tsx';
import { CompanyNotificationEmail } from './_templates/company-notification.tsx';
import { B2BConfirmationEmail } from './_templates/b2b-confirmation.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: 5 emails per hour
const RATE_LIMIT = {
  requests: 5,
  windowMinutes: 60
};

// Configure your company email here
const COMPANY_EMAIL = 'chad@sportsfacility.ai';

// Validation schema
const EmailPayloadSchema = z.object({
  customerEmail: z.string().email().max(255),
  customerName: z.string().min(1).max(200),
  leadData: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email().max(255),
    phone: z.string().max(50).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(50).optional(),
    location: z.string().max(200).optional(),
    allowOutreach: z.boolean().optional(),
    message: z.string().max(5000).optional()
  }),
  facilityDetails: z.object({
    sport: z.string().max(100).optional(),
    projectType: z.string().max(100).optional(),
    size: z.string().max(100).optional(),
    buildMode: z.string().max(100).optional(),
    sports: z.array(z.string()).optional()
  }).optional(),
  estimates: z.object({
    totalInvestment: z.number().positive().optional(),
    annualRevenue: z.number().positive().optional(),
    monthlyRevenue: z.number().positive().optional(),
    roi: z.number().optional(),
    paybackPeriod: z.union([z.number(), z.string()]).optional(),
    breakEven: z.union([z.number(), z.string()]).optional()
  }).optional(),
  source: z.string().min(1).max(100)
});

async function checkRateLimit(
  supabase: any,
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000);
  
  const { data: rateLimitData, error: rateLimitError } = await supabase
    .from('rate_limits')
    .select('request_count, window_start')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (rateLimitError) {
    console.error('Rate limit check error:', rateLimitError);
    return { allowed: true, remaining: RATE_LIMIT.requests };
  }

  if (!rateLimitData) {
    await supabase.from('rate_limits').insert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString()
    });
    return { allowed: true, remaining: RATE_LIMIT.requests - 1 };
  }

  if (rateLimitData.request_count >= RATE_LIMIT.requests) {
    return { allowed: false, remaining: 0 };
  }

  await supabase
    .from('rate_limits')
    .update({ request_count: rateLimitData.request_count + 1 })
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString());

  return { 
    allowed: true, 
    remaining: RATE_LIMIT.requests - rateLimitData.request_count - 1 
  };
}

// Helper function to transform partnership type slugs to display names
function formatPartnershipType(slug?: string): string {
  if (!slug) return 'Partnership Inquiry';
  
  const partnershipTypes: Record<string, string> = {
    'referral-partner': 'Referral Partner',
    'equipment-supplier': 'Equipment Supplier',
    'featured-supplier': 'Featured Supplier',
    'white-label': 'White Label Partnership',
    'integration-partner': 'Integration Partner',
    'reseller': 'Reseller Partner'
  };
  
  return partnershipTypes[slug] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

interface EmailPayload {
  customerEmail: string;
  customerName: string;
  leadData: {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
    location?: string;
    allowOutreach?: boolean;
    message?: string;
  };
  facilityDetails?: {
    sport?: string;
    projectType?: string;
    size?: string;
    buildMode?: string;
    sports?: string[];
  };
  estimates?: {
    totalInvestment?: number;
    annualRevenue?: number;
    monthlyRevenue?: number;
    roi?: number;
    paybackPeriod?: number | string;
    breakEven?: number | string;
  };
  source: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(supabase, identifier, 'send-lead-emails');

    if (!rateLimit.allowed) {
      console.warn('Rate limit exceeded:', { identifier, endpoint: 'send-lead-emails' });
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          remaining: 0
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Input validation
    const rawPayload = await req.json();
    const payload = EmailPayloadSchema.parse(rawPayload);

    console.log('Processing lead email request from:', payload.source, 'Remaining:', rateLimit.remaining);

    // Determine if this is a B2B inquiry
    const isB2BInquiry = payload.source === 'b2b-contact';

    // Format partnership type for display
    const formattedPartnershipType = isB2BInquiry 
      ? formatPartnershipType(payload.facilityDetails?.projectType)
      : payload.facilityDetails?.projectType;

    // Render appropriate customer confirmation email based on source
    let customerHtml: string;
    try {
      customerHtml = isB2BInquiry
        ? await renderAsync(
            React.createElement(B2BConfirmationEmail, {
              customerName: payload.customerName,
              partnershipType: formattedPartnershipType,
              message: payload.leadData?.message && payload.leadData.message !== 'b2b' 
                ? payload.leadData.message 
                : undefined,
            })
          )
        : await renderAsync(
            React.createElement(CustomerConfirmationEmail, {
              customerName: payload.customerName,
              facilityDetails: payload.facilityDetails,
              estimates: payload.estimates,
            })
          );
      console.log('Customer email rendered successfully');
    } catch (renderError: any) {
      console.error('Failed to render customer email:', {
        error: renderError.message,
        stack: renderError.stack,
        isB2B: isB2BInquiry,
        partnershipType: formattedPartnershipType
      });
      throw new Error(`Email rendering failed: ${renderError.message}`);
    }

    // Render company notification email
    let companyHtml: string;
    try {
      // Update facility details with formatted partnership type for company notification
      const formattedFacilityDetails = isB2BInquiry && payload.facilityDetails
        ? { ...payload.facilityDetails, projectType: formattedPartnershipType }
        : payload.facilityDetails;

      companyHtml = await renderAsync(
        React.createElement(CompanyNotificationEmail, {
          leadData: payload.leadData,
          facilityDetails: formattedFacilityDetails,
          estimates: payload.estimates,
          source: payload.source,
          timestamp: new Date().toISOString(),
        })
      );
      console.log('Company email rendered successfully');
    } catch (renderError: any) {
      console.error('Failed to render company email:', {
        error: renderError.message,
        stack: renderError.stack
      });
      throw new Error(`Company email rendering failed: ${renderError.message}`);
    }

    // Send customer confirmation email
    console.log('Sending customer confirmation to:', payload.customerEmail);
    const customerEmailResult = await resend.emails.send({
      from: 'Practice Sports <noreply@sportsfacility.ai>',
      to: [payload.customerEmail],
      replyTo: 'info@practicesports.com',
      subject: isB2BInquiry 
        ? 'Thank you for your partnership inquiry'
        : 'Thank you for your facility planning request',
      html: customerHtml,
    });

    if (customerEmailResult.error) {
      console.error('Error sending customer email:', {
        error: customerEmailResult.error,
        timestamp: new Date().toISOString(),
        recipient: payload.customerEmail
      });
      throw new Error('Failed to send customer confirmation email');
    }

    console.log('Customer email sent successfully:', customerEmailResult.data?.id);

    // Send company notification email
    console.log('Sending company notification to:', COMPANY_EMAIL);
    const companyEmailResult = await resend.emails.send({
      from: 'Practice Sports Leads <leads@sportsfacility.ai>',
      to: [COMPANY_EMAIL, 'info@practicesports.com'],
      replyTo: 'info@practicesports.com',
      subject: `New Lead: ${payload.customerName} - ${formattedPartnershipType || 'Sports Facility'}`,
      html: companyHtml,
    });

    if (companyEmailResult.error) {
      console.error('Error sending company email:', {
        error: companyEmailResult.error,
        timestamp: new Date().toISOString()
      });
      // Don't throw here - customer email was successful
    } else {
      console.log('Company email sent successfully:', companyEmailResult.data?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        customerEmailId: customerEmailResult.data?.id,
        companyEmailId: companyEmailResult.data?.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    // Log detailed error server-side only
    console.error('Error in send-lead-emails function:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Return generic error message to client
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your email request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
