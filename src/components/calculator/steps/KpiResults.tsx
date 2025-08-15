import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Calculator, 
  Download, 
  Mail,
  Building,
  Users,
  Trophy,
  AlertCircle,
  Edit
} from "lucide-react";
// Simple metrics calculation for demo

interface KpiResultsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
  onNavigateToStep?: (stepId: number) => void;
}

const KpiResults = ({ data, onNext, onPrevious, allData, onNavigateToStep }: KpiResultsProps) => {
  const [gatingMode] = useState('soft'); // soft gate by default

  // Calculate metrics from actual data
  const calculateMetrics = () => {
    // Get data from different steps
    const facilityData = allData[3] || {};
    const opexData = allData[5] || {};
    const revenueData = allData[6] || {};
    const financingData = allData[7] || {};

    // Calculate space
    const courtCounts = facilityData.court_or_cage_counts || {};
    const perUnitSF = {
      baseball_tunnels: 1050,
      basketball_courts_full: 6240,
      volleyball_courts: 2592,
      pickleball_courts: 1800,
      soccer_field_small: 14400,
      training_turf_zone: 7200
    };
    
    const totalProgramSF = Object.entries(courtCounts).reduce((acc, [unit, count]) => {
      const sf = perUnitSF[unit as keyof typeof perUnitSF] || 0;
      return acc + ((count as number) * sf);
    }, 0);
    
    const adminPct = facilityData.admin_pct_addon || 12;
    const circulationPct = facilityData.circulation_pct_addon || 20;
    const totalSqft = Math.round(totalProgramSF * (1 + (adminPct + circulationPct) / 100));

    // Calculate CapEx (simplified estimate)
    const tiCostPerSF = 18;
    const equipmentEstimate = 50000; // base estimate
    const totalCapex = Math.round((totalSqft * tiCostPerSF) + equipmentEstimate + (totalSqft * 5)); // simplified

    // Calculate OpEx from staffing and fixed costs
    const staffing = opexData.staffing || [];
    const HOURS_PER_FTE_MONTH = 173;
    const salaryCosts = staffing.reduce((acc: number, role: any) => {
      return acc + (role.ftes * role.loaded_wage_per_hr * HOURS_PER_FTE_MONTH);
    }, 0);
    
    const fixedCosts = (opexData.utilities_monthly || 0) + 
                      (opexData.insurance_monthly || 0) + 
                      (opexData.property_tax_monthly || 0) + 
                      (opexData.maintenance_monthly || 0) + 
                      (opexData.marketing_monthly || 0) + 
                      (opexData.software_monthly || 0) + 
                      (opexData.janitorial_monthly || 0) + 
                      (opexData.other_monthly || 0);

    const monthlyOpex = Math.round(salaryCosts + fixedCosts);

    // Calculate Revenue
    const memberships = revenueData.memberships || [];
    const rentals = revenueData.rentals || [];
    const lessons = revenueData.lessons || [];
    
    const WEEKS_PER_MONTH = 4.345;
    
    const membershipRevenue = memberships.reduce((acc: number, m: any) => 
      acc + (m.price_month * m.members), 0);
    
    const rentalRevenue = rentals.reduce((acc: number, r: any) => 
      acc + (r.rate_per_hr * r.util_hours_per_week * WEEKS_PER_MONTH), 0);
    
    const lessonRevenue = lessons.reduce((acc: number, l: any) => 
      acc + (l.coach_count * l.hours_per_coach_week * WEEKS_PER_MONTH * l.avg_rate_per_hr * (l.utilization_pct / 100)), 0);

    const monthlyRevenue = Math.round(membershipRevenue + rentalRevenue + lessonRevenue);

    // Calculate derived metrics
    const monthlyProfit = monthlyRevenue - monthlyOpex;
    const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(totalCapex / monthlyProfit) : null;
    const roi = monthlyProfit > 0 ? ((monthlyProfit * 12) / totalCapex) * 100 : 0;

    return {
      totalCapex,
      monthlyOpex,
      monthlyRevenue,
      breakEvenMonths,
      roi,
      paybackMonths: breakEvenMonths,
      totalSqft,
      debtService: 0, // simplified
      buildingCosts: Math.round(totalCapex * 0.6),
      equipmentCosts: equipmentEstimate,
      softCosts: Math.round(totalCapex * 0.2),
      salaryCosts: Math.round(salaryCosts),
      fixedCosts: Math.round(fixedCosts),
      membershipRevenue: Math.round(membershipRevenue),
      programRevenue: Math.round(rentalRevenue + lessonRevenue),
      otherRevenue: 0,
      facilityLayout: courtCounts
    };
  };

  const metrics = calculateMetrics();

  const kpiCards = [
    {
      title: "Total CapEx",
      value: `$${metrics.totalCapex.toLocaleString()}`,
      description: "Total capital expenditure",
      icon: Building,
      variant: "primary" as const
    },
    {
      title: "Monthly OpEx",
      value: `$${metrics.monthlyOpex.toLocaleString()}`,
      description: "Monthly operating expenses",
      icon: Calculator,
      variant: "secondary" as const
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics.monthlyRevenue.toLocaleString()}`,
      description: "Projected monthly revenue",
      icon: DollarSign,
      variant: "success" as const
    },
    {
      title: "Break-even",
      value: metrics.breakEvenMonths ? `${metrics.breakEvenMonths} months` : "N/A",
      description: "Time to break-even",
      icon: Calendar,
      variant: "warning" as const
    },
    {
      title: "ROI",
      value: `${metrics.roi.toFixed(1)}%`,
      description: "Return on investment",
      icon: TrendingUp,
      variant: "info" as const
    },
    {
      title: "Payback Period",
      value: metrics.paybackMonths ? `${metrics.paybackMonths} months` : "N/A",
      description: "Investment payback time",
      icon: Trophy,
      variant: "accent" as const
    }
  ];

  const advisorNotes = [
    `Your facility shows ${metrics.roi > 15 ? 'strong' : metrics.roi > 10 ? 'moderate' : 'challenging'} ROI potential at ${metrics.roi.toFixed(1)}%.`,
    `Break-even at ${metrics.breakEvenMonths || 'TBD'} months is ${metrics.breakEvenMonths && metrics.breakEvenMonths <= 18 ? 'competitive' : 'longer than typical'} for this market.`,
    `Monthly cash flow after break-even: $${(metrics.monthlyRevenue - metrics.monthlyOpex).toLocaleString()}.`,
    metrics.totalCapex > 2000000 ? 'Consider phased build-out to reduce initial capital requirements.' : 'Capital requirements appear manageable for this facility size.',
    `Recommended next steps: ${metrics.breakEvenMonths && metrics.breakEvenMonths > 24 ? 'Review revenue assumptions and market analysis' : 'Proceed with site selection and financing discussions'}.`
  ];

  const handleEditFacility = () => {
    if (onNavigateToStep) {
      onNavigateToStep(3); // Navigate to Facility Plan step
    }
  };

  const handleEditOpEx = () => {
    if (onNavigateToStep) {
      onNavigateToStep(5); // Navigate to OpEx step
    }
  };

  const handleEditRevenue = () => {
    if (onNavigateToStep) {
      onNavigateToStep(6); // Navigate to Revenue step
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Facility Analysis</h2>
        <p className="text-muted-foreground">
          Financial overview for your sports facility project
        </p>
      </div>

      {/* Facility Layout Summary */}
      {metrics.facilityLayout && Object.keys(metrics.facilityLayout).length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Your Facility Layout
                </CardTitle>
                <CardDescription>Sports and courts included in this analysis</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEditFacility}
                className="shrink-0"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(metrics.facilityLayout).map(([unit, count]) => (
                <div key={unit} className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm font-medium capitalize">
                    {unit.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Total facility size: <span className="font-medium">{metrics.totalSqft?.toLocaleString()} sq ft</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => {
          // Add edit button for OpEx and Revenue cards
          const showEdit = kpi.title === "Monthly OpEx" || kpi.title === "Monthly Revenue";
          const editHandler = kpi.title === "Monthly OpEx" ? handleEditOpEx : 
                            kpi.title === "Monthly Revenue" ? handleEditRevenue : undefined;
          
          return (
            <Card key={index} className="shadow-custom-md hover:shadow-custom-lg transition-smooth">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <kpi.icon className="h-5 w-5 text-muted-foreground" />
                  {showEdit && onNavigateToStep && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={editHandler}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
          <CardDescription>Key metrics for your facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Square Footage:</span>
                <span className="font-medium">{metrics.totalSqft?.toLocaleString() || 'N/A'} sf</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per Square Foot:</span>
                <span className="font-medium">
                  ${metrics.totalSqft ? (metrics.totalCapex / metrics.totalSqft).toFixed(0) : 'N/A'}/sf
                </span>
              </div>
              <div className="flex justify-between">
                <span>Revenue per Square Foot:</span>
                <span className="font-medium">
                  ${metrics.totalSqft ? ((metrics.monthlyRevenue * 12) / metrics.totalSqft).toFixed(0) : 'N/A'}/sf/year
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Net Operating Income:</span>
                <span className="font-medium">
                  ${((metrics.monthlyRevenue - metrics.monthlyOpex) * 12).toLocaleString()}/year
                </span>
              </div>
              <div className="flex justify-between">
                <span>Operating Margin:</span>
                <span className="font-medium">
                  {((metrics.monthlyRevenue - metrics.monthlyOpex) / metrics.monthlyRevenue * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Debt Service Coverage:</span>
                <span className="font-medium">
                  {metrics.debtService > 0 ? 
                    ((metrics.monthlyRevenue - metrics.monthlyOpex) / metrics.debtService).toFixed(2) + 'x' : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advisor Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-info" />
            Advisor Notes
          </CardTitle>
          <CardDescription>AI-generated insights for your project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {advisorNotes.map((note, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p className="text-sm">{note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How This Was Calculated */}
      <Card>
        <CardHeader>
          <CardTitle>How This Was Calculated</CardTitle>
          <CardDescription>Transparent methodology and assumptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="capex">
              <AccordionTrigger>Capital Expenditures (CapEx)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Land/Building/TI:</span>
                    <span>${metrics.buildingCosts?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment & FF&E:</span>
                    <span>${metrics.equipmentCosts?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soft Costs & Contingency:</span>
                    <span>${metrics.softCosts?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total CapEx:</span>
                    <span>${metrics.totalCapex.toLocaleString()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="opex">
              <AccordionTrigger>Operating Expenses (OpEx)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Salaries & Benefits:</span>
                    <span>${metrics.salaryCosts?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed Expenses:</span>
                    <span>${metrics.fixedCosts?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Debt Service:</span>
                    <span>${metrics.debtService?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total Monthly OpEx:</span>
                    <span>${metrics.monthlyOpex.toLocaleString()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="revenue">
              <AccordionTrigger>Revenue Projections</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Membership Revenue:</span>
                    <span>${metrics.membershipRevenue?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Program Revenue:</span>
                    <span>${metrics.programRevenue?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Revenue:</span>
                    <span>${metrics.otherRevenue?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total Monthly Revenue:</span>
                    <span>${metrics.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Soft Gate Message */}
      {gatingMode === 'soft' && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Get Your Complete Analysis
            </CardTitle>
            <CardDescription>
              Enter your contact information to receive detailed reports, sensitivity analysis, and next steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">Line-item cost breakdowns</Badge>
              <Badge variant="outline">24-month cash flow projections</Badge>
              <Badge variant="outline">Sensitivity analysis tables</Badge>
              <Badge variant="outline">Professional PDF report</Badge>
              <Badge variant="outline">CSV export for further analysis</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> All figures are planning estimates. Actual costs vary by market, vendor, and design. 
            Validate with professional quotes. This analysis is for planning purposes only and does not constitute 
            financial or investment advice.
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Previous Step
        </Button>
        
        <div className="flex gap-2 flex-1">
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Quick PDF
          </Button>
          <Button variant="outline" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Email Summary
          </Button>
        </div>
        
        <Button variant="hero" onClick={onNext} className="flex-1">
          Get Complete Analysis
        </Button>
      </div>
    </div>
  );
};

export default KpiResults;