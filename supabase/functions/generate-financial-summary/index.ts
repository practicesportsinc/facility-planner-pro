import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { financialMetrics, wizardData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the financial data for AI analysis
    const prompt = `
You are a sports facility financial advisor. Analyze the following financial projection data and provide a comprehensive, professional summary. Focus on key insights, opportunities, risks, and recommendations.

FACILITY DATA:
- Selected Sports: ${wizardData.selectedSports?.join(', ') || 'Not specified'}
- Facility Size: ${wizardData.facilitySize || 'Not specified'}
- Target Market: ${wizardData.targetMarket?.join(', ') || 'Not specified'}
- Total Square Footage: ${financialMetrics.space?.grossSF?.toLocaleString() || 'Not calculated'} sq ft

FINANCIAL PROJECTIONS:
- Total Investment: $${(financialMetrics.capex?.total / 1000000).toFixed(1)}M
- Construction Cost: $${(financialMetrics.capex?.construction / 1000000).toFixed(1)}M
- Equipment Cost: $${(financialMetrics.capex?.equipment / 1000000).toFixed(1)}M
- Monthly Revenue: $${(financialMetrics.revenue?.total / 1000).toFixed(0)}K
- Monthly Operating Expenses: $${(financialMetrics.opex?.total / 1000).toFixed(0)}K
- Monthly EBITDA: $${((financialMetrics.revenue?.total - financialMetrics.opex?.total) / 1000).toFixed(0)}K
- ROI: ${financialMetrics.profitability?.roi?.toFixed(1)}%
- Break-even: ${financialMetrics.profitability?.breakEvenMonths} months

REVENUE BREAKDOWN:
- Memberships: $${(financialMetrics.revenue?.memberships / 1000).toFixed(0)}K/month
- Rentals: $${(financialMetrics.revenue?.rentals / 1000).toFixed(0)}K/month
- Lessons: $${(financialMetrics.revenue?.lessons / 1000).toFixed(0)}K/month

SPORTS BREAKDOWN:
${financialMetrics.sportsBreakdown?.map((sport: any) => 
  `- ${sport.sportId}: ${sport.squareFootage} sq ft, $${(sport.totalCost / 1000).toFixed(0)}K investment, $${(sport.monthlyRevenue / 1000).toFixed(1)}K monthly revenue`
).join('\n') || 'No sports breakdown available'}

Please provide a 3-4 paragraph professional summary that includes:
1. Overall financial viability and key strengths
2. Market positioning and competitive advantages
3. Risk factors and areas of concern
4. Strategic recommendations for success

Keep the tone professional but accessible, as if speaking to a potential investor or facility owner.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
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
      console.error('OpenAI API error:', errorData);
      
      // Parse the error to provide better user feedback
      let errorMessage = `OpenAI API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error?.code === 'insufficient_quota') {
          errorMessage = 'OpenAI API quota exceeded. Please check your OpenAI account billing and add credits to continue using AI summaries.';
        } else if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-financial-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});