export const FIELD_LABELS = {
  "region_multiplier": "Region multiplier",
  "land_cost": "Land cost",
  "building_cost_per_sf": "Building cost per SF",
  "sitework_pct": "Sitework (%)",
  "ti_cost_per_sf": "TI cost per SF",
  "soft_costs_pct": "Soft costs (%)",
  "contingency_pct": "Contingency (%)",
  "fixtures_allowance": "Fixtures allowance (FF&E)",
  "it_security_allowance": "IT & security allowance",
  "purchase_price": "Purchase price",
  "renovation_cost_per_sf": "Renovation cost per SF",
  "closing_costs_pct": "Closing costs (%)",
  "due_diligence_costs": "Due diligence costs",
  "base_rent_per_sf_year": "Base rent (per SF per year)",
  "nnn_per_sf_year": "NNN (per SF per year)",
  "cam_per_sf_year": "CAM (per SF per year)",
  "free_rent_months": "Free rent (months)",
  "ti_allowance_per_sf": "TI allowance per SF",
  "lease_years": "Lease years",
  "annual_escalation_pct": "Annual escalation (%)",
  "security_deposit_months": "Security deposit (months)",
  "install_factor_pct": "Install factor (%)"
} as const;

export const GLOSSARY_EXTRA = {
  "capex_total": {
    "label": "CapEx (capital expenditures)",
    "short_tip": "Upfront project costs before opening (build/renovate, TI, soft costs, contingency, FF&E, IT, deposits).",
    "long_tip": "CapEx represents one-time investments to get the facility ready to operate. It excludes ongoing operating expenses.",
    "units": "currency (lump sum)",
    "formula": "Sum of all upfront costs by mode + equipment; see Results for breakdown.",
    "category": "Finance",
    "applies_in_modes": ["build","buy","lease","global"],
    "synonyms": ["capital budget","startup costs","initial investment"],
    "related": ["soft_costs_pct","contingency_pct","fixtures_allowance","it_security_allowance","ti_cost_per_sf","renovation_cost_per_sf"]
  },
  "opex_monthly": {
    "label": "OpEx (operating expenses)",
    "short_tip": "Monthly costs to run the business after opening (staff, rent, utilities, insurance, marketing, software, maintenance, debt service).",
    "units": "currency per month",
    "formula": "Staffing + fixed OpEx + lease + debt service",
    "category": "Finance",
    "applies_in_modes": ["build","buy","lease","global"],
    "synonyms": ["operating budget","monthly expenses"],
    "related": ["staffing_monthly","lease_monthly","debt_service_monthly"]
  },
  "ebitda_monthly": {
    "label": "EBITDA (monthly)",
    "short_tip": "Earnings before interest, taxes, depreciation, and amortization.",
    "long_tip": "Useful for comparing operating performance across financing structures.",
    "units": "currency per month",
    "formula": "Revenue monthly − (OpEx monthly − Debt service monthly)",
    "category": "Finance",
    "applies_in_modes": ["global"],
    "synonyms": ["operating cash flow (approx.)"],
    "related": ["revenue_monthly","opex_monthly"]
  },
  "net_income_monthly": {
    "label": "Net income (monthly)",
    "short_tip": "Profit after all monthly expenses, including debt service.",
    "units": "currency per month",
    "formula": "Revenue monthly − OpEx monthly",
    "category": "Finance",
    "applies_in_modes": ["global"],
    "related": ["ebitda_monthly"]
  },
  "break_even_months": {
    "label": "Break-even (months)",
    "short_tip": "Months to recover the upfront investment from monthly margin.",
    "units": "months",
    "formula": "CapEx total ÷ max(Margin monthly, 1)",
    "category": "Finance",
    "applies_in_modes": ["global"],
    "synonyms": ["payback period (simple)"],
    "related": ["capex_total","margin_monthly","payback_months"]
  },
  "roi_pct_year1": {
    "label": "ROI (Year 1)",
    "short_tip": "Return on investment for the first year.",
    "units": "percent (0–100)",
    "formula": "(Annual net income ÷ CapEx total) × 100",
    "category": "Finance",
    "applies_in_modes": ["global"],
    "related": ["net_income_monthly","capex_total"]
  },
  "payback_months": {
    "label": "Payback (months)",
    "short_tip": "Months of EBITDA needed to repay CapEx.",
    "units": "months",
    "formula": "CapEx total ÷ EBITDA monthly",
    "category": "Finance",
    "applies_in_modes": ["global"],
    "related": ["ebitda_monthly","capex_total"]
  },
  "gross_sf": {
    "label": "Gross square footage (Gross SF)",
    "short_tip": "Total planned area including program space plus circulation and admin allowances.",
    "units": "square feet",
    "formula": "TotalProgramSF × (1 + circulation% + admin%)",
    "category": "Operations",
    "applies_in_modes": ["global"],
    "related": ["total_program_sf"]
  },
  "total_program_sf": {
    "label": "Program square footage",
    "short_tip": "Sum of space required by all courts/fields/tunnels before add-ons.",
    "units": "square feet",
    "formula": "Σ (unit_count × per_unit_space_sf)",
    "category": "Operations",
    "applies_in_modes": ["global"],
    "related": ["gross_sf"]
  },
  "utilization_pct": {
    "label": "Utilization (%)",
    "short_tip": "How much of the available capacity you expect to use.",
    "units": "percent (0–100)",
    "formula": "Lessons: coaches × hours × rate × (utilization%/100)",
    "category": "Revenue",
    "applies_in_modes": ["global"],
    "synonyms": ["load factor","occupancy (contextual)"],
    "related": ["fill_rate_pct","seasonality"]
  },
  "fill_rate_pct": {
    "label": "Fill rate (%)",
    "short_tip": "Average percentage of seats or spots sold for an event or camp.",
    "units": "percent (0–100)",
    "category": "Revenue",
    "applies_in_modes": ["global"],
    "related": ["utilization_pct","seasonality"]
  },
  "seasonality": {
    "label": "Seasonality",
    "short_tip": "Month‑to‑month demand changes expressed as a percent index.",
    "units": "array of 12 values (0–100 each)",
    "formula": "Monthly revenue × (seasonality[m]/100)",
    "category": "Revenue",
    "applies_in_modes": ["global"],
    "related": ["revenue_monthly"]
  },
  "ff&e": {
    "label": "FF&E (fixtures, furniture, equipment)",
    "short_tip": "Non‑structural items like lockers, counters, storage, seating.",
    "units": "currency (lump sum or itemized)",
    "category": "Cost",
    "applies_in_modes": ["global"],
    "synonyms": ["fixtures allowance"],
    "related": ["fixtures_allowance","equipment_total"]
  },
  "nnn": {
    "label": "NNN (triple net)",
    "short_tip": "Pass‑through costs: property tax, insurance, common area.",
    "units": "currency per SF per year",
    "category": "Cost",
    "applies_in_modes": ["lease"],
    "synonyms": ["triple net"],
    "related": ["nnn_per_sf_year","cam_per_sf_year","base_rent_per_sf_year"]
  },
  "cam": {
    "label": "CAM (common area maintenance)",
    "short_tip": "Shared area upkeep you pay in addition to base rent.",
    "units": "currency per SF per year",
    "category": "Cost",
    "applies_in_modes": ["lease"],
    "related": ["cam_per_sf_year","nnn_per_sf_year"]
  }
} as const;

export type GlossaryCategory = "Cost" | "Finance" | "Revenue" | "Operations";
export type GlossaryMode = "build" | "buy" | "lease" | "global";

export interface GlossaryEntry {
  field_id: string;
  label: string;
  short_tip: string;
  long_tip?: string;
  units?: string;
  formula?: string;
  applies_in_modes: GlossaryMode[];
  range_hint?: string;
  pitfalls?: string[];
  category: GlossaryCategory;
  synonyms?: string[];
  related?: string[];
  alphaKey: string;
  slug: string;
}