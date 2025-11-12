import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Mail, Calendar, TrendingUp, DollarSign, Target, Clock, Calculator } from "lucide-react";
import { ValuePill } from "@/components/ui/value-pill";
import { ValueLegend } from "@/components/ui/value-legend";
import { formatMoney } from "@/lib/utils";
import { NextStepsBanner } from "@/components/ui/next-steps-banner";
import LeadGate from "@/components/shared/LeadGate";
import { dispatchLead } from "@/services/leadDispatch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateSpacePlanning, 
  calculateCapExBuild, 
  calculateCapExBuy, 
  calculateCapExLease,
  calculateOpEx,
  calculateRevenue,
  calculateProfitability 
} from "@/utils/calculations";
import { DEFAULT_GLOBAL_ASSUMPTIONS } from "@/data/sportPresets";

interface ResultsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
  setDataForStep?: (stepId: number, data: any) => void;
}

const Results = ({ data, onUpdate, onNext, onPrevious, allData, setDataForStep }: ResultsProps) => {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [pendingAction, setPendingAction] = useState<'email' | 'pdf' | 'consultation' | null>(null);

  // Extract data from previous steps (updated for new step order)
  const projectBasics = allData[1] || {};
  const facilityPlan = allData[2] || {};
  const equipment = allData[3] || {};
  const siteCosts = allData[4] || {};
  const operating = allData[5] || {};
  const revenue = allData[6] || {};
  const financing = allData[7] || {};
  const sensitivity = allData[8] || {};
  const sourcingData = allData[9] || {};
  const leadData = allData[10] || {};

  // Get global assumptions (can be made editable later)
  const globalAssumptions = DEFAULT_GLOBAL_ASSUMPTIONS;

  // Calculate Space Planning
  const spacePlanning = calculateSpacePlanning(
    facilityPlan.selectedSports || {},
    globalAssumptions,
    facilityPlan.totalSqft
  );

  // Calculate CapEx based on facility type
  let capExCalculation;
  const facilityType = facilityPlan.facilityType || 'build';
  
  if (facilityType === 'build') {
    capExCalculation = calculateCapExBuild(spacePlanning.grossSF, {
      buildingCostPerSf: siteCosts.buildingCostPerSf || 85,
      siteworkPct: siteCosts.siteworkPct || 15,
      tiCostPerSf: siteCosts.tiCostPerSf || 25,
      softCostsPct: siteCosts.softCostsPct || 20,
      fixturesAllowance: siteCosts.fixturesAllowance || 18000,
      itSecurityAllowance: siteCosts.itSecurityAllowance || 8500,
      contingencyPct: siteCosts.contingencyPct || 10,
      landCost: siteCosts.landCost || 0
    });
  } else if (facilityType === 'buy') {
    capExCalculation = calculateCapExBuy(spacePlanning.grossSF, {
      purchasePrice: siteCosts.purchasePrice || 1000000,
      closingCostsPct: siteCosts.closingCostsPct || 3,
      dueDiligenceCosts: siteCosts.dueDiligenceCosts || 15000,
      renovationCostPerSf: siteCosts.renovationCostPerSf || 45,
      softCostsPct: siteCosts.softCostsPct || 15,
      contingencyPct: siteCosts.contingencyPct || 8,
      fixturesAllowance: siteCosts.fixturesAllowance || 18000,
      itSecurityAllowance: siteCosts.itSecurityAllowance || 8500
    });
  } else {
    capExCalculation = calculateCapExLease(spacePlanning.grossSF, {
      tiCostPerSf: siteCosts.tiCostPerSf || 35,
      tiAllowancePerSf: siteCosts.tiAllowancePerSf || 10,
      baseRentPerSfYear: siteCosts.baseRentPerSfYear || 12,
      nnnPerSfYear: siteCosts.nnnPerSfYear || 4,
      camPerSfYear: siteCosts.camPerSfYear || 2,
      freeRentMonths: siteCosts.freeRentMonths || 3,
      securityDepositMonths: siteCosts.securityDepositMonths || 2,
      softCostsPct: siteCosts.softCostsPct || 15,
      contingencyPct: siteCosts.contingencyPct || 8,
      fixturesAllowance: siteCosts.fixturesAllowance || 18000,
      itSecurityAllowance: siteCosts.itSecurityAllowance || 8500
    });
  }

  // Calculate OpEx
  const opExCalculation = calculateOpEx(spacePlanning.grossSF, {
    staffing: operating.staffing || [{ ftes: 3, loadedWagePerHr: 25 }],
    utilities: operating.utilities || 3500,
    insurance: operating.insurance || 1200,
    propertyTax: operating.propertyTax || 2800,
    maintenance: operating.maintenance || 2000,
    marketing: operating.marketing || 1500,
    software: operating.software || 800,
    janitorial: operating.janitorial || 1000,
    other: operating.other || 500,
    baseRentPerSfYear: facilityType === 'lease' ? siteCosts.baseRentPerSfYear : undefined,
    nnnPerSfYear: facilityType === 'lease' ? siteCosts.nnnPerSfYear : undefined,
    camPerSfYear: facilityType === 'lease' ? siteCosts.camPerSfYear : undefined,
    loanAmount: financing.loanAmount,
    interestRate: financing.interestRate,
    termYears: financing.termYears
  });

  // Calculate Revenue
  const revenueCalculation = calculateRevenue({
    memberships: revenue.memberships || [{ priceMonth: 89, members: 150 }],
    rentals: revenue.rentals || [{ ratePerHr: 85, utilHoursPerWeek: 40 }],
    lessons: revenue.lessons || [{ coachCount: 2, hoursPerCoachWeek: 25, avgRatePerHr: 65, utilizationPct: 75 }],
    campsClinicsl: revenue.campsClinicsl || [{ sessionsPerYear: 12, avgPrice: 150, capacity: 20, fillRatePct: 80 }],
    leaguesTournaments: revenue.leaguesTournaments || [{ eventsPerYear: 6, teamsPerEvent: 8, avgTeamFee: 400, netMarginPct: 60 }],
    partiesEvents: revenue.partiesEvents || { annualRevenue: 24000 },
    merchandise: revenue.merchandise || { annualRevenue: 8000 },
    concessions: revenue.concessions || { annualRevenue: 12000 },
    sponsorships: revenue.sponsorships || { annualRevenue: 6000 }
  });

  // Add equipment and installation costs
  const equipmentData = allData[4] || {};
  const equipmentCost = equipmentData.equipmentCost || 0;
  const installationEstimate = equipmentData.installationEstimate || 0;
  const capexTotalWithEquipment = capExCalculation.total + equipmentCost + installationEstimate;

  // Calculate Profitability
  const profitabilityCalculation = calculateProfitability(
    capexTotalWithEquipment,
    revenueCalculation.total,
    opExCalculation.total,
    opExCalculation.debtServiceMonthly
  );

  const handleButtonClick = (action: 'email' | 'pdf' | 'consultation') => {
    // Check if lead data already exists
    const existingLeadData = allData[10];
    if (existingLeadData?.email) {
      // User already submitted contact info, proceed with action
      executeAction(action);
    } else {
      // Show lead gate first
      setPendingAction(action);
      setShowLeadGate(true);
    }
  };

  const executeAction = (action: 'email' | 'pdf' | 'consultation') => {
    switch (action) {
      case 'email':
        handleEmailReport();
        break;
      case 'pdf':
        handlePrintPDF();
        break;
      case 'consultation':
        handleScheduleConsultation();
        break;
    }
  };

  const handleEmailReport = async () => {
    // Get lead data from allData
    const leadInfo = allData[10] || {};
    
    if (!leadInfo.email || !leadInfo.name) {
      // If no lead info, open the lead gate and set pending action to email
      setPendingAction('email');
      setShowLeadGate(true);
      return;
    }

    try {
      // Build email payload with all available data
      const emailPayload = {
        customerEmail: leadInfo.email,
        customerName: leadInfo.name,
        leadData: {
          name: leadInfo.name,
          email: leadInfo.email,
          phone: leadInfo.phone || '',
          city: leadInfo.city || '',
          state: leadInfo.state || '',
          location: leadInfo.location || `${leadInfo.city || ''}, ${leadInfo.state || ''}`.trim(),
          allowOutreach: leadInfo.outreach === 'supplier_outreach',
        },
        facilityDetails: {
          projectType: projectBasics.projectName || 'Sports Facility',
          sports: projectBasics.selectedSports || [],
          size: facilityPlan.totalSqft ? `${facilityPlan.totalSqft} sq ft` : undefined,
          buildMode: facilityPlan.facilityType || 'build',
        },
        estimates: {
          totalInvestment: summaryData.totalInvestment,
          annualRevenue: summaryData.annualCashFlow,
          monthlyRevenue: summaryData.monthlyRevenue,
          roi: summaryData.roi,
          paybackPeriod: summaryData.paybackYears,
          breakEven: summaryData.breakEvenMonths,
        },
        source: 'full-calculator-email-action',
      };

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-lead-emails', {
        body: emailPayload,
      });

      if (error) {
        throw error;
      }

      // Show success feedback
      setEmailSent(true);
      toast({
        title: "Email Sent! ✓",
        description: `Full report sent to ${leadInfo.email}`,
      });
      
      setTimeout(() => setEmailSent(false), 3000);
      
    } catch (error) {
      console.error('Error sending email report:', error);
      toast({
        title: "Email Failed",
        description: "We couldn't send the email. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleScheduleConsultation = () => {
    window.open('https://practicesportsinc.setmore.com/', '_blank');
  };

  const handleLeadSubmit = async (leadData: any) => {
  // Save lead data under step 10 so email flow can reference it
  if (setDataForStep) {
    setDataForStep(10, { ...leadData });
  } else {
    onUpdate({ ...leadData });
  }
    
    // Dispatch to Make.com
    try {
      await dispatchLead({
        ...leadData,
        projectType: allData?.projectBasics?.projectName || 'Sports Facility',
        facilitySize: allData?.facilityPlan?.totalSquareFootage ? `${allData.facilityPlan.totalSquareFootage} sq ft` : undefined,
        sports: allData?.projectBasics?.selectedSports || [],
        buildMode: allData?.buildMode?.buildType,
        totalInvestment: data?.totalInvestment,
        annualRevenue: data?.projectedRevenue,
        roi: data?.roi,
        paybackPeriod: data?.paybackPeriod,
        source: 'full-calculator',
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
            projectType: allData?.projectBasics?.projectName || 'Sports Facility',
            sports: allData?.projectBasics?.selectedSports || [],
            size: allData?.facilityPlan?.totalSquareFootage ? `${allData.facilityPlan.totalSquareFootage} sq ft` : undefined,
            buildMode: allData?.buildMode?.buildType,
          },
          estimates: {
            totalInvestment: data?.totalInvestment,
            annualRevenue: data?.projectedRevenue,
            roi: data?.roi,
            paybackPeriod: data?.paybackPeriod,
          },
          source: 'full-calculator',
        },
      });
      console.log('Lead emails sent successfully');
    } catch (error) {
      console.error('Error sending lead emails:', error);
      // Don't block the user flow if email fails
    }
    
    // Execute the pending action without double-sending emails
    if (pendingAction === 'email') {
      setEmailSent(true);
      toast({
        title: "Email Sent! ✓",
        description: `Full report sent to ${leadData.email}`,
      });
      setTimeout(() => setEmailSent(false), 3000);
      setPendingAction(null);
    } else if (pendingAction === 'pdf') {
      handlePrintPDF();
      setPendingAction(null);
    } else if (pendingAction === 'consultation') {
      handleScheduleConsultation();
      setPendingAction(null);
    }
  };

  const summaryData = {
    totalInvestment: capexTotalWithEquipment,
    monthlyRevenue: revenueCalculation.total,
    monthlyExpenses: opExCalculation.total,
    monthlyCashFlow: profitabilityCalculation.netIncomeMonthly,
    annualCashFlow: profitabilityCalculation.netIncomeMonthly * 12,
    roi: profitabilityCalculation.roiYearOne,
    paybackYears: profitabilityCalculation.paybackMonths / 12,
    breakEvenMonths: profitabilityCalculation.breakEvenMonths,
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Facility Analysis Results</h2>
        <p className="text-muted-foreground">
          Comprehensive financial projections for {projectBasics.projectName || 'your sports facility'}
        </p>
      </div>

      {/* Next Steps Banner */}
      <NextStepsBanner 
        sourcingData={sourcingData}
        onSourcingUpdate={(newData) => onUpdate({ ...sourcingData, ...newData })}
      />

      {/* Value Legend */}
      <ValueLegend />

      {/* Key Metrics Dashboard */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <ValuePill 
                  value={summaryData.totalInvestment}
                  type="capex"
                  period="one-time"
                  className="text-xl font-bold"
                />
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cash Flow</p>
                <ValuePill 
                  value={summaryData.monthlyCashFlow}
                  type="net"
                  period="monthly"
                  className="text-xl font-bold"
                />
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annual ROI</p>
                <p className={`text-2xl font-bold ${summaryData.roi > 10 ? 'text-success' : summaryData.roi > 5 ? 'text-warning' : 'text-destructive'}`}>
                  {summaryData.roi.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payback Period</p>
                <p className="text-2xl font-bold">{summaryData.paybackYears.toFixed(1)} years</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="financial">Financial Details</TabsTrigger>
          <TabsTrigger value="timeline">Project Timeline</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Project Name:</span>
                    <span className="text-sm font-medium">{projectBasics.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm font-medium">{projectBasics.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sports:</span>
                    <span className="text-sm font-medium">{projectBasics.selectedSports?.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Facility Type:</span>
                    <span className="text-sm font-medium capitalize">{facilityPlan.facilityType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Program SF:</span>
                    <span className="text-sm font-medium">{spacePlanning.totalProgramSF.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gross SF (w/ circulation):</span>
                    <span className="text-sm font-medium">{spacePlanning.grossSF.toLocaleString()} sq ft</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Investment Required:</span>
                    <span className="text-sm font-bold">${summaryData.totalInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projected Monthly Revenue:</span>
                    <ValuePill value={summaryData.monthlyRevenue} type="revenue" period="monthly" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Operating Expenses:</span>
                    <ValuePill value={summaryData.monthlyExpenses} type="cost" period="monthly" />
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground">Net Monthly Cash Flow:</span>
                    <ValuePill value={summaryData.monthlyCashFlow} type="net" period="monthly" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Break-even:</span>
                    <span className="text-sm font-medium">
                      {typeof summaryData.breakEvenMonths === 'number' 
                        ? `${summaryData.breakEvenMonths.toFixed(0)} months` 
                        : summaryData.breakEvenMonths}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Investment Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success mb-1">
                    {summaryData.roi > 15 ? 'Strong' : summaryData.roi > 10 ? 'Good' : 'Moderate'}
                  </div>
                  <div className="text-sm text-muted-foreground">ROI Potential</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    ${(summaryData.annualCashFlow / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Annual Cash Flow</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {summaryData.paybackYears < 5 ? 'Fast' : summaryData.paybackYears < 8 ? 'Moderate' : 'Long-term'}
                  </div>
                  <div className="text-sm text-muted-foreground">Payback Timeline</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueCalculation.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.category}</span>
                      <span className="font-medium">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Monthly Revenue</span>
                    <span>${summaryData.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opExCalculation.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.category}</span>
                      <span className="font-medium">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Monthly Expenses</span>
                    <span>${summaryData.monthlyExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How This Was Calculated Accordion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                How This Was Calculated
              </CardTitle>
              <CardDescription>
                Detailed calculation steps and formulas used for all financial projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="space-planning">
                  <AccordionTrigger>Space Planning Calculations</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Total Program SF:</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {spacePlanning.breakdown.map((item, index) => (
                            <div key={index}>
                              {item.sport}: {item.units} units × {item.spacePer} sf/unit = {item.total.toLocaleString()} sf
                            </div>
                          ))}
                          <div className="font-medium pt-2 border-t">
                            Total Program SF = {spacePlanning.totalProgramSF.toLocaleString()} sf
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Gross SF Calculation:</h4>
                        <div className="text-sm text-muted-foreground">
                          Gross SF = Program SF × (1 + Circulation% + Admin%)<br/>
                          Gross SF = {spacePlanning.totalProgramSF.toLocaleString()} × (1 + {globalAssumptions.circulationPctAddon}% + {globalAssumptions.adminPctAddon}%)<br/>
                          Gross SF = {spacePlanning.grossSF.toLocaleString()} sf
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="capex">
                  <AccordionTrigger>CapEx Calculations ({facilityType.toUpperCase()})</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {capExCalculation.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{item.category}</div>
                            {item.calculation && (
                              <div className="text-sm text-muted-foreground">{item.calculation}</div>
                            )}
                          </div>
                          <div className="text-right font-medium">
                            ${item.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total CapEx</span>
                        <span>${capExCalculation.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="opex">
                  <AccordionTrigger>OpEx Calculations (Monthly)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {opExCalculation.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{item.category}</div>
                            {item.calculation && (
                              <div className="text-sm text-muted-foreground">{item.calculation}</div>
                            )}
                          </div>
                          <div className="text-right font-medium">
                            ${item.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total Monthly OpEx</span>
                        <span>${opExCalculation.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="revenue">
                  <AccordionTrigger>Revenue Calculations (Monthly)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {revenueCalculation.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{item.category}</div>
                            {item.calculation && (
                              <div className="text-sm text-muted-foreground">{item.calculation}</div>
                            )}
                          </div>
                          <div className="text-right font-medium">
                            ${item.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total Monthly Revenue</span>
                        <span>${revenueCalculation.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="profitability">
                  <AccordionTrigger>Profitability Calculations</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {profitabilityCalculation.calculations.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{item.metric}</div>
                            <div className="text-sm text-muted-foreground">{item.formula}</div>
                          </div>
                          <div className="text-right font-medium">
                            {typeof item.result === 'number' 
                              ? item.result.toLocaleString() 
                              : item.result}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Estimated phases from start to grand opening</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { phase: 'Planning & Design', duration: '2-4 months', description: 'Architectural plans, permits, financing' },
                  { phase: 'Site Preparation', duration: '1-2 months', description: 'Site work, utilities, foundation' },
                  { phase: 'Construction', duration: '4-8 months', description: 'Building construction and build-out' },
                  { phase: 'Equipment Installation', duration: '2-3 weeks', description: 'Sports equipment and technology setup' },
                  { phase: 'Pre-Opening', duration: '4-6 weeks', description: 'Staff hiring, marketing, soft opening' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{item.phase}</h3>
                        <span className="text-sm text-muted-foreground">{item.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h3 className="font-medium text-success mb-2">💰 Financial Strengths</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Strong projected ROI of {summaryData.roi.toFixed(1)}%</li>
                      <li>• Positive monthly cash flow from month 1</li>
                      <li>• Conservative membership projections leave room for upside</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h3 className="font-medium text-warning mb-2">⚠️ Areas to Consider</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Consider additional revenue streams (birthday parties, corporate events)</li>
                      <li>• Plan for seasonal variations in membership and usage</li>
                      <li>• Budget for first-year marketing to build membership base</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <h3 className="font-medium text-info mb-2">📈 Growth Opportunities</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Expand lesson programs during off-peak hours</li>
                      <li>• Develop tournament hosting capabilities</li>
                      <li>• Consider adding fitness/training programs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Get your detailed report and connect with our facility experts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="hero" 
              onClick={() => handleButtonClick('email')}
              disabled={emailSent}
            >
              <Mail className="h-4 w-4 mr-2" />
              {emailSent ? 'Report Sent!' : 'Email Full Report'}
            </Button>

            <Button variant="outline" onClick={() => handleButtonClick('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Download / Print PDF
            </Button>

            <Button variant="success" onClick={() => handleButtonClick('consultation')}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="hero" onClick={() => window.location.href = '/'}>
          Start New Calculation
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
        title={`Get Your ${pendingAction === 'email' ? 'Email Report' : pendingAction === 'pdf' ? 'PDF Report' : 'Consultation'}`}
        description="Enter your contact information to receive your detailed analysis report"
        showOptionalFields={false}
      />
    </div>
  );
};

export default Results;