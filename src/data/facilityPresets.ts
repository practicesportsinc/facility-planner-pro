
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
    id: "multi-sport",
    title: "Multi-Sport Complexes",
    description: "Versatile facilities designed to host multiple sports with flexible layouts and maximum revenue potential"
  }
];

export const FACILITY_PRESETS: FacilityPreset[] = [
  {
    id: "baseball-8-cage",
    name: "Batting Cage Facility",
    description: "Year-round training for all skill levels",
    image: "/images/home-gallery/batting-cage-facility.jpg",
    sport: "baseball",
    category: "court-sports",
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
    id: "basketball-4-court",
    name: "4-Court Basketball Facility",
    description: "Perfect for leagues, tournaments, and open play",
    image: "/images/home-gallery/basketball-facility.jpg",
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
    name: "Pickleball Facility",
    description: "Growing sport with strong community engagement",
    image: "/images/home-gallery/pickleball-facility.jpg",
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
    id: "volleyball-6-court",
    name: "Volleyball Facility",
    description: "Dedicated volleyball facility for competitive and recreational play",
    image: "/images/home-gallery/volleyball-facility.jpg",
    sport: "volleyball",
    category: "multi-sport",
    configuration: {
      volleyball_courts: 6,
      grossSF: 27000,
      clearHeight: 24
    },
    financials: {
      estimatedCapEx: 930000,
      monthlyRevenue: 48000,
      monthlyOpEx: 31500
    },
    targetMarket: "Club teams, adult leagues, recreational play",
    popularFeatures: ["Club training", "Tournament hosting", "League play", "Beach volleyball option"]
  }
];
