export interface SportPreset {
  id: string;
  name: string;
  description: string;
  recommendedUnits: Record<string, number>;
  perUnitSpaceSf: Record<string, number>;
  minClearHeight: { min: number; max: number };
  flooringType: string;
  typicalAmenities: string[];
  defaultEquipment: Array<{
    id: string;
    name: string;
    category: string;
    qtyFormula?: string; // e.g., "tunnels", "courts", "fixed:2"
    isPerimeter?: boolean; // for wall padding, etc.
  }>;
}

export const SPORT_PRESETS: Record<string, SportPreset> = {
  baseball_softball: {
    id: "baseball_softball",
    name: "Baseball/Softball Training",
    description: "Indoor batting tunnels and training facility",
    recommendedUnits: { baseball_tunnels: 8 },
    perUnitSpaceSf: { baseball_tunnels: 1050 }, // 70' x 15'
    minClearHeight: { min: 16, max: 20 },
    flooringType: "Indoor turf over pad",
    typicalAmenities: [
      "Bullpen area",
      "Strength corner", 
      "Party room",
      "Pro shop"
    ],
    defaultEquipment: [
      { id: "tunnel_net", name: "Tunnel net", category: "netting", qtyFormula: "baseball_tunnels" },
      { id: "divider_curtains", name: "Divider curtains", category: "netting", qtyFormula: "baseball_tunnels-1" },
      { id: "l_screens", name: "L-screens", category: "protection", qtyFormula: "baseball_tunnels" },
      { id: "portable_mounds", name: "Portable mounds", category: "equipment", qtyFormula: "fixed:2" },
      { id: "pitching_machines", name: "Pitching machines", category: "equipment", qtyFormula: "fixed:2" },
      { id: "tees", name: "Tees", category: "equipment", qtyFormula: "fixed:8" },
      { id: "ball_carts", name: "Ball carts", category: "equipment", qtyFormula: "fixed:4" },
      { id: "radar_device", name: "Radar device", category: "equipment", qtyFormula: "fixed:1" },
      { id: "protective_padding", name: "Protective wall padding", category: "safety", isPerimeter: true }
    ]
  },

  basketball: {
    id: "basketball",
    name: "Basketball",
    description: "Full basketball courts with proper runouts",
    recommendedUnits: { basketball_courts_full: 2 },
    perUnitSpaceSf: { basketball_courts_full: 6240 }, // includes runouts
    minClearHeight: { min: 24, max: 30 },
    flooringType: "Hardwood or sport tile",
    typicalAmenities: [
      "Bleacher seating",
      "Team rooms",
      "Training room",
      "Concessions"
    ],
    defaultEquipment: [
      { id: "competition_hoops", name: "Competition hoops", category: "basketball", qtyFormula: "basketball_courts_full*2" },
      { id: "shot_clocks", name: "Shot clocks", category: "basketball", qtyFormula: "basketball_courts_full*2" },
      { id: "scorers_table", name: "Scorer's table", category: "basketball", qtyFormula: "basketball_courts_full" },
      { id: "team_benches", name: "Team benches", category: "furniture", qtyFormula: "basketball_courts_full*4" },
      { id: "wall_padding", name: "Wall padding", category: "safety", isPerimeter: true },
      { id: "scoreboard", name: "Scoreboard", category: "scoring", qtyFormula: "basketball_courts_full" }
    ]
  },

  volleyball: {
    id: "volleyball",
    name: "Volleyball",
    description: "Volleyball courts with proper clearances",
    recommendedUnits: { volleyball_courts: 4 },
    perUnitSpaceSf: { volleyball_courts: 2592 }, // with runouts
    minClearHeight: { min: 23, max: 26 },
    flooringType: "Sport tile or wood",
    typicalAmenities: [
      "Referee platforms",
      "Team areas",
      "Equipment storage"
    ],
    defaultEquipment: [
      { id: "volleyball_net_systems", name: "Net systems", category: "volleyball", qtyFormula: "volleyball_courts" },
      { id: "volleyball_standards", name: "Standards/sleeves", category: "volleyball", qtyFormula: "volleyball_courts*2" },
      { id: "referee_stands", name: "Referee stands", category: "volleyball", qtyFormula: "volleyball_courts" },
      { id: "antennae", name: "Antennae", category: "volleyball", qtyFormula: "volleyball_courts*2" },
      { id: "ball_carts_vb", name: "Ball carts", category: "equipment", qtyFormula: "volleyball_courts" },
      { id: "scoreboard_vb", name: "Scoreboard", category: "scoring", qtyFormula: "volleyball_courts" }
    ]
  },

  pickleball: {
    id: "pickleball",
    name: "Pickleball",
    description: "Pickleball courts with proper spacing",
    recommendedUnits: { pickleball_courts: 6 },
    perUnitSpaceSf: { pickleball_courts: 1800 }, // with runouts
    minClearHeight: { min: 18, max: 20 },
    flooringType: "Acrylic on concrete or sport tile (indoor)",
    typicalAmenities: [
      "Player seating",
      "Equipment storage",
      "Water stations"
    ],
    defaultEquipment: [
      { id: "pickleball_nets", name: "Pickleball nets", category: "pickleball", qtyFormula: "pickleball_courts" },
      { id: "divider_nets_pb", name: "Divider nets", category: "netting", qtyFormula: "pickleball_courts-1" },
      { id: "player_benches", name: "Player benches", category: "furniture", qtyFormula: "pickleball_courts*2" },
      { id: "ball_carts_pb", name: "Ball carts", category: "equipment", qtyFormula: "pickleball_courts" },
      { id: "wall_padding_pb", name: "Wall padding", category: "safety", isPerimeter: true }
    ]
  },

  soccer_indoor: {
    id: "soccer_indoor",
    name: "Soccer (small-sided indoor)",
    description: "Small-sided soccer field for indoor play",
    recommendedUnits: { soccer_field_small: 1 },
    perUnitSpaceSf: { soccer_field_small: 14400 }, // ~180' x 80', editable
    minClearHeight: { min: 24, max: 30 },
    flooringType: "Turf (with shock pad)",
    typicalAmenities: [
      "Player benches",
      "Team rooms",
      "Referee room",
      "Viewing area"
    ],
    defaultEquipment: [
      { id: "soccer_goals", name: "Soccer goals", category: "soccer", qtyFormula: "soccer_field_small*2" },
      { id: "perimeter_netting", name: "Perimeter netting", category: "netting", isPerimeter: true },
      { id: "dasher_boards", name: "Dasher boards (optional)", category: "soccer", isPerimeter: true },
      { id: "team_benches_soccer", name: "Team benches", category: "furniture", qtyFormula: "soccer_field_small*4" },
      { id: "scoreboard_soccer", name: "Scoreboard", category: "scoring", qtyFormula: "soccer_field_small" },
      { id: "corner_flags", name: "Corner flags", category: "soccer", qtyFormula: "soccer_field_small*4" }
    ]
  },

  football: {
    id: "football",
    name: "Football",
    description: "Indoor football training field",
    recommendedUnits: { football_field: 1 },
    perUnitSpaceSf: { football_field: 19200 }, // 80' x 240' (reduced indoor size)
    minClearHeight: { min: 30, max: 35 },
    flooringType: "Turf (with shock pad)",
    typicalAmenities: [
      "Team rooms",
      "Training room",
      "Equipment storage",
      "Viewing area",
      "Referee room"
    ],
    defaultEquipment: [
      { id: "football_goalposts", name: "Football goalposts", category: "football", qtyFormula: "football_field*2" },
      { id: "yard_markers", name: "Yard markers", category: "football", qtyFormula: "fixed:20" },
      { id: "blocking_sleds", name: "Blocking sleds", category: "training", qtyFormula: "fixed:4" },
      { id: "tackling_dummies", name: "Tackling dummies", category: "training", qtyFormula: "fixed:6" },
      { id: "kicking_nets", name: "Kicking nets", category: "football", qtyFormula: "fixed:2" },
      { id: "team_benches_football", name: "Team benches", category: "furniture", qtyFormula: "fixed:4" },
      { id: "scoreboard_football", name: "Scoreboard", category: "scoring", qtyFormula: "football_field" },
      { id: "perimeter_netting_fb", name: "Perimeter netting", category: "netting", isPerimeter: true }
    ]
  },

  multi_sport_turf: {
    id: "multi_sport_turf",
    name: "Multi-sport Training Turf",
    description: "Flexible turf area for various training activities",
    recommendedUnits: { training_turf_zone: 1 },
    perUnitSpaceSf: { training_turf_zone: 7200 }, // 60' x 120'
    minClearHeight: { min: 18, max: 24 },
    flooringType: "Turf",
    typicalAmenities: [
      "Equipment storage",
      "Training station markers",
      "Viewing area"
    ],
    defaultEquipment: [
      { id: "agility_ladders", name: "Agility ladders", category: "training", qtyFormula: "fixed:6" },
      { id: "training_cones", name: "Training cones", category: "training", qtyFormula: "fixed:24" },
      { id: "training_sleds", name: "Training sleds", category: "training", qtyFormula: "fixed:4" },
      { id: "plyo_boxes", name: "Plyo boxes", category: "training", qtyFormula: "fixed:8" },
      { id: "storage_racks", name: "Storage racks", category: "furniture", qtyFormula: "fixed:3" }
    ]
  }
};

// Global editable assumptions
export interface GlobalAssumptions {
  regionMultiplier: number;
  circulationPctAddon: number;
  adminPctAddon: number;
}

export const DEFAULT_GLOBAL_ASSUMPTIONS: GlobalAssumptions = {
  regionMultiplier: 1.00,
  circulationPctAddon: 20, // 20%
  adminPctAddon: 12 // 12%
};