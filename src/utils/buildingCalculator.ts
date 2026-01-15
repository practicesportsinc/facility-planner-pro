import { COST_LIBRARY, getCostByTier } from '@/data/costLibrary';

export interface BuildingConfig {
  // Dimensions
  width: number;
  length: number;
  eaveHeight: number;
  
  // Sports (for height recommendations)
  sports: string[];
  
  // Doors & Openings
  rollUpDoors12x14: number;
  rollUpDoors10x12: number;
  manDoors: number;
  storefrontEntry: number;
  windows: number;
  
  // Finish Level
  finishLevel: 'basic' | 'standard' | 'premium';
  
  // Site Options
  sitePrep: boolean;
  concreteFoundation: boolean;
  parking: boolean;
  utilities: boolean;
  sprinklerSystem: boolean;
}

export interface BuildingEstimate {
  grossSF: number;
  items: BuildingLineItem[];
  subtotals: {
    structure: number;
    doors: number;
    systems: number;
    siteWork: number;
  };
  softCosts: number;
  contingency: number;
  total: number;
}

export interface BuildingLineItem {
  id: string;
  name: string;
  category: 'structure' | 'doors' | 'systems' | 'site_work';
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

// Clear height multipliers - taller buildings cost more per SF
const HEIGHT_MULTIPLIERS: Record<number, number> = {
  16: 1.0,
  20: 1.08,
  24: 1.18,
  30: 1.32,
};

// Finish level multipliers
const FINISH_MULTIPLIERS = {
  basic: 0.85,
  standard: 1.0,
  premium: 1.25,
};

// Get height multiplier with interpolation
function getHeightMultiplier(height: number): number {
  const heights = Object.keys(HEIGHT_MULTIPLIERS).map(Number).sort((a, b) => a - b);
  
  if (height <= heights[0]) return HEIGHT_MULTIPLIERS[heights[0]];
  if (height >= heights[heights.length - 1]) return HEIGHT_MULTIPLIERS[heights[heights.length - 1]];
  
  for (let i = 0; i < heights.length - 1; i++) {
    if (height >= heights[i] && height <= heights[i + 1]) {
      const ratio = (height - heights[i]) / (heights[i + 1] - heights[i]);
      return HEIGHT_MULTIPLIERS[heights[i]] + ratio * (HEIGHT_MULTIPLIERS[heights[i + 1]] - HEIGHT_MULTIPLIERS[heights[i]]);
    }
  }
  
  return 1.0;
}

// Get pricing tier based on finish level
function getTierFromFinish(finishLevel: 'basic' | 'standard' | 'premium'): 'low' | 'mid' | 'high' {
  switch (finishLevel) {
    case 'basic': return 'low';
    case 'standard': return 'mid';
    case 'premium': return 'high';
  }
}

export function calculateBuildingEstimate(config: BuildingConfig): BuildingEstimate {
  const grossSF = config.width * config.length;
  const perimeter = 2 * (config.width + config.length);
  const tier = getTierFromFinish(config.finishLevel);
  const heightMultiplier = getHeightMultiplier(config.eaveHeight);
  const finishMultiplier = FINISH_MULTIPLIERS[config.finishLevel];
  
  const items: BuildingLineItem[] = [];
  
  // ===== STRUCTURE =====
  
  // Metal Building Shell
  const shellCost = getCostByTier(COST_LIBRARY.metal_building_shell, tier);
  const adjustedShellCost = shellCost * heightMultiplier * finishMultiplier;
  items.push({
    id: 'metal_building_shell',
    name: 'Pre-Engineered Metal Building Shell',
    category: 'structure',
    quantity: grossSF,
    unit: 'SF',
    unitCost: Math.round(adjustedShellCost * 100) / 100,
    total: Math.round(grossSF * adjustedShellCost),
  });
  
  // Concrete Foundation
  if (config.concreteFoundation) {
    const foundationCost = getCostByTier(COST_LIBRARY.concrete_foundation, tier);
    items.push({
      id: 'concrete_foundation',
      name: 'Concrete Foundation (6" slab)',
      category: 'structure',
      quantity: grossSF,
      unit: 'SF',
      unitCost: foundationCost,
      total: Math.round(grossSF * foundationCost),
    });
  }
  
  // Insulation
  const insulationCost = getCostByTier(COST_LIBRARY.insulation_package, tier);
  items.push({
    id: 'insulation_package',
    name: 'Insulation Package (walls & roof)',
    category: 'structure',
    quantity: grossSF,
    unit: 'SF',
    unitCost: insulationCost,
    total: Math.round(grossSF * insulationCost),
  });
  
  // ===== DOORS & OPENINGS =====
  
  // Roll-up Doors 12x14
  if (config.rollUpDoors12x14 > 0) {
    const doorCost = getCostByTier(COST_LIBRARY.rollup_door_12x14, tier);
    items.push({
      id: 'rollup_door_12x14',
      name: 'Roll-up Door 12\'x14\'',
      category: 'doors',
      quantity: config.rollUpDoors12x14,
      unit: 'each',
      unitCost: doorCost,
      total: Math.round(config.rollUpDoors12x14 * doorCost),
    });
  }
  
  // Roll-up Doors 10x12
  if (config.rollUpDoors10x12 > 0) {
    const doorCost = getCostByTier(COST_LIBRARY.rollup_door_10x12, tier);
    items.push({
      id: 'rollup_door_10x12',
      name: 'Roll-up Door 10\'x12\'',
      category: 'doors',
      quantity: config.rollUpDoors10x12,
      unit: 'each',
      unitCost: doorCost,
      total: Math.round(config.rollUpDoors10x12 * doorCost),
    });
  }
  
  // Man Doors
  if (config.manDoors > 0) {
    const doorCost = getCostByTier(COST_LIBRARY.man_door, tier);
    items.push({
      id: 'man_door',
      name: 'Steel Man Door (3\'x7\')',
      category: 'doors',
      quantity: config.manDoors,
      unit: 'each',
      unitCost: doorCost,
      total: Math.round(config.manDoors * doorCost),
    });
  }
  
  // Storefront Entry
  if (config.storefrontEntry > 0) {
    const entryCost = getCostByTier(COST_LIBRARY.storefront_entry, tier);
    items.push({
      id: 'storefront_entry',
      name: 'Glass Storefront Entry',
      category: 'doors',
      quantity: config.storefrontEntry,
      unit: 'each',
      unitCost: entryCost,
      total: Math.round(config.storefrontEntry * entryCost),
    });
  }
  
  // Windows
  if (config.windows > 0) {
    const windowCost = getCostByTier(COST_LIBRARY.window_4x4, tier);
    items.push({
      id: 'window_4x4',
      name: 'Window 4\'x4\' (insulated)',
      category: 'doors',
      quantity: config.windows,
      unit: 'each',
      unitCost: windowCost,
      total: Math.round(config.windows * windowCost),
    });
  }
  
  // ===== BUILDING SYSTEMS =====
  
  // Electrical Service
  const electricalCost = getCostByTier(COST_LIBRARY.electrical_service, tier);
  items.push({
    id: 'electrical_service',
    name: 'Electrical Service (400A)',
    category: 'systems',
    quantity: 1,
    unit: 'lump sum',
    unitCost: electricalCost,
    total: electricalCost,
  });
  
  // Plumbing Rough-in
  const plumbingCost = getCostByTier(COST_LIBRARY.plumbing_roughin, tier);
  items.push({
    id: 'plumbing_roughin',
    name: 'Plumbing Rough-in',
    category: 'systems',
    quantity: 1,
    unit: 'lump sum',
    unitCost: plumbingCost,
    total: plumbingCost,
  });
  
  // HVAC (from existing cost library)
  const hvacCost = getCostByTier(COST_LIBRARY.hvac_installed, tier);
  items.push({
    id: 'hvac_installed',
    name: 'HVAC System',
    category: 'systems',
    quantity: grossSF,
    unit: 'SF',
    unitCost: hvacCost,
    total: Math.round(grossSF * hvacCost),
  });
  
  // LED Lighting (from existing cost library)
  const lightingCost = getCostByTier(COST_LIBRARY.led_lighting, tier);
  items.push({
    id: 'led_lighting',
    name: 'LED Lighting System',
    category: 'systems',
    quantity: grossSF,
    unit: 'SF',
    unitCost: lightingCost,
    total: Math.round(grossSF * lightingCost),
  });
  
  // Fire Sprinkler System
  if (config.sprinklerSystem) {
    const sprinklerCost = getCostByTier(COST_LIBRARY.fire_sprinkler, tier);
    items.push({
      id: 'fire_sprinkler',
      name: 'Fire Sprinkler System',
      category: 'systems',
      quantity: grossSF,
      unit: 'SF',
      unitCost: sprinklerCost,
      total: Math.round(grossSF * sprinklerCost),
    });
  }
  
  // ===== SITE WORK =====
  
  // Site Prep
  if (config.sitePrep) {
    const sitePrepCost = getCostByTier(COST_LIBRARY.site_prep, tier);
    items.push({
      id: 'site_prep',
      name: 'Site Preparation & Grading',
      category: 'site_work',
      quantity: grossSF,
      unit: 'SF',
      unitCost: sitePrepCost,
      total: Math.round(grossSF * sitePrepCost),
    });
  }
  
  // Parking Lot
  if (config.parking) {
    // Assume parking is 40% of building size
    const parkingSF = Math.round(grossSF * 0.4);
    const parkingCost = getCostByTier(COST_LIBRARY.parking_asphalt, tier);
    items.push({
      id: 'parking_asphalt',
      name: 'Asphalt Parking Lot',
      category: 'site_work',
      quantity: parkingSF,
      unit: 'SF',
      unitCost: parkingCost,
      total: Math.round(parkingSF * parkingCost),
    });
  }
  
  // Utilities Connection
  if (config.utilities) {
    const utilitiesCost = getCostByTier(COST_LIBRARY.utilities_connection, tier);
    items.push({
      id: 'utilities_connection',
      name: 'Utilities Connection (water, sewer, gas)',
      category: 'site_work',
      quantity: 1,
      unit: 'lump sum',
      unitCost: utilitiesCost,
      total: utilitiesCost,
    });
  }
  
  // Calculate subtotals
  const subtotals = {
    structure: items.filter(i => i.category === 'structure').reduce((sum, i) => sum + i.total, 0),
    doors: items.filter(i => i.category === 'doors').reduce((sum, i) => sum + i.total, 0),
    systems: items.filter(i => i.category === 'systems').reduce((sum, i) => sum + i.total, 0),
    siteWork: items.filter(i => i.category === 'site_work').reduce((sum, i) => sum + i.total, 0),
  };
  
  const hardCosts = subtotals.structure + subtotals.doors + subtotals.systems + subtotals.siteWork;
  
  // Soft costs: 8-12% based on finish level
  const softCostRate = config.finishLevel === 'basic' ? 0.08 : config.finishLevel === 'standard' ? 0.10 : 0.12;
  const softCosts = Math.round(hardCosts * softCostRate);
  
  // Contingency: 5-10% based on finish level
  const contingencyRate = config.finishLevel === 'basic' ? 0.10 : config.finishLevel === 'standard' ? 0.075 : 0.05;
  const contingency = Math.round(hardCosts * contingencyRate);
  
  const total = hardCosts + softCosts + contingency;
  
  return {
    grossSF,
    items,
    subtotals,
    softCosts,
    contingency,
    total,
  };
}

export function getRecommendedHeight(sport: string): number {
  switch (sport) {
    case 'baseball_softball':
    case 'baseball':
    case 'softball':
      return 20;
    case 'basketball':
      return 24;
    case 'volleyball':
      return 24;
    case 'soccer_indoor_small_sided':
    case 'soccer':
    case 'football':
      return 30;
    case 'pickleball':
      return 16;
    case 'multi_sport':
      return 24;
    default:
      return 20;
  }
}

export function getMaxRecommendedHeight(sports: string[]): number {
  if (sports.length === 0) return 20;
  return Math.max(...sports.map(getRecommendedHeight));
}

export const DEFAULT_BUILDING_CONFIG: BuildingConfig = {
  width: 100,
  length: 150,
  eaveHeight: 20,
  sports: [],
  rollUpDoors12x14: 1,
  rollUpDoors10x12: 0,
  manDoors: 2,
  storefrontEntry: 1,
  windows: 4,
  finishLevel: 'standard',
  sitePrep: true,
  concreteFoundation: true,
  parking: true,
  utilities: true,
  sprinklerSystem: false,
};
