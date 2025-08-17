import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface KpiCard {
  key: string;
  label: string;
  fmt: "$" | "mo" | "num";
}

interface EasyResultsProps {
  title: string;
  subtitle: string;
  kpiCards: KpiCard[];
  showTopView: boolean;
  showCharts: boolean;
  buttons: Array<{
    kind: "primary" | "secondary" | "ghost";
    label: string;
    action?: string;
    route?: string;
    url?: string;
    method?: string;
    bodyFrom?: string;
    download?: string;
  }>;
  leadGate: {
    trigger: string;
    delayMs: number;
    title: string;
    fields: Array<{
      key: string;
      label: string;
      required?: boolean;
      type?: string;
      options?: string[];
      default?: string;
      defaultFrom?: string;
    }>;
    primaryCta: { label: string };
    secondaryCta: { label: string };
    webhook: {
      url: string;
      method: string;
      payload: Record<string, string>;
    };
  };
}

export const EasyResults = ({
  title,
  subtitle,
  kpiCards,
  buttons,
  leadGate,
}: EasyResultsProps) => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<Record<string, number>>({});
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [leadData, setLeadData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Calculate KPIs from wizard data
    const calculateKpis = () => {
      const facilityData = JSON.parse(localStorage.getItem('wizard-facility-size') || '{}');
      const estimateData = JSON.parse(localStorage.getItem('wizard-estimate') || '{"inputs":{}}');
      
      const sf = facilityData.total_sqft || 0;
      const counts = facilityData.court_or_cage_counts || {};
      const products = estimateData.inputs.selected_products || [];
      const quantities = estimateData.inputs.quantities || {};
      
      // Enhanced calculations based on selected products and facility
      const tiCostPerSf = 45; // $45/sf for tenant improvements
      const ti = tiCostPerSf * sf;
      const soft = ti * 0.15; // 15% soft costs
      const cont = (ti + soft) * 0.10; // 10% contingency
      
      // Calculate fixtures cost based on selected products
      let fixtures = 0;
      if (quantities.batting_cages) fixtures += quantities.batting_cages * 8000;
      if (quantities.pitching_machines) fixtures += quantities.pitching_machines * 3500;
      if (quantities.basketball_hoops) fixtures += quantities.basketball_hoops * 1200;
      if (quantities.volleyball_systems) fixtures += quantities.volleyball_systems * 800;
      if (quantities.scoreboards) fixtures += quantities.scoreboards * 5000;
      if (quantities.pickleball_nets) fixtures += quantities.pickleball_nets * 300;
      fixtures = Math.max(fixtures, 25000); // Minimum fixtures
      
      const capex_total = Math.round(ti + soft + cont + fixtures);
      
      // Revenue estimates based on facility type and size
      let monthly_revenue = 0;
      
      // Membership revenue (base on facility size and sports)
      const memberships = sf < 10000 ? 150 : sf < 20000 ? 300 : sf < 30000 ? 500 : 800;
      const avgMembershipPrice = 89;
      monthly_revenue += memberships * avgMembershipPrice;
      
      // Hourly rental revenue
      const totalCourts = (counts.basketball_courts_full || 0) + (counts.volleyball_courts || 0) + (counts.pickleball_courts || 0);
      if (totalCourts > 0) {
        monthly_revenue += totalCourts * 25 * 4 * 30; // $25/hr, 4 hrs/day average
      }
      
      // Batting cage revenue
      if (counts.baseball_tunnels) {
        monthly_revenue += counts.baseball_tunnels * 20 * 6 * 30; // $20/hr, 6 hrs/day
      }
      
      // OpEx estimates
      let monthly_opex = 0;
      
      // Base rent ($12/sf/year average)
      monthly_opex += (sf * 12) / 12;
      
      // Staffing (2-4 FTE depending on size)
      const staffCount = sf < 10000 ? 2 : sf < 20000 ? 3 : 4;
      monthly_opex += staffCount * 3500; // $3500/month per FTE loaded
      
      // Utilities, insurance, maintenance (combined ~$3/sf/year)
      monthly_opex += (sf * 3) / 12;
      
      monthly_revenue = Math.round(monthly_revenue);
      monthly_opex = Math.round(monthly_opex);
      const monthly_ebitda = monthly_revenue - monthly_opex;
      const break_even_months = monthly_ebitda > 0 ? Math.ceil(capex_total / monthly_ebitda) : null;
      
      return {
        capex_total,
        monthly_revenue,
        monthly_opex,
        monthly_ebitda,
        break_even_months,
        gross_sf: sf
      };
    };

    setKpis(calculateKpis());

    // Show lead gate after delay
    const timer = setTimeout(() => {
      setShowLeadGate(true);
    }, leadGate.delayMs);

    // Fire analytics event
    console.log("Results viewed");

    return () => clearTimeout(timer);
  }, [leadGate.delayMs]);

  const formatValue = (value: number | null, format: string): string => {
    if (value === null) return "N/A";
    
    switch (format) {
      case "$":
        return `$${value.toLocaleString()}`;
      case "mo":
        return `${value} mo`;
      case "num":
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const handleButtonClick = (button: typeof buttons[0]) => {
    if (button.route) {
      navigate(button.route);
    } else if (button.action === "emit") {
      // Handle save/download action
      console.log("Save report clicked");
    } else if (button.action === "fetch") {
      // Handle business plan generation
      console.log("Generate business plan clicked");
    }
  };

  const handleLeadSubmit = async () => {
    try {
      // Get wizard data for payload
      const facilityData = JSON.parse(localStorage.getItem('wizard-facility-size') || '{}');
      const sportsData = JSON.parse(localStorage.getItem('wizard-selected-sports') || '[]');
      const wizardData = JSON.parse(localStorage.getItem('wizard-data') || '{}');
      const locationData = JSON.parse(localStorage.getItem('wizard-location') || '{}');
      
      const payload = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || "",
        city: leadData.city || locationData.city,
        state: leadData.state || locationData.state,
        outreach_pref: leadData.outreach || "supplier_outreach",
        projectId: Math.random().toString(36).substr(2, 9), // Generate temp ID
        stage_code: wizardData.stage_code,
        selected_sports: sportsData,
        total_sqft: facilityData.total_sqft
      };
      
      console.log("Lead submitted:", payload);
      
      // Here you would POST to /api/leads/monday
      // await fetch('/api/leads/monday', { method: 'POST', body: JSON.stringify(payload) });
      
      setShowLeadGate(false);
    } catch (error) {
      console.error("Error submitting lead:", error);
    }
  };

  const handleLeadInputChange = (key: string, value: string) => {
    setLeadData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ps-text mb-4">{title}</h1>
          <p className="text-lg muted">{subtitle}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {kpiCards.map((kpi) => (
            <Card key={kpi.key} className="ps-card p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-ps-blue mb-2">
                {formatValue(kpis[kpi.key], kpi.fmt)}
              </div>
              <div className="text-sm muted">{kpi.label}</div>
            </Card>
          ))}
        </div>

        {/* Top View Placeholder */}
        <Card className="ps-card p-8 mb-8">
          <h3 className="text-xl font-semibold text-ps-text mb-4 text-center">Facility Layout</h3>
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Top-view layout visualization</span>
          </div>
        </Card>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="ps-card p-8">
            <h3 className="text-xl font-semibold text-ps-text mb-4">Revenue Breakdown</h3>
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Revenue chart</span>
            </div>
          </Card>
          
          <Card className="ps-card p-8">
            <h3 className="text-xl font-semibold text-ps-text mb-4">Cash Flow Projection</h3>
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Cash flow chart</span>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(button)}
              variant={button.kind === "primary" ? "default" : button.kind === "secondary" ? "secondary" : "ghost"}
              className={`${button.kind === "primary" ? "ps-btn primary" : ""} px-6 py-3`}
            >
              {button.label}
            </Button>
          ))}
        </div>

        {/* Lead Gate Dialog */}
        <Dialog open={showLeadGate} onOpenChange={setShowLeadGate}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-ps-text">
                {leadGate.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {leadGate.fields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                      {field.type === "toggle" ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id={field.key}
                        checked={leadData[field.key] === field.options?.[0]}
                        onCheckedChange={(checked) => 
                          handleLeadInputChange(field.key, checked ? field.options?.[0] || "" : field.options?.[1] || "")
                        }
                      />
                      <Label htmlFor={field.key} className="text-sm">
                        {field.options?.[0]}
                      </Label>
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      type={field.key === "email" ? "email" : field.key === "phone" ? "tel" : "text"}
                      value={leadData[field.key] || field.default || (field.defaultFrom === "location.city" ? JSON.parse(localStorage.getItem('wizard-location') || '{}').city : field.defaultFrom === "location.state" ? JSON.parse(localStorage.getItem('wizard-location') || '{}').state : "")}
                      onChange={(e) => handleLeadInputChange(field.key, e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleLeadSubmit} className="ps-btn primary flex-1">
                  {leadGate.primaryCta.label}
                </Button>
                <Button variant="ghost" onClick={() => setShowLeadGate(false)} className="flex-1">
                  {leadGate.secondaryCta.label}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EasyResults;