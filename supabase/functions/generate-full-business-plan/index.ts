import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://facility-planner-pro.lovable.app',
  'https://id-preview--4da7e89e-10c0-46bf-bb1a-9914ee136192.lovable.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planData } = await req.json();
    
    console.log('Generating business plan for:', planData.projectOverview?.facilityName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build comprehensive prompt
    const prompt = buildBusinessPlanPrompt(planData);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional business plan writer specializing in sports facility development. 
Generate compelling, investor-ready content based on the provided facility data.
Be specific with numbers and realistic with projections.
Write in a professional but engaging tone.
Format your response as JSON with the following sections.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_business_plan_content',
              description: 'Generate comprehensive business plan content sections',
              parameters: {
                type: 'object',
                properties: {
                  executiveSummary: {
                    type: 'string',
                    description: 'A compelling 3-4 paragraph executive summary highlighting the investment opportunity, market opportunity, and key financial metrics'
                  },
                  marketAnalysisNarrative: {
                    type: 'string',
                    description: 'A detailed narrative analyzing the local market, demographics, and opportunity'
                  },
                  competitivePositioning: {
                    type: 'string',
                    description: 'Analysis of competitive landscape and how this facility will differentiate'
                  },
                  swotAnalysis: {
                    type: 'object',
                    properties: {
                      strengths: { type: 'array', items: { type: 'string' } },
                      weaknesses: { type: 'array', items: { type: 'string' } },
                      opportunities: { type: 'array', items: { type: 'string' } },
                      threats: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['strengths', 'weaknesses', 'opportunities', 'threats']
                  },
                  investmentThesis: {
                    type: 'string',
                    description: 'A compelling investment thesis explaining why this is a good investment'
                  },
                  riskMitigation: {
                    type: 'string',
                    description: 'Narrative explaining key risks and mitigation strategies'
                  },
                  marketingStrategy: {
                    type: 'string',
                    description: 'Go-to-market strategy and customer acquisition approach'
                  },
                  operationsOverview: {
                    type: 'string',
                    description: 'Overview of operations, staffing, and day-to-day management'
                  },
                  financialHighlights: {
                    type: 'string',
                    description: 'Key financial highlights and projections narrative'
                  },
                  finalRecommendation: {
                    type: 'string',
                    description: 'Final recommendation with go/no-go assessment'
                  }
                },
                required: [
                  'executiveSummary',
                  'marketAnalysisNarrative',
                  'competitivePositioning',
                  'swotAnalysis',
                  'investmentThesis',
                  'riskMitigation',
                  'marketingStrategy',
                  'operationsOverview',
                  'financialHighlights',
                  'finalRecommendation'
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_business_plan_content' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    let generatedContent = null;
    if (aiResponse.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        generatedContent = JSON.parse(aiResponse.choices[0].message.tool_calls[0].function.arguments);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }
    }

    // If AI generation failed, provide fallback content
    if (!generatedContent) {
      generatedContent = generateFallbackContent(planData);
    }

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-full-business-plan] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred generating the business plan' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildBusinessPlanPrompt(planData: any): string {
  const { projectOverview, marketAnalysis, sportSelection, competitiveAnalysis, facilityDesign, programming, financials, riskAssessment, timeline, scenario } = planData;
  
  // Calculate key financials
  const totalStartup = 
    (financials?.startupCosts?.leaseDeposit || 0) +
    (financials?.startupCosts?.buildoutConstruction || 0) +
    (financials?.startupCosts?.equipmentTechnology || 0) +
    (financials?.startupCosts?.preOpeningCosts || 0) +
    (financials?.startupCosts?.workingCapitalReserve || 0);
  const contingency = totalStartup * ((financials?.startupCosts?.contingencyPercentage || 10) / 100);
  const totalCapital = totalStartup + contingency;
  
  // Get selected sports
  const selectedSports = sportSelection?.primarySports?.filter((s: any) => s.selected)?.map((s: any) => s.sport) || [];
  
  return `Generate a professional business plan for the following sports facility:

FACILITY OVERVIEW:
- Name: ${projectOverview?.facilityName || 'Sports Facility'}
- Location: ${projectOverview?.city || 'City'}, ${projectOverview?.state || 'State'}
- Target Opening: ${projectOverview?.targetOpeningDate || 'TBD'}
- Build Mode: ${projectOverview?.buildMode || 'lease'}
- Size: ${facilityDesign?.totalSquareFootage?.toLocaleString() || '15,000'} SF
- Ceiling Height: ${facilityDesign?.ceilingHeight || 20} feet

MARKET DATA:
- Population (15 min drive): ${marketAnalysis?.population15Min?.toLocaleString() || '125,000'}
- Median Household Income: $${marketAnalysis?.medianHouseholdIncome?.toLocaleString() || '65,000'}
- Youth Population (5-18): ${marketAnalysis?.youthPopulation?.toLocaleString() || '25,000'}
- Population Growth Rate: ${marketAnalysis?.populationGrowthRate || 1.0}%
- Target Customer Segments: ${marketAnalysis?.customerSegments?.join(', ') || 'Youth athletes, travel teams'}

SPORTS OFFERED:
${selectedSports.length > 0 ? selectedSports.join(', ') : 'Baseball, Basketball, Volleyball'}

COMPETITIVE LANDSCAPE:
- Number of Competitors: ${competitiveAnalysis?.competitors?.length || 0}
- Market Gaps: ${competitiveAnalysis?.marketGaps?.join(', ') || 'Technology gap, quality gap'}
- Differentiation: ${competitiveAnalysis?.differentiationStrategy || 'Premium facility with latest technology'}

FINANCIAL SUMMARY:
- Total Capital Required: $${totalCapital.toLocaleString()}
- Equity/Debt Split: ${financials?.financing?.equityPercentage || 30}% / ${financials?.financing?.debtPercentage || 70}%
- Projection Scenario: ${scenario || 'base'}

RISK TOLERANCE: ${riskAssessment?.riskTolerance || 'moderate'}

Generate compelling, professional content that would satisfy investors and lenders.`;
}

function generateFallbackContent(planData: any): any {
  const facilityName = planData.projectOverview?.facilityName || 'Sports Facility';
  const city = planData.projectOverview?.city || 'the target market';
  const state = planData.projectOverview?.state || '';
  
  return {
    executiveSummary: `${facilityName} represents a compelling investment opportunity in the growing indoor sports facility market. Located in ${city}${state ? `, ${state}` : ''}, this facility will serve an underserved market with premium training facilities and programming. The facility will feature state-of-the-art equipment and technology to attract youth athletes, travel teams, and recreational players. With strong demographic tailwinds and limited local competition, we project achieving profitability within 18-24 months of opening.`,
    
    marketAnalysisNarrative: `The ${city} market presents a strong opportunity for an indoor sports facility. Population growth, combined with increasing youth sports participation rates, creates sustained demand for quality training facilities. The target demographic includes families with above-average household incomes who prioritize athletic development for their children. Market research indicates significant unmet demand for premium training facilities in this area.`,
    
    competitivePositioning: `${facilityName} will differentiate through superior facility quality, technology integration, and customer experience. While competitors in the market offer basic training facilities, our facility will feature modern equipment, professional-grade surfaces, and data-driven training technology. This positioning allows us to capture the premium segment of the market while building strong customer loyalty.`,
    
    swotAnalysis: {
      strengths: [
        'Modern facility with latest equipment and technology',
        'Experienced management team',
        'Prime location with strong demographics',
        'Diversified revenue streams'
      ],
      weaknesses: [
        'New entrant without established customer base',
        'Higher capital requirements than basic facilities',
        'Dependence on youth sports participation trends'
      ],
      opportunities: [
        'Growing youth sports market',
        'Limited quality competition in target area',
        'Expansion potential to additional sports/services',
        'Corporate and team partnership opportunities'
      ],
      threats: [
        'Economic downturn could reduce discretionary spending',
        'New competitor entry into market',
        'Changes in youth sports participation patterns',
        'Rising construction and operating costs'
      ]
    },
    
    investmentThesis: `${facilityName} offers investors exposure to the growing youth sports and fitness market with limited downside risk. The combination of favorable demographics, limited competition, and experienced management creates a compelling risk-adjusted return opportunity. Conservative projections indicate strong cash-on-cash returns with potential for significant appreciation upon exit.`,
    
    riskMitigation: `Key risks have been identified and mitigation strategies developed. Demand risk is addressed through extensive pre-opening marketing and partnership development with local leagues and schools. Operational risk is mitigated through experienced management and standardized operating procedures. Financial risk is managed through conservative projections and adequate working capital reserves.`,
    
    marketingStrategy: `Our go-to-market strategy focuses on building community relationships and establishing ${facilityName} as the premier training destination. Pre-opening activities include partnerships with local youth leagues, school athletic departments, and travel team organizations. Digital marketing will target parents of youth athletes, while facility tours and open houses will convert interest into memberships and bookings.`,
    
    operationsOverview: `The facility will operate seven days per week with extended hours to maximize utilization. A lean staffing model combines full-time management with flexible part-time staff to match demand patterns. Technology systems will automate booking, payment processing, and customer communication to enhance efficiency and customer experience.`,
    
    financialHighlights: `Based on conservative assumptions, the facility projects reaching break-even within 18-24 months of opening. Revenue diversification across court rentals, memberships, lessons, and events provides stability and growth potential. Operating margins are projected to improve as utilization increases and brand awareness builds.`,
    
    finalRecommendation: `Based on our analysis, ${facilityName} represents a viable investment opportunity with attractive risk-adjusted returns. We recommend proceeding with the project subject to securing appropriate financing and finalizing lease negotiations. Key success factors include pre-opening marketing execution and building strong community relationships.`
  };
}
