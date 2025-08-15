import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";

// Import the types and functions from QuickEstimatesModal
type BuildMode = "build" | "buy" | "lease";
type SizeKey = "small" | "medium" | "large";
type SportKey =
  | "baseball_softball"
  | "basketball"
  | "volleyball"
  | "pickleball"
  | "soccer_indoor_small_sided"
  | "football"
  | "multi_sport";

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

// Simplified preset function
function getPreset(sport: SportKey, size: SizeKey): QuickPreset {
  // This is a simplified baseball preset
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

// Equipment recommendations based on sport and size (matching wizard format)
const EQUIPMENT_RECOMMENDATIONS: Record<SportKey, Record<SizeKey, string[]>> = {
  baseball_softball: {
    small: ["6 Batting Cages", "3 Pitching Machines", "6 L-Screens", "3 Ball Carts", "4 Divider Curtains", "3,500 SF Turf Area"],
    medium: ["8 Batting Cages", "4 Pitching Machines", "8 L-Screens", "4 Ball Carts", "4 Divider Curtains", "4,200 SF Turf Area"],
    large: ["12 Batting Cages", "6 Pitching Machines", "12 L-Screens", "6 Ball Carts", "4 Divider Curtains", "5,600 SF Turf Area"]
  },
  basketball: {
    small: ["4 Basketball Hoops", "2 Scoreboards", "2,100 SF Hardwood Flooring", "4 Divider Curtains"],
    medium: ["4 Basketball Hoops", "2 Scoreboards", "6,600 SF Hardwood Flooring", "4 Divider Curtains"],
    large: ["6 Basketball Hoops", "3 Scoreboards", "7,800 SF Hardwood Flooring", "4 Divider Curtains"]
  },
  volleyball: {
    small: ["3 Volleyball Systems", "3 Referee Stands", "2 Scoreboards", "1,750 SF Rubber Flooring", "4 Divider Curtains"],
    medium: ["4 Volleyball Systems", "4 Referee Stands", "2 Scoreboards", "5,500 SF Rubber Flooring", "4 Divider Curtains"],
    large: ["5 Volleyball Systems", "5 Referee Stands", "3 Scoreboards", "6,500 SF Rubber Flooring", "4 Divider Curtains"]
  },
  pickleball: {
    small: ["4 Pickleball Nets", "8 Paddle Starter Sets", "1,680 SF Rubber Flooring", "4 Divider Curtains"],
    medium: ["6 Pickleball Nets", "12 Paddle Starter Sets", "5,500 SF Rubber Flooring", "4 Divider Curtains"],
    large: ["8 Pickleball Nets", "16 Paddle Starter Sets", "6,500 SF Rubber Flooring", "4 Divider Curtains"]
  },
  soccer_indoor_small_sided: {
    small: ["2 Soccer Goals (pair)", "3,500 SF Turf Area", "4 Divider Curtains", "1 Training Turf Zone"],
    medium: ["2 Soccer Goals (pair)", "7,700 SF Turf Area", "4 Divider Curtains", "1 Training Turf Zone"],
    large: ["3 Soccer Goals (pair)", "9,100 SF Turf Area", "4 Divider Curtains", "1 Training Turf Zone"]
  },
  football: {
    small: ["3,500 SF Turf Area", "4 Divider Curtains"],
    medium: ["7,700 SF Turf Area", "4 Divider Curtains"],
    large: ["9,100 SF Turf Area", "4 Divider Curtains"]
  },
  multi_sport: {
    small: ["4 Divider Curtains", "3,500 SF Turf Area", "1,750 SF Rubber Flooring", "2 Scoreboards"],
    medium: ["4 Divider Curtains", "7,700 SF Turf Area", "5,500 SF Rubber Flooring", "2 Scoreboards"],
    large: ["4 Divider Curtains", "9,100 SF Turf Area", "6,500 SF Rubber Flooring", "3 Scoreboards"]
  }
};

// Facility size recommendations
const FACILITY_SIZES: Record<SizeKey, { sqft: string; description: string }> = {
  small: { sqft: "8,000-12,000 SF", description: "Compact facility for local community" },
  medium: { sqft: "12,000-18,000 SF", description: "Mid-size facility with expanded programming" },
  large: { sqft: "18,000-30,000 SF", description: "Large facility for competitive programs" }
};

interface QuickEstimatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function QuickEstimatesModal({ isOpen, onClose }: QuickEstimatesModalProps) {
  const [sport, setSport] = useState<SportKey>("baseball_softball");
  const [size, setSize] = useState<SizeKey>("medium");
  const navigate = useNavigate();

  const preset = useMemo(() => getPreset(sport, size), [sport, size]);
  const preview = useMemo(() => estimateQuickNumbers(preset), [preset]);

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
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "baseball_softball", label: "Baseball / Softball" },
                    { key: "basketball", label: "Basketball" },
                    { key: "volleyball", label: "Volleyball" },
                    { key: "pickleball", label: "Pickleball" },
                    { key: "soccer_indoor_small_sided", label: "Indoor Soccer" },
                    { key: "football", label: "Football" },
                    { key: "multi_sport", label: "Multi-sport" }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSport(key as SportKey)}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                        sport === key 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">2) Choose a size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(["small", "medium", "large"] as SizeKey[]).map((sizeKey) => (
                      <button
                        key={sizeKey}
                        onClick={() => setSize(sizeKey)}
                        className={`p-3 text-center rounded-lg border-2 transition-colors ${
                          size === sizeKey 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-medium capitalize">{sizeKey}</div>
                        <div className="text-xs opacity-80">{FACILITY_SIZES[sizeKey].sqft}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3) Recommended Equipment</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-3">Based on your sport and size selections:</p>
                  <ul className="space-y-2">
                    {EQUIPMENT_RECOMMENDATIONS[sport][size].map((item, index) => (
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
                  <span className="text-gray-600">OpEx/month</span>
                  <div className="font-bold">${preview.opexMonthly.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Revenue/month</span>
                  <div className="font-bold">${preview.revenueMonthly.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">EBITDA/month</span>
                  <div className="font-bold">${preview.ebitdaMonthly.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Break-even</span>
                  <div className="font-bold">{preview.breakEvenMonths ? `${preview.breakEvenMonths} mo` : "N/A"}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                All numbers are editable in the full calculator and based on Omaha, NE baseline costs.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={createQuickEstimate} className="bg-blue-600 hover:bg-blue-700">
                Select sports →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuickEstimatesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="secondary" 
        size="lg" 
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
      >
        <Zap className="mr-2 h-5 w-5" />
        Quick Estimates
      </Button>
      <QuickEstimatesModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}