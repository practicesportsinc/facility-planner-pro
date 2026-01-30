import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://sportsfacility.ai',
  'https://www.sportsfacility.ai',
  'https://facility-planner-pro.lovable.app',
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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

const STEP_LABELS = [
  'Project Overview',
  'Market & Demographics',
  'Sport Selection',
  'Competitive Analysis',
  'Facility Design',
  'Programming & Operations',
  'Financial Inputs',
  'Risk Assessment',
  'Timeline',
  'Review & Generate',
];

serve(async (req: Request) => {
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
    // Handle GET request - fetch draft by resume token
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const resumeToken = url.searchParams.get('token');

      if (!resumeToken) {
        return new Response(
          JSON.stringify({ error: 'Missing resume token' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log('Fetching draft with token:', resumeToken);

      const { data: draft, error: fetchError } = await supabase
        .from('business_plan_drafts')
        .select('*')
        .eq('resume_token', resumeToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching draft:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch draft' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (!draft) {
        return new Response(
          JSON.stringify({ error: 'Draft not found or expired' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log('Draft found, step:', draft.current_step);

      return new Response(
        JSON.stringify({
          success: true,
          draft: {
            email: draft.email,
            name: draft.name,
            currentStep: draft.current_step,
            planData: draft.plan_data,
            expiresAt: draft.expires_at,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Handle POST request - save draft and send email
    if (req.method === 'POST') {
      const { email, name, currentStep, planData } = await req.json();

      if (!email || planData === undefined) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log('Saving draft for:', email, 'step:', currentStep);

      // Generate unique resume token
      const resumeToken = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Check if a draft already exists for this email
      const { data: existingDraft } = await supabase
        .from('business_plan_drafts')
        .select('id, resume_token')
        .eq('email', email)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      let savedDraft;
      let tokenToUse = resumeToken;

      if (existingDraft) {
        // Update existing draft
        tokenToUse = existingDraft.resume_token;
        const { data, error } = await supabase
          .from('business_plan_drafts')
          .update({
            name,
            current_step: currentStep,
            plan_data: planData,
            updated_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          })
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (error) throw error;
        savedDraft = data;
        console.log('Updated existing draft');
      } else {
        // Insert new draft
        const { data, error } = await supabase
          .from('business_plan_drafts')
          .insert({
            resume_token: resumeToken,
            email,
            name,
            current_step: currentStep,
            plan_data: planData,
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        savedDraft = data;
        console.log('Created new draft');
      }

      // Build resume URL
      const resumeUrl = `https://facility-planner-pro.lovable.app/business-plan?resume=${tokenToUse}`;

      // Get facility name from plan data
      const facilityName = planData?.projectOverview?.facilityName || 'Untitled';
      const stepLabel = STEP_LABELS[currentStep] || `Step ${currentStep + 1}`;

      // Send resume email via send-lead-emails function
      console.log('Sending resume email to:', email);
      
      const emailResponse = await supabase.functions.invoke('send-lead-emails', {
        body: {
          customerEmail: email,
          customerName: name || 'there',
          leadData: {
            name: name || 'Unknown',
            email,
          },
          source: 'business-plan-resume',
          resumeData: {
            resumeUrl,
            facilityName,
            currentStep: currentStep + 1,
            totalSteps: 10,
            stepLabel,
            expiresAt: expiresAt.toISOString(),
          },
        },
      });

      if (emailResponse.error) {
        console.error('Error sending resume email:', emailResponse.error);
        // Don't fail the whole operation if email fails
      } else {
        console.log('Resume email sent successfully');
      }

      return new Response(
        JSON.stringify({
          success: true,
          resumeToken: tokenToUse,
          resumeUrl,
          expiresAt: expiresAt.toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Error in save-business-plan-draft:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
