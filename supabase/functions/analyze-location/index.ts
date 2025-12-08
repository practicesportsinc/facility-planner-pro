import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Census API variables
const CENSUS_VARIABLES = [
  'B01003_001E', // Total Population
  'B19013_001E', // Median Household Income
  'B09001_001E', // Population Under 18 Years
  'B11001_001E', // Total Households
  'B11003_002E', // Married-couple family households
  'B11003_010E', // Male householder, no spouse, with children
  'B11003_016E', // Female householder, no spouse, with children
].join(',');

// Regional fallback data
const REGIONAL_DATA: Record<string, {
  populationMultiplier: number;
  incomeMultiplier: number;
  youthPercentage: number;
  growthRate: number;
  costOfLivingIndex: number;
}> = {
  'NY': { populationMultiplier: 1.4, incomeMultiplier: 1.3, youthPercentage: 18, growthRate: 0.5, costOfLivingIndex: 1.25 },
  'NJ': { populationMultiplier: 1.3, incomeMultiplier: 1.25, youthPercentage: 19, growthRate: 0.8, costOfLivingIndex: 1.2 },
  'MA': { populationMultiplier: 1.2, incomeMultiplier: 1.35, youthPercentage: 17, growthRate: 0.7, costOfLivingIndex: 1.3 },
  'CT': { populationMultiplier: 1.1, incomeMultiplier: 1.3, youthPercentage: 18, growthRate: 0.3, costOfLivingIndex: 1.2 },
  'PA': { populationMultiplier: 1.0, incomeMultiplier: 1.0, youthPercentage: 19, growthRate: 0.4, costOfLivingIndex: 1.0 },
  'FL': { populationMultiplier: 1.2, incomeMultiplier: 0.95, youthPercentage: 17, growthRate: 1.8, costOfLivingIndex: 1.05 },
  'GA': { populationMultiplier: 1.1, incomeMultiplier: 0.95, youthPercentage: 20, growthRate: 1.5, costOfLivingIndex: 0.95 },
  'NC': { populationMultiplier: 1.0, incomeMultiplier: 0.9, youthPercentage: 19, growthRate: 1.3, costOfLivingIndex: 0.92 },
  'SC': { populationMultiplier: 0.9, incomeMultiplier: 0.85, youthPercentage: 18, growthRate: 1.4, costOfLivingIndex: 0.88 },
  'VA': { populationMultiplier: 1.1, incomeMultiplier: 1.1, youthPercentage: 19, growthRate: 1.0, costOfLivingIndex: 1.05 },
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
  'TX': { populationMultiplier: 1.3, incomeMultiplier: 0.95, youthPercentage: 22, growthRate: 1.8, costOfLivingIndex: 0.92 },
  'AZ': { populationMultiplier: 1.0, incomeMultiplier: 0.9, youthPercentage: 19, growthRate: 1.7, costOfLivingIndex: 0.98 },
  'NM': { populationMultiplier: 0.6, incomeMultiplier: 0.8, youthPercentage: 18, growthRate: 0.5, costOfLivingIndex: 0.9 },
  'OK': { populationMultiplier: 0.7, incomeMultiplier: 0.8, youthPercentage: 20, growthRate: 0.6, costOfLivingIndex: 0.85 },
  'CO': { populationMultiplier: 1.0, incomeMultiplier: 1.1, youthPercentage: 19, growthRate: 1.4, costOfLivingIndex: 1.05 },
  'CA': { populationMultiplier: 1.5, incomeMultiplier: 1.2, youthPercentage: 19, growthRate: 0.5, costOfLivingIndex: 1.4 },
  'WA': { populationMultiplier: 1.1, incomeMultiplier: 1.15, youthPercentage: 19, growthRate: 1.2, costOfLivingIndex: 1.15 },
  'OR': { populationMultiplier: 0.9, incomeMultiplier: 1.0, youthPercentage: 18, growthRate: 1.0, costOfLivingIndex: 1.1 },
  'NV': { populationMultiplier: 1.0, incomeMultiplier: 0.95, youthPercentage: 18, growthRate: 1.5, costOfLivingIndex: 1.0 },
  'UT': { populationMultiplier: 0.9, incomeMultiplier: 0.95, youthPercentage: 24, growthRate: 1.8, costOfLivingIndex: 0.98 },
};

interface CensusData {
  totalPopulation: number;
  medianIncome: number;
  youthPopulation: number;
  totalHouseholds: number;
  familiesWithChildren: number;
  dataSource: 'census' | 'estimated';
  dataYear: string;
}

async function fetchCensusData(zipCode: string): Promise<CensusData | null> {
  const censusApiKey = Deno.env.get('CENSUS_API_KEY');
  
  try {
    // Census ACS 5-Year Data API - works without key but rate limited
    const baseUrl = 'https://api.census.gov/data/2022/acs/acs5';
    const keyParam = censusApiKey ? `&key=${censusApiKey}` : '';
    const url = `${baseUrl}?get=NAME,${CENSUS_VARIABLES}&for=zip%20code%20tabulation%20area:${zipCode}${keyParam}`;
    
    console.log('Fetching Census data for ZIP:', zipCode);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('Census API response not OK:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Census returns 2D array: [headers, values]
    if (!data || data.length < 2) {
      console.log('Census API returned no data for ZIP:', zipCode);
      return null;
    }
    
    const headers = data[0];
    const values = data[1];
    
    // Parse values by header index
    const getValue = (code: string): number => {
      const idx = headers.indexOf(code);
      if (idx === -1) return 0;
      const val = parseInt(values[idx]);
      return isNaN(val) || val < 0 ? 0 : val;
    };
    
    const totalPopulation = getValue('B01003_001E');
    const medianIncome = getValue('B19013_001E');
    const youthPop = getValue('B09001_001E');
    const totalHouseholds = getValue('B11001_001E');
    const marriedWithKids = getValue('B11003_002E');
    const maleHouseholderKids = getValue('B11003_010E');
    const femaleHouseholderKids = getValue('B11003_016E');
    
    const familiesWithChildren = marriedWithKids + maleHouseholderKids + femaleHouseholderKids;
    
    console.log('Census data parsed:', {
      totalPopulation,
      medianIncome,
      youthPop,
      totalHouseholds,
      familiesWithChildren,
    });
    
    return {
      totalPopulation,
      medianIncome,
      youthPopulation: youthPop,
      totalHouseholds,
      familiesWithChildren,
      dataSource: 'census',
      dataYear: '2022',
    };
  } catch (error) {
    console.error('Census API error:', error);
    return null;
  }
}

function getFallbackData(state: string): CensusData {
  const regional = REGIONAL_DATA[state] || {
    populationMultiplier: 1.0,
    incomeMultiplier: 1.0,
    youthPercentage: 19,
    growthRate: 0.8,
    costOfLivingIndex: 1.0,
  };
  
  const basePopulation = 25000;
  const totalPopulation = Math.round(basePopulation * regional.populationMultiplier);
  
  return {
    totalPopulation,
    medianIncome: Math.round(65000 * regional.incomeMultiplier),
    youthPopulation: Math.round(totalPopulation * (regional.youthPercentage / 100)),
    totalHouseholds: Math.round(totalPopulation / 2.5),
    familiesWithChildren: Math.round(totalPopulation * 0.28),
    dataSource: 'estimated',
    dataYear: 'N/A',
  };
}

function estimateRadiusPopulation(zipPopulation: number, state: string, radiusMinutes: number): number {
  const regional = REGIONAL_DATA[state] || { populationMultiplier: 1.0 };
  
  // Radius multipliers based on drive time (assuming average density)
  // 10 min ≈ 5 mile radius, 15 min ≈ 8 mile radius, 20 min ≈ 12 mile radius
  const radiusMultipliers: Record<number, number> = {
    5: 1.5,
    10: 3.0,
    15: 6.0,
    20: 10.0,
    25: 15.0,
    30: 20.0,
  };
  
  const multiplier = radiusMultipliers[radiusMinutes] || 6.0;
  return Math.round(zipPopulation * multiplier * regional.populationMultiplier);
}

function calculateDemandScore(sport: string, participants: number, population: number, state: string): number {
  const participationRate = participants / population;
  let score = Math.min(participationRate * 1000, 50);
  
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

serve(async (req) => {
  console.log('analyze-location function invoked at:', new Date().toISOString());
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode, city, state, radius = 15 } = await req.json();
    
    console.log('Analyzing location:', { zipCode, city, state, radius });

    // Try Census API first, fall back to estimates
    let censusData: CensusData;
    
    if (zipCode && zipCode.length === 5) {
      const apiData = await fetchCensusData(zipCode);
      censusData = apiData || getFallbackData(state);
    } else {
      censusData = getFallbackData(state);
    }

    const regional = REGIONAL_DATA[state] || {
      populationMultiplier: 1.0,
      incomeMultiplier: 1.0,
      youthPercentage: 19,
      growthRate: 0.8,
      costOfLivingIndex: 1.0,
    };

    // Calculate radius populations based on ZIP population
    const population10Min = estimateRadiusPopulation(censusData.totalPopulation, state, 10);
    const population15Min = estimateRadiusPopulation(censusData.totalPopulation, state, 15);
    const population20Min = estimateRadiusPopulation(censusData.totalPopulation, state, 20);

    // Calculate percentages
    const youthPercentage = censusData.totalPopulation > 0 
      ? Math.round((censusData.youthPopulation / censusData.totalPopulation) * 100)
      : regional.youthPercentage;
    
    const familiesWithChildrenPct = censusData.totalHouseholds > 0
      ? Math.round((censusData.familiesWithChildren / censusData.totalHouseholds) * 100)
      : 28;

    // Calculate youth for the trade area
    const tradeAreaYouth = Math.round(population15Min * (youthPercentage / 100));

    // Sports participation estimates
    const sportsParticipation = {
      baseball: Math.round(tradeAreaYouth * 0.12),
      softball: Math.round(tradeAreaYouth * 0.08),
      basketball: Math.round(tradeAreaYouth * 0.15),
      volleyball: Math.round(tradeAreaYouth * 0.10),
      soccer: Math.round(tradeAreaYouth * 0.14),
      pickleball: Math.round(population15Min * 0.03),
    };

    // Sport demand scores
    const sportDemandScores = {
      baseball: calculateDemandScore('baseball', sportsParticipation.baseball, population15Min, state),
      softball: calculateDemandScore('softball', sportsParticipation.softball, population15Min, state),
      basketball: calculateDemandScore('basketball', sportsParticipation.basketball, population15Min, state),
      volleyball: calculateDemandScore('volleyball', sportsParticipation.volleyball, population15Min, state),
      soccer: calculateDemandScore('soccer', sportsParticipation.soccer, population15Min, state),
      pickleball: calculateDemandScore('pickleball', sportsParticipation.pickleball, population15Min, state),
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
        medianHouseholdIncome: censusData.medianIncome,
        youthPopulation: youthPercentage,
        youthPopulationCount: tradeAreaYouth,
        familiesWithChildren: familiesWithChildrenPct,
        populationGrowthRate: regional.growthRate,
        zipPopulation: censusData.totalPopulation,
      },
      dataSource: {
        source: censusData.dataSource,
        year: censusData.dataYear,
        description: censusData.dataSource === 'census' 
          ? 'US Census Bureau ACS 5-Year Estimates' 
          : 'Regional estimates based on state averages',
      },
      sportsParticipation,
      sportDemandScores,
      regionalCostAdjustments: {
        construction: regional.costOfLivingIndex,
        labor: regional.costOfLivingIndex * 0.95,
        rent: regional.costOfLivingIndex * 1.1,
      },
      marketIndicators: {
        incomeIndex: regional.incomeMultiplier,
        growthIndex: regional.growthRate > 1.0 ? 'High Growth' : regional.growthRate > 0.5 ? 'Moderate Growth' : 'Stable',
        costOfLivingIndex: regional.costOfLivingIndex,
      },
    };

    console.log('Location analysis complete:', {
      location: result.location,
      dataSource: result.dataSource,
      population15Min: result.demographics.population15Min,
    });

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
