import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('[analyze-location] Function loaded - v3 with competitive analysis');

// Facility ratios per population (national averages)
const FACILITY_RATIOS = {
  baseball: 15000,    // 1 facility per 15,000 population
  basketball: 12000,  // 1 facility per 12,000 population
  volleyball: 25000,  // 1 facility per 25,000 population
  pickleball: 30000,  // 1 facility per 30,000 (newer sport)
  soccer: 18000,      // 1 facility per 18,000 population
  softball: 20000,    // 1 facility per 20,000 population
};

interface CompetitiveAnalysis {
  competitionScore: number;
  facilityEstimates: Record<string, { count: number; saturation: 'underserved' | 'balanced' | 'saturated' }>;
  marketGaps: Array<{ sport: string; opportunity: number; reason: string }>;
  insights: string[];
}

function calculateCompetitiveAnalysis(
  population: number,
  demandScores: Record<string, number>,
  region: string
): CompetitiveAnalysis {
  // Regional adjustment factors (some regions have more facilities)
  const regionalFactors: Record<string, number> = {
    'Midwest': 0.85,      // Fewer facilities, more opportunity
    'Northeast': 1.15,    // More saturated
    'Southeast': 1.05,    // Slightly saturated
    'Southwest': 0.95,    // Average
    'West': 1.10,         // More saturated
  };
  
  const regionalFactor = regionalFactors[region] || 1.0;
  
  const facilityEstimates: Record<string, { count: number; saturation: 'underserved' | 'balanced' | 'saturated' }> = {};
  const marketGaps: Array<{ sport: string; opportunity: number; reason: string }> = [];
  const insights: string[] = [];
  
  let totalSaturationScore = 0;
  let sportCount = 0;
  
  for (const [sport, ratio] of Object.entries(FACILITY_RATIOS)) {
    const baseCount = Math.round((population / ratio) * regionalFactor);
    const estimatedCount = Math.max(1, baseCount);
    const demandScore = demandScores[sport] || 50;
    
    // Calculate saturation: high demand + few facilities = underserved
    // saturation ratio = (estimated facilities / expected for demand)
    const expectedForDemand = (demandScore / 50) * (population / ratio);
    const saturationRatio = estimatedCount / Math.max(1, expectedForDemand);
    
    let saturation: 'underserved' | 'balanced' | 'saturated';
    let saturationValue: number;
    
    if (saturationRatio < 0.7) {
      saturation = 'underserved';
      saturationValue = 25;
    } else if (saturationRatio > 1.3) {
      saturation = 'saturated';
      saturationValue = 75;
    } else {
      saturation = 'balanced';
      saturationValue = 50;
    }
    
    facilityEstimates[sport] = { count: estimatedCount, saturation };
    totalSaturationScore += saturationValue;
    sportCount++;
    
    // Identify market gaps (underserved + high demand)
    if (saturation === 'underserved' && demandScore >= 60) {
      const opportunity = Math.round((demandScore / 100) * (1 - saturationRatio) * 100);
      marketGaps.push({
        sport: sport.charAt(0).toUpperCase() + sport.slice(1),
        opportunity,
        reason: `High demand (${demandScore}/100) with limited competition (~${estimatedCount} facilities)`
      });
    }
  }
  
  // Sort gaps by opportunity score
  marketGaps.sort((a, b) => b.opportunity - a.opportunity);
  
  // Calculate overall competition score (lower = better opportunity)
  const competitionScore = Math.round(totalSaturationScore / sportCount);
  
  // Generate insights
  if (competitionScore < 40) {
    insights.push("This market shows strong opportunity with below-average competition across most sports");
  } else if (competitionScore > 60) {
    insights.push("This market has above-average competition - consider niche sports or premium positioning");
  }
  
  if (marketGaps.length > 0) {
    const topGap = marketGaps[0];
    insights.push(`${topGap.sport} shows highest opportunity with ${topGap.reason.toLowerCase()}`);
  }
  
  // Multi-sport insight
  const underservedSports = Object.entries(facilityEstimates)
    .filter(([_, data]) => data.saturation === 'underserved')
    .map(([sport, _]) => sport);
  
  if (underservedSports.length >= 2) {
    insights.push(`Consider multi-sport facility to capture demand in ${underservedSports.slice(0, 2).join(' and ')}`);
  }
  
  // Pickleball specific insight (fastest growing sport)
  if (facilityEstimates.pickleball?.saturation === 'underserved') {
    insights.push("Pickleball is the fastest-growing sport in America with very few dedicated facilities");
  }
  
  return {
    competitionScore,
    facilityEstimates,
    marketGaps: marketGaps.slice(0, 3), // Top 3 gaps
    insights: insights.slice(0, 4), // Max 4 insights
  };
}

serve(async (req) => {
  console.log('[analyze-location] Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { zipCode, radius = 10 } = body;
    console.log('[analyze-location] Processing ZIP:', zipCode, 'Radius:', radius);

    // Test data - will be replaced with Census API integration
    const demographics = {
      population10Min: 75000,
      population15Min: 150000,
      population20Min: 250000,
      medianIncome: 72000,
      youthPercentage: 21,
      familiesWithChildren: 30,
      populationGrowthRate: 0.6,
    };
    
    const sportDemandScores = {
      baseball: 75,
      basketball: 70,
      volleyball: 85,
      pickleball: 65,
      soccer: 60,
      softball: 55,
    };
    
    // Calculate competitive analysis
    const competitiveAnalysis = calculateCompetitiveAnalysis(
      demographics.population15Min,
      sportDemandScores,
      'Midwest'
    );

    const responseData = {
      location: { 
        zipCode: zipCode || '68138', 
        city: 'Omaha', 
        state: 'NE', 
        region: 'Midwest' 
      },
      demographics,
      sportsParticipation: {
        baseball: 8500,
        basketball: 12000,
        volleyball: 6500,
        pickleball: 4500,
        soccer: 9000,
        softball: 5000,
      },
      sportDemandScores,
      competitiveAnalysis,
      dataSource: {
        source: 'test',
        year: 2024,
        description: 'Test data - v3 with competitive analysis'
      },
      regionalCostAdjustment: 0.95,
    };

    console.log('[analyze-location] Returning response with competitive analysis for ZIP:', zipCode);
    
    return new Response(JSON.stringify(responseData), {
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
