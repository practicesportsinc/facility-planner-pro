import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const WizardResults = () => {
  const navigate = useNavigate();
  const [wizardResult, setWizardResult] = useState<WizardResult | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
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

    // Simplified calculations for wizard results
    const totalSqft = selectedSports.reduce((total: number, sport: string) => {
      return total + getSportSquareFootage(sport);
    }, 0) * 1.25; // Add 25% for circulation

    const capexTotal = buildMode === 'build' ? totalSqft * 200 : budget * 0.8;
    const monthlyRevenue = calculateMembershipRevenue(targetMarket, totalSqft) + 
                          (totalSqft * 0.5) + // Rental revenue
                          (selectedSports.length * 2000); // Lesson revenue
    const monthlyOpex = (totalSqft * 8) + // Operating costs per sq ft
                       (Math.floor(totalSqft / 5000) * 3000); // Staffing costs
    
    const monthlyProfit = monthlyRevenue - monthlyOpex;
    const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(capexTotal / monthlyProfit) : 999;

    setFinancialMetrics({
      space: { grossSF: totalSqft, totalProgramSF: totalSqft * 0.8 },
      capex: { total: capexTotal },
      opex: { 
        total: monthlyOpex,
        staffing: Math.floor(totalSqft / 5000) * 3000,
        fixedOperating: totalSqft * 8
      },
      revenue: { 
        total: monthlyRevenue,
        memberships: calculateMembershipRevenue(targetMarket, totalSqft),
        rentals: totalSqft * 0.5,
        lessons: selectedSports.length * 2000
      },
      profitability: { 
        breakEvenMonths,
        ebitda: monthlyProfit,
        roi: (monthlyProfit * 12 / capexTotal) * 100
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

  const handleUnlock = async () => {
    if (leadData.name && leadData.email && leadData.business && leadData.phone && wizardResult && financialMetrics) {
      try {
        await saveWizardSubmission({
          lead_name: leadData.name,
          lead_email: leadData.email,
          lead_business: leadData.business,
          lead_phone: leadData.phone,
          wizard_responses: wizardResult.responses,
          recommendations: wizardResult.recommendations,
          financial_metrics: financialMetrics
        });
        
        setIsUnlocked(true);
        toast.success("Thank you! Your financial projections have been unlocked.");
      } catch (error) {
        console.error('Error saving lead data:', error);
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
            onClick={() => navigate('/calculator')}
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

        {/* Facility Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Facility Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Facility Type</h3>
                <p className="text-lg">{wizardResult.recommendations.facilityType}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Recommended Size</h3>
                <p className="text-lg">{wizardResult.recommendations.suggestedSize.toLocaleString()} sq ft</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Sports Offered</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {wizardResult.recommendations.keyFeatures.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
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
              <p className="text-2xl font-bold">${(financialMetrics.capex.total / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Initial capital required</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-sm">Monthly Revenue</h3>
              </div>
              <p className="text-2xl font-bold">${(financialMetrics.revenue.total / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Projected monthly income</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-sm">Monthly OpEx</h3>
              </div>
              <p className="text-2xl font-bold">${(financialMetrics.opex.total / 1000).toFixed(0)}K</p>
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
                <span className="font-semibold">${(financialMetrics.revenue.memberships / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Revenue</span>
                <span className="font-semibold">${(financialMetrics.revenue.rentals / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between">
                <span>Lesson Revenue</span>
                <span className="font-semibold">${(financialMetrics.revenue.lessons / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between">
                <span>Other Revenue</span>
                <span className="font-semibold">${((financialMetrics.revenue.total - financialMetrics.revenue.memberships - financialMetrics.revenue.rentals - financialMetrics.revenue.lessons) / 1000).toFixed(1)}K</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Monthly Revenue</span>
                <span>${(financialMetrics.revenue.total / 1000).toFixed(1)}K</span>
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
                <span className="font-semibold">${(financialMetrics.opex.staffing / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between">
                <span>Fixed Operating</span>
                <span className="font-semibold">${(financialMetrics.opex.fixedOperating / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between">
                <span>Lease/Debt Service</span>
                <span className="font-semibold">$0K</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Monthly OpEx</span>
                <span>${(financialMetrics.opex.total / 1000).toFixed(1)}K</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/calculator?mode=wizard')}
            className="flex items-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Build Detailed Financial Model
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/calculator')}
            className="flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Customize My Plan
          </Button>
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          These are preliminary estimates based on your wizard responses. Use the detailed calculator for more precise projections.
        </div>
        </div>
      </div>
    </div>
  );
};

export default WizardResults;