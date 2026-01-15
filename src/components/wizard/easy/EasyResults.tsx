import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LeadGate from "@/components/shared/LeadGate";
import useAnalytics from "@/hooks/useAnalytics";
import { getProjectState, saveProjectState } from "@/utils/projectState";
import { dispatchLead } from "@/services/leadDispatch";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from "recharts";
import { ValuePill } from "@/components/ui/value-pill";
import { ValueLegend } from "@/components/ui/value-legend";
import { formatMoney } from "@/lib/utils";
import { PricingDisclaimer } from "@/components/ui/pricing-disclaimer";

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
  const [pendingAction, setPendingAction] = useState<'report' | 'pdf' | null>(null);
  const { trackResultsViewed, trackLeadSubmitted, trackExportClicked } = useAnalytics();

  const handleSaveReport = () => {
    window.print();
  };

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
      
      monthly_revenue = Math.round(monthly_revenue) || 0;
      monthly_opex = Math.round(monthly_opex) || 0;
      const monthly_ebitda = monthly_revenue - monthly_opex;
      const break_even_months = monthly_ebitda > 0 ? Math.ceil(capex_total / monthly_ebitda) : null;
      
      return {
        capex_total: capex_total || 0,
        monthly_revenue: monthly_revenue || 0,
        monthly_opex: monthly_opex || 0,
        monthly_ebitda: monthly_ebitda || 0,
        break_even_months,
        gross_sf: sf || 0
      };
    };

    const calculatedKpis = calculateKpis();
    setKpis(calculatedKpis);

    // Track results viewed
    trackResultsViewed(calculatedKpis);

    // Show lead gate after delay
    const timer = setTimeout(() => {
      setShowLeadGate(true);
    }, leadGate.delayMs);

    return () => clearTimeout(timer);
  }, [leadGate.delayMs]);

  const formatValue = (value: number | null | undefined, format: string): string => {
    if (value === null || value === undefined || isNaN(value)) return "N/A";
    
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
      if (button.route === "/calculator") {
        // Pass Easy Wizard data to Calculator
        const facilityData = JSON.parse(localStorage.getItem('wizard-facility-size') || '{}');
        const estimateData = JSON.parse(localStorage.getItem('wizard-estimate') || '{}');
        const contextData = JSON.parse(localStorage.getItem('wizard-context') || '{}');
        const sportsData = JSON.parse(localStorage.getItem('wizard-sports') || '[]');
        
        navigate('/calculator', {
          state: {
            easyWizardData: {
              sports: sportsData,
              facility: facilityData,
              estimate: estimateData,
              context: contextData,
              kpis: kpis,
            }
          }
        });
        return;
      }
      navigate(button.route);
    } else if (button.action === "emit") {
      // Check if lead exists, gate if not
      const projectId = localStorage.getItem('current-project-id') || 'legacy';
      const project = getProjectState(projectId);
      if (!project.lead?.email) {
        trackExportClicked('report', true);
        setPendingAction('report');
        setShowLeadGate(true);
      } else {
        trackExportClicked('report', false);
        handleSaveReport();
      }
    } else if (button.action === "fetch") {
      // Check if lead exists, gate if not
      const projectId = localStorage.getItem('current-project-id') || 'legacy';
      const project = getProjectState(projectId);
      if (!project.lead?.email) {
        trackExportClicked('pdf', true);
        setShowLeadGate(true);
      } else {
        trackExportClicked('pdf', false);
        console.log("Generate business plan clicked");
        // TODO: Implement actual PDF generation
      }
    }
  };

  const handleLeadSubmit = async (leadData: any) => {
    try {
      const projectId = localStorage.getItem('current-project-id') || 'legacy';
      const project = getProjectState(projectId);
      
      // Dispatch to Make.com
      try {
        await dispatchLead({
          ...leadData,
          projectType: `${project.selectedSports?.join(', ') || 'Multi-Sport'} Facility`,
          facilitySize: project.facilitySize,
          sports: project.selectedSports || [],
          totalInvestment: project.totalInvestment,
          annualRevenue: project.annualRevenue,
          roi: project.roi,
          paybackPeriod: project.paybackPeriod,
          source: 'easy-wizard',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error dispatching lead:', error);
      }

      // Send lead emails
      try {
        await supabase.functions.invoke('send-lead-emails', {
          body: {
            customerEmail: leadData.email,
            customerName: leadData.name,
            leadData: {
              name: leadData.name,
              email: leadData.email,
              phone: leadData.phone,
              city: leadData.city,
              state: leadData.state,
              location: leadData.location,
              allowOutreach: leadData.allowOutreach,
            },
            facilityDetails: {
              projectType: `${project.selectedSports?.join(', ') || 'Multi-Sport'} Facility`,
              sports: project.selectedSports || [],
              size: project.facilitySize,
            },
            estimates: {
              totalInvestment: project.totalInvestment,
              annualRevenue: project.annualRevenue,
              roi: project.roi,
              paybackPeriod: project.paybackPeriod,
            },
            source: 'easy-wizard',
          },
        });
        console.log('Lead emails sent successfully');
      } catch (error) {
        console.error('Error sending lead emails:', error);
        // Don't block the user flow if email fails
      }
      
      // Save lead to project state
      saveProjectState(projectId, {
        ...project,
        lead: {
          ...leadData,
          captured_at: new Date().toISOString()
        }
      });
      
      const payload = {
        ...leadData,
        projectId,
        stage_code: project.wizard?.stage_code,
        selected_sports: project.wizard?.selected_sports,
        total_sqft: project.facility_plan?.total_sqft
      };
      
      // Track lead submission
      trackLeadSubmitted('easy_results_modal', leadData);
      
      console.log("Lead submitted:", payload);
      
      // Execute pending action after lead capture
      if (pendingAction === 'report') {
        handleSaveReport();
      }
      setPendingAction(null);
      setShowLeadGate(false);
      
    } catch (error) {
      console.error("Error submitting lead:", error);
    }
  };

  // Generate chart data from KPIs
  const getRevenueData = () => {
    const facilityData = JSON.parse(localStorage.getItem('wizard-facility-size') || '{}');
    const counts = facilityData.court_or_cage_counts || {};
    const sf = facilityData.total_sqft || 0;

    const memberships = sf < 10000 ? 150 : sf < 20000 ? 300 : sf < 30000 ? 500 : 800;
    const membershipRevenue = memberships * 89;
    
    const totalCourts = (counts.basketball_courts_full || 0) + (counts.volleyball_courts || 0) + (counts.pickleball_courts || 0);
    const courtRentals = totalCourts * 25 * 4 * 30;
    
    const cageRentals = (counts.baseball_tunnels || 0) * 20 * 6 * 30;
    
    return [
      { name: 'Memberships', value: membershipRevenue, color: '#0EA5E9' },
      { name: 'Court Rentals', value: courtRentals, color: '#10B981' },
      { name: 'Training/Cages', value: cageRentals, color: '#F59E0B' }
    ].filter(item => item.value > 0);
  };

  const getCashFlowData = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map(month => ({
      month: `M${month}`,
      revenue: kpis.monthly_revenue || 0,
      opex: -(kpis.monthly_opex || 0),
      ebitda: (kpis.monthly_ebitda || 0)
    }));
  };

  const getFacilityLayout = () => {
    const facilityData = JSON.parse(localStorage.getItem('wizard-facility-size') || '{}');
    const counts = facilityData.court_or_cage_counts || {};
    const sf = facilityData.total_sqft || 15000;
    
    // Simple grid layout representation
    const width = Math.sqrt(sf * 1.5); // Assuming 1.5:1 ratio
    const height = sf / width;
    
    return { 
      width: Math.round(width), 
      height: Math.round(height), 
      courts: counts,
      totalSf: sf
    };
  };


  return (
    <div className="container mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ps-text mb-4">{title}</h1>
          <p className="text-lg muted">{subtitle}</p>
        </div>

        {/* Value Legend */}
        <ValueLegend />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {kpiCards.map((kpi) => {
            const value = kpis[kpi.key];
            let type: 'revenue' | 'cost' | 'capex' | 'net' = 'net';
            let period: 'monthly' | 'annual' | 'one-time' | 'total' = 'total';
            
            // Determine type and period based on KPI key
            if (kpi.key === 'capex_total') {
              type = 'capex';
              period = 'one-time';
            } else if (kpi.key === 'monthly_revenue') {
              type = 'revenue';
              period = 'monthly';
            } else if (kpi.key === 'monthly_opex') {
              type = 'cost';
              period = 'monthly';
            } else if (kpi.key === 'monthly_ebitda') {
              type = 'net';
              period = 'monthly';
            } else if (kpi.key === 'break_even_months') {
              // Special formatting for break-even
              return (
                <Card key={kpi.key} className="ps-card p-6 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-ps-blue mb-2">
                    {formatValue(value, kpi.fmt)}
                  </div>
                  <div className="text-sm muted">{kpi.label}</div>
                </Card>
              );
            }
            
            return (
              <Card key={kpi.key} className="ps-card p-6 text-center">
                <ValuePill 
                  value={value || 0} 
                  type={type} 
                  period={period}
                  className="text-xl md:text-2xl font-bold mb-2"
                />
                <div className="text-sm muted mt-2">{kpi.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Pricing Disclaimer */}
        <PricingDisclaimer className="mb-8" />

        {/* Facility Layout */}
        <Card className="ps-card p-8 mb-8">
          <h3 className="text-xl font-semibold text-ps-text mb-4 text-center">Facility Layout</h3>
          <div className="relative bg-gradient-to-br from-blue-50 to-gray-100 h-64 rounded-lg flex items-center justify-center overflow-hidden">
            {(() => {
              const layout = getFacilityLayout();
              const scale = Math.min(240 / Math.max(layout.width, layout.height), 1);
              
              return (
                <div className="relative" style={{ 
                  width: `${layout.width * scale}px`, 
                  height: `${layout.height * scale}px`,
                  border: '2px solid #374151',
                  borderRadius: '4px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div className="absolute top-2 left-2 text-xs font-medium text-gray-600">
                    {layout.totalSf.toLocaleString()} sq ft
                  </div>
                  
                  {/* Court indicators */}
                  {Object.entries(layout.courts).map(([courtType, count], index) => {
                    const numCount = Number(count) || 0;
                    return numCount > 0 && (
                      <div 
                        key={courtType}
                        className="absolute bg-green-200 border border-green-400 rounded"
                        style={{
                          width: '20px',
                          height: '12px',
                          left: `${10 + (index % 3) * 25}px`,
                          top: `${20 + Math.floor(index / 3) * 15}px`
                        }}
                      >
                        <div className="text-[8px] text-center leading-3">{numCount}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="ps-card p-8">
            <h3 className="text-xl font-semibold text-ps-text mb-4">Revenue Breakdown</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getRevenueData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getRevenueData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {getRevenueData().map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          <Card className="ps-card p-8">
            <h3 className="text-xl font-semibold text-ps-text mb-4">Cash Flow Projection</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getCashFlowData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${Math.abs(value/1000)}k`} />
                  <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="opex" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="OpEx"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ebitda" 
                    stroke="#0EA5E9" 
                    strokeWidth={3}
                    name="EBITDA"
                  />
                </LineChart>
              </ResponsiveContainer>
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

        {/* Lead Gate */}
        <LeadGate
          isOpen={showLeadGate}
          onClose={() => setShowLeadGate(false)}
          onSubmit={handleLeadSubmit}
          title={leadGate.title}
          mode="modal"
          defaultCity={JSON.parse(localStorage.getItem('wizard-location') || '{}').city || ''}
          defaultState={JSON.parse(localStorage.getItem('wizard-location') || '{}').state || ''}
        />
      </div>
    </div>
  );
};

export default EasyResults;