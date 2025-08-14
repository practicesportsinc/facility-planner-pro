export interface CostItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  costTiers: {
    low: number;
    mid: number;
    high: number;
  };
  installFactorPct?: number; // percentage for installation costs
  description: string;
  userAdjustable: boolean;
  marketNote: string;
}

export const COST_LIBRARY: Record<string, CostItem> = {
  // Flooring & Surfaces
  turf_installed: {
    id: "turf_installed",
    name: "Turf (installed)",
    category: "flooring",
    unit: "sf",
    costTiers: { low: 6, mid: 8, high: 11 },
    installFactorPct: 15,
    description: "Indoor synthetic turf with shock pad and installation",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },
  
  sport_tile_installed: {
    id: "sport_tile_installed", 
    name: "Sport tile (installed)",
    category: "flooring",
    unit: "sf",
    costTiers: { low: 4, mid: 6, high: 8 },
    installFactorPct: 10,
    description: "Interlocking sport tile flooring with installation",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  hardwood_installed: {
    id: "hardwood_installed",
    name: "Hardwood (installed)", 
    category: "flooring",
    unit: "sf",
    costTiers: { low: 10, mid: 14, high: 20 },
    installFactorPct: 20,
    description: "Professional hardwood court flooring with installation",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Baseball/Softball Equipment
  tunnel_net: {
    id: "tunnel_net",
    name: "Batting tunnel net",
    category: "baseball",
    unit: "each",
    costTiers: { low: 700, mid: 900, high: 1200 },
    installFactorPct: 5,
    description: "Professional batting tunnel netting system",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  pitching_machines: {
    id: "pitching_machines",
    name: "Pitching machine",
    category: "baseball", 
    unit: "each",
    costTiers: { low: 2000, mid: 2800, high: 3800 },
    installFactorPct: 3,
    description: "Professional pitching machine",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Batting Cage Types
  curtain_cage: {
    id: "curtain_cage",
    name: "CurtainCage (Collapsible)",
    category: "baseball",
    unit: "each",
    costTiers: { low: 8000, mid: 12000, high: 18000 },
    installFactorPct: 15,
    description: "Collapsible curtain-style batting cage system, most affordable option",
    userAdjustable: true,
    marketNote: "Base model, easy setup and storage"
  },

  shell_cage: {
    id: "shell_cage", 
    name: "ShellCage (Multi-Lane)",
    category: "baseball",
    unit: "each",
    costTiers: { low: 15000, mid: 22000, high: 35000 },
    installFactorPct: 20,
    description: "Multi-lane shell cage system, mid-tier option with enhanced durability",
    userAdjustable: true,
    marketNote: "Professional-grade, multiple lane configuration"
  },

  air_cage: {
    id: "air_cage",
    name: "AirCage (Retractable)",
    category: "baseball", 
    unit: "each",
    costTiers: { low: 25000, mid: 35000, high: 50000 },
    installFactorPct: 25,
    description: "Premium electric retractable batting cage, highest-end option",
    userAdjustable: true,
    marketNote: "Top-tier retractable system, space-saving design"
  },

  // Basketball Equipment
  competition_hoops: {
    id: "competition_hoops",
    name: "Competition hoop system",
    category: "basketball",
    unit: "each", 
    costTiers: { low: 1800, mid: 2800, high: 4500 },
    installFactorPct: 10,
    description: "Professional basketball hoop and backboard system",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Volleyball Equipment
  volleyball_net_systems: {
    id: "volleyball_net_systems",
    name: "Volleyball net system",
    category: "volleyball",
    unit: "each",
    costTiers: { low: 1600, mid: 2400, high: 3200 },
    installFactorPct: 8,
    description: "Professional volleyball net and standards system",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Pickleball Equipment
  pickleball_nets: {
    id: "pickleball_nets",
    name: "Pickleball net",
    category: "pickleball",
    unit: "each",
    costTiers: { low: 180, mid: 280, high: 450 },
    installFactorPct: 5,
    description: "Professional pickleball net system",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Soccer Equipment
  soccer_goals: {
    id: "soccer_goals",
    name: "Soccer goal pair",
    category: "soccer",
    unit: "pair",
    costTiers: { low: 700, mid: 1100, high: 1800 },
    installFactorPct: 5,
    description: "Professional soccer goals (pair)",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Building Systems
  led_lighting: {
    id: "led_lighting",
    name: "LED lighting (installed)",
    category: "building_systems",
    unit: "sf",
    costTiers: { low: 2, mid: 3, high: 4 },
    installFactorPct: 20,
    description: "Professional LED lighting system with installation",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  hvac_installed: {
    id: "hvac_installed", 
    name: "HVAC (installed)",
    category: "building_systems",
    unit: "sf",
    costTiers: { low: 5, mid: 7, high: 10 },
    installFactorPct: 25,
    description: "HVAC system with installation",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Safety & Accessories
  safety_padding: {
    id: "safety_padding",
    name: "Safety padding",
    category: "safety",
    unit: "lf",
    costTiers: { low: 18, mid: 26, high: 40 },
    installFactorPct: 10,
    description: "Wall and column safety padding",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Technology
  it_security: {
    id: "it_security",
    name: "IT/Security (cameras + WiFi)",
    category: "technology",
    unit: "lump sum",
    costTiers: { low: 5000, mid: 8500, high: 15000 },
    installFactorPct: 15,
    description: "Security cameras and WiFi infrastructure",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Fixtures
  locker_restroom: {
    id: "locker_restroom",
    name: "Locker/Restroom fixtures",
    category: "fixtures",
    unit: "lump sum", 
    costTiers: { low: 12000, mid: 18000, high: 30000 },
    installFactorPct: 20,
    description: "Locker room and restroom fixtures and finishes",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  // Additional common items
  divider_curtains: {
    id: "divider_curtains",
    name: "Divider curtains",
    category: "netting",
    unit: "each",
    costTiers: { low: 400, mid: 600, high: 900 },
    installFactorPct: 8,
    description: "Motorized divider curtains",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  l_screens: {
    id: "l_screens", 
    name: "L-screens",
    category: "protection",
    unit: "each",
    costTiers: { low: 150, mid: 225, high: 350 },
    installFactorPct: 0,
    description: "Protective L-screens for pitching",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  portable_mounds: {
    id: "portable_mounds",
    name: "Portable mounds", 
    category: "equipment",
    unit: "each",
    costTiers: { low: 800, mid: 1200, high: 1800 },
    installFactorPct: 0,
    description: "Portable pitching mounds",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  tees: {
    id: "tees",
    name: "Batting tees",
    category: "equipment", 
    unit: "each",
    costTiers: { low: 25, mid: 40, high: 65 },
    installFactorPct: 0,
    description: "Professional batting tees",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  ball_carts: {
    id: "ball_carts",
    name: "Ball carts",
    category: "equipment",
    unit: "each", 
    costTiers: { low: 120, mid: 180, high: 280 },
    installFactorPct: 0,
    description: "Ball storage and transport carts",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  },

  radar_device: {
    id: "radar_device",
    name: "Radar speed device",
    category: "equipment",
    unit: "each",
    costTiers: { low: 1500, mid: 2200, high: 3500 },
    installFactorPct: 0,
    description: "Professional radar speed measurement device",
    userAdjustable: true,
    marketNote: "User-adjustable; varies by market"
  }
};

export const getCostItem = (id: string): CostItem | undefined => {
  return COST_LIBRARY[id];
};

export const getCostByTier = (item: CostItem, tier: 'low' | 'mid' | 'high'): number => {
  return item.costTiers[tier];
};

export const calculateItemTotal = (
  item: CostItem, 
  quantity: number, 
  tier: 'low' | 'mid' | 'high'
): number => {
  const baseCost = getCostByTier(item, tier);
  const installFactor = 1 + (item.installFactorPct || 0) / 100;
  return quantity * baseCost * installFactor;
};