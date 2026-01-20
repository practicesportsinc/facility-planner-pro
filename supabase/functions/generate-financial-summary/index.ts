import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'npm:zod@3.22.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

// Rate limiting: 5 AI summaries per hour
const RATE_LIMIT = {
  requests: 5,
  windowMinutes: 60
};

// Validation schema
const FinancialSummaryRequestSchema = z.object({
  financialMetrics: z.object({
    space: z.object({
      grossSF: z.number().positive().optional()
    }).optional(),
    capex: z.object({
      total: z.number().positive(),
      construction: z.number().positive().optional(),
      equipment: z.number().positive().optional()
    }),
    revenue: z.object({
      total: z.number().positive(),
      memberships: z.number().optional(),
      rentals: z.number().optional(),
      lessons: z.number().optional()
    }),
    opex: z.object({
      total: z.number().positive()
    }),
    profitability: z.object({
      roi: z.number(),
      breakEvenMonths: z.number().int().positive()
    }).optional(),
    sportsBreakdown: z.array(z.object({
      sportId: z.string(),
      squareFootage: z.number(),
      totalCost: z.number(),
      monthlyRevenue: z.number()
    })).optional()
  }),
  wizardData: z.object({
    selectedSports: z.array(z.string()).optional(),
    facilitySize: z.string().optional(),
    targetMarket: z.array(z.string()).optional()
  })
});

// Generate template-based fallback summary when OpenAI is unavailable
function generateFallbackSummary(financialMetrics: any, wizardData: any): string {
  const capex = financialMetrics.capex;
  const revenue = financialMetrics.revenue;
  const opex = financialMetrics.opex;
  const profitability = financialMetrics.profitability;
  
  const monthlyProfit = revenue.total - opex.total;
  const profitMargin = ((monthlyProfit / revenue.total) * 100).toFixed(1);
  const annualRevenue = revenue.total * 12;
  
  // Determine financial health assessment
  let healthAssessment = '';
  if (profitability?.roi >= 15) {
    healthAssessment = 'strong investment potential';
  } else if (profitability?.roi >= 8) {
    healthAssessment = 'solid investment fundamentals';
  } else {
    healthAssessment = 'potential for optimization';
  }

  // Build revenue streams description
  const revenueStreams: string[] = [];
  if (revenue.memberships > 0) revenueStreams.push(`memberships ($${(revenue.memberships / 1000).toFixed(0)}K/mo)`);
  if (revenue.rentals > 0) revenueStreams.push(`facility rentals ($${(revenue.rentals / 1000).toFixed(0)}K/mo)`);
  if (revenue.lessons > 0) revenueStreams.push(`training programs ($${(revenue.lessons / 1000).toFixed(0)}K/mo)`);
  
  const revenueDescription = revenueStreams.length > 0 
    ? revenueStreams.join(', ') 
    : 'diversified income sources';

  const sportsDescription = wizardData.selectedSports?.length > 0 
    ? wizardData.selectedSports.join(', ') 
    : 'multi-sport';

  return `**Financial Viability Assessment**

This ${wizardData.facilitySize || 'sports'} facility project focusing on ${sportsDescription} shows ${healthAssessment} with a total capital investment of $${(capex.total / 1000000).toFixed(2)}M. The projected monthly revenue of $${(revenue.total / 1000).toFixed(0)}K against operating expenses of $${(opex.total / 1000).toFixed(0)}K yields a healthy monthly EBITDA of $${(monthlyProfit / 1000).toFixed(0)}K (${profitMargin}% margin).

**Revenue Streams & Market Position**

The facility's diversified revenue model includes ${revenueDescription}. This multi-stream approach provides revenue stability and reduces dependency on any single income source. Targeting ${wizardData.targetMarket?.join(', ') || 'a broad demographic'} positions the facility well for consistent utilization.

**Investment Returns**

With an estimated ROI of ${profitability?.roi?.toFixed(1) || 'N/A'}% and break-even projected at ${profitability?.breakEvenMonths || 'N/A'} months, the facility demonstrates ${profitability?.breakEvenMonths && profitability.breakEvenMonths <= 24 ? 'attractive' : 'reasonable'} return characteristics. The annual revenue potential of $${(annualRevenue / 1000000).toFixed(2)}M supports long-term sustainability.

**Strategic Recommendations**

Focus on pre-opening marketing to build a membership base before launch. Consider phased equipment investment to manage initial capital outlay. Establish partnerships with local sports organizations and schools to drive consistent facility utilization. Monitor operating costs closely during the first year to optimize profitability.`;
}

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

serve(async (req) => {
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
    // Rate limiting
    const identifier = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(supabase, identifier, 'generate-financial-summary');

    if (!rateLimit.allowed) {
      console.warn('Rate limit exceeded:', { identifier, endpoint: 'generate-financial-summary' });
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
    const validated = FinancialSummaryRequestSchema.parse(rawPayload);
    const { financialMetrics, wizardData } = validated;

    // Check if OpenAI API key is configured - use fallback if not
    if (!openAIApiKey) {
      console.warn('OpenAI API key not configured, using fallback summary');
      const fallbackSummary = generateFallbackSummary(financialMetrics, wizardData);
      return new Response(JSON.stringify({ 
        summary: fallbackSummary,
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating financial summary:', { 
      investment: financialMetrics.capex.total,
      revenue: financialMetrics.revenue.total,
      remaining: rateLimit.remaining
    });

    const prompt = `
You are a sports facility financial advisor. Analyze the following financial projection data and provide a comprehensive, professional summary. Focus on key insights, opportunities, risks, and recommendations.

FACILITY DATA:
- Selected Sports: ${wizardData.selectedSports?.join(', ') || 'Not specified'}
- Facility Size: ${wizardData.facilitySize || 'Not specified'}
- Target Market: ${wizardData.targetMarket?.join(', ') || 'Not specified'}
- Total Square Footage: ${financialMetrics.space?.grossSF?.toLocaleString() || 'Not calculated'} sq ft

FINANCIAL PROJECTIONS:
- Total Investment: $${(financialMetrics.capex.total / 1000000).toFixed(1)}M
- Construction Cost: $${((financialMetrics.capex.construction || 0) / 1000000).toFixed(1)}M
- Equipment Cost: $${((financialMetrics.capex.equipment || 0) / 1000000).toFixed(1)}M
- Monthly Revenue: $${(financialMetrics.revenue.total / 1000).toFixed(0)}K
- Monthly Operating Expenses: $${(financialMetrics.opex.total / 1000).toFixed(0)}K
- Monthly EBITDA: $${((financialMetrics.revenue.total - financialMetrics.opex.total) / 1000).toFixed(0)}K
- ROI: ${financialMetrics.profitability?.roi?.toFixed(1) || 'N/A'}%
- Break-even: ${financialMetrics.profitability?.breakEvenMonths || 'N/A'} months

REVENUE BREAKDOWN:
- Memberships: $${((financialMetrics.revenue.memberships || 0) / 1000).toFixed(0)}K/month
- Rentals: $${((financialMetrics.revenue.rentals || 0) / 1000).toFixed(0)}K/month
- Lessons: $${((financialMetrics.revenue.lessons || 0) / 1000).toFixed(0)}K/month

SPORTS BREAKDOWN:
${financialMetrics.sportsBreakdown?.map((sport: any) => 
  `- ${sport.sportId}: ${sport.squareFootage} sq ft, $${(sport.totalCost / 1000).toFixed(0)}K investment, $${(sport.monthlyRevenue / 1000).toFixed(1)}K monthly revenue`
).join('\n') || 'No sports breakdown available'}

Please provide a 3-4 paragraph professional summary that includes:
1. Overall financial viability and key strengths
2. Market positioning and competitive advantages
3. Risk factors and areas of concern
4. Strategic recommendations for success

Keep the tone professional but accessible, as if speaking to a potential investor or facility owner.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sports facility financial advisor with deep knowledge of the industry. Provide insightful, actionable analysis based on financial projections.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error, using fallback summary:', errorData);
      
      // Generate fallback summary instead of throwing error
      const fallbackSummary = generateFallbackSummary(financialMetrics, wizardData);
      return new Response(JSON.stringify({ 
        summary: fallbackSummary,
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary, fallback: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: error.errors 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.error('Error in generate-financial-summary function:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: 'An error occurred while generating the financial summary' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
