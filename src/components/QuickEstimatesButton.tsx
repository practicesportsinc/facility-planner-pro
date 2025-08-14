import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

/** ---------- Types (aligned to your schema prompts) ---------- */
type BuildMode = "build" | "buy" | "lease";
type SizeKey = "small" | "medium" | "large";
type SportKey =
  | "baseball_softball"
  | "basketball"
  | "volleyball"
  | "pickleball"
  | "soccer_indoor_small_sided"
  | "multi_sport";

type CourtOrCageCounts = Record<string, number>;

interface FacilityPlan {
  build_mode: BuildMode;
  clear_height_ft: number;
  total_sqft?: number; // optional user-entered target
  admin_pct_addon: number;       // default 12
  circulation_pct_addon: number; // default 20
  court_or_cage_counts: CourtOrCageCounts;
  amenities?: Record<string, boolean | number | string>;
}

interface CapExInputs {
  land_cost?: number;
  sitework_pct?: number;
  building_cost_per_sf?: number;
  ti_cost_per_sf?: number;
  renovation_cost_per_sf?: number;
  soft_costs_pct: number;
  contingency_pct: number;
  fixtures_allowance: number;
  it_security_allowance: number;
}

interface LeaseTerms {
  base_rent_per_sf_year: number;
  nnn_per_sf_year: number;
  cam_per_sf_year: number;
  free_rent_months: number;
  ti_allowance_per_sf: number;
  lease_years: number;
  annual_escalation_pct: number;
  security_deposit_months: number;
}

interface StaffingRole {
  role: string;
  ftes: number;
  loaded_wage_per_hr: number;
}

interface OpEx {
  staffing: StaffingRole[];
  utilities_monthly: number;
  insurance_monthly: number;
  property_tax_monthly: number;
  maintenance_monthly: number;
  marketing_monthly: number;
  software_monthly: number;
  janitorial_monthly: number;
  other_monthly: number;
}

interface MembershipPlan { name: string; price_month: number; members: number; }
interface RentalLine { unit: string; rate_per_hr: number; util_hours_per_week: number; }
interface LessonsLine { coach_count: number; avg_rate_per_hr: number; hours_per_coach_week: number; utilization_pct: number; }
interface CampsClinicsLine { sessions_per_year: number; avg_price: number; capacity: number; fill_rate_pct: number; }
interface LeaguesTournamentsLine { events_per_year: number; teams_per_event: number; avg_team_fee: number; net_margin_pct: number; }

interface RevenuePrograms {
  memberships: MembershipPlan[];
  rentals: RentalLine[];
  lessons: LessonsLine[];
  camps_clinics: CampsClinicsLine[];
  leagues_tournaments: LeaguesTournamentsLine[];
  parties_events?: { events_per_month?: number; avg_net?: number; events_per_year?: number }[];
  merchandising?: { annual_merch_net?: number }[];
  concessions?: { annual_concessions_net?: number }[];
  sponsorships?: { annual_sponsorships?: number }[];
  seasonality?: number[]; // 12 numbers 0–100
}

interface QuickPreset {
  label: string;                 // e.g., "Baseball/Softball"
  size: SizeKey;                 // small | medium | large
  region_multiplier: number;     // 1.00 Omaha
  facility: FacilityPlan;
  capex: CapExInputs;            // used per build mode basis
  lease?: LeaseTerms;            // present for lease mode
  opex: OpEx;
  revenue: RevenuePrograms;
  // space recipe used to compute TotalProgramSF (per-unit space sf)
  per_unit_space_sf: Record<string, number>;
  // optional equipment budget lump sum for quick estimate (kept simple for this preview)
  equipment_lump_sum?: number;
}

interface ProjectDraft {
  id: string;
  currency: "USD";
  location_city: "Omaha";
  location_state_province: "NE";
  location_country: "United States";
  region_multiplier: number;
  scenario_name: string;
  status: "draft" | "completed";
  facility_plan: FacilityPlan;
  capex_inputs: CapExInputs;
  lease_terms?: LeaseTerms;
  opex_inputs: OpEx;
  revenue_programs: RevenuePrograms;
  financing?: { equity_pct?: number; debt_pct?: number; loan_amount?: number; interest_rate_pct?: number; amortization_years?: number; balloon_month?: number; fees_pct?: number; };
  selectedSports?: string[];
}

/** ---------- Constants (Omaha baseline) ---------- */
const HOURS_PER_FTE_MONTH = 173;
const WEEKS_PER_MONTH = 4.345;

/** Helper to compute ProgramSF, GrossSF and an estimate using the same math style as Prompt C */
function computeSpace(facility: FacilityPlan, perUnitSF: Record<string, number>) {
  const totalProgramSF = Object.entries(facility.court_or_cage_counts).reduce((acc, [unit, count]) => {
    const perSF = perUnitSF[unit] ?? 0;
    return acc + (count * perSF);
  }, 0);
  const grossSF = totalProgramSF * (1 + facility.circulation_pct_addon / 100 + facility.admin_pct_addon / 100);
  return { totalProgramSF, grossSF };
}

/** Estimate key numbers for the preview card (Lease mode shown; Build/Buy can be added similarly) */
function estimateQuickNumbers(p: QuickPreset) {
  const { grossSF } = computeSpace(p.facility, p.per_unit_space_sf);

  // TI (lease)
  const tiGross = (p.capex.ti_cost_per_sf ?? 0) * grossSF * p.region_multiplier;
  const tiAllowance = (p.lease?.ti_allowance_per_sf ?? 0) * grossSF;
  const tiNet = Math.max(tiGross - tiAllowance, 0);

  // Soft & contingency (lease bases)
  const soft = tiNet * (p.capex.soft_costs_pct / 100);
  const depositsFees = (p.lease?.security_deposit_months ?? 0) * ((p.lease!.base_rent_per_sf_year / 12) * grossSF);
  const contingency = (tiNet + soft + depositsFees) * (p.capex.contingency_pct / 100);

  // Fixtures/IT + equipment
  const fixturesIt = (p.capex.fixtures_allowance + p.capex.it_security_allowance);
  const equipment = p.equipment_lump_sum ?? 0;

  // Free rent credit
  const monthlyRentGross = (((p.lease!.base_rent_per_sf_year + p.lease!.nnn_per_sf_year + p.lease!.cam_per_sf_year) / 12) * grossSF);
  const freeRentCredit = monthlyRentGross * (p.lease?.free_rent_months ?? 0);

  const capexTotal = tiNet + soft + contingency + depositsFees + fixturesIt + equipment - freeRentCredit;

  // Opex monthly
  const staffingMonthly = p.opex.staffing.reduce((a, r) => a + r.ftes * r.loaded_wage_per_hr * HOURS_PER_FTE_MONTH, 0);
  const fixedMonthly =
    p.opex.utilities_monthly + p.opex.insurance_monthly + p.opex.property_tax_monthly +
    p.opex.maintenance_monthly + p.opex.marketing_monthly + p.opex.software_monthly +
    p.opex.janitorial_monthly + p.opex.other_monthly;
  const leaseMonthly = monthlyRentGross;
  const debtMonthly = 0; // keep the preview clean
  const opexMonthly = staffingMonthly + fixedMonthly + leaseMonthly + debtMonthly;

  // Revenue monthly
  const memberships = p.revenue.memberships.reduce((a, m) => a + m.price_month * m.members, 0);
  const rentals = p.revenue.rentals.reduce((a, r) => a + r.rate_per_hr * r.util_hours_per_week * WEEKS_PER_MONTH, 0);
  const lessons = p.revenue.lessons.reduce((a, l) => a + l.coach_count * l.hours_per_coach_week * WEEKS_PER_MONTH * l.avg_rate_per_hr * (l.utilization_pct / 100), 0);
  const camps = (p.revenue.camps_clinics.reduce((a, c) => a + c.sessions_per_year * c.avg_price * c.capacity * (c.fill_rate_pct / 100), 0)) / 12;
  const leagues = (p.revenue.leagues_tournaments.reduce((a, t) => a + t.events_per_year * t.teams_per_event * t.avg_team_fee * (t.net_margin_pct / 100), 0)) / 12;

  const parties = (p.revenue.parties_events ?? []).reduce((a, e) => a + (e.events_per_month ? (e.events_per_month * (e.avg_net ?? 0)) : ((e.events_per_year ?? 0) * (e.avg_net ?? 0) / 12)), 0);
  const merch = (p.revenue.merchandising ?? []).reduce((a, m) => a + ((m.annual_merch_net ?? 0) / 12), 0);
  const concessions = (p.revenue.concessions ?? []).reduce((a, c) => a + ((c.annual_concessions_net ?? 0) / 12), 0);
  const sponsorships = (p.revenue.sponsorships ?? []).reduce((a, s) => a + ((s.annual_sponsorships ?? 0) / 12), 0);

  const revenueMonthly = memberships + rentals + lessons + camps + leagues + parties + merch + concessions + sponsorships;

  const ebitdaMonthly = revenueMonthly - (opexMonthly - debtMonthly);
  const marginMonthly = revenueMonthly - (staffingMonthly + fixedMonthly + leaseMonthly);
  const breakEvenMonths = marginMonthly <= 0 ? null : Math.ceil(capexTotal / Math.max(marginMonthly, 1));

  return {
    grossSF: Math.round(grossSF),
    capexTotal: Math.round(capexTotal),
    opexMonthly: Math.round(opexMonthly),
    revenueMonthly: Math.round(revenueMonthly),
    ebitdaMonthly: Math.round(ebitdaMonthly),
    breakEvenMonths
  };
}

/** ---------- Omaha default presets per sport & size ---------- */
/** NOTE: All numbers are editable in-app later; these are brainstorming baselines for USD / Omaha, NE. */
const GLOBAL = {
  region_multiplier: 1.0,
  admin_pct_addon: 12,
  circulation_pct_addon: 20,
  leaseDefaults: {
    base_rent_per_sf_year: 12,
    nnn_per_sf_year: 3,
    cam_per_sf_year: 1.5,
    free_rent_months: 2,
    ti_allowance_per_sf: 8,
    lease_years: 7,
    annual_escalation_pct: 3,
    security_deposit_months: 2
  },
  capexDefaults: (size: SizeKey) => ({
    soft_costs_pct: 10,
    contingency_pct: 10,
    fixtures_allowance: size === "small" ? 15000 : size === "medium" ? 25000 : 40000,
    it_security_allowance: size === "small" ? 10000 : size === "medium" ? 15000 : 25000,
    // TI per SF baseline for lease mode
    ti_cost_per_sf: 18
  }),
  opexDefaults: (size: SizeKey): OpEx => {
    const coaches = size === "small" ? 2 : size === "medium" ? 4 : 6;
    const frontDeskFTE = size === "small" ? 1 : size === "medium" ? 1.25 : 1.5;
    return {
      staffing: [
        { role: "GM", ftes: 1, loaded_wage_per_hr: 35 },
        { role: "Operations Lead", ftes: 1, loaded_wage_per_hr: 28 },
        { role: "Coaches/Instructors", ftes: coaches, loaded_wage_per_hr: 25 },
        { role: "Front Desk", ftes: frontDeskFTE, loaded_wage_per_hr: 20 }
      ],
      utilities_monthly: 2500,
      insurance_monthly: 1200,
      property_tax_monthly: 1500,
      maintenance_monthly: 800,
      marketing_monthly: 1000,
      software_monthly: 350,
      janitorial_monthly: 600,
      other_monthly: 500
    };
  },
  seasonality: [80,85,90,95,100,110,120,115,105,95,90,85],
};

function membershipsBySize(size: SizeKey): MembershipPlan[] {
  if (size === "small") return [{ name: "Individual", price_month: 59, members: 200 }, { name: "Family", price_month: 99, members: 80 }];
  if (size === "medium") return [{ name: "Individual", price_month: 59, members: 300 }, { name: "Family", price_month: 99, members: 120 }];
  return [{ name: "Individual", price_month: 59, members: 400 }, { name: "Family", price_month: 99, members: 180 }];
}

/** Sport presets */
function presetsBaseball(size: SizeKey): QuickPreset {
  const tunnels = size === "small" ? 6 : size === "medium" ? 8 : 12;
  const perUnitSF = { baseball_tunnels: 1050 };
  return {
    label: "Baseball / Softball",
    size,
    region_multiplier: GLOBAL.region_multiplier,
    facility: {
      build_mode: "lease",
      clear_height_ft: 18,
      admin_pct_addon: GLOBAL.admin_pct_addon,
      circulation_pct_addon: GLOBAL.circulation_pct_addon,
      court_or_cage_counts: { baseball_tunnels: tunnels },
      amenities: { bullpen: true, party_room: size !== "small", pro_shop: size !== "small" }
    },
    capex: GLOBAL.capexDefaults(size),
    lease: { ...GLOBAL.leaseDefaults },
    opex: GLOBAL.opexDefaults(size),
    revenue: {
      memberships: membershipsBySize(size),
      rentals: [{ unit: "batting_tunnel", rate_per_hr: 45, util_hours_per_week: size === "small" ? 30 : size === "medium" ? 40 : 50 }],
      lessons: [{ coach_count: size === "small" ? 2 : size === "medium" ? 3 : 4, avg_rate_per_hr: 70, hours_per_coach_week: size === "large" ? 18 : 15, utilization_pct: size === "small" ? 65 : 70 }],
      camps_clinics: [{ sessions_per_year: 12, avg_price: 199, capacity: 30, fill_rate_pct: 70 }],
      leagues_tournaments: [{ events_per_year: 6, teams_per_event: 10, avg_team_fee: 400, net_margin_pct: 35 }],
      parties_events: [{ events_per_month: size === "small" ? 4 : size === "medium" ? 6 : 8, avg_net: 225 }],
      merchandising: [{ annual_merch_net: size === "small" ? 6000 : size === "medium" ? 9000 : 12000 }],
      concessions: [{ annual_concessions_net: size === "small" ? 3600 : size === "medium" ? 4800 : 6000 }],
      sponsorships: [{ annual_sponsorships: size === "small" ? 5000 : size === "medium" ? 8000 : 12000 }],
      seasonality: GLOBAL.seasonality
    },
    per_unit_space_sf: perUnitSF,
    equipment_lump_sum: size === "small" ? 40000 : size === "medium" ? 65000 : 95000
  };
}

function presetsBasketball(size: SizeKey): QuickPreset {
  const courts = size === "small" ? 1 : size === "medium" ? 2 : 3;
  const perUnitSF = { basketball_courts_full: 6240 };
  return {
    label: "Basketball",
    size,
    region_multiplier: GLOBAL.region_multiplier,
    facility: {
      build_mode: "lease",
      clear_height_ft: 26,
      admin_pct_addon: GLOBAL.admin_pct_addon,
      circulation_pct_addon: GLOBAL.circulation_pct_addon,
      court_or_cage_counts: { basketball_courts_full: courts },
      amenities: { scoreboards: true, benches: true, wall_padding: true }
    },
    capex: GLOBAL.capexDefaults(size),
    lease: { ...GLOBAL.leaseDefaults },
    opex: GLOBAL.opexDefaults(size),
    revenue: {
      memberships: membershipsBySize(size),
      rentals: [{ unit: "basketball_court_full", rate_per_hr: 95, util_hours_per_week: size === "small" ? 35 : size === "medium" ? 45 : 55 }],
      lessons: [{ coach_count: size === "small" ? 2 : 3, avg_rate_per_hr: 75, hours_per_coach_week: 15, utilization_pct: 70 }],
      camps_clinics: [{ sessions_per_year: 10, avg_price: 229, capacity: 40, fill_rate_pct: 70 }],
      leagues_tournaments: [{ events_per_year: size === "small" ? 6 : 8, teams_per_event: 12, avg_team_fee: 500, net_margin_pct: 40 }],
      parties_events: [{ events_per_month: size === "small" ? 4 : 6, avg_net: 275 }],
      merchandising: [{ annual_merch_net: size === "small" ? 5000 : size === "medium" ? 8000 : 11000 }],
      sponsorships: [{ annual_sponsorships: size === "small" ? 6000 : size === "medium" ? 9000 : 13000 }],
      seasonality: GLOBAL.seasonality
    },
    per_unit_space_sf: perUnitSF,
    equipment_lump_sum: size === "small" ? 35000 : size === "medium" ? 55000 : 80000
  };
}

function presetsVolleyball(size: SizeKey): QuickPreset {
  const courts = size === "small" ? 3 : size === "medium" ? 4 : 6;
  const perUnitSF = { volleyball_courts: 2592 };
  return {
    label: "Volleyball",
    size,
    region_multiplier: GLOBAL.region_multiplier,
    facility: {
      build_mode: "lease",
      clear_height_ft: 24,
      admin_pct_addon: GLOBAL.admin_pct_addon,
      circulation_pct_addon: GLOBAL.circulation_pct_addon,
      court_or_cage_counts: { volleyball_courts: courts },
      amenities: { ref_stands: true, antennae: true, ball_carts: true }
    },
    capex: GLOBAL.capexDefaults(size),
    lease: { ...GLOBAL.leaseDefaults },
    opex: GLOBAL.opexDefaults(size),
    revenue: {
      memberships: membershipsBySize(size),
      rentals: [{ unit: "volleyball_court", rate_per_hr: 45, util_hours_per_week: size === "small" ? 35 : size === "medium" ? 45 : 55 }],
      lessons: [{ coach_count: size === "small" ? 2 : 3, avg_rate_per_hr: 70, hours_per_coach_week: 15, utilization_pct: 70 }],
      camps_clinics: [{ sessions_per_year: 12, avg_price: 219, capacity: 30, fill_rate_pct: 70 }],
      leagues_tournaments: [{ events_per_year: size === "small" ? 8 : 10, teams_per_event: 12, avg_team_fee: 450, net_margin_pct: 40 }],
      parties_events: [{ events_per_month: size === "small" ? 3 : 5, avg_net: 225 }],
      merchandising: [{ annual_merch_net: size === "small" ? 4000 : size === "medium" ? 7000 : 9000 }],
      sponsorships: [{ annual_sponsorships: size === "small" ? 5000 : size === "medium" ? 8000 : 11000 }],
      seasonality: GLOBAL.seasonality
    },
    per_unit_space_sf: perUnitSF,
    equipment_lump_sum: size === "small" ? 30000 : size === "medium" ? 45000 : 65000
  };
}

function presetsPickleball(size: SizeKey): QuickPreset {
  const courts = size === "small" ? 4 : size === "medium" ? 6 : 8;
  const perUnitSF = { pickleball_courts: 1800 };
  return {
    label: "Pickleball",
    size,
    region_multiplier: GLOBAL.region_multiplier,
    facility: {
      build_mode: "lease",
      clear_height_ft: 19,
      admin_pct_addon: GLOBAL.admin_pct_addon,
      circulation_pct_addon: GLOBAL.circulation_pct_addon,
      court_or_cage_counts: { pickleball_courts: courts },
      amenities: { divider_nets: true, benches: true }
    },
    capex: GLOBAL.capexDefaults(size),
    lease: { ...GLOBAL.leaseDefaults },
    opex: GLOBAL.opexDefaults(size),
    revenue: {
      memberships: membershipsBySize(size),
      rentals: [{ unit: "pickleball_court", rate_per_hr: 35, util_hours_per_week: size === "small" ? 40 : size === "medium" ? 48 : 56 }],
      lessons: [{ coach_count: size === "small" ? 2 : 3, avg_rate_per_hr: 60, hours_per_coach_week: 12, utilization_pct: 65 }],
      camps_clinics: [{ sessions_per_year: 8, avg_price: 179, capacity: 20, fill_rate_pct: 65 }],
      leagues_tournaments: [{ events_per_year: size === "small" ? 6 : 8, teams_per_event: 12, avg_team_fee: 350, net_margin_pct: 40 }],
      parties_events: [{ events_per_month: size === "small" ? 4 : 6, avg_net: 200 }],
      seasonality: GLOBAL.seasonality
    },
    per_unit_space_sf: perUnitSF,
    equipment_lump_sum: size === "small" ? 20000 : size === "medium" ? 30000 : 40000
  };
}

function presetsSoccer(size: SizeKey): QuickPreset {
  const fields = size === "small" ? 1 : size === "medium" ? 2 : 3;
  const perUnitSF = { soccer_field_small: 14400 };
  return {
    label: "Indoor Soccer (small-sided)",
    size,
    region_multiplier: GLOBAL.region_multiplier,
    facility: {
      build_mode: "lease",
      clear_height_ft: 26,
      admin_pct_addon: GLOBAL.admin_pct_addon,
      circulation_pct_addon: GLOBAL.circulation_pct_addon,
      court_or_cage_counts: { soccer_field_small: fields },
      amenities: { dasher_boards: size !== "small", scoreboard: true }
    },
    capex: GLOBAL.capexDefaults(size),
    lease: { ...GLOBAL.leaseDefaults },
    opex: GLOBAL.opexDefaults(size),
    revenue: {
      memberships: membershipsBySize(size),
      rentals: [{ unit: "soccer_field_small", rate_per_hr: 140, util_hours_per_week: size === "small" ? 35 : size === "medium" ? 55 : 70 }],
      lessons: [{ coach_count: size === "small" ? 2 : 3, avg_rate_per_hr: 80, hours_per_coach_week: 12, utilization_pct: 65 }],
      camps_clinics: [{ sessions_per_year: 8, avg_price: 249, capacity: 25, fill_rate_pct: 70 }],
      leagues_tournaments: [{ events_per_year: size === "small" ? 6 : 8, teams_per_event: 16, avg_team_fee: 600, net_margin_pct: 40 }],
      parties_events: [{ events_per_month: size === "small" ? 3 : 5, avg_net: 300 }],
      seasonality: GLOBAL.seasonality
    },
    per_unit_space_sf: perUnitSF,
    equipment_lump_sum: size === "small" ? 35000 : size === "medium" ? 60000 : 85000
  };
}

function presetsMultiSport(size: SizeKey): QuickPreset {
  // Mix of turf zone + courts
  const perUnitSF = {
    training_turf_zone: 7200,
    pickleball_courts: 1800,
    volleyball_courts: 2592
  };
  const counts =
    size === "small"
      ? { training_turf_zone: 1, pickleball_courts: 4 }
      : size === "medium"
      ? { training_turf_zone: 1, volleyball_courts: 2, pickleball_courts: 4 }
      : { training_turf_zone: 1, volleyball_courts: 2, pickleball_courts: 6 };

  return {
    label: "Multi‑sport",
    size,
    region_multiplier: GLOBAL.region_multiplier,
    facility: {
      build_mode: "lease",
      clear_height_ft: 22,
      admin_pct_addon: GLOBAL.admin_pct_addon,
      circulation_pct_addon: GLOBAL.circulation_pct_addon,
      court_or_cage_counts: counts,
      amenities: { party_room: true, storage: true }
    },
    capex: GLOBAL.capexDefaults(size),
    lease: { ...GLOBAL.leaseDefaults },
    opex: GLOBAL.opexDefaults(size),
    revenue: {
      memberships: membershipsBySize(size),
      rentals: [
        ...(counts.pickleball_courts ? [{ unit: "pickleball_court", rate_per_hr: 35, util_hours_per_week: size === "small" ? 40 : 48 }] : []),
        ...(counts.volleyball_courts ? [{ unit: "volleyball_court", rate_per_hr: 45, util_hours_per_week: size === "small" ? 30 : 40 }] : []),
        ...(counts.training_turf_zone ? [{ unit: "training_turf_zone", rate_per_hr: 120, util_hours_per_week: size === "small" ? 25 : 35 }] : []),
      ],
      lessons: [{ coach_count: size === "small" ? 2 : 3, avg_rate_per_hr: 70, hours_per_coach_week: 14, utilization_pct: 65 }],
      camps_clinics: [{ sessions_per_year: 12, avg_price: 219, capacity: 30, fill_rate_pct: 70 }],
      leagues_tournaments: [{ events_per_year: size === "small" ? 4 : 6, teams_per_event: 8, avg_team_fee: 400, net_margin_pct: 35 }],
      parties_events: [{ events_per_month: size === "small" ? 5 : 7, avg_net: 240 }],
      sponsorships: [{ annual_sponsorships: size === "small" ? 6000 : 9000 }],
      seasonality: GLOBAL.seasonality
    },
    per_unit_space_sf: perUnitSF,
    equipment_lump_sum: size === "small" ? 40000 : size === "medium" ? 60000 : 80000
  };
}

const QUICK_PRESETS: Record<SportKey, (size: SizeKey) => QuickPreset> = {
  baseball_softball: presetsBaseball,
  basketball: presetsBasketball,
  volleyball: presetsVolleyball,
  pickleball: presetsPickleball,
  soccer_indoor_small_sided: presetsSoccer,
  multi_sport: presetsMultiSport
};

/** Save draft to localStorage (replace with your API if available) */
/** Helper function to get sports array for each sport key */
function getSportsForPreset(sportKey: SportKey): string[] {
  const sportMapping: Record<SportKey, string[]> = {
    "baseball_softball": ["baseball"],
    "basketball": ["basketball"],
    "volleyball": ["volleyball"],
    "pickleball": ["pickleball"],
    "soccer_indoor_small_sided": ["soccer"],
    "multi_sport": ["basketball", "volleyball", "soccer"]
  };
  return sportMapping[sportKey] || [];
}

function saveDraftProject(p: QuickPreset, sportKey: SportKey): ProjectDraft {
  const id = `quick-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const draft: ProjectDraft = {
    id,
    currency: "USD",
    location_city: "Omaha",
    location_state_province: "NE",
    location_country: "United States",
    region_multiplier: p.region_multiplier,
    scenario_name: `${p.label} — ${p.size[0].toUpperCase() + p.size.slice(1)} (Quick)`,
    status: "draft",
    facility_plan: p.facility,
    capex_inputs: p.capex,
    lease_terms: p.facility.build_mode === "lease" ? p.lease : undefined,
    opex_inputs: p.opex,
    revenue_programs: p.revenue,
    financing: { equity_pct: 0, debt_pct: 0, loan_amount: 0, interest_rate_pct: 0, amortization_years: 0 },
    // Add sports data based on the selected sport key
    selectedSports: getSportsForPreset(sportKey)
  };

  // Persist — switch to your backend create endpoint if you prefer
  localStorage.setItem(`ps:project:${id}`, JSON.stringify(draft));
  return draft;
}

/** ---------- UI COMPONENT ---------- */
export default function QuickEstimatesButton() {
  const [open, setOpen] = useState(false);
  const [sport, setSport] = useState<SportKey>("baseball_softball");
  const [size, setSize] = useState<SizeKey>("medium");
  const navigate = useNavigate();

  const preset = useMemo(() => QUICK_PRESETS[sport](size), [sport, size]);
  const preview = useMemo(() => estimateQuickNumbers(preset), [preset]);

  function createQuickEstimate() {
    const saved = saveDraftProject(preset, sport);
    setOpen(false); // Close the modal
    // Navigate: you can route to /calculator if your app shows results immediately (soft gate will still apply)
    navigate(`/calculator?projectId=${saved.id}&mode=quick`);
  }

  const sportOptions: { key: SportKey; label: string }[] = [
    { key: "baseball_softball", label: "Baseball / Softball" },
    { key: "basketball", label: "Basketball" },
    { key: "volleyball", label: "Volleyball" },
    { key: "pickleball", label: "Pickleball" },
    { key: "soccer_indoor_small_sided", label: "Indoor Soccer (small-sided)" },
    { key: "multi_sport", label: "Multi‑sport" }
  ];

  return (
    <>
      <Button 
        variant="outline" 
        size="lg" 
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-controls="quick-estimates-panel"
      >
        <Zap className="mr-2 h-5 w-5" />
        Quick Estimates
      </Button>

      {open && (
        <div className="qs-panel-overlay" role="dialog" aria-modal="true" id="quick-estimates-panel">
          <div className="qs-panel">
            <header className="qs-head">
              <h2>Quick Estimates</h2>
              <p>Get an instant, editable draft with typical layouts and budgeting—perfect for brainstorming.</p>
              <button className="qs-close" aria-label="Close quick estimates" onClick={() => setOpen(false)}>✕</button>
            </header>

            <section className="qs-grid">
              <div className="qs-card">
                <h3>1) Choose a sport</h3>
                <div className="qs-pills">
                  {sportOptions.map(opt => (
                    <button
                      key={opt.key}
                      className={`qs-pill ${sport === opt.key ? "active" : ""}`}
                      onClick={() => setSport(opt.key)}
                      aria-pressed={sport === opt.key}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <h3>2) Choose a size</h3>
                <div className="qs-pills">
                  {(["small","medium","large"] as SizeKey[]).map(s => (
                    <button
                      key={s}
                      className={`qs-pill ${size === s ? "active" : ""}`}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                    >
                      {s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="qs-card">
                <h3>Layout & Space</h3>
                <LayoutSummary preset={preset} />
              </div>

              <div className="qs-card">
                <h3>Budget Preview (Omaha baseline)</h3>
                <ul className="qs-stats">
                  <li><span>Gross SF</span><strong>{preview.grossSF.toLocaleString()}</strong></li>
                  <li><span>CapEx (est.)</span><strong>${preview.capexTotal.toLocaleString()}</strong></li>
                  <li><span>Monthly OpEx (est.)</span><strong>${preview.opexMonthly.toLocaleString()}</strong></li>
                  <li><span>Monthly Revenue (est.)</span><strong>${preview.revenueMonthly.toLocaleString()}</strong></li>
                  <li><span>EBITDA (est.)</span><strong>${preview.ebitdaMonthly.toLocaleString()}</strong></li>
                  <li><span>Break‑even</span><strong>{preview.breakEvenMonths ? `${preview.breakEvenMonths} mo` : "n/a"}</strong></li>
                </ul>
                <p className="qs-note">All inputs are editable later. Figures are planning estimates only.</p>
              </div>
            </section>

            <footer className="qs-foot">
              <button className="qs-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="qs-primary" onClick={createQuickEstimate}>Create Quick Estimate →</button>
            </footer>
          </div>
        </div>
      )}

      <style>{`
        .qs-panel-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center; z-index: 60;
        }
        .qs-panel {
          width: min(100%, 980px);
          background: #fff; border-radius: 12px; padding: 16px 16px 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
          display: grid; grid-template-rows: auto 1fr auto; gap: 8px;
          max-height: 92vh; overflow: hidden;
        }
        .qs-head { position: relative; padding: 8px 8px 0; }
        .qs-head h2 { margin: 0 0 4px; }
        .qs-close {
          position: absolute; top: 8px; right: 8px; border: none; background: transparent; font-size: 18px; cursor: pointer;
        }
        .qs-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          padding: 8px; overflow: auto;
        }
        .qs-card {
          background: #F7F9FC; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px;
        }
        .qs-pills { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 4px; }
        .qs-pill {
          border: 1px solid #D1D5DB; background: #fff; padding: 6px 10px; border-radius: 999px; cursor: pointer;
        }
        .qs-pill.active { background: #0B63E5; border-color: #0B63E5; color: #fff; }
        .qs-stats { list-style: none; padding: 0; margin: 8px 0; display: grid; gap: 6px; }
        .qs-stats li { display: flex; justify-content: space-between; font-size: 14px; }
        .qs-stats strong { font-weight: 700; }
        .qs-note { color: #6B7280; font-size: 12px; margin-top: 8px; }
        .qs-foot { display: flex; gap: 8px; justify-content: flex-end; padding: 8px; }
        .qs-primary {
          background: #00A66A; color: #fff; border: none; padding: 10px 14px; border-radius: 8px; font-weight: 700; cursor: pointer;
        }
        .qs-secondary {
          background: #fff; color: #111; border: 1px solid #D1D5DB; padding: 10px 14px; border-radius: 8px; cursor: pointer;
        }
        @media (max-width: 900px) {
          .qs-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

/** Small subcomponent to summarize layout + gross SF */
function LayoutSummary({ preset }: { preset: QuickPreset }) {
  const { totalProgramSF, grossSF } = computeSpace(preset.facility, preset.per_unit_space_sf);
  return (
    <div>
      <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "grid", gap: 6 }}>
        {Object.entries(preset.facility.court_or_cage_counts).map(([unit, count]) => (
          <li key={unit} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ textTransform: "capitalize" }}>{unit.replace(/_/g, " ")}</span>
            <strong>{count}</strong>
          </li>
        ))}
      </ul>
      <hr style={{ margin: "8px 0" }} />
      <div style={{ display: "grid", gap: 4, fontSize: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Program SF</span><strong>{Math.round(totalProgramSF).toLocaleString()}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Circulation + Admin</span><strong>{preset.facility.circulation_pct_addon + preset.facility.admin_pct_addon}%</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Gross SF (est.)</span><strong>{Math.round(grossSF).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}