import { WizardQuestion } from "@/types/wizard";

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "primary_sport",
    type: "multiple",
    title: "What sports or activities will you offer?",
    description: "Select all sports and activities you plan to include in your facility",
    required: true,
    options: [
      { id: "baseball_softball", label: "Baseball/Softball", icon: "⚾", description: "Batting cages, pitching areas" },
      { id: "basketball", label: "Basketball", icon: "🏀", description: "Full and half courts" },
      { id: "volleyball", label: "Volleyball", icon: "🏐", description: "Indoor courts with proper clearance" },
      { id: "pickleball", label: "Pickleball", icon: "🏓", description: "Fastest growing sport" },
      { id: "soccer", label: "Soccer", icon: "⚽", description: "Indoor turf fields" },
      { id: "football", label: "Football", icon: "🏈", description: "Indoor training and 7v7 fields" },
      { id: "lacrosse", label: "Lacrosse", icon: "🥍", description: "Indoor training and box lacrosse" },
      { id: "tennis", label: "Tennis", icon: "🎾", description: "Hard courts with viewing" },
      { id: "multi_sport", label: "Multi-Sport", icon: "🏟️", description: "Flexible programming space" },
      { id: "fitness", label: "Fitness/Training", icon: "💪", description: "Strength and conditioning" }
    ]
  },
  {
    id: "facility_size",
    type: "single",
    title: "What size facility are you considering?",
    description: "This helps determine court/field capacity and equipment quantities",
    required: true,
    options: [
      { id: "small", label: "Small (2,000–5,000 sq ft)", description: "1–2 courts/cages, minimal amenities" },
      { id: "small_plus", label: "Small+ (5,000–8,000 sq ft)", description: "2–4 courts/cages, basic amenities" },
      { id: "medium", label: "Medium (8,000–15,000 sq ft)", description: "4–6 courts/cages, full amenities" },
      { id: "large", label: "Large (15,000–30,000 sq ft)", description: "6–10 courts/fields, premium features" },
      { id: "giant", label: "Giant (30,000–50,000 sq ft)", description: "multi-court/field complex" },
      { id: "arena", label: "Arena (50,000+ sq ft)", description: "tournament-ready, multi-sport" },
      { id: "custom", label: "Custom Size", description: "Enter your exact square footage" }
    ],
    textField: {
      id: "custom_facility_size",
      label: "Enter square footage",
      placeholder: "e.g. 18500",
      dependsOnValue: "custom"
    }
  },
  {
    id: "sport_ratios",
    type: "range",
    title: "What percentage breakdown do you want for each sport?",
    description: "Use the sliders to allocate percentages for each selected sport. Total must equal 100%.",
    required: true,
    dependsOn: {
      questionId: "facility_size",
      values: ["small", "small_plus", "medium", "large", "giant", "arena", "custom"]
    },
    min: 0,
    max: 100,
    step: 5,
    unit: "%"
  },
  {
    id: "product_quantities",
    type: "range",
    title: "Select Products & Set Quantities",
    description: "Choose the products you want and set quantities. We've pre-selected recommended items based on your sports.",
    required: true,
    dependsOn: {
      questionId: "sport_ratios",
      values: ["any"] // Show if sport ratios exist
    }
  },
  {
    id: "target_market",
    type: "multiple",
    title: "Who is your primary target market?",
    description: "Select all that apply - this affects programming and facility design",
    required: true,
    options: [
      { id: "youth_recreational", label: "Youth Recreational", description: "Ages 5-17, casual play" },
      { id: "youth_competitive", label: "Youth Competitive", description: "Ages 5-17, travel teams, tournaments" },
      { id: "adult_recreational", label: "Adult Recreational", description: "18+, leagues and casual play" },
      { id: "adult_competitive", label: "Adult Competitive", description: "18+, serious athletes" },
      { id: "seniors", label: "Seniors 55+", description: "Lower impact activities" },
      { id: "families", label: "Families", description: "Multi-generational programming" },
      { id: "corporate", label: "Corporate Groups", description: "Team building, events" }
    ]
  },
  {
    id: "location_type",
    type: "single",
    title: "What type of location are you considering?",
    description: "Location affects accessibility, parking, and operating costs",
    required: true,
    options: [
      { id: "urban_downtown", label: "Urban Downtown", description: "High foot traffic, limited parking" },
      { id: "urban_warehouse", label: "Urban Warehouse District", description: "Industrial conversion, good access" },
      { id: "suburban_retail", label: "Suburban Retail Center", description: "Excellent parking, family friendly" },
      { id: "suburban_standalone", label: "Suburban Standalone", description: "Purpose-built, maximum flexibility" },
      { id: "rural_land", label: "Rural/Open Land", description: "Ground-up construction, lower costs" }
    ]
  },
  {
    id: "revenue_model",
    type: "multiple",
    title: "How do you plan to generate revenue?",
    description: "Select your top 3 revenue streams - this affects space allocation",
    required: true,
    options: [
      { id: "memberships", label: "Memberships", description: "Monthly unlimited access", recommended: true },
      { id: "court_rentals", label: "Court/Field Rentals", description: "Hourly facility rentals" },
      { id: "lessons_coaching", label: "Lessons & Coaching", description: "Private and group instruction" },
      { id: "leagues", label: "Leagues & Tournaments", description: "Organized competition" },
      { id: "camps_clinics", label: "Camps & Clinics", description: "Seasonal programming" },
      { id: "parties_events", label: "Parties & Events", description: "Birthday parties, corporate events" },
      { id: "pro_shop", label: "Pro Shop/Retail", description: "Equipment and apparel sales" },
      { id: "food_beverage", label: "Food & Beverage", description: "Concessions and café" }
    ]
  },
  {
    id: "operating_hours",
    type: "single",
    title: "What operating schedule are you planning?",
    description: "This affects staffing needs and revenue potential",
    required: true,
    options: [
      { id: "limited", label: "Limited Hours", description: "Evenings/weekends only (30-40 hrs/week)" },
      { id: "standard", label: "Standard Hours", description: "Afternoons through evenings (50-65 hrs/week)" },
      { id: "extended", label: "Extended Hours", description: "Early morning through evening (70-85 hrs/week)" },
      { id: "always_open", label: "24/7 Access", description: "Member key card access (24/7)" }
    ]
  },
  {
    id: "amenities",
    type: "multiple",
    title: "Which amenities are important to you?",
    description: "Select features that align with your target market and budget",
    options: [
      { id: "lobby_lounge", label: "Lobby/Lounge Area", description: "Welcoming entry space" },
      { id: "viewing_areas", label: "Spectator Viewing", description: "Parent and fan seating" },
      { id: "locker_rooms", label: "Locker Rooms", description: "Full changing facilities" },
      { id: "concessions", label: "Concessions", description: "Food and beverage service" },
      { id: "pro_shop", label: "Pro Shop", description: "Equipment retail space" },
      { id: "party_rooms", label: "Party Rooms", description: "Private event spaces" },
      { id: "training_room", label: "Fitness/Training Room", description: "Strength and conditioning" },
      { id: "storage", label: "Equipment Storage", description: "Secure equipment storage" },
      { id: "office_space", label: "Administrative Offices", description: "Staff workspace" }
    ]
  },
  {
    id: "ceiling_height",
    type: "single",
    title: "Do you have ceiling height requirements?",
    description: "Some sports require specific minimum heights",
    dependsOn: {
      questionId: "primary_sport",
      values: ["volleyball", "basketball", "badminton"]
    },
    options: [
      { id: "standard", label: "Standard (20-24 feet)", description: "Suitable for most activities" },
      { id: "high", label: "High (24-30 feet)", description: "Required for volleyball, basketball" },
      { id: "very_high", label: "Very High (30+ feet)", description: "Tournament volleyball, overhead sports" },
      { id: "flexible", label: "Flexible", description: "Not sport-specific" }
    ]
  },
  {
    id: "timeline",
    type: "single",
    title: "When are you hoping to open?",
    description: "This affects planning and construction timelines",
    required: true,
    options: [
      { id: "asap", label: "ASAP (0-6 months)", description: "Existing space, minimal renovation" },
      { id: "short_term", label: "Short-term (6-12 months)", description: "Moderate renovation or build-out" },
      { id: "medium_term", label: "Medium-term (1-2 years)", description: "Major renovation or new construction" },
      { id: "long_term", label: "Long-term (2+ years)", description: "Ground-up development, planning phase" }
    ]
  },
  {
    id: "budget_range",
    type: "single",
    title: "What's your estimated total project budget?",
    description: "Include construction, equipment, and initial operating capital",
    required: true,
    options: [
      { id: "10k_50k", label: "$10K - $50K", description: "Basic equipment and minimal renovation" },
      { id: "50k_100k", label: "$50K - $100K", description: "Small renovation, used/basic equipment" },
      { id: "100k_250k", label: "$100K - $250K", description: "Moderate renovation, mixed equipment" },
      { id: "250k_500k", label: "$250K - $500K", description: "Moderate renovation, standard equipment" },
      { id: "500k_1m", label: "$500K - $1M", description: "Significant renovation or small new build" },
      { id: "1m_2m", label: "$1M - $2M", description: "Large renovation or medium new build" },
      { id: "over_2m", label: "Over $2M", description: "Premium new construction" }
    ]
  },
  {
    id: "vendor_quotes_help",
    type: "single",
    title: "Need help getting discounted quotes from Vendors?",
    description: "We can connect you with vetted suppliers for competitive pricing",
    required: true,
    options: [
      { id: "yes_help", label: "Sure! Make it easy.", description: "Connect me with vetted suppliers for quotes" },
      { id: "no_self_source", label: "No, I'll source myself.", description: "I prefer to handle vendor sourcing independently" }
    ]
  },
  {
    id: "experience_level",
    type: "single",
    title: "What's your experience in the sports facility industry?",
    description: "This helps us tailor recommendations to your expertise level",
    required: true,
    options: [
      { id: "first_time", label: "First-time Owner", description: "New to the sports facility business" },
      { id: "sports_background", label: "Sports Background", description: "Athletic experience, new to business" },
      { id: "business_background", label: "Business Background", description: "Business experience, new to sports" },
      { id: "expanding", label: "Expanding Current Business", description: "Adding sports to existing business" },
      { id: "experienced", label: "Experienced Operator", description: "Currently own/operate sports facilities" }
    ]
  }
];

export const generateRecommendations = (responses: any) => {
  const primarySports = Array.isArray(responses.primary_sport) ? responses.primary_sport : [responses.primary_sport];
  const targetMarket = responses.target_market || [];
  const facilitySize = responses.facility_size;
  const locationType = responses.location_type;
  const revenueModel = responses.revenue_model || [];
  const budget = responses.budget_range;
  const productsOfInterest: string[] = [];
  const customProducts = "";
  const vendorQuotesHelp = responses.vendor_quotes_help || "";

  // Product cost estimates based on equipment data from calculator
  const productCostEstimates: Record<string, { cost: number; description: string }> = {
    turf: { cost: 56000, description: "Artificial turf system (7,000 sq ft @ $8/sq ft)" },
    nets_cages: { cost: 15000, description: "Protective netting and batting cage systems" },
    hoops: { cost: 8000, description: "Basketball goals and mounting systems" },
    volleyball: { cost: 3000, description: "Professional volleyball net systems" },
    lighting: { cost: 10000, description: "LED sports lighting fixtures (20 fixtures @ $500 each)" },
    hvac: { cost: 25000, description: "Climate control system for sports facility" },
    court_flooring: { cost: 30000, description: "Professional sport court flooring installation" },
    rubber_flooring: { cost: 15000, description: "Safety and fitness rubber flooring" },
    machines: { cost: 20000, description: "Fitness and training equipment package" },
    pickleball: { cost: 12000, description: "Pickleball court setup with nets and lines" },
    divider_curtains: { cost: 8000, description: "Court separation curtain systems" },
    other: { cost: 5000, description: "Custom or specialty products (estimated)" }
  };

  // Generate estimates for selected products
  const productEstimates = productsOfInterest.map(product => ({
    product,
    estimatedCost: productCostEstimates[product]?.cost || 5000,
    description: productCostEstimates[product]?.description || "Estimated cost"
  }));

  // Size recommendations based on sport and market
  const sizeMap: Record<string, Record<string, number>> = {
    baseball_softball: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 },
    basketball: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 },
    volleyball: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 },
    pickleball: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 },
    soccer: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 },
    football: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 },
    lacrosse: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 },
    multi_sport: { small: 2500, small_plus: 6000, medium: 10000, large: 18000, giant: 30000, arena: 50000 }
  };

  const suggestedSize = primarySports.reduce((total, sport) => total + (sizeMap[sport]?.[facilitySize] || 0), 0) || 20000;

  // Layout recommendations
  const layoutRecommendations: Record<string, string> = {
    baseball_softball: "Linear cage layout with central viewing",
    basketball: "Courts with spectator areas and concessions",
    volleyball: "Tournament-style courts with bleacher seating",
    pickleball: "Multiple court pod design with social areas",
    soccer: "Turf fields with training zones and seating",
    football: "Training fields with agility zones and strength areas",
    lacrosse: "Box lacrosse courts with training areas and boards",
    multi_sport: "Flexible space with moveable equipment"
  };

  // Key features based on target market and revenue model
  const features: string[] = [];
  
  if (targetMarket.includes('youth_recreational') || targetMarket.includes('youth_competitive')) {
    features.push("Parent viewing areas", "Birthday party rooms", "Equipment storage");
  }
  
  if (targetMarket.includes('adult_recreational') || targetMarket.includes('adult_competitive')) {
    features.push("Locker rooms", "Pro shop", "Adult league scheduling");
  }
  
  if (revenueModel.includes('lessons_coaching')) {
    features.push("Private lesson spaces", "Video analysis area");
  }
  
  if (revenueModel.includes('parties_events')) {
    features.push("Party rooms", "Catering kitchen", "Event storage");
  }
  
  if (revenueModel.includes('food_beverage')) {
    features.push("Full concessions", "Seating area", "Kitchen facilities");
  }

  // Business model recommendation
  let businessModel = "Mixed Revenue Model";
  if (revenueModel.includes('memberships') && revenueModel.length === 1) {
    businessModel = "Membership-focused Club";
  } else if (revenueModel.includes('court_rentals') && revenueModel.includes('leagues')) {
    businessModel = "Rental and League Facility";
  }

  // Capacity estimation
  const capacityMap: Record<string, number> = {
    baseball_softball: Math.floor(suggestedSize / 1500), // ~1500 sf per cage
    basketball: Math.floor(suggestedSize / 6000), // ~6000 sf per full court
    volleyball: Math.floor(suggestedSize / 3000), // ~3000 sf per court
    pickleball: Math.floor(suggestedSize / 1200), // ~1200 sf per court
    soccer: Math.floor(suggestedSize / 18000), // ~18000 sf per small field
    football: Math.floor(suggestedSize / 16000), // ~16000 sf per training field
    lacrosse: Math.floor(suggestedSize / 14000), // ~14000 sf per box lacrosse court
    multi_sport: Math.floor(suggestedSize / 4000) // Variable usage
  };

  return {
    facilityType: primarySports.length > 1 ? "Multi-Sport Facility" : primarySports[0]?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Multi-Sport",
    suggestedSize,
    layout: primarySports.length > 1 ? "Multi-sport layout with flexible zones" : layoutRecommendations[primarySports[0]] || "Custom layout design",
    keyFeatures: features,
    businessModel,
    estimatedCapacity: primarySports.reduce((total, sport) => total + (capacityMap[sport] || 0), 0) || Math.floor(suggestedSize / 4000),
    productsOfInterest: productsOfInterest.length > 0 ? productsOfInterest : undefined,
    customProducts: customProducts || undefined,
    vendorQuotesHelp: vendorQuotesHelp || undefined,
    productEstimates: productEstimates.length > 0 ? productEstimates : undefined
  };
};