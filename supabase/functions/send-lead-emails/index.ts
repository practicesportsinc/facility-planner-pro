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

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://sportsfacility.ai',
  'https://www.sportsfacility.ai',
  'https://facility-planner-pro.lovable.app',
  'https://id-preview--4da7e89e-10c0-46bf-bb1a-9914ee136192.lovable.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || 
    origin.endsWith('.lovable.app') || 
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('sportsfacility.ai')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Rate limiting: 5 emails per hour
const RATE_LIMIT = {
  requests: 5,
  windowMinutes: 60
};

// Configure your company email here
const COMPANY_EMAIL = 'chad@sportsfacility.ai';

// Equipment item schema
const EquipmentLineItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unitCost: z.number(),
  totalCost: z.number(),
  description: z.string().optional(),
});

const EquipmentCategorySchema = z.object({
  category: z.string(),
  items: z.array(EquipmentLineItemSchema),
  subtotal: z.number(),
});

// PDF attachment schema
const PdfAttachmentSchema = z.object({
  filename: z.string().max(255),
  content: z.string(), // base64 encoded PDF
});

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
    sports: z.array(z.string()).optional(),
    location: z.string().max(200).optional(),
  }).optional(),
  estimates: z.object({
    totalInvestment: z.number().positive().optional(),
    annualRevenue: z.number().positive().optional(),
    monthlyRevenue: z.number().positive().optional(),
    roi: z.number().optional(),
    paybackPeriod: z.union([z.number(), z.string()]).optional(),
    breakEven: z.union([z.number(), z.string()]).optional()
  }).nullish(),
  // Equipment quote data
  equipmentItems: z.array(EquipmentCategorySchema).optional(),
  equipmentTotals: z.object({
    equipment: z.number(),
    flooring: z.number(),
    installation: z.number(),
    grandTotal: z.number(),
  }).optional(),
  // Building estimate data
  buildingLineItems: z.array(EquipmentCategorySchema).optional(),
  buildingTotals: z.object({
    subtotal: z.number(),
    softCosts: z.number(),
    contingency: z.number(),
    grandTotal: z.number(),
  }).optional(),
  // PDF attachment for full report
  pdfAttachment: PdfAttachmentSchema.optional(),
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

interface EquipmentLineItem {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  description?: string;
}

interface EquipmentCategory {
  category: string;
  items: EquipmentLineItem[];
  subtotal: number;
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
    location?: string;
  };
  estimates?: {
    totalInvestment?: number;
    annualRevenue?: number;
    monthlyRevenue?: number;
    roi?: number;
    paybackPeriod?: number | string;
    breakEven?: number | string;
  };
  equipmentItems?: EquipmentCategory[];
  equipmentTotals?: {
    equipment: number;
    flooring: number;
    installation: number;
    grandTotal: number;
  };
  buildingLineItems?: EquipmentCategory[];
  buildingTotals?: {
    subtotal: number;
    softCosts: number;
    contingency: number;
    grandTotal: number;
  };
  pdfAttachment?: {
    filename: string;
    content: string;
  };
  source: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('=== Starting send-lead-emails function ===');
    
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    console.log('Checking rate limit for:', identifier);
    
    const rateLimit = await checkRateLimit(supabase, identifier, 'send-lead-emails');
    console.log('Rate limit check result:', rateLimit);

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
    console.log('Parsing request payload...');
    const rawPayload = await req.json();
    console.log('Raw payload received:', {
      source: rawPayload.source,
      customerEmail: rawPayload.customerEmail,
      hasLeadData: !!rawPayload.leadData,
      hasFacilityDetails: !!rawPayload.facilityDetails
    });
    
    const payload = EmailPayloadSchema.parse(rawPayload);
    console.log('Payload validated successfully');
    console.log('Processing lead email request from:', payload.source, 'Remaining:', rateLimit.remaining);

    // Determine if this is a B2B inquiry
    const isB2BInquiry = payload.source === 'b2b-contact';
    console.log('Is B2B inquiry:', isB2BInquiry);

    // Format partnership type for display
    const formattedPartnershipType = isB2BInquiry 
      ? formatPartnershipType(payload.facilityDetails?.projectType)
      : payload.facilityDetails?.projectType;
    console.log('Formatted partnership type:', formattedPartnershipType);

    // Render appropriate customer confirmation email based on source
    let customerHtml: string;
    try {
      console.log('Starting customer email rendering...');
      console.log('Customer email props:', {
        customerName: payload.customerName,
        partnershipType: formattedPartnershipType,
        hasMessage: !!(payload.leadData?.message && payload.leadData.message !== 'b2b'),
        isB2B: isB2BInquiry,
        hasEquipment: !!(payload.equipmentItems && payload.equipmentItems.length > 0)
      });
      
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
              equipmentItems: payload.equipmentItems,
              equipmentTotals: payload.equipmentTotals,
              buildingLineItems: payload.buildingLineItems,
              buildingTotals: payload.buildingTotals,
            })
          );
      console.log('✅ Customer email rendered successfully, length:', customerHtml.length);
    } catch (renderError: any) {
      console.error('❌ Failed to render customer email:', {
        error: renderError.message,
        stack: renderError.stack,
        isB2B: isB2BInquiry,
        partnershipType: formattedPartnershipType,
        errorName: renderError.name
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
          equipmentItems: payload.equipmentItems,
          equipmentTotals: payload.equipmentTotals,
          buildingLineItems: payload.buildingLineItems,
          buildingTotals: payload.buildingTotals,
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

    // Prepare PDF attachment for Resend if provided
    const attachments = payload.pdfAttachment ? [{
      filename: payload.pdfAttachment.filename,
      content: payload.pdfAttachment.content,
    }] : undefined;

    console.log('PDF attachment:', payload.pdfAttachment ? `${payload.pdfAttachment.filename} (${payload.pdfAttachment.content.length} chars)` : 'none');

    // Send customer confirmation email
    console.log('Attempting to send customer confirmation to:', payload.customerEmail);
    console.log('Email config:', {
      from: 'Practice Sports <noreply@sportsfacility.ai>',
      to: payload.customerEmail,
      subject: isB2BInquiry ? 'Thank you for your partnership inquiry' : 'Thank you for your facility planning request',
      htmlLength: customerHtml.length,
      hasAttachment: !!attachments
    });
    
    const customerEmailResult = await resend.emails.send({
      from: 'Practice Sports <noreply@sportsfacility.ai>',
      to: [payload.customerEmail],
      replyTo: 'info@practicesports.com',
      subject: isB2BInquiry 
        ? 'Thank you for your partnership inquiry'
        : 'Thank you for your facility planning request',
      html: customerHtml,
      attachments: attachments,
    });

    console.log('Customer email result:', {
      hasError: !!customerEmailResult.error,
      hasData: !!customerEmailResult.data,
      emailId: customerEmailResult.data?.id
    });

    if (customerEmailResult.error) {
      console.error('❌ Error sending customer email:', {
        error: customerEmailResult.error,
        timestamp: new Date().toISOString(),
        recipient: payload.customerEmail
      });
      throw new Error('Failed to send customer confirmation email');
    }

    console.log('✅ Customer email sent successfully:', customerEmailResult.data?.id);

    // Send company notification email (always include attachment for sales team)
    const companyRecipients = [COMPANY_EMAIL, 'info@practicesports.com'];
    console.log('Sending company notification to:', companyRecipients);
    const companyEmailResult = await resend.emails.send({
      from: 'Practice Sports Leads <leads@sportsfacility.ai>',
      to: companyRecipients,
      replyTo: 'info@practicesports.com',
      subject: `New Lead: ${payload.customerName} - ${formattedPartnershipType || 'Sports Facility'}`,
      html: companyHtml,
      attachments: attachments,
    });

    if (companyEmailResult.error) {
      console.error('Error sending company email:', {
        error: companyEmailResult.error,
        recipients: companyRecipients,
        timestamp: new Date().toISOString()
      });
      // Don't throw here - customer email was successful
    } else {
      console.log('✅ Company email sent successfully:', companyEmailResult.data?.id, 'to', companyRecipients.length, 'recipients:', companyRecipients);
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
    console.error('❌❌❌ CRITICAL ERROR in send-lead-emails function ❌❌❌');
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      errorType: typeof error,
      errorKeys: Object.keys(error)
    });
    
    // Return generic error message to client (no debug info to prevent leakage)
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
