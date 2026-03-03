import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

console.log('[analyze-location] Function loaded - v4 with real Census data');

// --- State-to-region mapping ---
const STATE_TO_REGION: Record<string, string> = {
  CT: 'Northeast', ME: 'Northeast', MA: 'Northeast', NH: 'Northeast', RI: 'Northeast',
  VT: 'Northeast', NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast',
  IL: 'Midwest', IN: 'Midwest', MI: 'Midwest', OH: 'Midwest', WI: 'Midwest',
  IA: 'Midwest', KS: 'Midwest', MN: 'Midwest', MO: 'Midwest', NE: 'Midwest',
  ND: 'Midwest', SD: 'Midwest',
  DE: 'Southeast', FL: 'Southeast', GA: 'Southeast', MD: 'Southeast', NC: 'Southeast',
  SC: 'Southeast', VA: 'Southeast', DC: 'Southeast', WV: 'Southeast', AL: 'Southeast',
  KY: 'Southeast', MS: 'Southeast', TN: 'Southeast', AR: 'Southeast', LA: 'Southeast',
  OK: 'Southwest', TX: 'Southwest', AZ: 'Southwest', NM: 'Southwest',
  CO: 'West', ID: 'West', MT: 'West', NV: 'West', UT: 'West', WY: 'West',
  AK: 'West', CA: 'West', HI: 'West', OR: 'West', WA: 'West',
};

// State FIPS codes for Census API
const STATE_FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09', DE: '10',
  DC: '11', FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18', IA: '19',
  KS: '20', KY: '21', LA: '22', ME: '23', MD: '24', MA: '25', MI: '26', MN: '27',
  MS: '28', MO: '29', MT: '30', NE: '31', NV: '32', NH: '33', NJ: '34', NM: '35',
  NY: '36', NC: '37', ND: '38', OH: '39', OK: '40', OR: '41', PA: '42', RI: '44',
  SC: '45', SD: '46', TN: '47', TX: '48', UT: '49', VT: '50', VA: '51', WA: '53',
  WV: '54', WI: '55', WY: '56',
};

// Regional sport demand weights (base 50, adjusted per region)
const REGIONAL_SPORT_DEMAND: Record<string, Record<string, number>> = {
  Midwest:    { baseball: 80, basketball: 75, volleyball: 70, pickleball: 55, soccer: 55, softball: 70 },
  Northeast:  { baseball: 70, basketball: 80, volleyball: 60, pickleball: 60, soccer: 70, softball: 55 },
  Southeast:  { baseball: 85, basketball: 75, volleyball: 55, pickleball: 65, soccer: 60, softball: 75 },
  Southwest:  { baseball: 70, basketball: 70, volleyball: 50, pickleball: 80, soccer: 75, softball: 60 },
  West:       { baseball: 65, basketball: 70, volleyball: 75, pickleball: 85, soccer: 80, softball: 50 },
};

// Facility ratios per population (national averages)
const FACILITY_RATIOS: Record<string, number> = {
  baseball: 15000,
  basketball: 12000,
  volleyball: 25000,
  pickleball: 30000,
  soccer: 18000,
  softball: 20000,
};

// Regional adjustment factors for competition
const REGIONAL_FACTORS: Record<string, number> = {
  Midwest: 0.85,
  Northeast: 1.15,
  Southeast: 1.05,
  Southwest: 0.95,
  West: 1.10,
};

// --- ZIP lookup via zippopotam.us ---
interface ZipLookupResult {
  city: string;
  stateAbbr: string;
  latitude: number;
  longitude: number;
}

async function lookupZip(zipCode: string): Promise<ZipLookupResult | null> {
  try {
    const resp = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const place = data.places?.[0];
    if (!place) return null;
    return {
      city: place['place name'],
      stateAbbr: place['state abbreviation'],
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
    };
  } catch (e) {
    console.error('[analyze-location] ZIP lookup failed:', e);
    return null;
  }
}

// --- Census ACS 5-Year API ---
interface CensusData {
  population: number;
  medianIncome: number;
  youthPopulation: number;       // percentage under 18
  totalHouseholds: number;
  familiesWithChildren: number;  // percentage
}

async function fetchCensusData(stateAbbr: string, zipCode: string): Promise<CensusData | null> {
  const fips = STATE_FIPS[stateAbbr];
  if (!fips) return null;

  // ACS 5-Year variables:
  // B01003_001E = total population
  // B19013_001E = median household income
  // B09001_001E = population under 18
  // B11005_001E = households with children under 18  (numerator)
  // B11001_001E = total households (denominator)
  const variables = 'B01003_001E,B19013_001E,B09001_001E,B11005_001E,B11001_001E';

  // Try ZIP Code Tabulation Area (ZCTA) first
  const year = '2022'; // latest reliable ACS 5-year
  const zctaUrl = `https://api.census.gov/data/${year}/acs/acs5?get=${variables}&for=zip%20code%20tabulation%20area:${zipCode}`;
  
  try {
    console.log('[analyze-location] Fetching Census ZCTA data:', zctaUrl);
    const resp = await fetch(zctaUrl);
    if (resp.ok) {
      const json = await resp.json();
      if (json && json.length >= 2) {
        return parseCensusRow(json[1]);
      }
    }
    console.log('[analyze-location] ZCTA query failed, trying state-level fallback');
  } catch (e) {
    console.error('[analyze-location] Census ZCTA error:', e);
  }

  // Fallback: state-level data
  const stateUrl = `https://api.census.gov/data/${year}/acs/acs5?get=${variables}&for=state:${fips}`;
  try {
    console.log('[analyze-location] Fetching Census state data:', stateUrl);
    const resp = await fetch(stateUrl);
    if (resp.ok) {
      const json = await resp.json();
      if (json && json.length >= 2) {
        return parseCensusRow(json[1]);
      }
    }
  } catch (e) {
    console.error('[analyze-location] Census state error:', e);
  }

  return null;
}

function parseCensusRow(row: string[]): CensusData {
  const totalPop = parseInt(row[0]) || 0;
  const medianIncome = parseInt(row[1]) || 0;
  const under18 = parseInt(row[2]) || 0;
  const hhWithChildren = parseInt(row[3]) || 0;
  const totalHH = parseInt(row[4]) || 1; // avoid divide-by-zero

  return {
    population: totalPop,
    medianIncome: medianIncome > 0 ? medianIncome : 65000,
    youthPopulation: totalPop > 0 ? Math.round((under18 / totalPop) * 100) : 22,
    totalHouseholds: totalHH,
    familiesWithChildren: totalHH > 0 ? Math.round((hhWithChildren / totalHH) * 100) : 30,
  };
}

// --- Competitive analysis (unchanged logic) ---
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
  const regionalFactor = REGIONAL_FACTORS[region] || 1.0;

  const facilityEstimates: Record<string, { count: number; saturation: 'underserved' | 'balanced' | 'saturated' }> = {};
  const marketGaps: Array<{ sport: string; opportunity: number; reason: string }> = [];
  const insights: string[] = [];

  let totalSaturationScore = 0;
  let sportCount = 0;

  for (const [sport, ratio] of Object.entries(FACILITY_RATIOS)) {
    const baseCount = Math.round((population / ratio) * regionalFactor);
    const estimatedCount = Math.max(1, baseCount);
    const demandScore = demandScores[sport] || 50;

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

    if (saturation === 'underserved' && demandScore >= 60) {
      const opportunity = Math.round((demandScore / 100) * (1 - saturationRatio) * 100);
      marketGaps.push({
        sport: sport.charAt(0).toUpperCase() + sport.slice(1),
        opportunity,
        reason: `High demand (${demandScore}/100) with limited competition (~${estimatedCount} facilities)`
      });
    }
  }

  marketGaps.sort((a, b) => b.opportunity - a.opportunity);
  const competitionScore = Math.round(totalSaturationScore / sportCount);

  if (competitionScore < 40) {
    insights.push("This market shows strong opportunity with below-average competition across most sports");
  } else if (competitionScore > 60) {
    insights.push("This market has above-average competition - consider niche sports or premium positioning");
  }

  if (marketGaps.length > 0) {
    const topGap = marketGaps[0];
    insights.push(`${topGap.sport} shows highest opportunity with ${topGap.reason.toLowerCase()}`);
  }

  const underservedSports = Object.entries(facilityEstimates)
    .filter(([_, data]) => data.saturation === 'underserved')
    .map(([sport, _]) => sport);

  if (underservedSports.length >= 2) {
    insights.push(`Consider multi-sport facility to capture demand in ${underservedSports.slice(0, 2).join(' and ')}`);
  }

  if (facilityEstimates.pickleball?.saturation === 'underserved') {
    insights.push("Pickleball is the fastest-growing sport in America with very few dedicated facilities");
  }

  return {
    competitionScore,
    facilityEstimates,
    marketGaps: marketGaps.slice(0, 3),
    insights: insights.slice(0, 4),
  };
}

// --- Estimate drive-time populations from ZCTA population ---
function estimateDriveTimePopulations(basePop: number) {
  // Rough scaling: 10-min ≈ base pop, 15-min ≈ 2.5x, 20-min ≈ 4.5x
  return {
    population10Min: basePop,
    population15Min: Math.round(basePop * 2.5),
    population20Min: Math.round(basePop * 4.5),
  };
}

// --- Main handler ---
serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { zipCode, radius = 10 } = body;
    console.log('[analyze-location] Processing ZIP:', zipCode, 'Radius:', radius);

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid 5-digit ZIP code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Resolve ZIP to city/state
    const zipData = await lookupZip(zipCode);
    if (!zipData) {
      return new Response(JSON.stringify({ error: 'Could not find location for this ZIP code. Please check and try again.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { city, stateAbbr } = zipData;
    const region = STATE_TO_REGION[stateAbbr] || 'Midwest';
    console.log('[analyze-location] Resolved:', city, stateAbbr, '→', region);

    // Step 2: Fetch Census data
    const censusData = await fetchCensusData(stateAbbr, zipCode);
    const isEstimated = !censusData;

    // Use Census data or state-level estimates
    const pop = censusData?.population || 50000;
    const drivePops = estimateDriveTimePopulations(pop);

    const demographics = {
      population10Min: drivePops.population10Min,
      population15Min: drivePops.population15Min,
      population20Min: drivePops.population20Min,
      medianIncome: censusData?.medianIncome || 65000,
      youthPercentage: censusData?.youthPopulation || 22,
      familiesWithChildren: censusData?.familiesWithChildren || 30,
      populationGrowthRate: 0.5, // ACS doesn't provide growth rate; use neutral estimate
    };

    // Step 3: Regional sport demand scores
    const sportDemandScores = REGIONAL_SPORT_DEMAND[region] || REGIONAL_SPORT_DEMAND['Midwest'];

    // Step 4: Competitive analysis
    const competitiveAnalysis = calculateCompetitiveAnalysis(
      demographics.population15Min,
      sportDemandScores,
      region
    );

    // Step 5: Sport participation estimates based on population + demand
    const sportsParticipation: Record<string, number> = {};
    for (const [sport, demand] of Object.entries(sportDemandScores)) {
      sportsParticipation[sport] = Math.round((demographics.population15Min * (demand / 100)) * 0.08);
    }

    // Regional cost adjustment
    const REGIONAL_COST: Record<string, number> = {
      Midwest: 0.92, Northeast: 1.15, Southeast: 0.95, Southwest: 0.98, West: 1.12,
    };

    const responseData = {
      location: {
        zipCode,
        city,
        state: stateAbbr,
        region,
      },
      demographics,
      sportsParticipation,
      sportDemandScores,
      competitiveAnalysis,
      dataSource: {
        source: isEstimated ? 'estimated' : 'census',
        year: isEstimated ? 'N/A' : '2022',
        description: isEstimated
          ? 'Regional estimates based on state averages'
          : `US Census Bureau ACS 5-Year (2022) for ZIP ${zipCode}`,
      },
      regionalCostAdjustment: REGIONAL_COST[region] || 1.0,
    };

    console.log('[analyze-location] Returning', isEstimated ? 'estimated' : 'census', 'data for', city, stateAbbr);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[analyze-location] Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred analyzing the location' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
