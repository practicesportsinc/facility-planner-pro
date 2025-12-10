import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('[analyze-location] MINIMAL TEST VERSION loaded');

serve(async (req) => {
  console.log('[analyze-location] Request received');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { zipCode } = body;
    console.log('[analyze-location] ZIP:', zipCode);

    return new Response(JSON.stringify({
      location: { 
        zipCode: zipCode || '68138', 
        city: 'Omaha', 
        state: 'NE', 
        region: 'Midwest' 
      },
      demographics: {
        population10Min: 75000,
        population15Min: 150000,
        population20Min: 250000,
        medianIncome: 72000,
        youthPercentage: 21,
        familiesWithChildren: 30,
        populationGrowthRate: 0.6,
      },
      sportsParticipation: {
        baseball: 8500,
        basketball: 12000,
        volleyball: 6500,
        pickleball: 4500,
        soccer: 9000,
        softball: 5000,
      },
      sportDemandScores: {
        baseball: 75,
        basketball: 70,
        volleyball: 85,
        pickleball: 65,
        soccer: 60,
        softball: 55,
      },
      dataSource: {
        source: 'test',
        year: 2024,
        description: 'Test data - deployment diagnostic'
      },
      regionalCostAdjustment: 0.95,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[analyze-location] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
