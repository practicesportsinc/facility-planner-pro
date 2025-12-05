import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Demographic data estimates by region (simplified for demo)
// In production, integrate with US Census Bureau API, Esri ArcGIS, or similar
const REGIONAL_DATA: Record<string, {
  populationMultiplier: number;
  incomeMultiplier: number;
  youthPercentage: number;
  growthRate: number;
  costOfLivingIndex: number;
}> = {
  // Northeast
  'NY': { populationMultiplier: 1.4, incomeMultiplier: 1.3, youthPercentage: 18, growthRate: 0.5, costOfLivingIndex: 1.25 },
  'NJ': { populationMultiplier: 1.3, incomeMultiplier: 1.25, youthPercentage: 19, growthRate: 0.8, costOfLivingIndex: 1.2 },
  'MA': { populationMultiplier: 1.2, incomeMultiplier: 1.35, youthPercentage: 17, growthRate: 0.7, costOfLivingIndex: 1.3 },
  'CT': { populationMultiplier: 1.1, incomeMultiplier: 1.3, youthPercentage: 18, growthRate: 0.3, costOfLivingIndex: 1.2 },
  'PA': { populationMultiplier: 1.0, incomeMultiplier: 1.0, youthPercentage: 19, growthRate: 0.4, costOfLivingIndex: 1.0 },
  // Southeast
  'FL': { populationMultiplier: 1.2, incomeMultiplier: 0.95, youthPercentage: 17, growthRate: 1.8, costOfLivingIndex: 1.05 },
  'GA': { populationMultiplier: 1.1, incomeMultiplier: 0.95, youthPercentage: 20, growthRate: 1.5, costOfLivingIndex: 0.95 },
  'NC': { populationMultiplier: 1.0, incomeMultiplier: 0.9, youthPercentage: 19, growthRate: 1.3, costOfLivingIndex: 0.92 },
  'SC': { populationMultiplier: 0.9, incomeMultiplier: 0.85, youthPercentage: 18, growthRate: 1.4, costOfLivingIndex: 0.88 },
  'VA': { populationMultiplier: 1.1, incomeMultiplier: 1.1, youthPercentage: 19, growthRate: 1.0, costOfLivingIndex: 1.05 },
  // Midwest
  'IL': { populationMultiplier: 1.1, incomeMultiplier: 1.0, youthPercentage: 20, growthRate: 0.2, costOfLivingIndex: 0.98 },
  'OH': { populationMultiplier: 1.0, incomeMultiplier: 0.9, youthPercentage: 20, growthRate: 0.3, costOfLivingIndex: 0.88 },
  'MI': { populationMultiplier: 0.95, incomeMultiplier: 0.9, youthPercentage: 19, growthRate: 0.2, costOfLivingIndex: 0.9 },
  'IN': { populationMultiplier: 0.9, incomeMultiplier: 0.85, youthPercentage: 20, growthRate: 0.5, costOfLivingIndex: 0.85 },
  'WI': { populationMultiplier: 0.9, incomeMultiplier: 0.9, youthPercentage: 19, growthRate: 0.4, costOfLivingIndex: 0.9 },
  'MN': { populationMultiplier: 0.95, incomeMultiplier: 1.0, youthPercentage: 20, growthRate: 0.6, costOfLivingIndex: 0.95 },
  'IA': { populationMultiplier: 0.7, incomeMultiplier: 0.85, youthPercentage: 20, growthRate: 0.3, costOfLivingIndex: 0.82 },
  'MO': { populationMultiplier: 0.85, incomeMultiplier: 0.85, youthPercentage: 19, growthRate: 0.4, costOfLivingIndex: 0.85 },
  'NE': { populationMultiplier: 0.6, incomeMultiplier: 0.9, youthPercentage: 21, growthRate: 0.6, costOfLivingIndex: 0.88 },
  'KS': { populationMultiplier: 0.6, incomeMultiplier: 0.85, youthPercentage: 20, growthRate: 0.4, costOfLivingIndex: 0.85 },
  // Southwest
  'TX': { populationMultiplier: 1.3, incomeMultiplier: 0.95, youthPercentage: 22, growthRate: 1.8, costOfLivingIndex: 0.92 },
  'AZ': { populationMultiplier: 1.0, incomeMultiplier: 0.9, youthPercentage: 19, growthRate: 1.7, costOfLivingIndex: 0.98 },
  'NM': { populationMultiplier: 0.6, incomeMultiplier: 0.8, youthPercentage: 18, growthRate: 0.5, costOfLivingIndex: 0.9 },
  'OK': { populationMultiplier: 0.7, incomeMultiplier: 0.8, youthPercentage: 20, growthRate: 0.6, costOfLivingIndex: 0.85 },
  'CO': { populationMultiplier: 1.0, incomeMultiplier: 1.1, youthPercentage: 19, growthRate: 1.4, costOfLivingIndex: 1.05 },
  // West
  'CA': { populationMultiplier: 1.5, incomeMultiplier: 1.2, youthPercentage: 19, growthRate: 0.5, costOfLivingIndex: 1.4 },
  'WA': { populationMultiplier: 1.1, incomeMultiplier: 1.15, youthPercentage: 19, growthRate: 1.2, costOfLivingIndex: 1.15 },
  'OR': { populationMultiplier: 0.9, incomeMultiplier: 1.0, youthPercentage: 18, growthRate: 1.0, costOfLivingIndex: 1.1 },
  'NV': { populationMultiplier: 1.0, incomeMultiplier: 0.95, youthPercentage: 18, growthRate: 1.5, costOfLivingIndex: 1.0 },
  'UT': { populationMultiplier: 0.9, incomeMultiplier: 0.95, youthPercentage: 24, growthRate: 1.8, costOfLivingIndex: 0.98 },
};

// Base population estimates (can be refined with actual ZIP code data)
function estimatePopulationByRadius(state: string, radius: number): number {
  const regional = REGIONAL_DATA[state] || { populationMultiplier: 1.0 };
  const basePopulation = {
    10: 50000,
    15: 125000,
    20: 250000,
    30: 500000,
  };
  const base = basePopulation[radius as keyof typeof basePopulation] || 125000;
  return Math.round(base * regional.populationMultiplier);
}

function estimateMedianIncome(state: string): number {
  const regional = REGIONAL_DATA[state] || { incomeMultiplier: 1.0 };
  const baseIncome = 65000; // US median
  return Math.round(baseIncome * regional.incomeMultiplier);
}

function estimateYouthPopulation(state: string, totalPop: number): number {
  const regional = REGIONAL_DATA[state] || { youthPercentage: 19 };
  return Math.round(totalPop * (regional.youthPercentage / 100));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode, city, state } = await req.json();
    
    console.log('Analyzing location:', { zipCode, city, state });

    // Get regional data
    const regional = REGIONAL_DATA[state] || {
      populationMultiplier: 1.0,
      incomeMultiplier: 1.0,
      youthPercentage: 19,
      growthRate: 0.8,
      costOfLivingIndex: 1.0,
    };

    // Calculate population estimates
    const population10Min = estimatePopulationByRadius(state, 10);
    const population15Min = estimatePopulationByRadius(state, 15);
    const population20Min = estimatePopulationByRadius(state, 20);

    // Calculate demographic data
    const medianHouseholdIncome = estimateMedianIncome(state);
    const youthPopulation = estimateYouthPopulation(state, population15Min);
    const familiesWithChildren = Math.round(population15Min * 0.28 * regional.populationMultiplier);
    const populationGrowthRate = regional.growthRate;

    // Sports participation estimates (national averages adjusted by region)
    const sportsParticipation = {
      baseball: Math.round(youthPopulation * 0.12),
      softball: Math.round(youthPopulation * 0.08),
      basketball: Math.round(youthPopulation * 0.15),
      volleyball: Math.round(youthPopulation * 0.10),
      soccer: Math.round(youthPopulation * 0.14),
      pickleball: Math.round(population15Min * 0.03), // Growing adult sport
    };

    // Sport demand scores (0-100)
    const sportDemandScores = {
      baseball: calculateDemandScore('baseball', sportsParticipation.baseball, population15Min, state),
      softball: calculateDemandScore('softball', sportsParticipation.softball, population15Min, state),
      basketball: calculateDemandScore('basketball', sportsParticipation.basketball, population15Min, state),
      volleyball: calculateDemandScore('volleyball', sportsParticipation.volleyball, population15Min, state),
      soccer: calculateDemandScore('soccer', sportsParticipation.soccer, population15Min, state),
      pickleball: calculateDemandScore('pickleball', sportsParticipation.pickleball, population15Min, state),
    };

    // Regional cost adjustments
    const regionalCostAdjustments = {
      construction: regional.costOfLivingIndex,
      labor: regional.costOfLivingIndex * 0.95,
      rent: regional.costOfLivingIndex * 1.1,
    };

    const result = {
      location: {
        zipCode,
        city,
        state,
        region: getRegion(state),
      },
      demographics: {
        population10Min,
        population15Min,
        population20Min,
        medianHouseholdIncome,
        youthPopulation,
        youthPercentage: regional.youthPercentage,
        familiesWithChildren,
        populationGrowthRate,
      },
      sportsParticipation,
      sportDemandScores,
      regionalCostAdjustments,
      marketIndicators: {
        incomeIndex: regional.incomeMultiplier,
        growthIndex: regional.growthRate > 1.0 ? 'High Growth' : regional.growthRate > 0.5 ? 'Moderate Growth' : 'Stable',
        costOfLivingIndex: regional.costOfLivingIndex,
      },
    };

    console.log('Location analysis complete:', result.location);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Location analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateDemandScore(sport: string, participants: number, population: number, state: string): number {
  // Base score from participation rate
  const participationRate = participants / population;
  let score = Math.min(participationRate * 1000, 50);
  
  // Regional adjustments
  const regionalBoosts: Record<string, string[]> = {
    baseball: ['TX', 'FL', 'CA', 'AZ', 'GA'],
    softball: ['TX', 'OK', 'CA', 'FL', 'AZ'],
    basketball: ['IN', 'KY', 'NC', 'IL', 'NY'],
    volleyball: ['CA', 'NE', 'TX', 'HI', 'FL'],
    soccer: ['TX', 'CA', 'FL', 'WA', 'CO'],
    pickleball: ['FL', 'AZ', 'CA', 'TX', 'NC'],
  };
  
  if (regionalBoosts[sport]?.includes(state)) {
    score += 15;
  }
  
  // Population density bonus
  if (population > 200000) score += 10;
  if (population > 300000) score += 10;
  
  return Math.min(Math.round(score), 100);
}

function getRegion(state: string): string {
  const regions: Record<string, string[]> = {
    'Northeast': ['NY', 'NJ', 'MA', 'CT', 'PA', 'ME', 'NH', 'VT', 'RI'],
    'Southeast': ['FL', 'GA', 'NC', 'SC', 'VA', 'TN', 'AL', 'MS', 'LA', 'KY', 'WV'],
    'Midwest': ['IL', 'OH', 'MI', 'IN', 'WI', 'MN', 'IA', 'MO', 'NE', 'KS', 'ND', 'SD'],
    'Southwest': ['TX', 'AZ', 'NM', 'OK', 'CO'],
    'West': ['CA', 'WA', 'OR', 'NV', 'UT', 'ID', 'MT', 'WY', 'AK', 'HI'],
  };
  
  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(state)) return region;
  }
  return 'Other';
}
