import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Function version for deployment tracking
const VERSION = '1.0.2';

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

// ZIP prefix to state mapping for when state is not provided
const ZIP_PREFIX_TO_STATE: Record<string, string> = {
  // Northeast
  '010': 'MA', '011': 'MA', '012': 'MA', '013': 'MA', '014': 'MA', '015': 'MA', '016': 'MA', '017': 'MA', '018': 'MA', '019': 'MA', '020': 'MA', '021': 'MA', '022': 'MA', '023': 'MA', '024': 'MA',
  '100': 'NY', '101': 'NY', '102': 'NY', '103': 'NY', '104': 'NY', '105': 'NY', '106': 'NY', '107': 'NY', '108': 'NY', '109': 'NY',
  '110': 'NY', '111': 'NY', '112': 'NY', '113': 'NY', '114': 'NY', '115': 'NY', '116': 'NY', '117': 'NY', '118': 'NY', '119': 'NY',
  '120': 'NY', '121': 'NY', '122': 'NY', '123': 'NY', '124': 'NY', '125': 'NY', '126': 'NY', '127': 'NY', '128': 'NY', '129': 'NY',
  '130': 'NY', '131': 'NY', '132': 'NY', '133': 'NY', '134': 'NY', '135': 'NY', '136': 'NY', '137': 'NY', '138': 'NY', '139': 'NY', '140': 'NY', '141': 'NY', '142': 'NY', '143': 'NY', '144': 'NY', '145': 'NY', '146': 'NY', '147': 'NY', '148': 'NY', '149': 'NY',
  '070': 'NJ', '071': 'NJ', '072': 'NJ', '073': 'NJ', '074': 'NJ', '075': 'NJ', '076': 'NJ', '077': 'NJ', '078': 'NJ', '079': 'NJ', '080': 'NJ', '081': 'NJ', '082': 'NJ', '083': 'NJ', '084': 'NJ', '085': 'NJ', '086': 'NJ', '087': 'NJ', '088': 'NJ', '089': 'NJ',
  '150': 'PA', '151': 'PA', '152': 'PA', '153': 'PA', '154': 'PA', '155': 'PA', '156': 'PA', '157': 'PA', '158': 'PA', '159': 'PA', '160': 'PA', '161': 'PA', '162': 'PA', '163': 'PA', '164': 'PA', '165': 'PA', '166': 'PA', '167': 'PA', '168': 'PA', '169': 'PA',
  '170': 'PA', '171': 'PA', '172': 'PA', '173': 'PA', '174': 'PA', '175': 'PA', '176': 'PA', '177': 'PA', '178': 'PA', '179': 'PA', '180': 'PA', '181': 'PA', '182': 'PA', '183': 'PA', '184': 'PA', '185': 'PA', '186': 'PA', '187': 'PA', '188': 'PA', '189': 'PA', '190': 'PA', '191': 'PA', '192': 'PA', '193': 'PA', '194': 'PA', '195': 'PA', '196': 'PA',
  '060': 'CT', '061': 'CT', '062': 'CT', '063': 'CT', '064': 'CT', '065': 'CT', '066': 'CT', '067': 'CT', '068': 'CT', '069': 'CT',
  // Southeast
  '320': 'FL', '321': 'FL', '322': 'FL', '323': 'FL', '324': 'FL', '325': 'FL', '326': 'FL', '327': 'FL', '328': 'FL', '329': 'FL',
  '330': 'FL', '331': 'FL', '332': 'FL', '333': 'FL', '334': 'FL', '335': 'FL', '336': 'FL', '337': 'FL', '338': 'FL', '339': 'FL', '340': 'FL', '341': 'FL', '342': 'FL', '344': 'FL', '346': 'FL', '347': 'FL', '349': 'FL',
  '300': 'GA', '301': 'GA', '302': 'GA', '303': 'GA', '304': 'GA', '305': 'GA', '306': 'GA', '307': 'GA', '308': 'GA', '309': 'GA', '310': 'GA', '311': 'GA', '312': 'GA', '313': 'GA', '314': 'GA', '315': 'GA', '316': 'GA', '317': 'GA', '318': 'GA', '319': 'GA', '398': 'GA', '399': 'GA',
  '270': 'NC', '271': 'NC', '272': 'NC', '273': 'NC', '274': 'NC', '275': 'NC', '276': 'NC', '277': 'NC', '278': 'NC', '279': 'NC', '280': 'NC', '281': 'NC', '282': 'NC', '283': 'NC', '284': 'NC', '285': 'NC', '286': 'NC', '287': 'NC', '288': 'NC', '289': 'NC',
  '290': 'SC', '291': 'SC', '292': 'SC', '293': 'SC', '294': 'SC', '295': 'SC', '296': 'SC', '297': 'SC', '298': 'SC', '299': 'SC',
  '220': 'VA', '221': 'VA', '222': 'VA', '223': 'VA', '224': 'VA', '225': 'VA', '226': 'VA', '227': 'VA', '228': 'VA', '229': 'VA', '230': 'VA', '231': 'VA', '232': 'VA', '233': 'VA', '234': 'VA', '235': 'VA', '236': 'VA', '237': 'VA', '238': 'VA', '239': 'VA', '240': 'VA', '241': 'VA', '243': 'VA', '244': 'VA', '245': 'VA', '246': 'VA',
  // Midwest
  '600': 'IL', '601': 'IL', '602': 'IL', '603': 'IL', '604': 'IL', '605': 'IL', '606': 'IL', '607': 'IL', '608': 'IL', '609': 'IL', '610': 'IL', '611': 'IL', '612': 'IL', '613': 'IL', '614': 'IL', '615': 'IL', '616': 'IL', '617': 'IL', '618': 'IL', '619': 'IL', '620': 'IL', '622': 'IL', '623': 'IL', '624': 'IL', '625': 'IL', '626': 'IL', '627': 'IL', '628': 'IL', '629': 'IL',
  '430': 'OH', '431': 'OH', '432': 'OH', '433': 'OH', '434': 'OH', '435': 'OH', '436': 'OH', '437': 'OH', '438': 'OH', '439': 'OH', '440': 'OH', '441': 'OH', '442': 'OH', '443': 'OH', '444': 'OH', '445': 'OH', '446': 'OH', '447': 'OH', '448': 'OH', '449': 'OH', '450': 'OH', '451': 'OH', '452': 'OH', '453': 'OH', '454': 'OH', '455': 'OH', '456': 'OH', '457': 'OH', '458': 'OH',
  '480': 'MI', '481': 'MI', '482': 'MI', '483': 'MI', '484': 'MI', '485': 'MI', '486': 'MI', '487': 'MI', '488': 'MI', '489': 'MI', '490': 'MI', '491': 'MI', '492': 'MI', '493': 'MI', '494': 'MI', '495': 'MI', '496': 'MI', '497': 'MI', '498': 'MI', '499': 'MI',
  '460': 'IN', '461': 'IN', '462': 'IN', '463': 'IN', '464': 'IN', '465': 'IN', '466': 'IN', '467': 'IN', '468': 'IN', '469': 'IN', '470': 'IN', '471': 'IN', '472': 'IN', '473': 'IN', '474': 'IN', '475': 'IN', '476': 'IN', '477': 'IN', '478': 'IN', '479': 'IN',
  '530': 'WI', '531': 'WI', '532': 'WI', '534': 'WI', '535': 'WI', '537': 'WI', '538': 'WI', '539': 'WI', '540': 'WI', '541': 'WI', '542': 'WI', '543': 'WI', '544': 'WI', '545': 'WI', '546': 'WI', '547': 'WI', '548': 'WI', '549': 'WI',
  '550': 'MN', '551': 'MN', '553': 'MN', '554': 'MN', '555': 'MN', '556': 'MN', '557': 'MN', '558': 'MN', '559': 'MN', '560': 'MN', '561': 'MN', '562': 'MN', '563': 'MN', '564': 'MN', '565': 'MN', '566': 'MN', '567': 'MN',
  '500': 'IA', '501': 'IA', '502': 'IA', '503': 'IA', '504': 'IA', '505': 'IA', '506': 'IA', '507': 'IA', '508': 'IA', '509': 'IA', '510': 'IA', '511': 'IA', '512': 'IA', '513': 'IA', '514': 'IA', '515': 'IA', '516': 'IA', '520': 'IA', '521': 'IA', '522': 'IA', '523': 'IA', '524': 'IA', '525': 'IA', '526': 'IA', '527': 'IA', '528': 'IA',
  '630': 'MO', '631': 'MO', '633': 'MO', '634': 'MO', '635': 'MO', '636': 'MO', '637': 'MO', '638': 'MO', '639': 'MO', '640': 'MO', '641': 'MO', '644': 'MO', '645': 'MO', '646': 'MO', '647': 'MO', '648': 'MO', '649': 'MO', '650': 'MO', '651': 'MO', '652': 'MO', '653': 'MO', '654': 'MO', '655': 'MO', '656': 'MO', '657': 'MO', '658': 'MO',
  '680': 'NE', '681': 'NE', '683': 'NE', '684': 'NE', '685': 'NE', '686': 'NE', '687': 'NE', '688': 'NE', '689': 'NE', '690': 'NE', '691': 'NE', '692': 'NE', '693': 'NE',
  '660': 'KS', '661': 'KS', '662': 'KS', '664': 'KS', '665': 'KS', '666': 'KS', '667': 'KS', '668': 'KS', '669': 'KS', '670': 'KS', '671': 'KS', '672': 'KS', '673': 'KS', '674': 'KS', '675': 'KS', '676': 'KS', '677': 'KS', '678': 'KS', '679': 'KS',
  // Southwest
  '750': 'TX', '751': 'TX', '752': 'TX', '753': 'TX', '754': 'TX', '755': 'TX', '756': 'TX', '757': 'TX', '758': 'TX', '759': 'TX', '760': 'TX', '761': 'TX', '762': 'TX', '763': 'TX', '764': 'TX', '765': 'TX', '766': 'TX', '767': 'TX', '768': 'TX', '769': 'TX',
  '770': 'TX', '771': 'TX', '772': 'TX', '773': 'TX', '774': 'TX', '775': 'TX', '776': 'TX', '777': 'TX', '778': 'TX', '779': 'TX', '780': 'TX', '781': 'TX', '782': 'TX', '783': 'TX', '784': 'TX', '785': 'TX', '786': 'TX', '787': 'TX', '788': 'TX', '789': 'TX', '790': 'TX', '791': 'TX', '792': 'TX', '793': 'TX', '794': 'TX', '795': 'TX', '796': 'TX', '797': 'TX', '798': 'TX', '799': 'TX',
  '850': 'AZ', '851': 'AZ', '852': 'AZ', '853': 'AZ', '855': 'AZ', '856': 'AZ', '857': 'AZ', '859': 'AZ', '860': 'AZ', '863': 'AZ', '864': 'AZ', '865': 'AZ',
  '870': 'NM', '871': 'NM', '872': 'NM', '873': 'NM', '874': 'NM', '875': 'NM', '877': 'NM', '878': 'NM', '879': 'NM', '880': 'NM', '881': 'NM', '882': 'NM', '883': 'NM', '884': 'NM',
  '730': 'OK', '731': 'OK', '734': 'OK', '735': 'OK', '736': 'OK', '737': 'OK', '738': 'OK', '739': 'OK', '740': 'OK', '741': 'OK', '743': 'OK', '744': 'OK', '745': 'OK', '746': 'OK', '747': 'OK', '748': 'OK', '749': 'OK',
  '800': 'CO', '801': 'CO', '802': 'CO', '803': 'CO', '804': 'CO', '805': 'CO', '806': 'CO', '807': 'CO', '808': 'CO', '809': 'CO', '810': 'CO', '811': 'CO', '812': 'CO', '813': 'CO', '814': 'CO', '815': 'CO', '816': 'CO',
  // West
  '900': 'CA', '901': 'CA', '902': 'CA', '903': 'CA', '904': 'CA', '905': 'CA', '906': 'CA', '907': 'CA', '908': 'CA', '910': 'CA', '911': 'CA', '912': 'CA', '913': 'CA', '914': 'CA', '915': 'CA', '916': 'CA', '917': 'CA', '918': 'CA',
  '920': 'CA', '921': 'CA', '922': 'CA', '923': 'CA', '924': 'CA', '925': 'CA', '926': 'CA', '927': 'CA', '928': 'CA', '930': 'CA', '931': 'CA', '932': 'CA', '933': 'CA', '934': 'CA', '935': 'CA', '936': 'CA', '937': 'CA', '938': 'CA', '939': 'CA',
  '940': 'CA', '941': 'CA', '942': 'CA', '943': 'CA', '944': 'CA', '945': 'CA', '946': 'CA', '947': 'CA', '948': 'CA', '949': 'CA', '950': 'CA', '951': 'CA', '952': 'CA', '953': 'CA', '954': 'CA', '955': 'CA', '956': 'CA', '957': 'CA', '958': 'CA', '959': 'CA', '960': 'CA', '961': 'CA',
  '980': 'WA', '981': 'WA', '982': 'WA', '983': 'WA', '984': 'WA', '985': 'WA', '986': 'WA', '988': 'WA', '989': 'WA', '990': 'WA', '991': 'WA', '992': 'WA', '993': 'WA', '994': 'WA',
  '970': 'OR', '971': 'OR', '972': 'OR', '973': 'OR', '974': 'OR', '975': 'OR', '976': 'OR', '977': 'OR', '978': 'OR', '979': 'OR',
  '889': 'NV', '890': 'NV', '891': 'NV', '893': 'NV', '894': 'NV', '895': 'NV', '897': 'NV', '898': 'NV',
  '840': 'UT', '841': 'UT', '842': 'UT', '843': 'UT', '844': 'UT', '845': 'UT', '846': 'UT', '847': 'UT',
};

function getStateFromZip(zipCode: string): string | null {
  if (!zipCode || zipCode.length < 3) return null;
  const prefix = zipCode.substring(0, 3);
  return ZIP_PREFIX_TO_STATE[prefix] || null;
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
