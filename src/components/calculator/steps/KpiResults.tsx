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
import { ValuePill } from "@/components/ui/value-pill";
import { ValueLegend } from "@/components/ui/value-legend";
import { formatMoney } from "@/lib/utils";
import LeadGate from "@/components/shared/LeadGate";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { dispatchLead } from "@/services/leadDispatch";
// Simple metrics calculation for demo

interface KpiResultsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
  onNavigateToStep?: (stepId: number) => void;
}

const KpiResults = ({ data, onUpdate, onNext, onPrevious, allData, onNavigateToStep }: KpiResultsProps) => {
  const { toast } = useToast();
  const [gatingMode] = useState('soft'); // soft gate by default
  const [emailSent, setEmailSent] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [pendingAction, setPendingAction] = useState<'email' | 'pdf' | null>(null);

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

    // Calculate CapEx (simplified estimate) with installation
    const tiCostPerSF = 18;
    const equipmentData = allData[4] || {};
    const equipmentCost = equipmentData.equipmentCost || 50000;
    const installationEstimate = equipmentData.installationEstimate || Math.round(equipmentCost * 1.0);
    const totalCapex = Math.round((totalSqft * tiCostPerSF) + equipmentCost + installationEstimate + (totalSqft * 5)); // simplified

    // Calculate OpEx - handle both schema formats
    const HOURS_PER_FTE_MONTH = 173.33;
    let salaryCosts = 0;
    
    // Handle staffing array format (quick estimate) or individual fields (step form)
    if (opexData.staffing && Array.isArray(opexData.staffing)) {
      salaryCosts = opexData.staffing.reduce((acc: number, role: any) => {
        return acc + ((role.ftes || 0) * (role.loaded_wage_per_hr || 0) * HOURS_PER_FTE_MONTH);
      }, 0);
    } else {
      // Handle individual field format from StaffingAndOpEx step
      const gmCost = Number(opexData.gmFte || 0) * Number(opexData.gmRate || 0) * HOURS_PER_FTE_MONTH;
      const opsLeadCost = Number(opexData.opsLeadFte || 0) * Number(opexData.opsLeadRate || 0) * HOURS_PER_FTE_MONTH;
      const coachCost = Number(opexData.coachFte || 0) * Number(opexData.coachRate || 0) * HOURS_PER_FTE_MONTH;
      const frontDeskCost = Number(opexData.frontDeskFte || 0) * Number(opexData.frontDeskRate || 0) * 86.67; // PT assumption
      salaryCosts = gmCost + opsLeadCost + coachCost + frontDeskCost;
    }
    
    // Handle fixed costs - try both schema formats
    const fixedCosts = Number(opexData.utilities_monthly || opexData.utilities || 0) + 
                      Number(opexData.insurance_monthly || opexData.insurance || 0) + 
                      Number(opexData.property_tax_monthly || opexData.propertyTax || 0) + 
                      Number(opexData.maintenance_monthly || opexData.maintenance || 0) + 
                      Number(opexData.marketing_monthly || opexData.marketing || 0) + 
                      Number(opexData.software_monthly || opexData.software || 0) + 
                      Number(opexData.janitorial_monthly || opexData.janitorial || 0) + 
                      Number(opexData.other_monthly || opexData.other || 0);

    const monthlyOpex = Math.round(salaryCosts + fixedCosts);

    // Calculate Revenue - handle both schema formats
    let membershipRevenue = 0;
    let rentalRevenue = 0; 
    let lessonRevenue = 0;
    
    const WEEKS_PER_MONTH = 4.345;
    
    // Handle array format (quick estimate) or individual fields (step form)  
    if (revenueData.memberships && Array.isArray(revenueData.memberships)) {
      membershipRevenue = revenueData.memberships.reduce((acc: number, m: any) => 
        acc + ((m.price_month || 0) * (m.members || 0)), 0);
    } else {
      // Handle individual field format from Revenue step
      membershipRevenue = (Number(revenueData.membershipBasic || 0) * Number(revenueData.membershipBasicCount || 0)) +
                         (Number(revenueData.membershipPremium || 0) * Number(revenueData.membershipPremiumCount || 0)) +
                         (Number(revenueData.membershipFamily || 0) * Number(revenueData.membershipFamilyCount || 0));
    }
    
    if (revenueData.rentals && Array.isArray(revenueData.rentals)) {
      rentalRevenue = revenueData.rentals.reduce((acc: number, r: any) => 
        acc + ((r.rate_per_hr || 0) * (r.util_hours_per_week || 0) * WEEKS_PER_MONTH), 0);
    } else {
      // Handle individual field format from Revenue step
      rentalRevenue = (Number(revenueData.courtRentalRate || 0) * Number(revenueData.courtUtilization || 0) * 30 / 100) +
                     (Number(revenueData.fieldRentalRate || 0) * Number(revenueData.fieldUtilization || 0) * 30 / 100);
    }
    
    if (revenueData.lessons && Array.isArray(revenueData.lessons)) {
      lessonRevenue = revenueData.lessons.reduce((acc: number, l: any) => 
        acc + ((l.coach_count || 0) * (l.hours_per_coach_week || 0) * WEEKS_PER_MONTH * (l.avg_rate_per_hr || 0) * ((l.utilization_pct || 0) / 100)), 0);
    } else {
      // Handle individual field format from Revenue step
      lessonRevenue = (Number(revenueData.privateLessonRate || 0) * Number(revenueData.privateLessonsPerWeek || 0) * WEEKS_PER_MONTH) +
                     (Number(revenueData.groupLessonRate || 0) * Number(revenueData.groupLessonsPerWeek || 0) * WEEKS_PER_MONTH);
    }

    const monthlyRevenue = Math.round(membershipRevenue + rentalRevenue + lessonRevenue);

    // Calculate derived metrics
    const monthlyProfit = monthlyRevenue - monthlyOpex;
    const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(totalCapex / monthlyProfit) : null;
    const roi = totalCapex > 0 ? ((monthlyProfit * 12) / totalCapex) * 100 : 0;

    return {
      totalCapex,
      monthlyOpex,
      monthlyRevenue,
      breakEvenMonths,
      roi,
      paybackMonths: breakEvenMonths,
      totalSqft,
      monthlyProfit,
      debtService: 0, // simplified
      buildingCosts: Math.round(totalCapex * 0.6),
      equipmentCosts: equipmentCost,
      installationCosts: installationEstimate,
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
      value: metrics.breakEvenMonths ? `${metrics.breakEvenMonths} months` : "Not reached",
      description: metrics.monthlyProfit <= 0 ? "Current monthly cash flow is negative" : "Time to break-even",
      icon: Calendar,
      variant: "warning" as const,
      showActions: metrics.monthlyProfit <= 0
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
      value: metrics.paybackMonths ? `${metrics.paybackMonths} months` : "Not reached",
      description: metrics.monthlyProfit <= 0 ? "Current monthly cash flow is negative" : "Investment payback time",
      icon: Trophy,
      variant: "accent" as const,
      showActions: metrics.monthlyProfit <= 0
    }
  ];

  const advisorNotes = [
    `Your facility shows ${metrics.roi > 15 ? 'strong' : metrics.roi > 10 ? 'moderate' : metrics.roi <= 0 ? 'negative' : 'challenging'} ROI potential at ${metrics.roi.toFixed(1)}%.`,
    `Break-even at ${metrics.breakEvenMonths ? metrics.breakEvenMonths + ' months' : 'not reached'} is ${metrics.breakEvenMonths && metrics.breakEvenMonths <= 18 ? 'competitive' : 'longer than typical'} for this market.`,
    `Monthly cash flow after break-even: $${(metrics.monthlyRevenue - metrics.monthlyOpex).toLocaleString()}.`,
    metrics.totalCapex > 2000000 ? 'Consider phased build-out to reduce initial capital requirements.' : 'Capital requirements appear manageable for this facility size.',
    `Recommended next steps: ${metrics.breakEvenMonths && metrics.breakEvenMonths > 24 ? 'Review revenue assumptions and market analysis' : 'Proceed with site selection and financing discussions'}.`,
    ...(metrics.monthlyProfit <= 0 ? [`Increase rentals/lessons utilization or reduce staffing by ~${Math.ceil(Math.abs(metrics.monthlyProfit) / (25 * 173))} FTE to reach break-even.`] : [])
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

  const handleButtonClick = (action: 'email' | 'pdf') => {
    setPendingAction(action);
    setShowLeadGate(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLeadSubmit = async (leadData: any) => {
    // Save lead data to allData[10] so it's available in Results step
    onUpdate({ ...leadData });
    
    try {
      // Get project basics data
      const projectBasics = allData[1] || {};
      
      // Build email payload with all available data
      const emailPayload = {
        customerEmail: leadData.email,
        customerName: leadData.name,
        leadData: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone || '',
          city: leadData.city || '',
          state: leadData.state || '',
          location: `${leadData.city || ''}, ${leadData.state || ''}`.trim(),
          allowOutreach: leadData.outreach === 'supplier_outreach',
        },
        facilityDetails: {
          projectType: projectBasics.projectName || 'Sports Facility',
          sports: projectBasics.selectedSports || [],
          size: metrics.totalSqft ? `${metrics.totalSqft.toLocaleString()} sq ft` : undefined,
          buildMode: allData[2]?.buildMode || 'lease',
        },
        estimates: {
          totalInvestment: metrics.totalCapex,
          annualRevenue: metrics.monthlyRevenue * 12,
          monthlyRevenue: metrics.monthlyRevenue,
          roi: metrics.roi,
          paybackPeriod: metrics.paybackMonths,
          breakEven: metrics.breakEvenMonths,
        },
        source: 'kpi-results-email-action',
      };

      // Call the edge function
      const { data: emailData, error } = await supabase.functions.invoke('send-lead-emails', {
        body: emailPayload,
      });

      if (error) {
        throw error;
      }

      // Optional: Dispatch to Make.com webhook (non-blocking)
      try {
        const nameParts = leadData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await dispatchLead({
          firstName,
          lastName,
          email: leadData.email,
          phone: leadData.phone || '',
          city: leadData.city,
          state: leadData.state,
          projectType: projectBasics.projectName,
          sports: projectBasics.selectedSports,
          buildMode: allData[2]?.buildMode,
          totalInvestment: metrics.totalCapex,
          annualRevenue: metrics.monthlyRevenue * 12,
          roi: metrics.roi,
          paybackPeriod: metrics.paybackMonths,
          source: 'quick-estimate',
          timestamp: new Date().toISOString(),
        });
      } catch (webhookError) {
        console.log('Webhook dispatch failed (non-critical):', webhookError);
      }

      // Show success feedback
      if (pendingAction === 'email') {
        setEmailSent(true);
        toast({
          title: "Email Sent! ✓",
          description: `Summary sent to ${leadData.email}`,
        });
        setTimeout(() => setEmailSent(false), 3000);
      } else if (pendingAction === 'pdf') {
        toast({
          title: "Generating PDF...",
          description: "Your browser's print dialog will open",
        });
        setTimeout(handlePrint, 500);
      }
      
    } catch (error) {
      console.error('Error in lead submission:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact support.",
        variant: "destructive",
      });
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

      {/* Value Legend */}
      <ValueLegend />

      {/* KPI Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => {
          // Add edit button for OpEx and Revenue cards
          const showEdit = kpi.title === "Monthly OpEx" || kpi.title === "Monthly Revenue";
          const editHandler = kpi.title === "Monthly OpEx" ? handleEditOpEx : 
                            kpi.title === "Monthly Revenue" ? handleEditRevenue : undefined;
          
          // Determine value type for proper styling
          let type: 'revenue' | 'cost' | 'capex' | 'net' = 'net';
          let period: 'monthly' | 'annual' | 'one-time' | 'total' = 'total';
          
          if (kpi.title === "Total CapEx") {
            type = 'capex';
            period = 'one-time';
          } else if (kpi.title === "Monthly OpEx") {
            type = 'cost';
            period = 'monthly';
          } else if (kpi.title === "Monthly Revenue") {
            type = 'revenue';
            period = 'monthly';
          }
          
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
                {kpi.title === "Break-even" || kpi.title === "ROI" || kpi.title === "Payback Period" ? (
                  <div className="text-2xl font-bold">{kpi.value}</div>
                ) : (
                  <ValuePill 
                    value={parseInt(kpi.value.replace(/[$,]/g, '')) || 0}
                    type={type}
                    period={period}
                    className="text-xl font-bold"
                  />
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
                {(kpi as any).showActions && onNavigateToStep && (
                  <div className="flex gap-1 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditRevenue}
                      className="text-xs h-6 px-2"
                    >
                      Tune revenue
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditOpEx}
                      className="text-xs h-6 px-2"
                    >
                      Reduce OpEx
                    </Button>
                  </div>
                )}
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
                  {metrics.monthlyRevenue > 0 ? 
                    ((metrics.monthlyRevenue - metrics.monthlyOpex) / metrics.monthlyRevenue * 100).toFixed(1) + '%' : 
                    'N/A'
                  }
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
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleButtonClick('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Quick PDF
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleButtonClick('email')}
            disabled={emailSent}
          >
            <Mail className="h-4 w-4 mr-2" />
            {emailSent ? 'Email Sent! ✓' : 'Email Summary'}
          </Button>
        </div>
        
        <Button variant="hero" onClick={onNext} className="flex-1">
          Get Complete Analysis
        </Button>
      </div>

      {/* Lead Gate Modal */}
      <LeadGate
        isOpen={showLeadGate}
        onClose={() => {
          setShowLeadGate(false);
          setPendingAction(null);
        }}
        onSubmit={handleLeadSubmit}
        title={pendingAction === 'email' ? "Email Your Summary" : "Get Your PDF"}
        description={pendingAction === 'email' 
          ? "Enter your contact info to receive this financial summary" 
          : "Enter your contact info to generate and download the PDF"}
        showOptionalFields={false}
      />
    </div>
  );
};

export default KpiResults;