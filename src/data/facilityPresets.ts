
export interface PresetCategory {
  id: string;
  title: string;
  description: string;
}

export interface FacilityPreset {
  id: string;
  name: string;
  description: string;
  image: string;
  sport: string;
  category: string;
  configuration: {
    basketball_courts_full?: number;
    basketball_courts_half?: number;
    pickleball_courts?: number;
    baseball_tunnels?: number;
    volleyball_courts?: number;
    soccer_field_small?: number;
    training_turf_zone?: number;
    grossSF: number;
    clearHeight: number;
  };
  financials: {
    estimatedCapEx: number;
    monthlyRevenue: number;
    monthlyOpEx: number;
  };
  targetMarket: string;
  popularFeatures: string[];
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "court-sports",
    title: "Court Sports Facilities",
    description: "Purpose-built facilities for basketball, volleyball, and pickleball with regulation courts and optimal playing conditions"
  },
  {
    id: "training-practice",
    title: "Training & Practice Facilities",
    description: "Year-round training centers focused on skill development, individual coaching, and team practice sessions"
  },
  {
    id: "multi-sport",
    title: "Multi-Sport Complexes",
    description: "Versatile facilities designed to host multiple sports with flexible layouts and maximum revenue potential"
  }
];

export const FACILITY_PRESETS: FacilityPreset[] = [
  {
    id: "basketball-4-court",
    name: "4-Court Basketball Facility",
    description: "Perfect for leagues, tournaments, and open play",
    image: "/images/home-gallery/facility-9.jpg",
    sport: "basketball",
    category: "court-sports",
    configuration: {
      basketball_courts_full: 4,
      grossSF: 24000,
      clearHeight: 24
    },
    financials: {
      estimatedCapEx: 850000,
      monthlyRevenue: 42000,
      monthlyOpEx: 28000
    },
    targetMarket: "Youth leagues, adult tournaments, open gym",
    popularFeatures: ["Tournament hosting", "League play", "Skills training", "Open gym sessions"]
  },
  {
    id: "pickleball-6-court",
    name: "6-Court Pickleball Center",
    description: "Growing sport with strong community engagement",
    image: "/images/home-gallery/facility-6.jpg",
    sport: "pickleball",
    category: "court-sports",
    configuration: {
      pickleball_courts: 6,
      grossSF: 12000,
      clearHeight: 16
    },
    financials: {
      estimatedCapEx: 425000,
      monthlyRevenue: 28000,
      monthlyOpEx: 18000
    },
    targetMarket: "Adults 50+, competitive leagues, drop-in play",
    popularFeatures: ["League play", "Drop-in sessions", "Clinics & lessons", "Social events"]
  },
  {
    id: "baseball-8-cage",
    name: "8-Cage Batting Facility",
    description: "Year-round training for all skill levels",
    image: "/images/home-gallery/facility-1.jpg",
    sport: "baseball",
    category: "training-practice",
    configuration: {
      baseball_tunnels: 8,
      grossSF: 16000,
      clearHeight: 20
    },
    financials: {
      estimatedCapEx: 580000,
      monthlyRevenue: 35000,
      monthlyOpEx: 22000
    },
    targetMarket: "Youth baseball/softball, team training, individual lessons",
    popularFeatures: ["Pitching machines", "HitTrax systems", "Private lessons", "Team rentals"]
  },
  {
    id: "multisport-basketball-volleyball",
    name: "Multi-Sport Complex",
    description: "2 basketball courts + 4 volleyball courts for maximum versatility",
    image: "/images/home-gallery/facility-8.jpg",
    sport: "multisport",
    category: "multi-sport",
    configuration: {
      basketball_courts_full: 2,
      volleyball_courts: 4,
      grossSF: 28000,
      clearHeight: 24
    },
    financials: {
      estimatedCapEx: 950000,
      monthlyRevenue: 52000,
      monthlyOpEx: 32000
    },
    targetMarket: "Multiple sports leagues, schools, clubs",
    popularFeatures: ["Flexible court dividers", "Multi-sport events", "School partnerships", "Club programs"]
  },
  {
    id: "soccer-small-field",
    name: "Indoor Soccer Arena",
    description: "Climate-controlled turf for year-round play",
    image: "/images/home-gallery/facility-2.jpg",
    sport: "soccer",
    category: "training-practice",
    configuration: {
      soccer_field_small: 1,
      grossSF: 22000,
      clearHeight: 22
    },
    financials: {
      estimatedCapEx: 780000,
      monthlyRevenue: 38000,
      monthlyOpEx: 25000
    },
    targetMarket: "Youth leagues, adult recreation, training programs",
    popularFeatures: ["League play", "Open play sessions", "Skills training", "Birthday parties"]
  },
  {
    id: "volleyball-4-court",
    name: "4-Court Volleyball Center",
    description: "Dedicated volleyball facility for competitive and recreational play",
    image: "/images/home-gallery/facility-7.jpg",
    sport: "volleyball",
    category: "court-sports",
    configuration: {
      volleyball_courts: 4,
      grossSF: 18000,
      clearHeight: 24
    },
    financials: {
      estimatedCapEx: 620000,
      monthlyRevenue: 32000,
      monthlyOpEx: 21000
    },
    targetMarket: "Club teams, adult leagues, recreational play",
    popularFeatures: ["Club training", "Tournament hosting", "League play", "Beach volleyball option"]
  }
];
