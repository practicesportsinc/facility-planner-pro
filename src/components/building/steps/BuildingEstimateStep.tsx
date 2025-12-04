import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BuildingConfig, BuildingEstimate } from "@/utils/buildingCalculator";
import { Building, DoorOpen, Wrench, Shovel, Download, Calculator, Phone } from "lucide-react";
import { PricingDisclaimer } from "@/components/ui/pricing-disclaimer";

interface BuildingEstimateStepProps {
  config: BuildingConfig;
  estimate: BuildingEstimate;
  onBack: () => void;
  onDownload: () => void;
  onContinueToCalculator: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const CATEGORY_CONFIG = {
  structure: { label: 'Building Structure', icon: Building, color: 'bg-blue-500' },
  doors: { label: 'Doors & Openings', icon: DoorOpen, color: 'bg-amber-500' },
  systems: { label: 'Building Systems', icon: Wrench, color: 'bg-green-500' },
  site_work: { label: 'Site Work', icon: Shovel, color: 'bg-orange-500' },
};

export function BuildingEstimateStep({ 
  config, 
  estimate, 
  onBack, 
  onDownload,
  onContinueToCalculator 
}: BuildingEstimateStepProps) {
  const costPerSF = Math.round(estimate.total / estimate.grossSF);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Building Estimate</h2>
        <p className="text-muted-foreground">
          Itemized construction cost estimate for your {estimate.grossSF.toLocaleString()} SF building.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-sm text-muted-foreground">Total Estimate</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(estimate.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-sm text-muted-foreground">Cost per SF</div>
            <div className="text-2xl font-bold">${costPerSF}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-sm text-muted-foreground">Building Size</div>
            <div className="text-2xl font-bold">{estimate.grossSF.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">square feet</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-sm text-muted-foreground">Finish Level</div>
            <div className="text-2xl font-bold capitalize">{config.finishLevel}</div>
          </CardContent>
        </Card>
      </div>

      {/* Itemized Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Itemized Cost Breakdown</CardTitle>
          <CardDescription>
            Detailed line items by category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(CATEGORY_CONFIG).map(([category, { label, icon: Icon, color }]) => {
            const categoryItems = estimate.items.filter(item => item.category === category);
            const categoryTotal = estimate.subtotals[category as keyof typeof estimate.subtotals];
            
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded ${color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">{label}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {formatCurrency(categoryTotal)}
                  </Badge>
                </div>
                
                <div className="space-y-2 pl-8">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span>{item.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({item.quantity.toLocaleString()} {item.unit} × ${item.unitCost.toLocaleString()})
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="mt-4" />
              </div>
            );
          })}

          {/* Soft Costs & Contingency */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span>Soft Costs (architect, engineering, permits)</span>
              <span className="font-medium">{formatCurrency(estimate.softCosts)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Contingency</span>
              <span className="font-medium">{formatCurrency(estimate.contingency)}</span>
            </div>
          </div>

          <Separator />

          {/* Grand Total */}
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total Building Estimate</span>
            <span className="text-primary">{formatCurrency(estimate.total)}</span>
          </div>
        </CardContent>
      </Card>

      <PricingDisclaimer />

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={onDownload}
        >
          <Download className="h-5 w-5" />
          <span>Download Estimate PDF</span>
        </Button>
        
        <Button 
          className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-primary"
          onClick={onContinueToCalculator}
        >
          <Calculator className="h-5 w-5" />
          <span>Continue to Full Calculator</span>
        </Button>
        
        <Button 
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          asChild
        >
          <a href="https://practicesportsinc.setmore.com/" target="_blank" rel="noopener noreferrer">
            <Phone className="h-5 w-5" />
            <span>Schedule Consultation</span>
          </a>
        </Button>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          Back to Edit
        </Button>
      </div>
    </div>
  );
}
