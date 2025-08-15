import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

// Import the types and functions from QuickEstimatesButton
type BuildMode = "build" | "buy" | "lease";
type SizeKey = "small" | "small_plus" | "medium" | "large" | "giant" | "arena";
type SportKey =
  | "baseball_softball"
  | "basketball"
  | "volleyball"
  | "pickleball"
  | "soccer"
  | "football"
  | "lacrosse"
  | "tennis"
  | "multi_sport"
  | "fitness";

type CourtOrCageCounts = Record<string, number>;

interface FacilityPlan {
  build_mode: BuildMode;
  clear_height_ft: number;
  total_sqft?: number;
  admin_pct_addon: number;
  circulation_pct_addon: number;
  court_or_cage_counts: CourtOrCageCounts;
  amenities?: Record<string, boolean | number | string>;
  layout_choice?: string;
  aspect_ratio?: number;
  perimeter_ft?: number;
  gap_ft?: number;
  admin_blocks?: any[];
  orientation_hint?: Record<string, boolean>;
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
  seasonality?: number[];
}

interface QuickPreset {
  label: string;
  size: SizeKey;
  region_multiplier: number;
  facility: FacilityPlan;
  capex: CapExInputs;
  lease?: LeaseTerms;
  opex: OpEx;
  revenue: RevenuePrograms;
  per_unit_space_sf: Record<string, number>;
  equipment_lump_sum?: number;
}

// Import constants and functions (simplified version for this modal)
const HOURS_PER_FTE_MONTH = 173;
const WEEKS_PER_MONTH = 4.345;

function computeSpace(facility: FacilityPlan, perUnitSF: Record<string, number>) {
  const totalProgramSF = Object.entries(facility.court_or_cage_counts).reduce((acc, [unit, count]) => {
    const perSF = perUnitSF[unit] ?? 0;
    return acc + (count * perSF);
  }, 0);
  const grossSF = totalProgramSF * (1 + facility.circulation_pct_addon / 100 + facility.admin_pct_addon / 100);
  return { totalProgramSF, grossSF };
}

function estimateQuickNumbers(p: QuickPreset) {
  const { grossSF } = computeSpace(p.facility, p.per_unit_space_sf);

  const tiGross = (p.capex.ti_cost_per_sf ?? 0) * grossSF * p.region_multiplier;
  const tiAllowance = (p.lease?.ti_allowance_per_sf ?? 0) * grossSF;
  const tiNet = Math.max(tiGross - tiAllowance, 0);

  const soft = tiNet * (p.capex.soft_costs_pct / 100);
  const depositsFees = (p.lease?.security_deposit_months ?? 0) * ((p.lease!.base_rent_per_sf_year / 12) * grossSF);
  const contingency = (tiNet + soft + depositsFees) * (p.capex.contingency_pct / 100);

  const fixturesIt = (p.capex.fixtures_allowance + p.capex.it_security_allowance);
  const equipment = p.equipment_lump_sum ?? 0;

  const monthlyRentGross = (((p.lease!.base_rent_per_sf_year + p.lease!.nnn_per_sf_year + p.lease!.cam_per_sf_year) / 12) * grossSF);
  const freeRentCredit = monthlyRentGross * (p.lease?.free_rent_months ?? 0);

  const capexTotal = tiNet + soft + contingency + depositsFees + fixturesIt + equipment - freeRentCredit;

  const staffingMonthly = p.opex.staffing.reduce((a, r) => a + r.ftes * r.loaded_wage_per_hr * HOURS_PER_FTE_MONTH, 0);
  const fixedMonthly =
    p.opex.utilities_monthly + p.opex.insurance_monthly + p.opex.property_tax_monthly +
    p.opex.maintenance_monthly + p.opex.marketing_monthly + p.opex.software_monthly +
    p.opex.janitorial_monthly + p.opex.other_monthly;
  const leaseMonthly = monthlyRentGross;
  const opexMonthly = staffingMonthly + fixedMonthly + leaseMonthly;

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

  const ebitdaMonthly = revenueMonthly - opexMonthly;
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

// Simplified preset function (you would import the full QUICK_PRESETS from the original file)
function getPreset(sport: SportKey, size: SizeKey): QuickPreset {
  // This is a simplified baseball preset - you'd need to import the full QUICK_PRESETS
  return {
    label: "Baseball / Softball",
    size,
    region_multiplier: 1.0,
    facility: {
      build_mode: "lease",
      clear_height_ft: 18,
      admin_pct_addon: 12,
      circulation_pct_addon: 20,
      court_or_cage_counts: { baseball_tunnels: size === "small" ? 6 : size === "medium" ? 8 : 12 },
    },
    capex: {
      soft_costs_pct: 10,
      contingency_pct: 10,
      fixtures_allowance: size === "small" ? 15000 : size === "medium" ? 25000 : 40000,
      it_security_allowance: size === "small" ? 10000 : size === "medium" ? 15000 : 25000,
      ti_cost_per_sf: 18
    },
    lease: {
      base_rent_per_sf_year: 12,
      nnn_per_sf_year: 3,
      cam_per_sf_year: 1.5,
      free_rent_months: 2,
      ti_allowance_per_sf: 8,
      lease_years: 7,
      annual_escalation_pct: 3,
      security_deposit_months: 2
    },
    opex: {
      staffing: [
        { role: "GM", ftes: 1, loaded_wage_per_hr: 35 },
        { role: "Operations Lead", ftes: 1, loaded_wage_per_hr: 28 },
        { role: "Coaches/Instructors", ftes: size === "small" ? 2 : size === "medium" ? 4 : 6, loaded_wage_per_hr: 25 },
        { role: "Front Desk", ftes: size === "small" ? 1 : size === "medium" ? 1.25 : 1.5, loaded_wage_per_hr: 20 }
      ],
      utilities_monthly: 2500,
      insurance_monthly: 1200,
      property_tax_monthly: 1500,
      maintenance_monthly: 800,
      marketing_monthly: 1000,
      software_monthly: 350,
      janitorial_monthly: 600,
      other_monthly: 500
    },
    revenue: {
      memberships: [{ name: "Individual", price_month: 59, members: 200 }, { name: "Family", price_month: 99, members: 80 }],
      rentals: [{ unit: "batting_tunnel", rate_per_hr: 45, util_hours_per_week: 30 }],
      lessons: [{ coach_count: 2, avg_rate_per_hr: 70, hours_per_coach_week: 15, utilization_pct: 65 }],
      camps_clinics: [{ sessions_per_year: 12, avg_price: 199, capacity: 30, fill_rate_pct: 70 }],
      leagues_tournaments: [{ events_per_year: 6, teams_per_event: 10, avg_team_fee: 400, net_margin_pct: 35 }],
      parties_events: [{ events_per_month: 4, avg_net: 225 }],
      merchandising: [{ annual_merch_net: 6000 }],
      concessions: [{ annual_concessions_net: 3600 }],
      sponsorships: [{ annual_sponsorships: 5000 }],
    },
    per_unit_space_sf: { baseball_tunnels: 1050 },
    equipment_lump_sum: 40000
  };
}

interface QuickEstimatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Equipment recommendations based on sport and size (matching wizard format)
const EQUIPMENT_RECOMMENDATIONS: Record<SportKey, Record<SizeKey, string[]>> = {
  baseball_softball: {
    small: ["6 Batting Cages", "3 Pitching Machines", "6 L-Screens", "3 Ball Carts", "4 Divider Curtains", "3,500 SF Turf Area"],
    small_plus: ["8 Batting Cages", "4 Pitching Machines", "8 L-Screens", "4 Ball Carts", "4 Divider Curtains", "4,200 SF Turf Area"],
    medium: ["10 Batting Cages", "5 Pitching Machines", "10 L-Screens", "5 Ball Carts", "4 Divider Curtains", "5,000 SF Turf Area"],
    large: ["12 Batting Cages", "6 Pitching Machines", "12 L-Screens", "6 Ball Carts", "4 Divider Curtains", "5,600 SF Turf Area"],
    giant: ["16 Batting Cages", "8 Pitching Machines", "16 L-Screens", "8 Ball Carts", "4 Divider Curtains", "7,000 SF Turf Area"],
    arena: ["20 Batting Cages", "10 Pitching Machines", "20 L-Screens", "10 Ball Carts", "4 Divider Curtains", "8,500 SF Turf Area"]
  },
  basketball: {
    small: ["2 Basketball Hoops", "1 Scoreboard", "2,100 SF Hardwood Flooring", "4 Divider Curtains"],
    small_plus: ["3 Basketball Hoops", "2 Scoreboards", "4,800 SF Hardwood Flooring", "4 Divider Curtains"],
    medium: ["4 Basketball Hoops", "2 Scoreboards", "6,600 SF Hardwood Flooring", "4 Divider Curtains"],
    large: ["6 Basketball Hoops", "3 Scoreboards", "7,800 SF Hardwood Flooring", "4 Divider Curtains"],
    giant: ["8 Basketball Hoops", "4 Scoreboards", "12,000 SF Hardwood Flooring", "4 Divider Curtains"],
    arena: ["12 Basketball Hoops", "6 Scoreboards", "18,000 SF Hardwood Flooring", "4 Divider Curtains"]
  },
  volleyball: {
    small: ["2 Volleyball Systems", "2 Referee Stands", "1 Scoreboard", "1,750 SF Rubber Flooring", "4 Divider Curtains"],
    small_plus: ["3 Volleyball Systems", "3 Referee Stands", "2 Scoreboards", "3,500 SF Rubber Flooring", "4 Divider Curtains"],
    medium: ["4 Volleyball Systems", "4 Referee Stands", "2 Scoreboards", "5,500 SF Rubber Flooring", "4 Divider Curtains"],
    large: ["5 Volleyball Systems", "5 Referee Stands", "3 Scoreboards", "6,500 SF Rubber Flooring", "4 Divider Curtains"],
    giant: ["8 Volleyball Systems", "8 Referee Stands", "4 Scoreboards", "10,000 SF Rubber Flooring", "4 Divider Curtains"],
    arena: ["12 Volleyball Systems", "12 Referee Stands", "6 Scoreboards", "15,000 SF Rubber Flooring", "4 Divider Curtains"]
  },
  pickleball: {
    small: ["3 Pickleball Nets", "6 Paddle Starter Sets", "1,200 SF Rubber Flooring", "4 Divider Curtains"],
    small_plus: ["4 Pickleball Nets", "8 Paddle Starter Sets", "2,400 SF Rubber Flooring", "4 Divider Curtains"],
    medium: ["6 Pickleball Nets", "12 Paddle Starter Sets", "3,600 SF Rubber Flooring", "4 Divider Curtains"],
    large: ["8 Pickleball Nets", "16 Paddle Starter Sets", "4,800 SF Rubber Flooring", "4 Divider Curtains"],
    giant: ["12 Pickleball Nets", "24 Paddle Starter Sets", "7,200 SF Rubber Flooring", "4 Divider Curtains"],
    arena: ["16 Pickleball Nets", "32 Paddle Starter Sets", "9,600 SF Rubber Flooring", "4 Divider Curtains"]
  },
  soccer: {
    small: ["1 Soccer Goal (pair)", "3,500 SF Turf Area", "4 Divider Curtains", "1 Training Turf Zone"],
    small_plus: ["2 Soccer Goals (pair)", "5,500 SF Turf Area", "4 Divider Curtains", "1 Training Turf Zone"],
    medium: ["2 Soccer Goals (pair)", "7,700 SF Turf Area", "4 Divider Curtains", "1 Training Turf Zone"],
    large: ["3 Soccer Goals (pair)", "9,100 SF Turf Area", "4 Divider Curtains", "1 Training Turf Zone"],
    giant: ["4 Soccer Goals (pair)", "15,000 SF Turf Area", "4 Divider Curtains", "2 Training Turf Zones"],
    arena: ["6 Soccer Goals (pair)", "25,000 SF Turf Area", "4 Divider Curtains", "3 Training Turf Zones"]
  },
  football: {
    small: ["3,500 SF Turf Area", "4 Divider Curtains", "Training Equipment Set"],
    small_plus: ["5,500 SF Turf Area", "4 Divider Curtains", "Training Equipment Set"],
    medium: ["7,700 SF Turf Area", "4 Divider Curtains", "Training Equipment Set"],
    large: ["9,100 SF Turf Area", "4 Divider Curtains", "Training Equipment Set"],
    giant: ["15,000 SF Turf Area", "4 Divider Curtains", "2 Training Equipment Sets"],
    arena: ["25,000 SF Turf Area", "4 Divider Curtains", "3 Training Equipment Sets"]
  },
  lacrosse: {
    small: ["2 Lacrosse Goals (pair)", "3,500 SF Turf Area", "4 Divider Curtains", "Lacrosse Ball Sets"],
    small_plus: ["3 Lacrosse Goals (pair)", "5,500 SF Turf Area", "4 Divider Curtains", "Lacrosse Ball Sets"],
    medium: ["4 Lacrosse Goals (pair)", "7,700 SF Turf Area", "4 Divider Curtains", "Lacrosse Ball Sets"],
    large: ["5 Lacrosse Goals (pair)", "9,100 SF Turf Area", "4 Divider Curtains", "Lacrosse Ball Sets"],
    giant: ["8 Lacrosse Goals (pair)", "15,000 SF Turf Area", "4 Divider Curtains", "2 Lacrosse Ball Sets"],
    arena: ["12 Lacrosse Goals (pair)", "25,000 SF Turf Area", "4 Divider Curtains", "3 Lacrosse Ball Sets"]
  },
  tennis: {
    small: ["1 Tennis Net", "2,800 SF Hard Court Flooring", "4 Divider Curtains", "Tennis Ball Machine"],
    small_plus: ["2 Tennis Nets", "5,600 SF Hard Court Flooring", "4 Divider Curtains", "Tennis Ball Machine"],
    medium: ["3 Tennis Nets", "8,400 SF Hard Court Flooring", "4 Divider Curtains", "2 Tennis Ball Machines"],
    large: ["4 Tennis Nets", "11,200 SF Hard Court Flooring", "4 Divider Curtains", "2 Tennis Ball Machines"],
    giant: ["6 Tennis Nets", "16,800 SF Hard Court Flooring", "4 Divider Curtains", "3 Tennis Ball Machines"],
    arena: ["8 Tennis Nets", "22,400 SF Hard Court Flooring", "4 Divider Curtains", "4 Tennis Ball Machines"]
  },
  multi_sport: {
    small: ["4 Divider Curtains", "3,500 SF Mixed Flooring", "Multi-Sport Equipment Set", "2 Scoreboards"],
    small_plus: ["4 Divider Curtains", "5,500 SF Mixed Flooring", "Multi-Sport Equipment Set", "2 Scoreboards"],
    medium: ["4 Divider Curtains", "7,700 SF Mixed Flooring", "Multi-Sport Equipment Set", "2 Scoreboards"],
    large: ["4 Divider Curtains", "9,100 SF Mixed Flooring", "2 Multi-Sport Equipment Sets", "3 Scoreboards"],
    giant: ["4 Divider Curtains", "15,000 SF Mixed Flooring", "3 Multi-Sport Equipment Sets", "4 Scoreboards"],
    arena: ["4 Divider Curtains", "25,000 SF Mixed Flooring", "4 Multi-Sport Equipment Sets", "6 Scoreboards"]
  },
  fitness: {
    small: ["Basic Fitness Equipment Package", "1,500 SF Rubber Flooring", "Mirror Wall System", "Sound System"],
    small_plus: ["Standard Fitness Equipment Package", "2,500 SF Rubber Flooring", "Mirror Wall System", "Sound System"],
    medium: ["Premium Fitness Equipment Package", "4,000 SF Rubber Flooring", "Mirror Wall System", "Sound System"],
    large: ["Professional Fitness Equipment Package", "6,000 SF Rubber Flooring", "Mirror Wall System", "Professional Sound System"],
    giant: ["Commercial Fitness Equipment Package", "10,000 SF Rubber Flooring", "Mirror Wall System", "Professional Sound System"],
    arena: ["Elite Fitness Equipment Package", "15,000 SF Rubber Flooring", "Mirror Wall System", "Professional Sound System"]
  }
};

// Equipment cost estimates per sport
const EQUIPMENT_COSTS: Record<SportKey, Record<SizeKey, number>> = {
  baseball_softball: { small: 40000, small_plus: 50000, medium: 65000, large: 95000, giant: 130000, arena: 180000 },
  basketball: { small: 35000, small_plus: 45000, medium: 55000, large: 80000, giant: 110000, arena: 150000 },
  volleyball: { small: 25000, small_plus: 35000, medium: 45000, large: 65000, giant: 85000, arena: 120000 },
  pickleball: { small: 20000, small_plus: 28000, medium: 35000, large: 50000, giant: 70000, arena: 95000 },
  soccer: { small: 45000, small_plus: 60000, medium: 75000, large: 100000, giant: 140000, arena: 200000 },
  football: { small: 35000, small_plus: 50000, medium: 65000, large: 85000, giant: 120000, arena: 170000 },
  lacrosse: { small: 30000, small_plus: 42000, medium: 55000, large: 75000, giant: 100000, arena: 140000 },
  tennis: { small: 40000, small_plus: 55000, medium: 70000, large: 95000, giant: 130000, arena: 180000 },
  multi_sport: { small: 50000, small_plus: 70000, medium: 90000, large: 120000, giant: 160000, arena: 220000 },
  fitness: { small: 30000, small_plus: 45000, medium: 60000, large: 85000, giant: 115000, arena: 160000 }
};

// Facility size recommendations
const FACILITY_SIZES: Record<SizeKey, { sqft: string; description: string }> = {
  small: { sqft: "2,000-5,000 SF", description: "1-2 courts/cages, minimal amenities" },
  small_plus: { sqft: "5,000-8,000 SF", description: "2-4 courts/cages, basic amenities" },
  medium: { sqft: "8,000-15,000 SF", description: "4-6 courts/cages, full amenities" },
  large: { sqft: "15,000-30,000 SF", description: "6-10 courts/fields, premium features" },
  giant: { sqft: "30,000-50,000 SF", description: "multi-court/field complex" },
  arena: { sqft: "50,000+ SF", description: "tournament-ready, multi-sport" }
};

export default function QuickEstimatesModal({ isOpen, onClose }: QuickEstimatesModalProps) {
  const [sports, setSports] = useState<SportKey[]>(["baseball_softball"]);
  const [size, setSize] = useState<SizeKey>("medium");
  const navigate = useNavigate();

  const preset = useMemo(() => getPreset(sports[0], size), [sports, size]);
  const preview = useMemo(() => estimateQuickNumbers(preset), [preset]);

  // Calculate total equipment cost for selected sports
  const equipmentCost = useMemo(() => {
    return sports.reduce((total, sport) => total + (EQUIPMENT_COSTS[sport][size] || 0), 0);
  }, [sports, size]);

  // Get combined equipment list for selected sports
  const combinedEquipment = useMemo(() => {
    const equipmentMap = new Map<string, number>();
    
    sports.forEach(sport => {
      const sportEquipment = EQUIPMENT_RECOMMENDATIONS[sport][size] || [];
      sportEquipment.forEach(item => {
        equipmentMap.set(item, (equipmentMap.get(item) || 0) + 1);
      });
    });

    return Array.from(equipmentMap.entries()).map(([item, count]) => 
      count > 1 ? `${item} (${count}x)` : item
    );
  }, [sports, size]);

  const toggleSport = (sport: SportKey) => {
    setSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  function createQuickEstimate() {
    // Create project and navigate
    const id = `quick-${Date.now()}`;
    navigate(`/calculator?projectId=${id}&mode=quick`);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Quick Estimates</h2>
            <p className="text-gray-600 text-sm mt-1">Get an instant, editable draft with typical layouts and budgeting—perfect for brainstorming.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1) Choose sports</h3>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {[
                    { key: "baseball_softball", label: "Baseball/Softball", icon: "⚾" },
                    { key: "basketball", label: "Basketball", icon: "🏀" },
                    { key: "volleyball", label: "Volleyball", icon: "🏐" },
                    { key: "pickleball", label: "Pickleball", icon: "🏓" },
                    { key: "soccer", label: "Soccer", icon: "⚽" },
                    { key: "football", label: "Football", icon: "🏈" },
                    { key: "lacrosse", label: "Lacrosse", icon: "🥍" },
                    { key: "tennis", label: "Tennis", icon: "🎾" },
                    { key: "multi_sport", label: "Multi-Sport", icon: "🏟️" },
                    { key: "fitness", label: "Fitness/Training", icon: "💪" }
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => toggleSport(key as SportKey)}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors text-left ${
                        sports.includes(key as SportKey)
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span>{label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">2) Choose a size</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {(["small", "small_plus", "medium", "large", "giant", "arena"] as SizeKey[]).map((sizeKey) => (
                      <button
                        key={sizeKey}
                        onClick={() => setSize(sizeKey)}
                        className={`p-3 text-left rounded-lg border-2 transition-colors ${
                          size === sizeKey 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-medium">{FACILITY_SIZES[sizeKey].sqft}</div>
                        <div className="text-xs opacity-80">{FACILITY_SIZES[sizeKey].description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3) Recommended Equipment</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-3">
                    Based on your {sports.length > 1 ? 'sports' : 'sport'} and size selections:
                  </p>
                  <ul className="space-y-2">
                    {combinedEquipment.map((item, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-3 border-t pt-3">
                    These are typical recommendations. All equipment can be customized in the full calculator.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Budget Preview (Omaha baseline)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Gross SF</span>
                  <div className="font-bold">{preview.grossSF.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">CapEx (est.)</span>
                  <div className="font-bold">${preview.capexTotal.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Monthly OpEx (est.)</span>
                  <div className="font-bold">${preview.opexMonthly.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Revenue (est.)</span>
                  <div className="font-bold">${preview.revenueMonthly.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">EBITDA (est.)</span>
                  <div className="font-bold">${preview.ebitdaMonthly.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Break-even</span>
                  <div className="font-bold">{preview.breakEvenMonths ? `${preview.breakEvenMonths} mo` : "n/a"}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">All inputs are editable later. Figures are planning estimates only.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={createQuickEstimate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            {sports.length > 0 ? "Continue" : "Select sports"} →
          </button>
        </div>
      </div>
    </div>
  );
}