export const TOOLTIP_LIBRARY = {
  "region_multiplier": {
    "short_tip": "Scales costs relative to the Omaha baseline (1.00).",
    "long_tip": "Use >1.00 to increase costs for higher-cost markets and <1.00 to decrease. This factor multiplies construction, TI, equipment, and library items. It does not change rent unless you edit rent inputs.",
    "units": "number (e.g., 1.15 = +15%)",
    "formula": "adjusted_cost = base_cost × region_multiplier",
    "applies_in_modes": ["build", "buy", "lease"],
    "range_hint": "0.85–1.30 (varies by market)",
    "pitfalls": ["Setting 1.15 but also manually inflating every unit cost (double inflation)."]
  },

  "land_cost": {
    "short_tip": "Total price to purchase the land parcel.",
    "long_tip": "One-time amount for the site only. Closing/entitlement costs belong in soft costs or due diligence as appropriate.",
    "units": "currency (lump sum)",
    "formula": "Included in CapEx (Build mode).",
    "applies_in_modes": ["build"],
    "range_hint": "Varies by location",
    "pitfalls": ["Including land cost again in soft costs.", "Entering per‑sf here (use total)."]
  },

  "building_cost_per_sf": {
    "short_tip": "Hard construction cost for shell & core per gross SF.",
    "long_tip": "Structure, slab, roof, exterior envelope. Excludes interior build‑out (TI), sitework, soft costs, contingency.",
    "units": "currency per SF",
    "formula": "building_cost = building_cost_per_sf × gross_sf",
    "applies_in_modes": ["build"],
    "range_hint": "$80-200/SF",
    "pitfalls": ["Adding TI items here (double counts with TI)."]
  },

  "sitework_pct": {
    "short_tip": "Site utilities, grading, paving as % of building cost.",
    "long_tip": "Covers earthwork, utilities, parking, drainage, exterior lighting, landscaping. Applied to the building_cost (not land).",
    "units": "percent (0–100)",
    "formula": "sitework = building_cost × (sitework_pct/100)",
    "applies_in_modes": ["build"],
    "range_hint": "5–20%",
    "pitfalls": ["Applying % to land.", "Entering 0.1 for 10% (use 10)."]
  },

  "ti_cost_per_sf": {
    "short_tip": "Tenant improvement (interior build‑out) cost per gross SF.",
    "long_tip": "Walls, finishes, sports flooring, MEP inside the space, restrooms, reception, lockers. For Lease, landlord TI allowance reduces your out‑of‑pocket TI.",
    "units": "currency per SF",
    "formula": "ti_gross = ti_cost_per_sf × gross_sf; lease: ti_net = max(ti_gross − (ti_allowance_per_sf × gross_sf), 0)",
    "applies_in_modes": ["build", "lease"],
    "pitfalls": ["Also entering the same flooring/HVAC as equipment (double count).", "Using Buy mode with TI instead of renovation_cost_per_sf."]
  },

  "soft_costs_pct": {
    "short_tip": "Professional fees, permits, testing, legal, lender/admin as a % of construction scope.",
    "long_tip": "Design/engineering, permits, surveys, geotech, inspections, legal, lender fees, project admin. Basis depends on mode: Build → (building_cost + TI). Lease → TI_net. Buy → renovation.",
    "units": "percent (0–100)",
    "formula": "build: soft_costs = (building_cost + ti) × (soft_costs_pct/100); lease: soft_costs = ti_net × (soft_costs_pct/100); buy: soft_costs = reno × (soft_costs_pct/100)",
    "applies_in_modes": ["build", "buy", "lease"],
    "range_hint": "8–20%",
    "pitfalls": ["Applying to land or purchase price.", "Entering 0.1 instead of 10."]
  },

  "contingency_pct": {
    "short_tip": "Reserve for unknowns/overruns as a % of the construction subtotal.",
    "long_tip": "Applied to: Build → (building_cost + TI + soft_costs); Lease → (ti_net + soft_costs + deposits_fees); Buy → (reno + soft_costs).",
    "units": "percent (0–100)",
    "formula": "contingency = basis × (contingency_pct/100)",
    "applies_in_modes": ["build", "buy", "lease"],
    "range_hint": "5–15%",
    "pitfalls": ["Applying to equipment twice (if equipment already has install factor)."]
  },

  "fixtures_allowance": {
    "short_tip": "FF&E allowance (non‑sport fixtures, millwork, lockers).",
    "long_tip": "Use for furnishings and built‑ins not captured as equipment. One-time lump sum.",
    "units": "currency (lump sum)",
    "formula": "Added to CapEx in all modes.",
    "applies_in_modes": ["build", "buy", "lease"],
    "range_hint": "Varies by facility size",
    "pitfalls": []
  },

  "it_security_allowance": {
    "short_tip": "Low‑voltage, cameras, access control, networking, POS hardware.",
    "long_tip": "One-time setup costs. Software subscriptions belong in OpEx.",
    "units": "currency (lump sum)",
    "formula": "Added to CapEx in all modes.",
    "applies_in_modes": ["build", "buy", "lease"],
    "range_hint": "Varies by facility complexity",
    "pitfalls": []
  },

  "purchase_price": {
    "short_tip": "Contract price to buy the existing building/site.",
    "long_tip": "Base acquisition amount; renovations and closing costs are entered separately.",
    "units": "currency (lump sum)",
    "formula": "Included in CapEx (Buy mode).",
    "applies_in_modes": ["buy"],
    "pitfalls": ["Also putting this into renovation or soft costs."]
  },

  "renovation_cost_per_sf": {
    "short_tip": "Renovation cost per gross SF to adapt the building.",
    "long_tip": "Interior/exterior upgrades to meet your program (e.g., nets, boards, finishes). Use this in Buy mode instead of TI per SF.",
    "units": "currency per SF",
    "formula": "reno = renovation_cost_per_sf × gross_sf",
    "applies_in_modes": ["buy"],
    "pitfalls": ["Using both renovation and TI in Buy mode (double count)."]
  },

  "closing_costs_pct": {
    "short_tip": "Transaction costs as % of purchase price.",
    "long_tip": "Title, escrow, recording, transfer taxes, lender origination. Applied only to purchase_price.",
    "units": "percent (0–100)",
    "formula": "closing_costs = purchase_price × (closing_costs_pct/100)",
    "applies_in_modes": ["buy"]
  },

  "due_diligence_costs": {
    "short_tip": "Third‑party reports and studies.",
    "long_tip": "Environmental (Phase I), appraisal, surveys, structural reports. Lump sum.",
    "units": "currency (lump sum)",
    "formula": "Added to CapEx (Buy mode).",
    "applies_in_modes": ["buy"]
  },

  "base_rent_per_sf_year": {
    "short_tip": "Annual base rent per SF.",
    "long_tip": "Your contracted rent rate excluding pass‑throughs. $12/yr ≈ $1/SF/mo.",
    "units": "currency per SF per year",
    "formula": "monthly_base_rent = (base_rent_per_sf_year/12) × gross_sf",
    "applies_in_modes": ["lease"],
    "pitfalls": ["Entering monthly rate here (this field is annual)."]
  },

  "nnn_per_sf_year": {
    "short_tip": "Triple‑net charges per SF per year.",
    "long_tip": "Estimated pass‑through for taxes, insurance, common area. Added to base rent.",
    "units": "currency per SF per year",
    "formula": "monthly_nnn = (nnn_per_sf_year/12) × gross_sf",
    "applies_in_modes": ["lease"]
  },

  "cam_per_sf_year": {
    "short_tip": "Common area maintenance per SF per year (if separate).",
    "long_tip": "If CAM is included in NNN, set this to 0.",
    "units": "currency per SF per year",
    "formula": "monthly_cam = (cam_per_sf_year/12) × gross_sf",
    "applies_in_modes": ["lease"]
  },

  "free_rent_months": {
    "short_tip": "Number of months with rent abated.",
    "long_tip": "Calculator assumes full gross relief (base + NNN + CAM) during free months. If only base is abated, lower NNN/CAM accordingly for those months (advanced).",
    "units": "months (integer)",
    "formula": "free_rent_credit = monthly_rent_gross × free_rent_months",
    "applies_in_modes": ["lease"],
    "pitfalls": ["Entering 0.5 for half a month (use whole months)."]
  },

  "ti_allowance_per_sf": {
    "short_tip": "Landlord cash/credit toward your TI per SF.",
    "long_tip": "Reduces your out‑of‑pocket TI spend. We subtract this from TI gross.",
    "units": "currency per SF",
    "formula": "ti_allowance = ti_allowance_per_sf × gross_sf",
    "applies_in_modes": ["lease"],
    "pitfalls": ["Entering total dollars instead of per‑SF here."]
  },

  "lease_years": {
    "short_tip": "Initial lease term length in years.",
    "long_tip": "Used for multi‑year projections and escalation (if enabled).",
    "units": "years (integer)",
    "applies_in_modes": ["lease"]
  },

  "annual_escalation_pct": {
    "short_tip": "Year‑over‑year increase in base rent.",
    "long_tip": "Applies to base rent in out‑years (not to NNN/CAM unless you model it).",
    "units": "percent (0–100)",
    "applies_in_modes": ["lease"],
    "pitfalls": ["Using decimals (enter 3, not 0.03)."]
  },

  "security_deposit_months": {
    "short_tip": "Months of base rent held as deposit.",
    "long_tip": "Counted as upfront cash in CapEx (Lease mode).",
    "units": "months (integer)",
    "formula": "deposits_fees = security_deposit_months × monthly_base_rent",
    "applies_in_modes": ["lease"]
  },

  "install_factor_pct": {
    "short_tip": "Installer labor, freight, small parts as % of equipment unit cost.",
    "long_tip": "Applied on each equipment item. Use 0 when the unit cost you entered already includes installation.",
    "units": "percent (0–100)",
    "formula": "item_total = qty × unit_cost × (1 + install_factor_pct/100)",
    "applies_in_modes": ["build", "buy", "lease"],
    "range_hint": "5–20%",
    "pitfalls": ["Adding both here and again in contingency for the same scope."]
  }
} as const;

export type TooltipKey = keyof typeof TOOLTIP_LIBRARY;