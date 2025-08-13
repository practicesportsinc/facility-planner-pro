import { GlobalAssumptions } from "@/data/sportPresets";

export interface SpacePlanningCalculation {
  totalProgramSF: number;
  grossSF: number;
  surplus_deficit?: number;
  breakdown: Array<{
    sport: string;
    units: number;
    spacePer: number;
    total: number;
  }>;
}

export interface CapExCalculation {
  facilityType: 'build' | 'buy' | 'lease';
  buildingCost?: number;
  sitework?: number;
  tenantImprovements: number;
  softCosts: number;
  fixturesIT: number;
  contingency: number;
  land?: number;
  renovationCost?: number;
  closingCosts?: number;
  dueDiligenceCosts?: number;
  purchasePrice?: number;
  freeRentCredit?: number;
  depositsFees?: number;
  total: number;
  breakdown: Array<{
    category: string;
    amount: number;
    calculation?: string;
  }>;
}

export interface EquipmentCalculation {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
    installFactor: number;
    total: number;
  }>;
  flooring: Array<{
    type: string;
    area: number;
    unitCost: number;
    installCost: number;
    total: number;
  }>;
  total: number;
}

export interface OpExCalculation {
  staffingMonthly: number;
  fixedOpExMonthly: number;
  leaseMonthly: number;
  debtServiceMonthly: number;
  total: number;
  breakdown: Array<{
    category: string;
    amount: number;
    calculation?: string;
  }>;
}

export interface RevenueCalculation {
  membershipMRR: number;
  rentals: number;
  lessons: number;
  campsClinicsl: number;
  leaguesTournaments: number;
  partiesEvents: number;
  merchandise: number;
  concessions: number;
  sponsorships: number;
  total: number;
  breakdown: Array<{
    category: string;
    amount: number;
    calculation?: string;
  }>;
}

export interface ProfitabilityCalculation {
  ebitdaMonthly: number;
  netIncomeMonthly: number;
  breakEvenMonths: number | string;
  roiYearOne: number;
  paybackMonths: number;
  calculations: Array<{
    metric: string;
    formula: string;
    result: number | string;
  }>;
}

// Space Planning Calculations
export const calculateSpacePlanning = (
  selectedSports: Record<string, any>,
  globalAssumptions: GlobalAssumptions,
  userProvidedSqft?: number
): SpacePlanningCalculation => {
  const breakdown = Object.entries(selectedSports).map(([sport, data]) => {
    const units = Object.values((data as any)?.units || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    const spacePer = Object.values((data as any)?.perUnitSpaceSf || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    return {
      sport,
      units: Number(units),
      spacePer: Number(spacePer),
      total: Number(units) * Number(spacePer)
    };
  });

  const totalProgramSF = breakdown.reduce((sum, item) => sum + item.total, 0);
  
  const circulationAddon = totalProgramSF * (globalAssumptions.circulationPctAddon / 100);
  const adminAddon = totalProgramSF * (globalAssumptions.adminPctAddon / 100);
  const grossSF = totalProgramSF + circulationAddon + adminAddon;

  const result: SpacePlanningCalculation = {
    totalProgramSF,
    grossSF,
    breakdown
  };

  if (userProvidedSqft) {
    result.surplus_deficit = userProvidedSqft - grossSF;
  }

  return result;
};

// CapEx Calculations
export const calculateCapExBuild = (
  grossSF: number,
  inputs: {
    buildingCostPerSf: number;
    siteworkPct: number;
    tiCostPerSf: number;
    softCostsPct: number;
    fixturesAllowance: number;
    itSecurityAllowance: number;
    contingencyPct: number;
    landCost: number;
  }
): CapExCalculation => {
  const buildingCost = grossSF * inputs.buildingCostPerSf;
  const sitework = buildingCost * (inputs.siteworkPct / 100);
  const tenantImprovements = grossSF * inputs.tiCostPerSf;
  const softCosts = (buildingCost + tenantImprovements) * (inputs.softCostsPct / 100);
  const fixturesIT = inputs.fixturesAllowance + inputs.itSecurityAllowance;
  const contingency = (buildingCost + tenantImprovements + softCosts) * (inputs.contingencyPct / 100);
  const land = inputs.landCost;

  const total = buildingCost + sitework + tenantImprovements + softCosts + fixturesIT + contingency + land;

  return {
    facilityType: 'build',
    buildingCost,
    sitework,
    tenantImprovements,
    softCosts,
    fixturesIT,
    contingency,
    land,
    total,
    breakdown: [
      { category: 'Building Cost', amount: buildingCost, calculation: `${grossSF} sf × $${inputs.buildingCostPerSf}/sf` },
      { category: 'Sitework', amount: sitework, calculation: `$${buildingCost.toLocaleString()} × ${inputs.siteworkPct}%` },
      { category: 'Tenant Improvements', amount: tenantImprovements, calculation: `${grossSF} sf × $${inputs.tiCostPerSf}/sf` },
      { category: 'Soft Costs', amount: softCosts, calculation: `($${buildingCost.toLocaleString()} + $${tenantImprovements.toLocaleString()}) × ${inputs.softCostsPct}%` },
      { category: 'Fixtures & IT', amount: fixturesIT, calculation: `$${inputs.fixturesAllowance.toLocaleString()} + $${inputs.itSecurityAllowance.toLocaleString()}` },
      { category: 'Contingency', amount: contingency, calculation: `($${buildingCost.toLocaleString()} + $${tenantImprovements.toLocaleString()} + $${softCosts.toLocaleString()}) × ${inputs.contingencyPct}%` },
      { category: 'Land', amount: land, calculation: 'Direct cost' }
    ]
  };
};

export const calculateCapExBuy = (
  grossSF: number,
  inputs: {
    purchasePrice: number;
    closingCostsPct: number;
    dueDiligenceCosts: number;
    renovationCostPerSf: number;
    softCostsPct: number;
    contingencyPct: number;
    fixturesAllowance: number;
    itSecurityAllowance: number;
  }
): CapExCalculation => {
  const renovationCost = grossSF * inputs.renovationCostPerSf;
  const closingCosts = inputs.purchasePrice * (inputs.closingCostsPct / 100);
  const softCosts = (renovationCost) * (inputs.softCostsPct / 100);
  const contingency = (renovationCost + softCosts) * (inputs.contingencyPct / 100);
  const fixturesIT = inputs.fixturesAllowance + inputs.itSecurityAllowance;

  const total = inputs.purchasePrice + closingCosts + inputs.dueDiligenceCosts + renovationCost + softCosts + contingency + fixturesIT;

  return {
    facilityType: 'buy',
    purchasePrice: inputs.purchasePrice,
    closingCosts,
    dueDiligenceCosts: inputs.dueDiligenceCosts,
    renovationCost,
    tenantImprovements: renovationCost,
    softCosts,
    contingency,
    fixturesIT,
    total,
    breakdown: [
      { category: 'Purchase Price', amount: inputs.purchasePrice, calculation: 'Direct cost' },
      { category: 'Closing Costs', amount: closingCosts, calculation: `$${inputs.purchasePrice.toLocaleString()} × ${inputs.closingCostsPct}%` },
      { category: 'Due Diligence', amount: inputs.dueDiligenceCosts, calculation: 'Direct cost' },
      { category: 'Renovation', amount: renovationCost, calculation: `${grossSF} sf × $${inputs.renovationCostPerSf}/sf` },
      { category: 'Soft Costs', amount: softCosts, calculation: `$${renovationCost.toLocaleString()} × ${inputs.softCostsPct}%` },
      { category: 'Contingency', amount: contingency, calculation: `($${renovationCost.toLocaleString()} + $${softCosts.toLocaleString()}) × ${inputs.contingencyPct}%` },
      { category: 'Fixtures & IT', amount: fixturesIT, calculation: `$${inputs.fixturesAllowance.toLocaleString()} + $${inputs.itSecurityAllowance.toLocaleString()}` }
    ]
  };
};

export const calculateCapExLease = (
  grossSF: number,
  inputs: {
    tiCostPerSf: number;
    tiAllowancePerSf: number;
    baseRentPerSfYear: number;
    nnnPerSfYear: number;
    camPerSfYear: number;
    freeRentMonths: number;
    securityDepositMonths: number;
    softCostsPct: number;
    contingencyPct: number;
    fixturesAllowance: number;
    itSecurityAllowance: number;
  }
): CapExCalculation => {
  const tenantImprovements = Math.max(0, (inputs.tiCostPerSf - inputs.tiAllowancePerSf) * grossSF);
  const monthlyRent = (inputs.baseRentPerSfYear / 12 + inputs.nnnPerSfYear / 12 + inputs.camPerSfYear / 12) * grossSF;
  const freeRentCredit = monthlyRent * inputs.freeRentMonths;
  const depositsFees = (inputs.securityDepositMonths * inputs.baseRentPerSfYear / 12 * grossSF);
  const fixturesIT = inputs.fixturesAllowance + inputs.itSecurityAllowance;
  const softCosts = tenantImprovements * (inputs.softCostsPct / 100);
  const contingency = (tenantImprovements + softCosts) * (inputs.contingencyPct / 100);

  const total = tenantImprovements + fixturesIT + softCosts + contingency + depositsFees - freeRentCredit;

  return {
    facilityType: 'lease',
    tenantImprovements,
    freeRentCredit,
    depositsFees,
    softCosts,
    contingency,
    fixturesIT,
    total,
    breakdown: [
      { category: 'Tenant Improvements', amount: tenantImprovements, calculation: `max(0, ($${inputs.tiCostPerSf}/sf - $${inputs.tiAllowancePerSf}/sf) × ${grossSF} sf)` },
      { category: 'Fixtures & IT', amount: fixturesIT, calculation: `$${inputs.fixturesAllowance.toLocaleString()} + $${inputs.itSecurityAllowance.toLocaleString()}` },
      { category: 'Soft Costs', amount: softCosts, calculation: `$${tenantImprovements.toLocaleString()} × ${inputs.softCostsPct}%` },
      { category: 'Contingency', amount: contingency, calculation: `($${tenantImprovements.toLocaleString()} + $${softCosts.toLocaleString()}) × ${inputs.contingencyPct}%` },
      { category: 'Deposits & Fees', amount: depositsFees, calculation: `${inputs.securityDepositMonths} months × $${(inputs.baseRentPerSfYear / 12 * grossSF).toLocaleString()}/month` },
      { category: 'Free Rent Credit', amount: -freeRentCredit, calculation: `${inputs.freeRentMonths} months × $${monthlyRent.toLocaleString()}/month` }
    ]
  };
};

// OpEx Calculations
export const calculateOpEx = (
  grossSF: number,
  inputs: {
    staffing: Array<{ ftes: number; loadedWagePerHr: number }>;
    utilities: number;
    insurance: number;
    propertyTax: number;
    maintenance: number;
    marketing: number;
    software: number;
    janitorial: number;
    other: number;
    // Lease specific
    baseRentPerSfYear?: number;
    nnnPerSfYear?: number;
    camPerSfYear?: number;
    // Financing
    loanAmount?: number;
    interestRate?: number;
    termYears?: number;
  }
): OpExCalculation => {
  const staffingMonthly = inputs.staffing.reduce((sum, staff) => {
    return sum + (staff.ftes * staff.loadedWagePerHr * 173); // 173 hours per month average
  }, 0);

  const fixedOpExMonthly = inputs.utilities + inputs.insurance + inputs.propertyTax + 
                          inputs.maintenance + inputs.marketing + inputs.software + 
                          inputs.janitorial + inputs.other;

  const leaseMonthly = inputs.baseRentPerSfYear && inputs.nnnPerSfYear && inputs.camPerSfYear
    ? ((inputs.baseRentPerSfYear + inputs.nnnPerSfYear + inputs.camPerSfYear) / 12) * grossSF
    : 0;

  let debtServiceMonthly = 0;
  if (inputs.loanAmount && inputs.interestRate && inputs.termYears) {
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.termYears * 12;
    debtServiceMonthly = inputs.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const total = staffingMonthly + fixedOpExMonthly + leaseMonthly + debtServiceMonthly;

  return {
    staffingMonthly,
    fixedOpExMonthly,
    leaseMonthly,
    debtServiceMonthly,
    total,
    breakdown: [
      { category: 'Staffing', amount: staffingMonthly, calculation: `Sum of FTEs × loaded wages × 173 hours/month` },
      { category: 'Fixed Operating', amount: fixedOpExMonthly, calculation: 'Utilities + Insurance + Property Tax + Maintenance + Marketing + Software + Janitorial + Other' },
      { category: 'Lease Payments', amount: leaseMonthly, calculation: leaseMonthly > 0 ? `($${inputs.baseRentPerSfYear}/sf + $${inputs.nnnPerSfYear}/sf + $${inputs.camPerSfYear}/sf) ÷ 12 × ${grossSF} sf` : 'N/A - Not leasing' },
      { category: 'Debt Service', amount: debtServiceMonthly, calculation: debtServiceMonthly > 0 ? `Loan payment: $${inputs.loanAmount?.toLocaleString()} at ${inputs.interestRate}% for ${inputs.termYears} years` : 'N/A - No financing' }
    ]
  };
};

// Revenue Calculations
export const calculateRevenue = (inputs: {
  memberships: Array<{ priceMonth: number; members: number }>;
  rentals: Array<{ ratePerHr: number; utilHoursPerWeek: number }>;
  lessons: Array<{ coachCount: number; hoursPerCoachWeek: number; avgRatePerHr: number; utilizationPct: number }>;
  campsClinicsl: Array<{ sessionsPerYear: number; avgPrice: number; capacity: number; fillRatePct: number }>;
  leaguesTournaments: Array<{ eventsPerYear: number; teamsPerEvent: number; avgTeamFee: number; netMarginPct: number }>;
  partiesEvents: { annualRevenue: number };
  merchandise: { annualRevenue: number };
  concessions: { annualRevenue: number };
  sponsorships: { annualRevenue: number };
}): RevenueCalculation => {
  const membershipMRR = inputs.memberships.reduce((sum, mem) => sum + (mem.priceMonth * mem.members), 0);
  
  const rentals = inputs.rentals.reduce((sum, rental) => 
    sum + (rental.ratePerHr * rental.utilHoursPerWeek * 4.345), 0);
  
  const lessons = inputs.lessons.reduce((sum, lesson) => 
    sum + (lesson.coachCount * lesson.hoursPerCoachWeek * 4.345 * lesson.avgRatePerHr * lesson.utilizationPct / 100), 0);
  
  const campsClinicsl = inputs.campsClinicsl.reduce((sum, camp) => 
    sum + (camp.sessionsPerYear * camp.avgPrice * camp.capacity * camp.fillRatePct / 100), 0) / 12;
  
  const leaguesTournaments = inputs.leaguesTournaments.reduce((sum, league) => 
    sum + (league.eventsPerYear * league.teamsPerEvent * league.avgTeamFee * league.netMarginPct / 100), 0) / 12;
  
  const partiesEvents = inputs.partiesEvents.annualRevenue / 12;
  const merchandise = inputs.merchandise.annualRevenue / 12;
  const concessions = inputs.concessions.annualRevenue / 12;
  const sponsorships = inputs.sponsorships.annualRevenue / 12;

  const total = membershipMRR + rentals + lessons + campsClinicsl + leaguesTournaments + 
               partiesEvents + merchandise + concessions + sponsorships;

  return {
    membershipMRR,
    rentals,
    lessons,
    campsClinicsl,
    leaguesTournaments,
    partiesEvents,
    merchandise,
    concessions,
    sponsorships,
    total,
    breakdown: [
      { category: 'Membership MRR', amount: membershipMRR, calculation: 'Sum of (price/month × members)' },
      { category: 'Rentals', amount: rentals, calculation: 'Sum of (rate/hr × util hours/week × 4.345)' },
      { category: 'Lessons', amount: lessons, calculation: 'Sum of (coaches × hours/week × 4.345 × rate/hr × util%)' },
      { category: 'Camps/Clinics', amount: campsClinicsl, calculation: 'Sum of (sessions/year × price × capacity × fill%) ÷ 12' },
      { category: 'Leagues/Tournaments', amount: leaguesTournaments, calculation: 'Sum of (events/year × teams × fee × margin%) ÷ 12' },
      { category: 'Parties/Events', amount: partiesEvents, calculation: 'Annual revenue ÷ 12' },
      { category: 'Merchandise', amount: merchandise, calculation: 'Annual revenue ÷ 12' },
      { category: 'Concessions', amount: concessions, calculation: 'Annual revenue ÷ 12' },
      { category: 'Sponsorships', amount: sponsorships, calculation: 'Annual revenue ÷ 12' }
    ]
  };
};

// Profitability Calculations
export const calculateProfitability = (
  capExTotal: number,
  revenueMonthly: number,
  opExMonthly: number,
  debtServiceMonthly: number
): ProfitabilityCalculation => {
  const ebitdaMonthly = revenueMonthly - (opExMonthly - debtServiceMonthly);
  const netIncomeMonthly = revenueMonthly - opExMonthly;
  
  const breakEvenMonths = revenueMonthly > 0 
    ? Math.ceil(capExTotal / Math.max(ebitdaMonthly, 1))
    : "n/a";
  
  const roiYearOne = capExTotal > 0 ? (netIncomeMonthly * 12 / capExTotal) * 100 : 0;
  const paybackMonths = ebitdaMonthly > 0 ? capExTotal / ebitdaMonthly : 0;

  return {
    ebitdaMonthly,
    netIncomeMonthly,
    breakEvenMonths,
    roiYearOne,
    paybackMonths,
    calculations: [
      { metric: 'EBITDA Monthly', formula: `$${revenueMonthly.toLocaleString()} - ($${opExMonthly.toLocaleString()} - $${debtServiceMonthly.toLocaleString()})`, result: ebitdaMonthly },
      { metric: 'Net Income Monthly', formula: `$${revenueMonthly.toLocaleString()} - $${opExMonthly.toLocaleString()}`, result: netIncomeMonthly },
      { metric: 'Break-even Months', formula: `$${capExTotal.toLocaleString()} ÷ max($${ebitdaMonthly.toLocaleString()}, 1)`, result: breakEvenMonths },
      { metric: 'ROI Year 1 (%)', formula: `($${netIncomeMonthly.toLocaleString()} × 12) ÷ $${capExTotal.toLocaleString()} × 100`, result: roiYearOne },
      { metric: 'Payback Months', formula: `$${capExTotal.toLocaleString()} ÷ $${ebitdaMonthly.toLocaleString()}`, result: paybackMonths }
    ]
  };
};