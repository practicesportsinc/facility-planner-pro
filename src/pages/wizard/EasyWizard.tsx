import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import EasyStartSports from "@/components/wizard/easy/EasyStartSports";
import FacilitySizeSelector from "@/components/wizard/easy/FacilitySizeSelector";
import ProductQuantities from "@/components/wizard/easy/ProductQuantities";
import EasyContext from "@/components/wizard/easy/EasyContext";
import EasyResults from "@/components/wizard/easy/EasyResults";

const EasyWizard = () => {
  return (
    <Layout showWizardNav={true}>
      <Routes>
      <Route index element={<Navigate to="/wizard/easy/start" replace />} />
      <Route path="/start" element={
        <EasyStartSports
          title="What are you building?"
          subtitle="Pick one or more sports. You can change these later."
          multi={true}
          options={[
            { key: "baseball_softball", label: "Baseball / Softball", icon: "bat", color: "#00A66A" },
            { key: "basketball", label: "Basketball", icon: "basketball", color: "#0B63E5" },
            { key: "volleyball", label: "Volleyball", icon: "volleyball", color: "#F5A623" },
            { key: "pickleball", label: "Pickleball", icon: "tennis", color: "#F8E71C" },
            { key: "soccer_indoor", label: "Indoor Soccer", icon: "soccer", color: "#65A30D" },
            { key: "football", label: "Football", icon: "football", color: "#8B4513" },
            { key: "lacrosse", label: "Lacrosse", icon: "lacrosse", color: "#FF6B35" },
            { key: "tennis", label: "Tennis", icon: "tennis", color: "#006400" },
            { key: "multi_sport_turf", label: "Multi‑sport", icon: "grid", color: "#111111" }
          ]}
          primaryCta={{ label: "Next: Choose Size →", route: "/wizard/easy/size" }}
        />
      } />
      
      <Route path="/size" element={
        <FacilitySizeSelector
          title="What size facility are you considering?"
          subtitle="Pick a footprint. Hover or tap hotspots to see what fits."
          sizeOptions={[
            {
              key: "small",
              name: "Small",
              dimensions: "50' × 80'",
              sqft: 4000,
              img: "/assets/layouts/small_layout.png",
              description: "Two batting cages with a viewing strip, lobby and office.",
              preload: {
                shell_dims_ft: [50, 80],
                total_sqft: 4000,
                court_or_cage_counts: { baseball_tunnels: 2 }
              },
              hotspots: [
                { id: "sm-cage1", rectPct: { x: 12, y: 58, w: 22, h: 18 }, label: "Batting cage", tooltip: "70'×15' tunnel" },
                { id: "sm-cage2", rectPct: { x: 40, y: 58, w: 22, h: 18 }, label: "Batting cage", tooltip: "70'×15' tunnel" },
                { id: "sm-view", rectPct: { x: 0, y: 0, w: 100, h: 12 }, label: "Viewing area", tooltip: "Lobby + office along the front" }
              ]
            },
            {
              key: "small_plus",
              name: "Small+",
              dimensions: "100' × 70'",
              sqft: 7000,
              img: "/assets/layouts/small_plus_layout.png",
              description: "One basketball court plus one batting cage and viewing strip.",
              preload: {
                shell_dims_ft: [100, 70],
                total_sqft: 7000,
                court_or_cage_counts: { basketball_courts_full: 1, baseball_tunnels: 1 }
              }
            },
            {
              key: "medium",
              name: "Medium",
              dimensions: "100' × 100'",
              sqft: 10000,
              img: "/assets/layouts/medium_layout.png",
              description: "One basketball court centered with two batting cages.",
              preload: {
                shell_dims_ft: [100, 100],
                total_sqft: 10000,
                court_or_cage_counts: { basketball_courts_full: 1, baseball_tunnels: 2 }
              }
            },
            {
              key: "large",
              name: "Large",
              dimensions: "150' × 120'",
              sqft: 18000,
              img: "/assets/layouts/large_layout.png",
              description: "Two basketball courts with four batting cages.",
              preload: {
                shell_dims_ft: [150, 120],
                total_sqft: 18000,
                court_or_cage_counts: { basketball_courts_full: 2, baseball_tunnels: 4 }
              }
            },
            {
              key: "giant",
              name: "Giant",
              dimensions: "200' × 150'",
              sqft: 30000,
              img: "/assets/layouts/giant_layout.png",
              description: "Three basketball courts, four volleyball courts, six batting cages.",
              preload: {
                shell_dims_ft: [200, 150],
                total_sqft: 30000,
                court_or_cage_counts: { basketball_courts_full: 3, volleyball_courts: 4, baseball_tunnels: 6 }
              }
            },
            {
              key: "arena",
              name: "Arena",
              dimensions: "250' × 200'",
              sqft: 50000,
              img: "/assets/layouts/arena_layout.png",
              description: "Four basketball, eight volleyball, eight cages, four pickleball.",
              preload: {
                shell_dims_ft: [250, 200],
                total_sqft: 50000,
                court_or_cage_counts: { basketball_courts_full: 4, volleyball_courts: 8, baseball_tunnels: 8, pickleball_courts: 4 }
              }
            }
          ]}
          primaryCta={{ label: "Next: Typical Equipment →", route: "/wizard/easy/products" }}
        />
      } />
      
      <Route path="/products" element={
        <ProductQuantities
          title="Typical equipment for your sports"
          subtitle="We've pre‑selected items and quantities. Adjust; you can refine costs later."
          catalog={[
            { key: "batting_cages", label: "Batting Cages (70'×15')", unit: "ea", min: 0, max: 24 },
            { key: "pitching_machines", label: "Pitching Machines", unit: "ea", min: 0, max: 12 },
            { key: "l_screens", label: "L‑Screens / Protective", unit: "ea", min: 0, max: 24 },
            { key: "ball_carts", label: "Ball Carts / Buckets", unit: "ea", min: 0, max: 24 },
            { key: "volleyball_systems", label: "Volleyball Systems", unit: "ea", min: 0, max: 12 },
            { key: "ref_stands", label: "Referee Stands", unit: "ea", min: 0, max: 12 },
            { key: "basketball_hoops", label: "Basketball Hoops/Goals", unit: "ea", min: 0, max: 12 },
            { key: "scoreboards", label: "Scoreboards / Shot Clocks (set)", unit: "ea", min: 0, max: 8 },
            { key: "pickleball_nets", label: "Pickleball Nets", unit: "ea", min: 0, max: 16 },
            { key: "paddle_starter_sets", label: "Pickleball Starter Sets", unit: "ea", min: 0, max: 24 },
            { key: "soccer_goals_pair", label: "Indoor Soccer Goals (pair)", unit: "ea", min: 0, max: 6 },
            { key: "training_turf_zone", label: "Training Turf Zones", unit: "ea", min: 0, max: 4 },
            { key: "turf_area_sf", label: "Indoor Turf (area)", unit: "sf", min: 0 },
            { key: "rubber_floor_area_sf", label: "Rubber Flooring (area)", unit: "sf", min: 0 },
            { key: "hardwood_floor_area_sf", label: "Hardwood Flooring (area)", unit: "sf", min: 0 },
            { key: "divider_curtains", label: "Divider Curtains/Nets", unit: "ea", min: 0, max: 16 }
          ]}
          primaryCta={{ label: "Next: Location & Timeline →", route: "/wizard/easy/context" }}
        />
      } />
      
      <Route path="/context" element={
        <EasyContext
          title="Where & when do you plan to open?"
          subtitle="We'll use this to fine‑tune your budget."
          fields={[
            { key: "city", label: "City", type: "text", default: "Omaha" },
            { key: "state", label: "State", type: "text", default: "NE" },
            { key: "country", label: "Country", type: "text", default: "United States" },
            { key: "timeline", label: "Target open date", type: "chips", options: ["<6 mo", "6–12", "12–18", ">18", "TBD"] },
            { key: "stage_code", label: "Stage", type: "chips", options: ["concept", "feasibility", "site_search", "plan_permits", "financing", "outfitting", "expansion"] }
          ]}
          primaryCta={{ label: "Show My Results →", route: "/wizard/easy/results" }}
        />
      } />
      
      <Route path="/results" element={
        <EasyResults
          title="Your preliminary plan"
          subtitle="Based on your selections. Refine in Pro Mode for precise projections."
          kpiCards={[
            { key: "capex_total", label: "CapEx (est.)", fmt: "$" },
            { key: "monthly_revenue", label: "Monthly Revenue", fmt: "$" },
            { key: "monthly_opex", label: "Monthly OpEx", fmt: "$" },
            { key: "monthly_ebitda", label: "Monthly EBITDA", fmt: "$" },
            { key: "break_even_months", label: "Break‑even", fmt: "mo" },
            { key: "gross_sf", label: "Gross SF", fmt: "num" }
          ]}
          showTopView={true}
          showCharts={true}
          buttons={[
            { kind: "primary", label: "Generate Business Plan (PDF)", action: "fetch", url: "/api/plan/generate", method: "POST", bodyFrom: "project", download: "PracticeSports_BusinessPlan.pdf" },
            { kind: "secondary", label: "Customize in Pro Mode", route: "/wizard/pro" },
            { kind: "ghost", label: "Save / Download Report", action: "emit" }
          ]}
          leadGate={{
            trigger: "onLoadDelay",
            delayMs: 1200,
            title: "Send this to your inbox + unlock pro features",
            fields: [
              { key: "name", label: "Full name", required: true },
              { key: "email", label: "Email", required: true },
              { key: "phone", label: "Phone (optional)" },
              { key: "city", label: "City", defaultFrom: "location.city" },
              { key: "state", label: "State", defaultFrom: "location.state" },
              { key: "outreach", label: "Supplier outreach", type: "toggle", options: ["supplier_outreach", "self_research"], default: "supplier_outreach" }
            ],
            primaryCta: { label: "Email me this plan" },
            secondaryCta: { label: "No thanks, keep exploring" },
            webhook: {
              url: "/api/leads/monday",
              method: "POST",
              payload: {
                name: "{{lead.name}}",
                email: "{{lead.email}}",
                phone: "{{lead.phone}}",
                city: "{{lead.city}}",
                state: "{{lead.state}}",
                outreach_pref: "{{lead.outreach}}",
                projectId: "{{project.id}}",
                stage_code: "{{wizard.stage_code}}",
                selected_sports: "{{wizard.selected_sports}}",
                total_sqft: "{{facility_plan.total_sqft}}"
              }
            }
          }}
        />
      } />
      </Routes>
    </Layout>
  );
};

export default EasyWizard;