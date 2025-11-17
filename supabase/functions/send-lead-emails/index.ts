import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.0';
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

// Configure your company email here
const COMPANY_EMAIL = 'chad@sportsfacility.ai';

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    console.log('Processing lead email request from:', payload.source);

    // Validate required fields
    if (!payload.customerEmail || !payload.customerName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customerEmail and customerName' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Determine if this is a B2B inquiry
    const isB2BInquiry = payload.source === 'b2b-contact';

    // Render appropriate customer confirmation email based on source
    const customerHtml = isB2BInquiry
      ? await renderAsync(
          React.createElement(B2BConfirmationEmail, {
            customerName: payload.customerName,
            partnershipType: payload.facilityDetails?.projectType,
            message: payload.leadData?.message,
          })
        )
      : await renderAsync(
          React.createElement(CustomerConfirmationEmail, {
            customerName: payload.customerName,
            facilityDetails: payload.facilityDetails,
            estimates: payload.estimates,
          })
        );

    // Render company notification email
    const companyHtml = await renderAsync(
      React.createElement(CompanyNotificationEmail, {
        leadData: payload.leadData,
        facilityDetails: payload.facilityDetails,
        estimates: payload.estimates,
        source: payload.source,
        timestamp: new Date().toISOString(),
      })
    );

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
      console.error('Error sending customer email:', customerEmailResult.error);
      throw new Error(`Customer email failed: ${customerEmailResult.error.message}`);
    }

    console.log('Customer email sent successfully:', customerEmailResult.data?.id);

    // Send company notification email
    console.log('Sending company notification to:', COMPANY_EMAIL);
    const companyEmailResult = await resend.emails.send({
      from: 'Practice Sports Leads <leads@sportsfacility.ai>',
      to: [COMPANY_EMAIL, 'info@practicesports.com'],
      replyTo: 'info@practicesports.com',
      subject: `New Lead: ${payload.customerName} - ${payload.facilityDetails?.projectType || 'Sports Facility'}`,
      html: companyHtml,
    });

    if (companyEmailResult.error) {
      console.error('Error sending company email:', companyEmailResult.error);
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
    console.error('Error in send-lead-emails function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send emails',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
