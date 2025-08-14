import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SportIcon, SPORT_LABELS, SportKey } from "./SportIcons";
import { LayoutGallery } from "@/components/layout/LayoutGallery";
import { TopViewLayout } from "@/components/layout/TopViewLayout";

/** ---- Typical shells & counts by sport+size (editable) ---- */
type SizeKey = "small" | "medium" | "large";
const SIZE_LABELS: Record<SizeKey, string> = { small: "Small", medium: "Medium", large: "Large" };

// Recommended shell area (Gross SF) by sport & size (Omaha baseline)
const SHELL_SF: Record<SportKey, Record<SizeKey, number>> = {
  baseball_softball: { small: 10000, medium: 16000, large: 24000 },
  basketball:        { small: 12000, medium: 24000, large: 36000 },
  volleyball:        { small: 12000, medium: 20000, large: 30000 },
  pickleball:        { small: 12000, medium: 20000, large: 28000 },
  soccer_indoor_small_sided: { small: 18000, medium: 36000, large: 54000 },
  multi_sport:       { small: 18000, medium: 26000, large: 36000 }
};

// Recommended unit counts by sport & size
const UNIT_COUNTS: Record<SportKey, Record<SizeKey, Partial<Record<string, number>>>> = {
  baseball_softball: {
    small:  { baseball_tunnels: 6 },
    medium: { baseball_tunnels: 8 },
    large:  { baseball_tunnels: 12 }
  },
  basketball: {
    small:  { basketball_courts_full: 1 },
    medium: { basketball_courts_full: 2 },
    large:  { basketball_courts_full: 3 }
  },
  volleyball: {
    small:  { volleyball_courts: 3 },
    medium: { volleyball_courts: 4 },
    large:  { volleyball_courts: 6 }
  },
  pickleball: {
    small:  { pickleball_courts: 4 },
    medium: { pickleball_courts: 6 },
    large:  { pickleball_courts: 8 }
  },
  soccer_indoor_small_sided: {
    small:  { soccer_field_small: 1 },
    medium: { soccer_field_small: 2 },
    large:  { soccer_field_small: 3 }
  },
  multi_sport: {
    small:  { training_turf_zone: 1, pickleball_courts: 4 },
    medium: { training_turf_zone: 1, volleyball_courts: 2, pickleball_courts: 4 },
    large:  { training_turf_zone: 1, volleyball_courts: 2, pickleball_courts: 6 }
  }
};

type Selection = { sports: SportKey[]; size?: SizeKey; };

interface VisualDesignerHomeProps {
  onLayoutSelected?: (layoutData: any) => void;
  onShowLayoutSelector?: () => void;
  selectedLayoutId?: string;
  initialData?: any;
}

export default function VisualDesignerHome({ 
  onLayoutSelected, 
  onShowLayoutSelector, 
  selectedLayoutId,
  initialData 
}: VisualDesignerHomeProps = {}) {
  const [sel, setSel] = useState<Selection>({ 
    sports: initialData?.selectedSports || [], 
    size: initialData?.size || undefined 
  });
  const [step, setStep] = useState<0|1|2>(initialData?.selectedSports?.length > 0 ? 1 : 0);
  const navigate = useNavigate();

  const canContinue = sel.sports.length > 0;

  // If multiple sports: choose a shell based on "multi_sport" unless soccer is included (soccer drives shell)
  const shellSf = useMemo(() => {
    if (!sel.size || sel.sports.length === 0) return 0;
    const hasSoccer = sel.sports.includes("soccer_indoor_small_sided");
    if (sel.sports.length === 1) {
      const sport = sel.sports[0];
      return SHELL_SF[sport]?.[sel.size] || 16000; // fallback
    }
    if (hasSoccer) return SHELL_SF.soccer_indoor_small_sided?.[sel.size] || 36000;
    return SHELL_SF.multi_sport?.[sel.size] || 26000;
  }, [sel]);

  // Aggregate counts for multi-select (map to LayoutGallery expected keys)
  const counts = useMemo(() => {
    if (!sel.size || sel.sports.length === 0) return {};
    const bundle: Record<string, number> = {};
    for (const s of sel.sports) {
      const sportCounts = UNIT_COUNTS[s];
      if (!sportCounts) continue; // skip if sport not found
      const add = sportCounts[sel.size] || {};
      for (const [k, v] of Object.entries(add)) {
        // Map to keys expected by LayoutGallery
        const mappedKey = k === "baseball_tunnels" ? "baseball_tunnels" : k;
        bundle[mappedKey] = (bundle[mappedKey] ?? 0) + (v ?? 0);
      }
    }
    return bundle;
  }, [sel]);

  function toggleSport(s: SportKey) {
    setSel((prev) => {
      const has = prev.sports.includes(s);
      const sports = has ? prev.sports.filter(x => x !== s) : [...prev.sports, s];
      return { ...prev, sports };
    });
  }

  return (
    <section className="visual">
      {/* Step 0 — Sport tiles */}
      <header className="v-head">
        <h2>Design visually (optional)</h2>
        <p>Pick your sport(s), then choose a size to preview example layouts.</p>
      </header>

      <div className="tiles" role="listbox" aria-label="Choose sports">
        {(Object.keys(SPORT_LABELS) as SportKey[]).map((k) => (
          <button
            key={k}
            role="option"
            aria-selected={sel.sports.includes(k)}
            className={`tile ${sel.sports.includes(k) ? "on" : ""}`}
            onClick={() => toggleSport(k)}
          >
            <SportIcon kind={k} size={56} />
            <div className="t-label">{SPORT_LABELS[k]}</div>
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="secondary" disabled={!canContinue} onClick={() => { setStep(1); if (!sel.size) setSel(s => ({...s, size: "medium"})); }} aria-disabled={!canContinue}>
          Continue → Choose size
        </button>
      </div>

      {/* Step 1 — Size chips & shell preview */}
      {step >= 1 && sel.size && (
        <div className="sizes-wrap">
          <h3>Pick a typical size</h3>
          <div className="size-chips" role="tablist" aria-label="Size options">
            {(["small","medium","large"] as SizeKey[]).map(s => (
              <button key={s} role="tab" aria-selected={sel.size===s}
                className={`chip ${sel.size===s?"on":""}`} onClick={()=>setSel({...sel, size:s})}>
                {SIZE_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="shell-preview">
            <TopViewLayout
              title="Typical building shell"
              grossSf={shellSf || 16000}
              aspectRatio={2.0}
              units={[]} // just the shell here
              adminBlocks={[{label:"Lobby", w:40, h:25, anchor:"front-left"}]}
              viewWidthPx={560}
              buildingLabel={`${Math.round(shellSf||0).toLocaleString()} sf`}
            />
          </div>

          <div className="actions">
            <button className="secondary" onClick={() => setStep(2)}>Show layout examples</button>
          </div>
        </div>
      )}

      {/* Step 2 — Layout examples for the chosen counts */}
      {step >= 2 && sel.size && (
        <div className="layouts">
          <h3>Example top‑view layouts</h3>
          <LayoutGallery
            grossSf={shellSf || 16000}
            counts={counts}
            selectedId={selectedLayoutId}
            onChoose={(choice) => {
              console.log("Layout choice clicked:", choice);
              console.log("Current selection:", sel);
              console.log("Counts:", counts);
              
              if (sel.size && onLayoutSelected) {
                // Create layout data for the calculator
                const layoutData = {
                  selectedSports: sel.sports,
                  size: sel.size,
                  layoutChoice: choice,
                  grossSf: shellSf || 16000,
                  counts,
                  // Map to calculator format
                  facilityType: "lease",
                  clearHeight: "24",
                  totalSquareFootage: (shellSf || 16000).toString(),
                  numberOfCourts: counts.basketball_courts_full || counts.volleyball_courts || counts.pickleball_courts || '',
                  numberOfFields: counts.soccer_field_small || '',
                  numberOfCages: counts.baseball_tunnels || '',
                  amenities: ["lobby", "storage"]
                };
                
                onLayoutSelected(layoutData);
              } else if (sel.size) {
                // Fallback to navigation for standalone use
                try {
                  const id = createQuickDraftFromVisual({ ...sel, size: sel.size }, shellSf || 16000, counts, choice.id);
                  console.log("Created draft with ID:", id);
                  navigate(`/calculator?projectId=${id}&mode=visual`);
                } catch (error) {
                  console.error("Error creating draft:", error);
                }
              } else {
                console.error("No size selected");
              }
            }}
          />
        </div>
      )}

      {/* Back to Layout Button */}
      {onShowLayoutSelector && (
        <div className="actions">
          <button className="back-to-layout" onClick={onShowLayoutSelector}>
            ← Back to Layout Selection
          </button>
        </div>
      )}

      <style>{`
        .visual { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .v-head h2 { margin: 0 0 6px; }
        .v-head p { margin: 0 0 12px; color: #6B7280; }
        .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
        .tile {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          border: 1px solid #D1D5DB; background: #FFFFFF; border-radius: 12px; padding: 14px; cursor: pointer;
        }
        .tile.on { outline: 3px solid #0B63E5; border-color: #0B63E5; }
        .t-label { font-weight: 600; text-align: center; }
        .actions { display: flex; justify-content: flex-end; margin-top: 10px; }
        .secondary {
          background: #0B63E5; color: #fff; border: none; padding: 10px 14px; border-radius: 8px; font-weight: 700; cursor: pointer;
        }
        .secondary:disabled { background: #D1D5DB; color: #6B7280; cursor: not-allowed; }
        .sizes-wrap { margin-top: 14px; }
        .size-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0 12px; }
        .chip { border: 1px solid #D1D5DB; background: #fff; padding: 6px 10px; border-radius: 999px; cursor: pointer; }
        .chip.on { background: #00A66A; color: #fff; border-color: #00A66A; }
        .shell-preview { margin: 8px 0 12px; }
        .layouts { margin-top: 12px; }
        .back-to-layout { 
          background: #E5E7EB; color: #374151; border: none; padding: 10px 14px; 
          border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 16px; 
        }
        .back-to-layout:hover { background: #D1D5DB; }
      `}</style>
    </section>
  );
}

/** ---- Draft creation (localStorage) — mirror your Quick Estimates saveDraftProject ---- */
function createQuickDraftFromVisual(
  sel: { sports: SportKey[]; size: SizeKey },
  shellSf: number,
  counts: Record<string, number>,
  layoutChoiceId: string
) {
  const id = `visual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const facility_plan = {
    build_mode: "lease" as const,
    clear_height_ft: 24,
    admin_pct_addon: 12,
    circulation_pct_addon: 20,
    total_sqft: shellSf,
    court_or_cage_counts: counts,
    amenities: { lobby: true, storage: true },
    layout_choice: layoutChoiceId
  };

  const capex_inputs = {
    soft_costs_pct: 10,
    contingency_pct: 10,
    fixtures_allowance: 20000,
    it_security_allowance: 15000,
    ti_cost_per_sf: 18
  };

  const lease_terms = {
    base_rent_per_sf_year: 12,
    nnn_per_sf_year: 3,
    cam_per_sf_year: 1.5,
    free_rent_months: 2,
    ti_allowance_per_sf: 8,
    lease_years: 7,
    annual_escalation_pct: 3,
    security_deposit_months: 2
  };

  const opex_inputs = {
    staffing: [
      { role: "GM", ftes: 1, loaded_wage_per_hr: 35 },
      { role: "Operations Lead", ftes: 1, loaded_wage_per_hr: 28 },
      { role: "Coaches/Instructors", ftes: 3, loaded_wage_per_hr: 25 },
      { role: "Front Desk", ftes: 1.25, loaded_wage_per_hr: 20 }
    ],
    utilities_monthly: 2500, insurance_monthly: 1200, property_tax_monthly: 1500,
    maintenance_monthly: 800, marketing_monthly: 1000, software_monthly: 350,
    janitorial_monthly: 600, other_monthly: 500
  };

  const revenue_programs = {
    memberships: [{ name: "Individual", price_month: 59, members: 300 }, { name: "Family", price_month: 99, members: 120 }],
    rentals: deriveRentalsFromCounts(counts),
    lessons: [{ coach_count: 3, avg_rate_per_hr: 70, hours_per_coach_week: 15, utilization_pct: 70 }],
    camps_clinics: [{ sessions_per_year: 12, avg_price: 219, capacity: 30, fill_rate_pct: 70 }],
    leagues_tournaments: [{ events_per_year: 8, teams_per_event: 12, avg_team_fee: 450, net_margin_pct: 40 }],
    parties_events: [{ events_per_month: 6, avg_net: 240 }],
    sponsorships: [{ annual_sponsorships: 8000 }],
    seasonality: [80,85,90,95,100,110,120,115,105,95,90,85]
  };

  const draft = {
    id,
    currency: "USD" as const,
    location_city: "Omaha",
    location_state_province: "NE",
    location_country: "United States",
    region_multiplier: 1.0,
    scenario_name: `${sel.sports.map(s=>SPORT_LABELS[s]).join(" + ")} — ${sel.size[0].toUpperCase()+sel.size.slice(1)} (Visual)`,
    status: "draft" as const,
    facility_plan,
    capex_inputs,
    lease_terms,
    opex_inputs,
    revenue_programs,
    financing: { equity_pct: 0, debt_pct: 0, loan_amount: 0, interest_rate_pct: 0, amortization_years: 0 },
    selectedSports: sel.sports.map(s => SPORT_LABELS[s])
  };

  localStorage.setItem(`ps:project:${id}`, JSON.stringify(draft));
  return id;
}

function deriveRentalsFromCounts(counts: Record<string, number>) {
  const rentals: any[] = [];
  if (counts.baseball_tunnels) rentals.push({ unit: "batting_tunnel", rate_per_hr: 45, util_hours_per_week: 40 });
  if (counts.basketball_courts_full) rentals.push({ unit: "basketball_court_full", rate_per_hr: 95, util_hours_per_week: 45 });
  if (counts.volleyball_courts) rentals.push({ unit: "volleyball_court", rate_per_hr: 45, util_hours_per_week: 45 });
  if (counts.pickleball_courts) rentals.push({ unit: "pickleball_court", rate_per_hr: 35, util_hours_per_week: 48 });
  if (counts.training_turf_zone) rentals.push({ unit: "training_turf_zone", rate_per_hr: 120, util_hours_per_week: 30 });
  if (counts.soccer_field_small) rentals.push({ unit: "soccer_field_small", rate_per_hr: 140, util_hours_per_week: 50 });
  return rentals;
}