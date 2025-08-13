import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface SensitivityProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const Sensitivity = ({ data, onUpdate, onNext, onPrevious, allData }: SensitivityProps) => {
  const [formData, setFormData] = useState({
    constructionCostVariation: data.constructionCostVariation || [0],
    revenueVariation: data.revenueVariation || [0],
    operatingCostVariation: data.operatingCostVariation || [0],
    membershipUtilization: data.membershipUtilization || [0],
    seasonalityFactor: data.seasonalityFactor || [0],
    ...data
  });

  const handleSliderChange = (field: string, value: number[]) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  // Base values from previous steps (simplified for demo)
  const baseConstructionCost = 1500000;
  const baseMonthlyRevenue = 45000;
  const baseMonthlyOperating = 32000;
  const baseMembership = 325;

  // Calculate adjusted values
  const adjustedConstructionCost = baseConstructionCost * (1 + formData.constructionCostVariation[0] / 100);
  const adjustedMonthlyRevenue = baseMonthlyRevenue * (1 + formData.revenueVariation[0] / 100);
  const adjustedMonthlyOperating = baseMonthlyOperating * (1 + formData.operatingCostVariation[0] / 100);
  const adjustedMembership = baseMembership * (1 + formData.membershipUtilization[0] / 100);

  const adjustedMonthlyCashFlow = adjustedMonthlyRevenue - adjustedMonthlyOperating;
  const adjustedAnnualCashFlow = adjustedMonthlyCashFlow * 12;

  // ROI calculation
  const adjustedROI = adjustedAnnualCashFlow / adjustedConstructionCost * 100;

  const scenarios = [
    {
      name: "Conservative",
      construction: -10,
      revenue: -15,
      operating: 10,
      membership: -20,
      color: "text-destructive",
    },
    {
      name: "Most Likely",
      construction: 0,
      revenue: 0,
      operating: 0,
      membership: 0,
      color: "text-primary",
    },
    {
      name: "Optimistic",
      construction: 5,
      revenue: 20,
      operating: -5,
      membership: 25,
      color: "text-success",
    }
  ];

  const calculateScenario = (scenario: any) => {
    const scenarioConstruction = baseConstructionCost * (1 + scenario.construction / 100);
    const scenarioRevenue = baseMonthlyRevenue * (1 + scenario.revenue / 100);
    const scenarioOperating = baseMonthlyOperating * (1 + scenario.operating / 100);
    const scenarioCashFlow = (scenarioRevenue - scenarioOperating) * 12;
    const scenarioROI = scenarioCashFlow / scenarioConstruction * 100;
    
    return {
      annualCashFlow: scenarioCashFlow,
      roi: scenarioROI,
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Sensitivity Analysis</h2>
        <p className="text-muted-foreground">
          Test how changes in key variables affect your project's financial performance
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Construction Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-warning" />
                Construction Cost Variation
              </CardTitle>
              <CardDescription>How much might construction costs vary from estimates?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>-20% (Best Case)</span>
                  <span className="font-medium">{formData.constructionCostVariation[0]}%</span>
                  <span>+30% (Worst Case)</span>
                </div>
                <Slider
                  value={formData.constructionCostVariation}
                  onValueChange={(value) => handleSliderChange('constructionCostVariation', value)}
                  min={-20}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Adjusted Construction Cost</div>
                  <div className="text-xl font-bold">
                    ${adjustedConstructionCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Variation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-success" />
                Revenue Performance
              </CardTitle>
              <CardDescription>How might actual revenue compare to projections?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>-25% (Conservative)</span>
                  <span className="font-medium">{formData.revenueVariation[0]}%</span>
                  <span>+25% (Optimistic)</span>
                </div>
                <Slider
                  value={formData.revenueVariation}
                  onValueChange={(value) => handleSliderChange('revenueVariation', value)}
                  min={-25}
                  max={25}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Adjusted Monthly Revenue</div>
                  <div className="text-xl font-bold">
                    ${adjustedMonthlyRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-destructive" />
                Operating Cost Efficiency
              </CardTitle>
              <CardDescription>How efficient will your operations be?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>-10% (Very Efficient)</span>
                  <span className="font-medium">{formData.operatingCostVariation[0]}%</span>
                  <span>+20% (Higher Costs)</span>
                </div>
                <Slider
                  value={formData.operatingCostVariation}
                  onValueChange={(value) => handleSliderChange('operatingCostVariation', value)}
                  min={-10}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Adjusted Monthly Operating Cost</div>
                  <div className="text-xl font-bold">
                    ${adjustedMonthlyOperating.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Utilization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-info" />
                Membership Achievement
              </CardTitle>
              <CardDescription>How close to target membership will you achieve?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>-30% (Slow Start)</span>
                  <span className="font-medium">{formData.membershipUtilization[0]}%</span>
                  <span>+30% (Exceed Target)</span>
                </div>
                <Slider
                  value={formData.membershipUtilization}
                  onValueChange={(value) => handleSliderChange('membershipUtilization', value)}
                  min={-30}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Adjusted Member Count</div>
                  <div className="text-xl font-bold">
                    {Math.round(adjustedMembership)} members
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Scenario Results */}
          <Card>
            <CardHeader>
              <CardTitle>Current Scenario Results</CardTitle>
              <CardDescription>Financial performance with your current adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Monthly Cash Flow</div>
                  <div className={`text-xl font-bold ${adjustedMonthlyCashFlow > 0 ? 'text-success' : 'text-destructive'}`}>
                    ${adjustedMonthlyCashFlow.toLocaleString()}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Annual Cash Flow</div>
                  <div className={`text-xl font-bold ${adjustedAnnualCashFlow > 0 ? 'text-success' : 'text-destructive'}`}>
                    ${adjustedAnnualCashFlow.toLocaleString()}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">ROI</div>
                  <div className={`text-xl font-bold ${adjustedROI > 10 ? 'text-success' : adjustedROI > 5 ? 'text-warning' : 'text-destructive'}`}>
                    {adjustedROI.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>Compare three potential outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {scenarios.map((scenario) => {
                  const results = calculateScenario(scenario);
                  return (
                    <div key={scenario.name} className="p-4 border rounded-lg">
                      <h3 className={`font-semibold mb-2 ${scenario.color}`}>
                        {scenario.name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Construction:</span>
                          <span>{scenario.construction > 0 ? '+' : ''}{scenario.construction}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span>{scenario.revenue > 0 ? '+' : ''}{scenario.revenue}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operating:</span>
                          <span>{scenario.operating > 0 ? '+' : ''}{scenario.operating}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Membership:</span>
                          <span>{scenario.membership > 0 ? '+' : ''}{scenario.membership}%</span>
                        </div>
                      </div>
                      <div className="border-t mt-3 pt-3">
                        <div className="flex justify-between text-sm">
                          <span>Annual Cash Flow:</span>
                          <span className="font-medium">
                            ${results.annualCashFlow.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>ROI:</span>
                          <span className="font-medium">
                            {results.roi.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t">
                💡 Use these scenarios to understand your project's risk profile and prepare for different outcomes
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="hero" onClick={onNext}>
          Continue to Contact Information
        </Button>
      </div>
    </div>
  );
};

export default Sensitivity;