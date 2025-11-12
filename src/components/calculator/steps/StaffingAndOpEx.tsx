import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Calculator, TrendingUp } from "lucide-react";
import { PricingDisclaimer } from "@/components/ui/pricing-disclaimer";

interface StaffingAndOpExProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData?: any;
}

const StaffingAndOpEx = ({ data, onUpdate, onNext, onPrevious }: StaffingAndOpExProps) => {
  const [formData, setFormData] = useState({
    // Staffing Template
    gmFte: data.gmFte || '1',
    gmRate: data.gmRate || '35',
    opsLeadFte: data.opsLeadFte || '1',
    opsLeadRate: data.opsLeadRate || '28',
    coachFte: data.coachFte || '4',
    coachRate: data.coachRate || '25',
    frontDeskFte: data.frontDeskFte || '2',
    frontDeskRate: data.frontDeskRate || '20',
    
    // Fixed OpEx Monthly Defaults
    utilities: data.utilities || '2500',
    insurance: data.insurance || '1200',
    propertyTax: data.propertyTax || '1500',
    maintenance: data.maintenance || '800',
    marketing: data.marketing || '1000',
    software: data.software || '350',
    janitorial: data.janitorial || '600',
    other: data.other || '500',
    
    ...data
  });

  // Auto-persist default data on mount to ensure Calculator receives it
  useEffect(() => {
    onUpdate(formData);
  }, []); // Only run on mount

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  // Calculate totals
  const gmMonthlyCost = Number(formData.gmFte) * Number(formData.gmRate) * 173.33; // hours per month
  const opsLeadMonthlyCost = Number(formData.opsLeadFte) * Number(formData.opsLeadRate) * 173.33;
  const coachMonthlyCost = Number(formData.coachFte) * Number(formData.coachRate) * 173.33;
  const frontDeskMonthlyCost = Number(formData.frontDeskFte) * Number(formData.frontDeskRate) * 86.67; // PT assumption

  const totalMonthlySalaries = gmMonthlyCost + opsLeadMonthlyCost + coachMonthlyCost + frontDeskMonthlyCost;
  
  const totalFixedOpEx = Number(formData.utilities) + Number(formData.insurance) + 
                        Number(formData.propertyTax) + Number(formData.maintenance) + 
                        Number(formData.marketing) + Number(formData.software) + 
                        Number(formData.janitorial) + Number(formData.other);

  const totalMonthlyOpEx = totalMonthlySalaries + totalFixedOpEx;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Staffing & Operating Expenses</h2>
        <p className="text-muted-foreground">
          Configure your team and monthly operating costs
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Staffing Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Staffing Template
              </CardTitle>
              <CardDescription>All rates are loaded (includes benefits, taxes, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="text-sm font-medium">General Manager</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gmFte">FTE</Label>
                  <Input
                    id="gmFte"
                    type="number"
                    step="0.25"
                    value={formData.gmFte}
                    onChange={(e) => handleInputChange('gmFte', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gmRate">Rate ($/hr loaded)</Label>
                  <Input
                    id="gmRate"
                    type="number"
                    value={formData.gmRate}
                    onChange={(e) => handleInputChange('gmRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Operations Lead</div>
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    step="0.25"
                    value={formData.opsLeadFte}
                    onChange={(e) => handleInputChange('opsLeadFte', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={formData.opsLeadRate}
                    onChange={(e) => handleInputChange('opsLeadRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Coaches/Instructors</div>
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    step="0.25"
                    value={formData.coachFte}
                    onChange={(e) => handleInputChange('coachFte', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={formData.coachRate}
                    onChange={(e) => handleInputChange('coachRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Front Desk (PT)</div>
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    step="0.25"
                    value={formData.frontDeskFte}
                    onChange={(e) => handleInputChange('frontDeskFte', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={formData.frontDeskRate}
                    onChange={(e) => handleInputChange('frontDeskRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground pt-2 border-t">
                Total Monthly Salaries: ${totalMonthlySalaries.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Fixed OpEx */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-secondary" />
                Fixed Operating Expenses
              </CardTitle>
              <CardDescription>Monthly recurring costs (user-adjustable; varies by market)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="utilities">Utilities</Label>
                  <Input
                    id="utilities"
                    type="number"
                    placeholder="2500"
                    value={formData.utilities}
                    onChange={(e) => handleInputChange('utilities', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance</Label>
                  <Input
                    id="insurance"
                    type="number"
                    placeholder="1200"
                    value={formData.insurance}
                    onChange={(e) => handleInputChange('insurance', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyTax">Property Tax</Label>
                  <Input
                    id="propertyTax"
                    type="number"
                    placeholder="1500"
                    value={formData.propertyTax}
                    onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance">Maintenance</Label>
                  <Input
                    id="maintenance"
                    type="number"
                    placeholder="800"
                    value={formData.maintenance}
                    onChange={(e) => handleInputChange('maintenance', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marketing">Marketing</Label>
                  <Input
                    id="marketing"
                    type="number"
                    placeholder="1000"
                    value={formData.marketing}
                    onChange={(e) => handleInputChange('marketing', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="software">Software</Label>
                  <Input
                    id="software"
                    type="number"
                    placeholder="350"
                    value={formData.software}
                    onChange={(e) => handleInputChange('software', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="janitorial">Janitorial</Label>
                  <Input
                    id="janitorial"
                    type="number"
                    placeholder="600"
                    value={formData.janitorial}
                    onChange={(e) => handleInputChange('janitorial', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other">Other</Label>
                  <Input
                    id="other"
                    type="number"
                    placeholder="500"
                    value={formData.other}
                    onChange={(e) => handleInputChange('other', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground pt-2 border-t">
                Total Fixed OpEx: ${totalFixedOpEx.toLocaleString()}/month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Monthly OpEx Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Salaries:</span>
                    <span>${totalMonthlySalaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed Expenses:</span>
                    <span>${totalFixedOpEx.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Monthly OpEx:</span>
                    <span className="text-xl font-bold text-primary">
                      ${totalMonthlyOpEx.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Annual: ${(totalMonthlyOpEx * 12).toLocaleString()}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded">
                  <strong>Note:</strong> All figures are planning estimates. Actual costs vary by market, vendor, and design. Validate with professional quotes.
                </div>
                
                {/* Pricing Disclaimer */}
                <div className="pt-4 border-t">
                  <PricingDisclaimer />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="hero" onClick={onNext}>
          Continue to Revenue Programs
        </Button>
      </div>
    </div>
  );
};

export default StaffingAndOpEx;