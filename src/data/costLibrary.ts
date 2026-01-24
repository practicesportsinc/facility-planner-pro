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
    costTiers: { low: 2500, mid: 3000, high: 3500 },
    installFactorPct: 15,
    description: "Collapsible curtain-style batting cage system, most affordable option",
    userAdjustable: true,
    marketNote: "Base model, easy setup and storage"
  },

  shell_cage: {
    id: "shell_cage", 
    name: "Batting Cage (Per Lane)",
    category: "baseball",
    unit: "lane",
    costTiers: { low: 2500, mid: 3000, high: 3500 },
    installFactorPct: 20,
    description: "Professional batting cage system per lane",
    userAdjustable: true,
    marketNote: "Based on Practice Sports pricing - practicesports.com"
  },

  air_cage: {
    id: "air_cage",
    name: "AirCage (Retractable)",
    category: "baseball", 
    unit: "each",
    costTiers: { low: 13000, mid: 15000, high: 17000 },
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

  // Outdoor Pickleball Infrastructure
  outdoor_concrete_court: {
    id: "outdoor_concrete_court",
    name: "Outdoor Concrete Court Surface",
    category: "flooring",
    unit: "sf",
    costTiers: { low: 10, mid: 12, high: 15 },
    installFactorPct: 0,
    description: "Concrete pad with acrylic sport coating for outdoor courts",
    userAdjustable: true,
    marketNote: "Standard outdoor court construction rate"
  },

  outdoor_court_lighting: {
    id: "outdoor_court_lighting",
    name: "Outdoor Court Lighting",
    category: "building_systems",
    unit: "court",
    costTiers: { low: 8000, mid: 12000, high: 18000 },
    installFactorPct: 25,
    description: "Pole-mounted LED lighting system per outdoor court",
    userAdjustable: true,
    marketNote: "Includes poles, fixtures, and electrical"
  },

  // Fencing
  chainlink_fence: {
    id: "chainlink_fence",
    name: "Chain-Link Fence",
    category: "site_work",
    unit: "lf",
    costTiers: { low: 15, mid: 20, high: 25 },
    installFactorPct: 0,
    description: "4-6ft chain-link fence for outdoor courts, includes posts and installation",
    userAdjustable: true,
    marketNote: "Standard sports court fencing"
  },

  vinyl_fence: {
    id: "vinyl_fence",
    name: "Vinyl Fence",
    category: "site_work",
    unit: "lf",
    costTiers: { low: 25, mid: 35, high: 45 },
    installFactorPct: 0,
    description: "4-6ft vinyl/PVC fence for outdoor courts, includes posts and installation",
    userAdjustable: true,
    marketNote: "Premium option, low maintenance"
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
    name: "Wall Padding",
    category: "safety",
    unit: "lf",
    costTiers: { low: 50, mid: 60, high: 75 },
    installFactorPct: 10,
    description: "Indoor wall padding for safety",
    userAdjustable: true,
    marketNote: "Based on Practice Sports pricing - practicesports.com"
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
  },

  // ==========================================
  // BUILDING STRUCTURE
  // ==========================================
  
  metal_building_shell: {
    id: "metal_building_shell",
    name: "Pre-Engineered Metal Building Shell",
    category: "building_structure",
    unit: "sf",
    costTiers: { low: 35, mid: 45, high: 60 },
    installFactorPct: 30,
    description: "Complete pre-engineered metal building shell including frame, roofing, and wall panels",
    userAdjustable: true,
    marketNote: "Varies by region and steel prices"
  },

  concrete_foundation: {
    id: "concrete_foundation",
    name: "Concrete Foundation (6\" slab)",
    category: "building_structure",
    unit: "sf",
    costTiers: { low: 8, mid: 10, high: 14 },
    installFactorPct: 0,
    description: "6-inch reinforced concrete slab with vapor barrier and wire mesh",
    userAdjustable: true,
    marketNote: "Includes standard site prep"
  },

  insulation_package: {
    id: "insulation_package",
    name: "Insulation Package",
    category: "building_structure",
    unit: "sf",
    costTiers: { low: 2, mid: 3, high: 5 },
    installFactorPct: 15,
    description: "Wall and roof insulation package (R-19 to R-30)",
    userAdjustable: true,
    marketNote: "Higher tier includes enhanced R-value"
  },

  // ==========================================
  // DOORS & OPENINGS
  // ==========================================

  rollup_door_12x14: {
    id: "rollup_door_12x14",
    name: "Roll-Up Door 12'x14'",
    category: "doors_openings",
    unit: "each",
    costTiers: { low: 4500, mid: 5500, high: 7000 },
    installFactorPct: 15,
    description: "Insulated steel roll-up overhead door 12' wide x 14' tall",
    userAdjustable: true,
    marketNote: "Includes motor and controls"
  },

  rollup_door_10x12: {
    id: "rollup_door_10x12",
    name: "Roll-Up Door 10'x12'",
    category: "doors_openings",
    unit: "each",
    costTiers: { low: 3500, mid: 4500, high: 5500 },
    installFactorPct: 15,
    description: "Insulated steel roll-up overhead door 10' wide x 12' tall",
    userAdjustable: true,
    marketNote: "Includes motor and controls"
  },

  man_door: {
    id: "man_door",
    name: "Steel Man Door (3'x7')",
    category: "doors_openings",
    unit: "each",
    costTiers: { low: 800, mid: 1200, high: 1800 },
    installFactorPct: 10,
    description: "Commercial steel personnel door with hardware",
    userAdjustable: true,
    marketNote: "Includes frame and hardware"
  },

  storefront_entry: {
    id: "storefront_entry",
    name: "Glass Storefront Entry",
    category: "doors_openings",
    unit: "each",
    costTiers: { low: 6000, mid: 8500, high: 12000 },
    installFactorPct: 15,
    description: "Double-door aluminum storefront entry with glass",
    userAdjustable: true,
    marketNote: "ADA compliant"
  },

  window_4x4: {
    id: "window_4x4",
    name: "Window 4'x4' (insulated)",
    category: "doors_openings",
    unit: "each",
    costTiers: { low: 600, mid: 900, high: 1400 },
    installFactorPct: 10,
    description: "Fixed insulated window 4' x 4'",
    userAdjustable: true,
    marketNote: "Commercial grade"
  },

  // ==========================================
  // SITE WORK
  // ==========================================

  site_prep: {
    id: "site_prep",
    name: "Site Preparation & Grading",
    category: "site_work",
    unit: "sf",
    costTiers: { low: 2, mid: 3, high: 5 },
    installFactorPct: 0,
    description: "Clearing, grading, and compaction for building pad",
    userAdjustable: true,
    marketNote: "Varies by site conditions"
  },

  parking_asphalt: {
    id: "parking_asphalt",
    name: "Asphalt Parking Lot",
    category: "site_work",
    unit: "sf",
    costTiers: { low: 4, mid: 5, high: 7 },
    installFactorPct: 0,
    description: "Asphalt parking lot with striping",
    userAdjustable: true,
    marketNote: "Includes base and striping"
  },

  utilities_connection: {
    id: "utilities_connection",
    name: "Utilities Connection",
    category: "site_work",
    unit: "lump sum",
    costTiers: { low: 15000, mid: 25000, high: 40000 },
    installFactorPct: 0,
    description: "Water, sewer, and gas connections to site",
    userAdjustable: true,
    marketNote: "Varies by distance to mains"
  },

  // ==========================================
  // BUILDING SYSTEMS (additions)
  // ==========================================

  electrical_service: {
    id: "electrical_service",
    name: "Electrical Service (400A)",
    category: "building_systems",
    unit: "lump sum",
    costTiers: { low: 25000, mid: 35000, high: 50000 },
    installFactorPct: 0,
    description: "400A electrical service with panel and distribution",
    userAdjustable: true,
    marketNote: "Includes panel, meter, and main distribution"
  },

  plumbing_roughin: {
    id: "plumbing_roughin",
    name: "Plumbing Rough-in",
    category: "building_systems",
    unit: "lump sum",
    costTiers: { low: 12000, mid: 18000, high: 28000 },
    installFactorPct: 0,
    description: "Plumbing rough-in for restrooms and utilities",
    userAdjustable: true,
    marketNote: "2-4 fixture rough-in"
  },

  fire_sprinkler: {
    id: "fire_sprinkler",
    name: "Fire Sprinkler System",
    category: "building_systems",
    unit: "sf",
    costTiers: { low: 3, mid: 4, high: 6 },
    installFactorPct: 0,
    description: "NFPA-compliant fire sprinkler system",
    userAdjustable: true,
    marketNote: "Required in most jurisdictions"
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