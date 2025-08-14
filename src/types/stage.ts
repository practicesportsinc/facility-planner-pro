export type StageCode = 
  | "concept" 
  | "feasibility" 
  | "site_search" 
  | "plan_permits" 
  | "financing" 
  | "outfitting" 
  | "expansion";

export type FinancingMode = "seeking" | "secured";
export type ExpansionMode = "onsite" | "new_site";

export interface StageDetail {
  financing_mode?: FinancingMode;
  expansion_mode?: ExpansionMode;
}

export interface StageSignals {
  target_open_bucket?: "<6" | "6-12" | "12-18" | ">18" | "tbd";
  rough_sf?: number;
  budget_confidence?: "low" | "medium" | "high";
  site_status?: "browsing" | "shortlist" | "loi" | "under_contract";
  build_type?: "lease_ti" | "buy_reno" | "ground_up";
  ceiling_height_ft?: number;
  plan_status?: "draft" | "near_final";
  permit_status?: "none" | "preapp" | "submitted" | "approved";
  parking_risk?: "unknown" | "none" | "potential";
  capital_target_usd?: number;
  capital_secured_usd?: number;
  capital_structure?: "debt" | "equity" | "both" | "n/a";
  quote_categories?: string[];
  install_window?: "<3" | "3-6" | ">6";
  outreach_pref?: "supplier_outreach" | "self_research";
  current_facility_sf?: number;
  expansion_goal?: string[];
}

export interface StageData {
  stage_code: StageCode;
  stage_detail: StageDetail;
  signals: StageSignals;
}

export const STAGE_CONFIG = {
  concept: {
    label: "Concept",
    help: "Early ideas—start with visual layouts and quick budgets."
  },
  feasibility: {
    label: "Feasibility", 
    help: "Dial in square footage, programs, and a first-pass budget."
  },
  site_search: {
    label: "Site search",
    help: "Compare rent vs. reno vs. build; check clear height and TI."
  },
  plan_permits: {
    label: "Plan & permits",
    help: "Finalize plan; export pro forma and code/parking notes."
  },
  financing: {
    label: "Financing",
    help: "Model capital and monthly payments.",
    hasToggle: true,
    toggleOptions: ["Seeking", "Secured"]
  },
  outfitting: {
    label: "Outfitting",
    help: "Get quotes for floors, nets, hoops, lighting, HVAC, etc."
  },
  expansion: {
    label: "Expansion", 
    help: "Grow your current operation.",
    hasToggle: true,
    toggleOptions: ["Onsite", "New site"]
  }
} as const;