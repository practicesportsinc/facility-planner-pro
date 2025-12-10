import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Function version for deployment tracking
const VERSION = '1.0.3';

console.log(`analyze-location function loaded - Version ${VERSION} at ${new Date().toISOString()}`);

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

// Compute state from ZIP prefix using ranges (more compact than explicit mapping)
function getStateFromZip(zipCode: string): string | null {
  if (!zipCode || zipCode.length < 3) return null;
  const prefix = parseInt(zipCode.substring(0, 3));
  if (isNaN(prefix)) return null;
  
  // ZIP prefix ranges by state (USPS standard ranges)
  if (prefix >= 10 && prefix <= 24) return 'MA';
  if (prefix >= 25 && prefix <= 26) return 'RI';
  if (prefix >= 27 && prefix <= 28) return 'NH';
  if (prefix >= 50 && prefix <= 54) return 'VT';
  if (prefix >= 60 && prefix <= 69) return 'CT';
  if (prefix >= 70 && prefix <= 89) return 'NJ';
  if (prefix >= 100 && prefix <= 149) return 'NY';
  if (prefix >= 150 && prefix <= 196) return 'PA';
  if (prefix >= 197 && prefix <= 199) return 'DE';
  if (prefix >= 200 && prefix <= 205) return 'DC';
  if (prefix >= 206 && prefix <= 219) return 'MD';
  if (prefix >= 220 && prefix <= 246) return 'VA';
  if (prefix >= 247 && prefix <= 268) return 'WV';
  if (prefix >= 270 && prefix <= 289) return 'NC';
  if (prefix >= 290 && prefix <= 299) return 'SC';
  if (prefix >= 300 && prefix <= 319) return 'GA';
  if (prefix >= 320 && prefix <= 349) return 'FL';
  if (prefix >= 350 && prefix <= 369) return 'AL';
  if (prefix >= 370 && prefix <= 385) return 'TN';
  if (prefix >= 386 && prefix <= 397) return 'MS';
  if (prefix >= 400 && prefix <= 427) return 'KY';
  if (prefix >= 430 && prefix <= 458) return 'OH';
  if (prefix >= 460 && prefix <= 479) return 'IN';
  if (prefix >= 480 && prefix <= 499) return 'MI';
  if (prefix >= 500 && prefix <= 528) return 'IA';
  if (prefix >= 530 && prefix <= 549) return 'WI';
  if (prefix >= 550 && prefix <= 567) return 'MN';
  if (prefix >= 570 && prefix <= 577) return 'SD';
  if (prefix >= 580 && prefix <= 588) return 'ND';
  if (prefix >= 590 && prefix <= 599) return 'MT';
  if (prefix >= 600 && prefix <= 629) return 'IL';
  if (prefix >= 630 && prefix <= 658) return 'MO';
  if (prefix >= 660 && prefix <= 679) return 'KS';
  if (prefix >= 680 && prefix <= 693) return 'NE';
  if (prefix >= 700 && prefix <= 714) return 'LA';
  if (prefix >= 716 && prefix <= 729) return 'AR';
  if (prefix >= 730 && prefix <= 749) return 'OK';
  if (prefix >= 750 && prefix <= 799) return 'TX';
  if (prefix >= 800 && prefix <= 816) return 'CO';
  if (prefix >= 820 && prefix <= 831) return 'WY';
  if (prefix >= 832 && prefix <= 838) return 'ID';
  if (prefix >= 840 && prefix <= 847) return 'UT';
  if (prefix >= 850 && prefix <= 865) return 'AZ';
  if (prefix >= 870 && prefix <= 884) return 'NM';
  if (prefix >= 889 && prefix <= 898) return 'NV';
  if (prefix >= 900 && prefix <= 961) return 'CA';
  if (prefix >= 967 && prefix <= 968) return 'HI';
  if (prefix >= 970 && prefix <= 979) return 'OR';
  if (prefix >= 980 && prefix <= 994) return 'WA';
  if (prefix >= 995 && prefix <= 999) return 'AK';
  
  return null;
}

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
  console.log('=== analyze-location function START ===');
  console.log(`Version: ${VERSION}`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: { ...corsHeaders, 'X-Function-Version': VERSION } 
    });
  }

  try {
    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', version: VERSION }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Function-Version': VERSION } 
        }
      );
    }
    
    console.log('Request body received:', JSON.stringify(body));
    
    let { zipCode, city, state, radius = 15 } = body;
    
    // Derive state from ZIP if not provided
    if (!state && zipCode && zipCode.length >= 3) {
      const derivedState = getStateFromZip(zipCode);
      if (derivedState) {
        console.log('State derived from ZIP prefix:', derivedState);
        state = derivedState;
      } else {
        console.log('Could not derive state from ZIP, using default PA');
        state = 'PA'; // Default fallback
      }
    }
    
    console.log('Analyzing location:', { zipCode, city, state, radius });

    // Try Census API first, fall back to estimates
    let censusData: CensusData;
    
    if (zipCode && zipCode.length === 5) {
      console.log('Fetching Census API data for ZIP:', zipCode);
      const apiData = await fetchCensusData(zipCode);
      if (apiData) {
        console.log('Census API data received successfully');
        censusData = apiData;
      } else {
        console.log('Census API failed, using fallback data for state:', state);
        censusData = getFallbackData(state);
      }
    } else {
      console.log('Invalid ZIP code, using fallback data');
      censusData = getFallbackData(state);
    }

    const regional = REGIONAL_DATA[state] || {
      populationMultiplier: 1.0,
      incomeMultiplier: 1.0,
      youthPercentage: 19,
      growthRate: 0.8,
      costOfLivingIndex: 1.0,
    };
    
    console.log('Using regional data for state:', state, regional);

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
        medianIncome: censusData.medianIncome,
        youthPercentage: youthPercentage,
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
    console.log('=== analyze-location function END (success) ===');

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Function-Version': VERSION
      },
    });

  } catch (error) {
    console.error('=== analyze-location function END (error) ===');
    console.error('Location analysis error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed',
        version: VERSION 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Function-Version': VERSION
        } 
      }
    );
  }
});
