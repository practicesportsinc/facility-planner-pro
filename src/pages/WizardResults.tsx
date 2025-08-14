import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Building, 
  Users, 
  MapPin,
  ArrowLeft,
  Edit
} from "lucide-react";
import { WizardResult } from "@/types/wizard";
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
  );
};

export default WizardResults;