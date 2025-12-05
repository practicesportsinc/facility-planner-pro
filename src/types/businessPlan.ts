export interface BusinessPlanData {
  // Step 1: Project Overview
  projectOverview: {
    facilityName: string;
    city: string;
    state: string;
    zipCode: string;
    targetOpeningDate: string;
    projectStage: 'concept' | 'feasibility' | 'site_search' | 'financing' | 'construction';
    buildMode: 'lease' | 'buy' | 'build';
  };

  // Step 2: Market & Demographics
  marketAnalysis: {
    tradeAreaRadius: number; // minutes
    population10Min: number;
    population15Min: number;
    population20Min: number;
    medianHouseholdIncome: number;
    youthPopulation: number;
    familiesWithChildren: number;
    populationGrowthRate: number;
    customerSegments: string[];
  };

  // Step 3: Sport Selection
  sportSelection: {
    primarySports: SportAssessment[];
    secondaryOfferings: string[];
    sportsToAvoid: string[];
  };

  // Step 4: Competitive Analysis
  competitiveAnalysis: {
    competitors: Competitor[];
    marketGaps: string[];
    differentiationStrategy: string;
    uniqueDifferentiators: string[];
  };

  // Step 5: Facility Design
  facilityDesign: {
    totalSquareFootage: number;
    ceilingHeight: number;
    spaceAllocation: SpaceAllocation;
    equipment: EquipmentItem[];
    technologyRequirements: string[];
    buildOutRequirements: string[];
  };

  // Step 6: Programming & Operations
  programming: {
    rentalPricing: RentalPricing;
    membershipTiers: MembershipTier[];
    lessonPricing: LessonPricing;
    partyPackages: PartyPackage[];
    hoursOfOperation: HoursOfOperation;
    staffingPlan: StaffingPlan;
  };

  // Step 7: Financial Inputs
  financials: {
    startupCosts: StartupCosts;
    monthlyOperatingCosts: MonthlyOperatingCosts;
    revenueAssumptions: RevenueAssumptions;
    financing: FinancingStructure;
  };

  // Step 8: Risk Assessment
  riskAssessment: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    keyRisks: RiskItem[];
    goNoGoConditions: GoNoGoCondition[];
  };

  // Step 9: Implementation Timeline
  timeline: {
    targetOpeningDate: string;
    phases: TimelinePhase[];
    checklist: ChecklistItem[];
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  scenario: 'conservative' | 'base' | 'upside';
}

export interface SportAssessment {
  sport: string;
  localDemand: 'low' | 'medium' | 'high';
  revenuePerHour: number;
  spaceEfficiency: 'low' | 'medium' | 'high';
  equipmentCost: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
  selected: boolean;
}

export interface Competitor {
  name: string;
  distance: number;
  size: string;
  technology: string;
  utilizationLevel: 'low' | 'medium' | 'high';
  strengths: string;
  weaknesses: string;
}

export interface SpaceAllocation {
  playingTrainingAreas: number;
  lobbyCheckIn: number;
  partyTeamRoom: number;
  proShop: number;
  restrooms: number;
  officeAdmin: number;
  storageMechanical: number;
}

export interface EquipmentItem {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface RentalPricing {
  standardRate: number;
  peakRate: number;
  offPeakRate: number;
  teamBlockRate: number;
}

export interface MembershipTier {
  name: string;
  monthlyPrice: number;
  benefits: string[];
}

export interface LessonPricing {
  privateRate: number;
  semiPrivateRate: number;
  groupRate: number;
  instructorSplit: number;
}

export interface PartyPackage {
  name: string;
  price: number;
  duration: number;
  includes: string[];
}

export interface HoursOfOperation {
  weekdayOpen: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
}

export interface StaffingPlan {
  generalManager: { salary: number; count: number };
  headInstructor: { salary: number; count: number };
  frontDesk: { hourlyRate: number; count: number; hoursPerWeek: number };
  partTimeStaff: { hourlyRate: number; count: number; hoursPerWeek: number };
  contractInstructors: { splitPercentage: number; estimatedCount: number };
}

export interface StartupCosts {
  leaseDeposit: number;
  buildoutConstruction: number;
  equipmentTechnology: number;
  preOpeningCosts: number;
  workingCapitalReserve: number;
  contingencyPercentage: number;
}

export interface MonthlyOperatingCosts {
  rent: number;
  utilities: number;
  insurance: number;
  marketing: number;
  maintenance: number;
  software: number;
  other: number;
}

export interface RevenueAssumptions {
  year1Utilization: number;
  year2Utilization: number;
  year3Utilization: number;
  membershipGrowthRate: number;
  lessonHoursPerWeek: number;
  partiesPerMonth: number;
}

export interface FinancingStructure {
  totalCapitalRequired: number;
  equityPercentage: number;
  debtPercentage: number;
  interestRate: number;
  loanTermYears: number;
  sbaLoan: boolean;
}

export interface RiskItem {
  risk: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface GoNoGoCondition {
  condition: string;
  threshold: string;
  met: boolean | null;
}

export interface TimelinePhase {
  phase: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface ChecklistItem {
  item: string;
  completed: boolean;
  dueDate: string;
}

export const DEFAULT_BUSINESS_PLAN: BusinessPlanData = {
  projectOverview: {
    facilityName: '',
    city: '',
    state: '',
    zipCode: '',
    targetOpeningDate: '',
    projectStage: 'concept',
    buildMode: 'lease',
  },
  marketAnalysis: {
    tradeAreaRadius: 15,
    population10Min: 0,
    population15Min: 0,
    population20Min: 0,
    medianHouseholdIncome: 0,
    youthPopulation: 0,
    familiesWithChildren: 0,
    populationGrowthRate: 0,
    customerSegments: [],
  },
  sportSelection: {
    primarySports: [],
    secondaryOfferings: [],
    sportsToAvoid: [],
  },
  competitiveAnalysis: {
    competitors: [],
    marketGaps: [],
    differentiationStrategy: '',
    uniqueDifferentiators: [],
  },
  facilityDesign: {
    totalSquareFootage: 15000,
    ceilingHeight: 20,
    spaceAllocation: {
      playingTrainingAreas: 70,
      lobbyCheckIn: 8,
      partyTeamRoom: 6,
      proShop: 4,
      restrooms: 5,
      officeAdmin: 4,
      storageMechanical: 3,
    },
    equipment: [],
    technologyRequirements: [],
    buildOutRequirements: [],
  },
  programming: {
    rentalPricing: {
      standardRate: 45,
      peakRate: 55,
      offPeakRate: 35,
      teamBlockRate: 40,
    },
    membershipTiers: [
      { name: 'Individual', monthlyPrice: 99, benefits: ['Unlimited practice time', 'Discounts on lessons'] },
      { name: 'Family', monthlyPrice: 179, benefits: ['Up to 4 family members', 'Priority booking'] },
      { name: 'Team', monthlyPrice: 299, benefits: ['Team practice slots', 'Film room access'] },
    ],
    lessonPricing: {
      privateRate: 75,
      semiPrivateRate: 50,
      groupRate: 30,
      instructorSplit: 60,
    },
    partyPackages: [
      { name: 'Base', price: 299, duration: 90, includes: ['90 min cage time', 'Party room'] },
      { name: 'Premium', price: 449, duration: 120, includes: ['2 hr cage time', 'Party room', 'Pizza & drinks'] },
    ],
    hoursOfOperation: {
      weekdayOpen: '06:00',
      weekdayClose: '22:00',
      weekendOpen: '08:00',
      weekendClose: '20:00',
    },
    staffingPlan: {
      generalManager: { salary: 65000, count: 1 },
      headInstructor: { salary: 50000, count: 1 },
      frontDesk: { hourlyRate: 14, count: 2, hoursPerWeek: 30 },
      partTimeStaff: { hourlyRate: 12, count: 4, hoursPerWeek: 20 },
      contractInstructors: { splitPercentage: 60, estimatedCount: 5 },
    },
  },
  financials: {
    startupCosts: {
      leaseDeposit: 25000,
      buildoutConstruction: 200000,
      equipmentTechnology: 150000,
      preOpeningCosts: 30000,
      workingCapitalReserve: 50000,
      contingencyPercentage: 10,
    },
    monthlyOperatingCosts: {
      rent: 12000,
      utilities: 2500,
      insurance: 1500,
      marketing: 2000,
      maintenance: 1000,
      software: 500,
      other: 1000,
    },
    revenueAssumptions: {
      year1Utilization: 40,
      year2Utilization: 55,
      year3Utilization: 70,
      membershipGrowthRate: 10,
      lessonHoursPerWeek: 40,
      partiesPerMonth: 8,
    },
    financing: {
      totalCapitalRequired: 500000,
      equityPercentage: 30,
      debtPercentage: 70,
      interestRate: 7.5,
      loanTermYears: 10,
      sbaLoan: true,
    },
  },
  riskAssessment: {
    riskTolerance: 'moderate',
    keyRisks: [
      { risk: 'Demand below projections', likelihood: 'medium', impact: 'high', mitigation: 'Conservative ramp-up, flexible staffing' },
      { risk: 'New competitor enters market', likelihood: 'medium', impact: 'medium', mitigation: 'Differentiation strategy, customer loyalty programs' },
      { risk: 'Construction delays/overruns', likelihood: 'medium', impact: 'medium', mitigation: 'Contingency budget, fixed-price contracts' },
      { risk: 'Key instructor leaves', likelihood: 'low', impact: 'medium', mitigation: 'Cross-training, competitive compensation' },
      { risk: 'Safety incident', likelihood: 'low', impact: 'high', mitigation: 'Insurance, safety protocols, staff training' },
    ],
    goNoGoConditions: [
      { condition: 'Maximum lease rate per SF', threshold: '$15/SF NNN', met: null },
      { condition: 'Pre-sales requirement', threshold: '50 members before opening', met: null },
      { condition: 'Staffing confirmed', threshold: 'GM + Head Instructor hired', met: null },
    ],
  },
  timeline: {
    targetOpeningDate: '',
    phases: [],
    checklist: [],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  scenario: 'base',
};
