import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenerateBusinessPlanButton from "@/components/GenerateBusinessPlanButton";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Building, 
  Users, 
  MapPin,
  ArrowLeft,
  Edit,
  Lock,
  Unlock,
  Target,
  Clock,
  CreditCard,
  Star
} from "lucide-react";
import { WizardResult } from "@/types/wizard";
import { WIZARD_QUESTIONS } from "@/data/wizardQuestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  calculateSpacePlanning,
  calculateCapExBuild,
  calculateOpEx,
  calculateRevenue,
  calculateProfitability
} from "@/utils/calculations";
import { formatCurrency } from "@/lib/utils";

const WizardResults = () => {
  const navigate = useNavigate();
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    business: '',
    phone: ''
  });

  useEffect(() => {
    const savedResult = localStorage.getItem('wizard-result');
    if (savedResult) {
      const result = JSON.parse(savedResult);
      setWizardResult(result);
      calculateFinancialMetrics(result);
    } else {
      navigate('/wizard');
    }
  }, [navigate]);

  const calculateFinancialMetrics = (result: WizardResult) => {
    const responses = result.responses.reduce((acc, response) => {
      acc[response.questionId] = response.value;
      return acc;
    }, {} as Record<string, any>);

    // Extract key data from wizard responses
    const selectedSports = Array.isArray(responses.primary_sport) ? responses.primary_sport : [responses.primary_sport];
    const facilitySize = responses.facility_size;
    const targetMarket = Array.isArray(responses.target_market) ? responses.target_market : [responses.target_market];
    const buildMode = responses.build_mode || 'build';
    const budget = responses.budget || 1000000;
    const productQuantities = responses.product_quantities || {};

    // Calculate detailed sport-by-sport breakdown
    const sportsBreakdown = selectedSports.filter(Boolean).map((sportId: string) => {
      const sportSqft = getSportSquareFootage(sportId);
      const constructionCost = sportSqft * 200; // $200 per sq ft
      const equipmentCost = sportSqft * 50; // $50 per sq ft for equipment
      const monthlyRevenue = sportSqft * 2; // $2 per sq ft monthly revenue
      const monthlyOpex = sportSqft * 0.8; // $0.80 per sq ft monthly operating costs
      
      return {
        sportId,
        squareFootage: sportSqft,
        constructionCost,
        equipmentCost,
        totalCost: constructionCost + equipmentCost,
        monthlyRevenue,
        monthlyOpex,
        monthlyProfit: monthlyRevenue - monthlyOpex
      };
    });

    // Calculate detailed equipment breakdown based on selections
    const equipmentBreakdown = generateEquipmentBreakdown(selectedSports, productQuantities, facilitySize);

    // Calculate totals
    const totalSqft = sportsBreakdown.reduce((sum, sport) => sum + sport.squareFootage, 0) * 1.25; // Add 25% for circulation
    const totalConstructionCost = sportsBreakdown.reduce((sum, sport) => sum + sport.constructionCost, 0) * 1.25;
    const equipment = sportsBreakdown.reduce((sum, sport) => sum + sport.equipmentCost, 0);
    const installation = Math.round(equipment * 0.3);
    const totalEquipment = equipment + installation;
    const capexTotal = totalConstructionCost + totalEquipment;
    
    const monthlyRevenue = calculateMembershipRevenue(targetMarket, totalSqft) + 
                          (totalSqft * 0.5) + // Rental revenue
                          (selectedSports.length * 2000); // Lesson revenue
    const monthlyOpex = (totalSqft * 8) + // Operating costs per sq ft
                       (Math.floor(totalSqft / 5000) * 3000); // Staffing costs
    
    const monthlyProfit = monthlyRevenue - monthlyOpex;
    const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(capexTotal / monthlyProfit) : 999;

    // Enhanced financial metrics with sport breakdown
    setFinancialMetrics({
      sportsBreakdown,
      equipmentBreakdown,
      space: { 
        grossSF: totalSqft, 
        totalProgramSF: totalSqft * 0.8,
        circulationSF: totalSqft * 0.2
      },
      capex: { 
        total: capexTotal,
        construction: totalConstructionCost,
        equipment: equipment,
        installation: installation,
        totalEquipment: totalEquipment,
        workingCapital: capexTotal * 0.1
      },
      opex: { 
        total: monthlyOpex,
        staffing: Math.floor(totalSqft / 5000) * 3000,
        fixedOperating: totalSqft * 8,
        utilities: totalSqft * 2,
        insurance: capexTotal * 0.002 / 12,
        maintenance: totalSqft * 1
      },
      revenue: { 
        total: monthlyRevenue,
        memberships: calculateMembershipRevenue(targetMarket, totalSqft),
        rentals: totalSqft * 0.5,
        lessons: selectedSports.length * 2000,
        events: totalSqft * 0.2,
        retail: totalSqft * 0.1
      },
      profitability: { 
        breakEvenMonths,
        ebitda: monthlyProfit,
        roi: (monthlyProfit * 12 / capexTotal) * 100,
        paybackPeriod: capexTotal / (monthlyProfit * 12)
      },
      marketAnalysis: {
        targetMarkets: targetMarket,
        competitiveAdvantage: selectedSports.length > 2 ? 'Multi-sport facility' : 'Specialized facility',
        marketPenetration: targetMarket.includes('youth_competitive') ? 'High' : 'Medium'
      }
    });
  };

  const getSportSquareFootage = (sport: string): number => {
    const sportSizes: Record<string, number> = {
      'baseball_softball': 3000,
      'basketball': 4000,
      'volleyball': 3500,
      'pickleball': 1500,
      'soccer': 6000,
      'football': 5500,
      'lacrosse': 5000,
      'tennis': 2800,
      'multi_sport': 4500,
      'fitness': 2000
    };
    return sportSizes[sport] || 3000;
  };

  const calculateMembershipRevenue = (targetMarket: string[], grossSqft: number): number => {
    const baseMembers = Math.floor(grossSqft / 100); // 1 member per 100 sq ft
    let avgMembershipPrice = 50;

    if (targetMarket.includes('adult_competitive') || targetMarket.includes('corporate')) {
      avgMembershipPrice = 80;
    } else if (targetMarket.includes('seniors')) {
      avgMembershipPrice = 40;
    }

    return baseMembers * avgMembershipPrice;
  };

  // Generate detailed equipment breakdown
  const generateEquipmentBreakdown = (sports: string[], quantities: any, facilitySize: string) => {
    const equipmentCategories: any = {
      'Courts & Playing Surfaces': [],
      'Protective Equipment': [],
      'Goals & Net Systems': [],
      'Lighting & Infrastructure': [],
      'Safety & Training': [],
      'Facility Infrastructure': []
    };

    // Sport-specific equipment based on selections
    sports.forEach(sport => {
      switch (sport) {
        case 'basketball':
          equipmentCategories['Courts & Playing Surfaces'].push(
            { item: 'Basketball Court Flooring', quantity: 2, unitCost: 8500, total: 17000, description: 'Professional hardwood flooring' }
          );
          equipmentCategories['Goals & Net Systems'].push(
            { item: 'Basketball Goals (Adjustable)', quantity: 4, unitCost: 1200, total: 4800, description: 'NCAA regulation goals' }
          );
          break;
        
        case 'volleyball':
          equipmentCategories['Courts & Playing Surfaces'].push(
            { item: 'Volleyball Court Flooring', quantity: 2, unitCost: 6500, total: 13000, description: 'Competition-grade flooring' }
          );
          equipmentCategories['Goals & Net Systems'].push(
            { item: 'Volleyball Net Systems', quantity: 4, unitCost: 450, total: 1800, description: 'Official height net systems' }
          );
          break;
        
        case 'baseball_softball':
          equipmentCategories['Protective Equipment'].push(
            { item: 'Batting Cage Netting', quantity: 4, unitCost: 2800, total: 11200, description: '70\' x 15\' protective netting' },
            { item: 'Pitching Machines', quantity: 2, unitCost: 3500, total: 7000, description: 'Multi-speed pitching machines' }
          );
          break;
        
        case 'soccer':
          equipmentCategories['Courts & Playing Surfaces'].push(
            { item: 'Artificial Turf System', quantity: 1, unitCost: 45000, total: 45000, description: '6000 sq ft turf installation' }
          );
          equipmentCategories['Goals & Net Systems'].push(
            { item: 'Soccer Goals', quantity: 4, unitCost: 800, total: 3200, description: 'Regulation size goals' }
          );
          break;
        
        case 'pickleball':
          equipmentCategories['Courts & Playing Surfaces'].push(
            { item: 'Pickleball Court Surface', quantity: 4, unitCost: 3500, total: 14000, description: 'Non-slip court surface' }
          );
          equipmentCategories['Goals & Net Systems'].push(
            { item: 'Pickleball Net Systems', quantity: 4, unitCost: 250, total: 1000, description: 'Portable net systems' }
          );
          break;
      }
    });

    // Common facility equipment based on size
    const baseEquipment = [
      { category: 'Lighting & Infrastructure', item: 'LED Sports Lighting', quantity: 20, unitCost: 450, total: 9000, description: 'Energy-efficient LED fixtures' },
      { category: 'Safety & Training', item: 'First Aid Stations', quantity: 2, unitCost: 350, total: 700, description: 'Fully stocked first aid stations' },
      { category: 'Facility Infrastructure', item: 'Sound System', quantity: 1, unitCost: 8500, total: 8500, description: 'Facility-wide audio system' },
      { category: 'Facility Infrastructure', item: 'HVAC Equipment', quantity: 1, unitCost: 25000, total: 25000, description: 'Climate control system' },
      { category: 'Safety & Training', item: 'Storage Systems', quantity: 1, unitCost: 4500, total: 4500, description: 'Equipment storage solutions' }
    ];

    baseEquipment.forEach(item => {
      equipmentCategories[item.category].push({
        item: item.item,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: item.total,
        description: item.description
      });
    });

    // Calculate category totals
    Object.keys(equipmentCategories).forEach(category => {
      const categoryTotal = equipmentCategories[category].reduce((sum: number, item: any) => sum + item.total, 0);
      equipmentCategories[category].categoryTotal = categoryTotal;
    });

    return equipmentCategories;
  };

  const generateLocalSummary = (financialMetrics: any, wizardData: any) => {
    const totalInvestment = financialMetrics.capex?.total || 0;
    const monthlyRevenue = financialMetrics.revenue?.total || 0;
    const monthlyOpex = financialMetrics.opex?.total || 0;
    const monthlyProfit = monthlyRevenue - monthlyOpex;
    const roi = financialMetrics.profitability?.roi || 0;
    const breakEven = financialMetrics.profitability?.breakEvenMonths || 0;
    
    const isViable = roi > 15 && breakEven < 60;
    const profitStatus = monthlyProfit > 0 ? "positive" : "negative";
    
    return `**Financial Viability Analysis**

This ${wizardData.facilitySize?.toUpperCase() || 'large'} multi-sport facility targeting ${wizardData.targetMarket?.join(' and ') || 'families and competitive athletes'} shows ${isViable ? 'strong' : 'challenging'} financial projections. With a total investment of ${formatCurrency(totalInvestment)}, the facility is projected to generate ${formatCurrency(monthlyRevenue)} in monthly revenue across ${wizardData.selectedSports?.join(', ') || 'volleyball and soccer'} programs.

**Operational Performance**

Monthly operating expenses are projected at ${formatCurrency(monthlyOpex)}, resulting in ${profitStatus} monthly cash flow of ${formatCurrency(Math.abs(monthlyProfit))}. The facility's ${formatCurrency(financialMetrics.space?.grossSF || 0).replace('$', '')} square feet provides ample space for the selected sports, with strong revenue potential from memberships (${formatCurrency(financialMetrics.revenue?.memberships || 0)}/month) and program offerings.

**Risk Assessment & Market Position**

${roi > 20 ? 'The projected ROI of ' + roi.toFixed(1) + '% indicates excellent investment potential.' : roi > 10 ? 'The projected ROI of ' + roi.toFixed(1) + '% shows moderate investment returns.' : 'The projected ROI of ' + roi.toFixed(1) + '% suggests financial challenges that need addressing.'} ${breakEven < 36 ? 'Break-even timing of ' + breakEven + ' months is favorable for this market segment.' : 'Break-even projections require careful cash flow management and strong marketing execution.'} Key success factors include effective membership acquisition, optimal facility utilization, and competitive programming for ${wizardData.targetMarket?.join(' and ') || 'your target demographics'}.

**Strategic Recommendations**

${monthlyProfit > 0 ? 'Focus on maximizing high-margin revenue streams and building strong community partnerships.' : 'Consider optimizing the revenue mix through additional programming, corporate partnerships, and operational efficiency improvements.'} ${wizardData.timeline === 'long_term' ? 'Your long-term timeline provides opportunity for market development and phased expansion.' : 'Accelerated timeline requires strong pre-opening marketing and immediate revenue generation strategies.'} Monitor key performance indicators including membership retention, facility utilization rates, and program profitability to ensure sustainable growth.`;
  };

  const generateAISummary = async () => {
    if (!wizardResult || !financialMetrics) return;
    
    setIsGeneratingSummary(true);
    
    try {
      const responses = wizardResult.responses.reduce((acc, response) => {
        acc[response.questionId] = response.value;
        return acc;
      }, {} as Record<string, any>);
      
      const wizardData = {
        selectedSports: Array.isArray(responses.primary_sport) ? responses.primary_sport : [responses.primary_sport],
        facilitySize: responses.facility_size,
        targetMarket: Array.isArray(responses.target_market) ? responses.target_market : [responses.target_market],
        budget: responses.budget_range,
        timeline: responses.timeline,
        businessModel: wizardResult.recommendations.businessModel
      };

      // Try OpenAI first, fallback to local generation
      try {
        const { data, error } = await supabase.functions.invoke('generate-financial-summary', {
          body: {
            financialMetrics,
            wizardData
          }
        });

        if (error || data?.error) {
          throw new Error(data?.error || error?.message || 'OpenAI API unavailable');
        }
        
        setAiSummary(data.summary);
        toast.success("AI summary generated successfully!");
      } catch (openaiError) {
        console.log('OpenAI unavailable, using local summary generation:', openaiError);
        
        // Generate local summary
        const localSummary = generateLocalSummary(financialMetrics, wizardData);
        setAiSummary(localSummary);
        toast.success("Financial summary generated successfully!");
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleUnlock = async () => {
    if (leadData.name && leadData.email && leadData.business && leadData.phone && wizardResult && financialMetrics) {
      try {
        // Extract comprehensive data from wizard responses
        const responses = wizardResult.responses.reduce((acc, response) => {
          acc[response.questionId] = response.value;
          return acc;
        }, {} as Record<string, any>);

        // Prepare comprehensive submission data
        const submissionData = {
          lead_name: leadData.name,
          lead_email: leadData.email,
          lead_business: leadData.business,
          lead_phone: leadData.phone,
          wizard_responses: wizardResult.responses,
          recommendations: wizardResult.recommendations,
          financial_metrics: financialMetrics,
          
          // Individual response fields for easier querying
          facility_size: responses.facility_size,
          location_type: responses.location_type,
          target_market: responses.target_market,
          revenue_model: responses.revenue_model,
          selected_sports: responses.primary_sport,
          timeline: responses.timeline,
          amenities: responses.amenities,
          operating_hours: responses.operating_hours,
          experience_level: responses.experience_level,
          
          // Financial summary fields
          sports_breakdown: financialMetrics.sportsBreakdown,
          total_square_footage: Math.round(financialMetrics.space.grossSF),
          total_investment: financialMetrics.capex.total,
          monthly_revenue: financialMetrics.revenue.total,
          monthly_opex: financialMetrics.opex.total,
          break_even_months: financialMetrics.profitability.breakEvenMonths,
          roi_percentage: financialMetrics.profitability.roi,
          facility_type: wizardResult.recommendations.facilityType,
          business_model: wizardResult.recommendations.businessModel
        };

        const { error } = await (supabase as any)
          .from('wizard_submissions')
          .insert(submissionData);
        
        if (error) throw error;
        
        setIsUnlocked(true);
        toast.success("Thank you! Your comprehensive facility analysis has been saved and unlocked.");
      } catch (error) {
        console.error('Error saving comprehensive wizard data:', error);
        toast.error("There was an error processing your request. Please try again.");
      }
    }
  };

  const isFormValid = leadData.name && leadData.email && leadData.business && leadData.phone;

  if (!wizardResult || !financialMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Calculating your financial projections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/wizard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Wizard
          </Button>
          <h1 className="text-3xl font-bold">Your Financial Projections</h1>
          <Button 
            onClick={() => navigate('/calculator?mode=wizard')}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Customize Plan
          </Button>
        </div>

        {/* Lead Capture Gate */}
        {!isUnlocked && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Unlock Your Financial Projections
                </CardTitle>
                <p className="text-muted-foreground">
                  Get instant access to your personalized facility financial analysis
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={leadData.name}
                    onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={leadData.email}
                    onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business">Business Name</Label>
                  <Input
                    id="business"
                    value={leadData.business}
                    onChange={(e) => setLeadData({...leadData, business: e.target.value})}
                    placeholder="Enter your business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                <Button 
                  onClick={handleUnlock}
                  disabled={!isFormValid}
                  className="w-full flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Unlock Financial Projections
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Content with Conditional Blur */}
        <div className={!isUnlocked ? "blur-sm pointer-events-none" : ""}>

        {/* Comprehensive Wizard Selections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Selected Sports */}
          {(() => {
            const sportsResponse = wizardResult.responses.find(r => r.questionId === 'primary_sport');
            const selectedSports = Array.isArray(sportsResponse?.value) ? sportsResponse.value : [sportsResponse?.value];
            const sportsQuestion = WIZARD_QUESTIONS.find(q => q.id === 'primary_sport');
            
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Selected Sports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedSports.filter(Boolean).map((sportId: string) => {
                    const sport = sportsQuestion?.options?.find(opt => opt.id === sportId);
                    return sport ? (
                      <div key={sportId} className="flex items-center gap-2">
                        <span className="text-lg">{sport.icon}</span>
                        <span className="font-medium">{sport.label}</span>
                      </div>
                    ) : null;
                  })}
                </CardContent>
              </Card>
            );
          })()}

          {/* Target Market */}
          {(() => {
            const marketResponse = wizardResult.responses.find(r => r.questionId === 'target_market');
            const selectedMarkets = Array.isArray(marketResponse?.value) ? marketResponse.value : [marketResponse?.value];
            const marketQuestion = WIZARD_QUESTIONS.find(q => q.id === 'target_market');
            
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Target Market
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedMarkets.filter(Boolean).map((marketId: string) => {
                    const market = marketQuestion?.options?.find(opt => opt.id === marketId);
                    return market ? (
                      <Badge key={marketId} variant="secondary" className="mr-1 mb-1">
                        {market.label}
                      </Badge>
                    ) : null;
                  })}
                </CardContent>
              </Card>
            );
          })()}

          {/* Revenue Model */}
          {(() => {
            const revenueResponse = wizardResult.responses.find(r => r.questionId === 'revenue_model');
            const selectedRevenue = Array.isArray(revenueResponse?.value) ? revenueResponse.value : [revenueResponse?.value];
            const revenueQuestion = WIZARD_QUESTIONS.find(q => q.id === 'revenue_model');
            
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Revenue Streams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedRevenue.filter(Boolean).map((revenueId: string) => {
                    const revenue = revenueQuestion?.options?.find(opt => opt.id === revenueId);
                    return revenue ? (
                      <div key={revenueId} className="flex items-center justify-between">
                        <span className="text-sm">{revenue.label}</span>
                        {revenue.recommended && <Star className="w-3 h-3 text-yellow-500" />}
                      </div>
                    ) : null;
                  })}
                </CardContent>
              </Card>
            );
          })()}

          {/* Additional Selections */}
          {(() => {
            const facilitySize = wizardResult.responses.find(r => r.questionId === 'facility_size');
            const locationType = wizardResult.responses.find(r => r.questionId === 'location_type');
            const timeline = wizardResult.responses.find(r => r.questionId === 'timeline');
            const budget = wizardResult.responses.find(r => r.questionId === 'budget_range');
            
            const sizeQuestion = WIZARD_QUESTIONS.find(q => q.id === 'facility_size');
            const locationQuestion = WIZARD_QUESTIONS.find(q => q.id === 'location_type');
            const timelineQuestion = WIZARD_QUESTIONS.find(q => q.id === 'timeline');
            const budgetQuestion = WIZARD_QUESTIONS.find(q => q.id === 'budget_range');
            
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Facility Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {facilitySize?.value && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Size:</span>
                      <p className="text-sm">{sizeQuestion?.options?.find(opt => opt.id === facilitySize.value)?.label}</p>
                    </div>
                  )}
                  {locationType?.value && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Location:</span>
                      <p className="text-sm">{locationQuestion?.options?.find(opt => opt.id === locationType.value)?.label}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {/* Timeline & Budget */}
          {(() => {
            const timeline = wizardResult.responses.find(r => r.questionId === 'timeline');
            const budget = wizardResult.responses.find(r => r.questionId === 'budget_range');
            
            const timelineQuestion = WIZARD_QUESTIONS.find(q => q.id === 'timeline');
            const budgetQuestion = WIZARD_QUESTIONS.find(q => q.id === 'budget_range');
            
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Timeline & Budget
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {timeline?.value && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Timeline:</span>
                      <p className="text-sm">{timelineQuestion?.options?.find(opt => opt.id === timeline.value)?.label}</p>
                    </div>
                  )}
                  {budget?.value && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Budget:</span>
                      <p className="text-sm">{budgetQuestion?.options?.find(opt => opt.id === budget.value)?.label}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {/* Amenities */}
          {(() => {
            const amenitiesResponse = wizardResult.responses.find(r => r.questionId === 'amenities');
            const selectedAmenities = Array.isArray(amenitiesResponse?.value) ? amenitiesResponse.value : [amenitiesResponse?.value];
            const amenitiesQuestion = WIZARD_QUESTIONS.find(q => q.id === 'amenities');
            
            if (!selectedAmenities.filter(Boolean).length) return null;
            
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Selected Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {selectedAmenities.filter(Boolean).map((amenityId: string) => {
                    const amenity = amenitiesQuestion?.options?.find(opt => opt.id === amenityId);
                    return amenity ? (
                      <div key={amenityId} className="text-sm">
                        • {amenity.label}
                      </div>
                    ) : null;
                  })}
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* Sports & Facility Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building className="w-6 h-6 text-primary" />
              Sports & Facility Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Individual Sport Analysis */}
            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-lg">Sport-by-Sport Financial Analysis</h4>
              <div className="grid gap-4">
                {financialMetrics.sportsBreakdown?.map((sportData: any) => {
                  const sportsQuestion = WIZARD_QUESTIONS.find(q => q.id === 'primary_sport');
                  const sport = sportsQuestion?.options?.find(opt => opt.id === sportData.sportId);
                  
                  return sport ? (
                    <Card key={sportData.sportId} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{sport.icon}</span>
                          <div>
                            <h5 className="font-bold text-xl">{sport.label}</h5>
                            <p className="text-sm text-muted-foreground">{sport.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {(sportData.squareFootage / 1000).toFixed(1)}K sq ft
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(sportData.constructionCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">Construction</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(sportData.equipmentCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">Equipment</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {formatCurrency(sportData.monthlyRevenue)}
                          </div>
                          <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">
                            {formatCurrency(sportData.monthlyProfit)}
                          </div>
                          <div className="text-xs text-muted-foreground">Monthly Profit</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Investment for {sport.label}:</span>
                          <span className="font-bold text-lg text-primary">
                            {formatCurrency(sportData.totalCost)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ) : null;
                })}
              </div>
            </div>

            {/* Facility Summary */}
            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{(financialMetrics.space.grossSF / 1000).toFixed(1)}K</div>
                <div className="text-sm text-muted-foreground">Total Square Feet</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wizardResult.recommendations.estimatedCapacity}</div>
                <div className="text-sm text-muted-foreground">Courts/Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{wizardResult.recommendations.facilityType}</div>
                <div className="text-sm text-muted-foreground">Facility Type</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Breakdown Section */}
        {financialMetrics.equipmentBreakdown && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Equipment Selections & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Detailed breakdown of equipment selections and estimated pricing based on your facility requirements.
              </p>
              
              <div className="space-y-6">
                {Object.entries(financialMetrics.equipmentBreakdown).map(([categoryName, items]: [string, any]) => {
                  if (!Array.isArray(items) || items.length === 0) return null;
                  
                  return (
                    <div key={categoryName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">{categoryName}</h4>
                        <Badge variant="outline" className="text-sm">
                          {formatCurrency((items as any).categoryTotal || items.reduce((sum: number, item: any) => sum + item.total, 0))}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {items.map((item: any, index: number) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-muted/30 rounded-lg border">
                            <div className="md:col-span-2">
                              <div className="font-medium">{item.item}</div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">{formatCurrency(item.unitCost)}</div>
                              <div className="text-xs text-muted-foreground">per unit</div>
                            </div>
                            <div className="md:col-span-2 text-right">
                              <div className="text-lg font-bold text-primary">{formatCurrency(item.total)}</div>
                              <div className="text-xs text-muted-foreground">total cost</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Equipment Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(Object.values(financialMetrics.equipmentBreakdown)
                        .filter((category: any) => Array.isArray(category))
                        .reduce((total: number, category: any[]) => 
                          total + category.reduce((sum: number, item: any) => sum + (item.total || 0), 0), 0
                        ))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Equipment Investment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(financialMetrics.equipmentBreakdown).reduce((total: number, category: any) => 
                        total + (Array.isArray(category) ? category.length : 0), 0
                      ).toString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Equipment Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(financialMetrics.equipmentBreakdown).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Equipment Categories</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Equipment pricing is estimated based on industry standards. 
                  Final costs may vary based on vendors, quality specifications, and installation requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget & Investment Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Budget & Investment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const budgetResponse = wizardResult.responses.find(r => r.questionId === 'budget_range');
              const budgetQuestion = WIZARD_QUESTIONS.find(q => q.id === 'budget_range');
              const selectedBudget = budgetQuestion?.options?.find(opt => opt.id === budgetResponse?.value);
              
              return (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Your Budget Target</h4>
                    <div className="p-4 bg-primary/10 rounded-lg mb-4">
                      <div className="text-lg font-bold text-primary">{selectedBudget?.label || 'Not specified'}</div>
                      <div className="text-sm text-muted-foreground">{selectedBudget?.description || ''}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Layout:</strong> {wizardResult.recommendations.layout}<br />
                      <strong>Business Model:</strong> {wizardResult.recommendations.businessModel}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Projected Investment Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Construction/Build-out</span>
                        <span className="font-semibold">{formatCurrency(financialMetrics.capex.total * 0.7)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Equipment & Fixtures</span>
                        <span className="font-semibold">{formatCurrency(financialMetrics.capex.total * 0.2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Working Capital</span>
                        <span className="font-semibold">{formatCurrency(financialMetrics.capex.total * 0.1)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Investment</span>
                        <span className="text-primary">{formatCurrency(financialMetrics.capex.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Key Financial Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-sm">Total Investment</h3>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(financialMetrics.capex.total)}</p>
              <p className="text-xs text-muted-foreground">Initial capital required</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-sm">Monthly Revenue</h3>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(financialMetrics.revenue.total)}</p>
              <p className="text-xs text-muted-foreground">Projected monthly income</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-sm">Monthly OpEx</h3>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(financialMetrics.opex.total)}</p>
              <p className="text-xs text-muted-foreground">Operating expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-sm">Break-Even</h3>
              </div>
              <p className="text-2xl font-bold">{financialMetrics.profitability.breakEvenMonths}</p>
              <p className="text-xs text-muted-foreground">Months to profitability</p>
            </CardContent>
          </Card>
        </div>

        {/* Products of Interest Section */}
        {wizardResult.recommendations.productsOfInterest && wizardResult.recommendations.productsOfInterest.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Products of Interest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Based on your responses, you've expressed interest in the following products and equipment:
              </p>
              
              {/* Product Estimates Grid */}
              {wizardResult.recommendations.productEstimates && wizardResult.recommendations.productEstimates.length > 0 ? (
                <div className="space-y-4 mb-4">
                  <h4 className="font-semibold text-lg">Budget Estimates</h4>
                  <div className="grid gap-3">
                    {wizardResult.recommendations.productEstimates.map((estimate) => {
                      const productLabels: Record<string, string> = {
                        'turf': 'Artificial Turf Systems',
                        'nets_cages': 'Protective Netting & Batting Cages',
                        'hoops': 'Basketball Goals & Systems',
                        'volleyball': 'Volleyball Net Systems & Equipment',
                        'lighting': 'LED Sports Lighting Systems',
                        'hvac': 'Climate Control Systems',
                        'court_flooring': 'Sport Court & Hardwood Flooring',
                        'rubber_flooring': 'Rubber Fitness & Safety Flooring',
                        'machines': 'Fitness & Training Equipment',
                        'pickleball': 'Pickleball Courts & Equipment',
                        'divider_curtains': 'Court Separation Systems',
                        'other': 'Custom or Specialty Products'
                      };
                      
                      return (
                        <div key={estimate.product} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border">
                          <div>
                            <div className="font-medium">
                              {productLabels[estimate.product] || estimate.product.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="text-sm text-muted-foreground">{estimate.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{formatCurrency(estimate.estimatedCost)}</div>
                            <div className="text-xs text-muted-foreground">Est. cost</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Total Estimate */}
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <div className="font-semibold text-lg">Total Equipment Investment</div>
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(wizardResult.recommendations.productEstimates.reduce((sum, est) => sum + est.estimatedCost, 0))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {wizardResult.recommendations.productsOfInterest?.map((product) => {
                    const productLabels: Record<string, string> = {
                      'turf': 'Artificial Turf Systems',
                      'nets_cages': 'Protective Netting & Batting Cages',
                      'hoops': 'Basketball Goals & Systems',
                      'volleyball': 'Volleyball Net Systems & Equipment',
                      'lighting': 'LED Sports Lighting Systems',
                      'hvac': 'Climate Control Systems',
                      'court_flooring': 'Sport Court & Hardwood Flooring',
                      'rubber_flooring': 'Rubber Fitness & Safety Flooring',
                      'machines': 'Fitness & Training Equipment',
                      'pickleball': 'Pickleball Courts & Equipment',
                      'divider_curtains': 'Court Separation Systems',
                      'other': 'Custom or Specialty Products'
                    };
                    
                    return (
                      <Badge key={product} variant="secondary" className="justify-start p-3 h-auto">
                        {productLabels[product] || product.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    );
                  })}
                </div>
              )}
              
              {/* Vendor Quotes Preference */}
              {wizardResult.recommendations.vendorQuotesHelp && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold mb-2">Vendor Quote Preference:</h4>
                  <p className="text-sm text-blue-800">
                    {wizardResult.recommendations.vendorQuotesHelp === 'yes_help' 
                      ? "✅ You've requested help getting discounted quotes from vetted suppliers. We'll connect you with competitive vendors."
                      : "✅ You prefer to source vendors independently. We respect your procurement process."
                    }
                  </p>
                </div>
              )}
              {wizardResult.recommendations.customProducts && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Additional Requirements:</h4>
                  <p className="text-sm text-muted-foreground">{wizardResult.recommendations.customProducts}</p>
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> Contact suppliers for detailed quotes on these items to refine your budget and timeline.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Membership Revenue</span>
                <span className="font-semibold">{formatCurrency(financialMetrics.revenue.memberships)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Revenue</span>
                <span className="font-semibold">{formatCurrency(financialMetrics.revenue.rentals)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lesson Revenue</span>
                <span className="font-semibold">{formatCurrency(financialMetrics.revenue.lessons)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Revenue</span>
                <span className="font-semibold">{formatCurrency(financialMetrics.revenue.total - financialMetrics.revenue.memberships - financialMetrics.revenue.rentals - financialMetrics.revenue.lessons)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Monthly Revenue</span>
                <span>{formatCurrency(financialMetrics.revenue.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* OpEx Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operating Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Staffing Costs</span>
                <span className="font-semibold">{formatCurrency(financialMetrics.opex.staffing)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fixed Operating</span>
                <span className="font-semibold">{formatCurrency(financialMetrics.opex.fixedOperating)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lease/Debt Service</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Monthly OpEx</span>
                <span>{formatCurrency(financialMetrics.opex.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Business Plan and Download Report Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <GenerateBusinessPlanButton
            getProject={() => ({
              responses: wizardResult.responses,
              financialMetrics,
              recommendations: wizardResult.recommendations,
              leadData // Include the lead data from the unlock step
            })}
            includeImages={true}
            variant="default"
            size="lg"
            className="bg-green-600 hover:bg-white hover:text-green-600 border-green-600 hover:border-green-600 text-white transition-all duration-200"
            onStart={() => toast.info("Preparing business plan...")}
            onDone={(success) => {
              if (!success) {
                toast.error("Failed to generate business plan");
              }
            }}
          />
          <Button 
            variant="default"
            size="lg"
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-white hover:text-green-600 border-green-600 hover:border-green-600 text-white transition-all duration-200 flex items-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Save / Download Report
          </Button>
        </div>

        {/* Customize Plan Button */}
        <div className="flex justify-center mt-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/calculator?mode=wizard')}
            className="flex items-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Customize This Plan
          </Button>
        </div>

        {/* AI Generated Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              AI Financial Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!aiSummary ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Get an AI-powered professional analysis of your financial projections
                </p>
                <Button 
                  onClick={generateAISummary} 
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-2"
                >
                  {isGeneratingSummary ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {aiSummary}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateAISummary}
                    disabled={isGeneratingSummary}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Star className="w-3 h-3" />
                        Regenerate Summary
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          These are preliminary estimates based on your wizard responses. Use the detailed calculator for more precise projections.
        </div>
        </div>
      </div>
    </div>
  );
};

export default WizardResults;