import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Zap, Shield, Megaphone, Laptop, Wrench } from "lucide-react";

interface OperatingProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const Operating = ({ data, onUpdate, onNext, onPrevious, allData }: OperatingProps) => {
  const squareFootage = allData[2]?.totalSquareFootage || 25000;
  const leaseRate = allData[4]?.leaseRate || 0;

  const [formData, setFormData] = useState({
    // Staffing
    managerSalary: data.managerSalary || '65000',
    assistantManagerSalary: data.assistantManagerSalary || '45000',
    instructorHourlyRate: data.instructorHourlyRate || '35',
    instructorHoursPerWeek: data.instructorHoursPerWeek || '40',
    frontDeskHourlyRate: data.frontDeskHourlyRate || '15',
    frontDeskHoursPerWeek: data.frontDeskHoursPerWeek || '60',
    maintenanceHourlyRate: data.maintenanceHourlyRate || '20',
    maintenanceHoursPerWeek: data.maintenanceHoursPerWeek || '20',
    
    // Utilities
    electricityPerSqFt: data.electricityPerSqFt || '2.5',
    gasPerSqFt: data.gasPerSqFt || '0.8',
    waterSewer: data.waterSewer || '800',
    internet: data.internet || '300',
    
    // Insurance & Legal
    generalLiability: data.generalLiability || '15000',
    propertyInsurance: data.propertyInsurance || '12000',
    workersComp: data.workersComp || '8000',
    
    // Marketing & Operations
    marketingBudget: data.marketingBudget || '3000',
    software: data.software || '500',
    maintenanceSupplies: data.maintenanceSupplies || '1200',
    professionalServices: data.professionalServices || '2000',
    
    // Other
    phoneSystem: data.phoneSystem || '200',
    bankingFees: data.bankingFees || '150',
    miscellaneous: data.miscellaneous || '1000',
    
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  // Calculate monthly costs
  const monthlyStaffing = 
    (Number(formData.managerSalary) / 12) +
    (Number(formData.assistantManagerSalary) / 12) +
    (Number(formData.instructorHourlyRate) * Number(formData.instructorHoursPerWeek) * 52 / 12) +
    (Number(formData.frontDeskHourlyRate) * Number(formData.frontDeskHoursPerWeek) * 52 / 12) +
    (Number(formData.maintenanceHourlyRate) * Number(formData.maintenanceHoursPerWeek) * 52 / 12);

  const monthlyUtilities = 
    (squareFootage * Number(formData.electricityPerSqFt) / 12) +
    (squareFootage * Number(formData.gasPerSqFt) / 12) +
    Number(formData.waterSewer) +
    Number(formData.internet);

  const monthlyInsurance = 
    (Number(formData.generalLiability) + Number(formData.propertyInsurance) + Number(formData.workersComp)) / 12;

  const monthlyOperating = 
    Number(formData.marketingBudget) +
    Number(formData.software) +
    Number(formData.maintenanceSupplies) +
    Number(formData.professionalServices) +
    Number(formData.phoneSystem) +
    Number(formData.bankingFees) +
    Number(formData.miscellaneous);

  const monthlyLease = Number(leaseRate);
  
  const totalMonthlyOperating = monthlyStaffing + monthlyUtilities + monthlyInsurance + monthlyOperating + monthlyLease;
  const annualOperating = totalMonthlyOperating * 12;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Operating Costs & Staffing</h2>
        <p className="text-muted-foreground">
          Define your ongoing monthly and annual operating expenses
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Staffing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Staffing Costs
              </CardTitle>
              <CardDescription>Salaries and hourly wages for your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="managerSalary">General Manager (Annual)</Label>
                  <Input
                    id="managerSalary"
                    type="number"
                    value={formData.managerSalary}
                    onChange={(e) => handleInputChange('managerSalary', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assistantManagerSalary">Assistant Manager (Annual)</Label>
                  <Input
                    id="assistantManagerSalary"
                    type="number"
                    value={formData.assistantManagerSalary}
                    onChange={(e) => handleInputChange('assistantManagerSalary', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructorRate">Instructor Rate/Hour</Label>
                  <Input
                    id="instructorRate"
                    type="number"
                    value={formData.instructorHourlyRate}
                    onChange={(e) => handleInputChange('instructorHourlyRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorHours">Hours/Week</Label>
                  <Input
                    id="instructorHours"
                    type="number"
                    value={formData.instructorHoursPerWeek}
                    onChange={(e) => handleInputChange('instructorHoursPerWeek', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frontDeskRate">Front Desk Rate/Hour</Label>
                  <Input
                    id="frontDeskRate"
                    type="number"
                    value={formData.frontDeskHourlyRate}
                    onChange={(e) => handleInputChange('frontDeskHourlyRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frontDeskHours">Hours/Week</Label>
                  <Input
                    id="frontDeskHours"
                    type="number"
                    value={formData.frontDeskHoursPerWeek}
                    onChange={(e) => handleInputChange('frontDeskHoursPerWeek', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceRate">Maintenance Rate/Hour</Label>
                  <Input
                    id="maintenanceRate"
                    type="number"
                    value={formData.maintenanceHourlyRate}
                    onChange={(e) => handleInputChange('maintenanceHourlyRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceHours">Maintenance Hours/Week</Label>
                  <Input
                    id="maintenanceHours"
                    type="number"
                    value={formData.maintenanceHoursPerWeek}
                    onChange={(e) => handleInputChange('maintenanceHoursPerWeek', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Utilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-warning" />
                Utilities
              </CardTitle>
              <CardDescription>Monthly utility costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="electricity">Electricity ($/sq ft/year)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    step="0.1"
                    value={formData.electricityPerSqFt}
                    onChange={(e) => handleInputChange('electricityPerSqFt', e.target.value)}
                  />
                  <div className="text-sm text-muted-foreground">
                    Est. ${(squareFootage * Number(formData.electricityPerSqFt) / 12).toLocaleString()}/month
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gas">Gas/Heating ($/sq ft/year)</Label>
                  <Input
                    id="gas"
                    type="number"
                    step="0.1"
                    value={formData.gasPerSqFt}
                    onChange={(e) => handleInputChange('gasPerSqFt', e.target.value)}
                  />
                  <div className="text-sm text-muted-foreground">
                    Est. ${(squareFootage * Number(formData.gasPerSqFt) / 12).toLocaleString()}/month
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waterSewer">Water & Sewer (Monthly)</Label>
                  <Input
                    id="waterSewer"
                    type="number"
                    value={formData.waterSewer}
                    onChange={(e) => handleInputChange('waterSewer', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internet">Internet & Phone (Monthly)</Label>
                  <Input
                    id="internet"
                    type="number"
                    value={formData.internet}
                    onChange={(e) => handleInputChange('internet', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-success" />
                Insurance & Legal
              </CardTitle>
              <CardDescription>Annual insurance and legal costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="generalLiability">General Liability</Label>
                  <Input
                    id="generalLiability"
                    type="number"
                    value={formData.generalLiability}
                    onChange={(e) => handleInputChange('generalLiability', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyInsurance">Property Insurance</Label>
                  <Input
                    id="propertyInsurance"
                    type="number"
                    value={formData.propertyInsurance}
                    onChange={(e) => handleInputChange('propertyInsurance', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workersComp">Workers' Comp</Label>
                  <Input
                    id="workersComp"
                    type="number"
                    value={formData.workersComp}
                    onChange={(e) => handleInputChange('workersComp', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Laptop className="h-5 w-5 mr-2 text-info" />
                Operations & Marketing
              </CardTitle>
              <CardDescription>Monthly operational expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marketing">Marketing & Advertising</Label>
                  <Input
                    id="marketing"
                    type="number"
                    value={formData.marketingBudget}
                    onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="software">Software & Technology</Label>
                  <Input
                    id="software"
                    type="number"
                    value={formData.software}
                    onChange={(e) => handleInputChange('software', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplies">Maintenance & Supplies</Label>
                  <Input
                    id="supplies"
                    type="number"
                    value={formData.maintenanceSupplies}
                    onChange={(e) => handleInputChange('maintenanceSupplies', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professional">Professional Services</Label>
                  <Input
                    id="professional"
                    type="number"
                    value={formData.professionalServices}
                    onChange={(e) => handleInputChange('professionalServices', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone System</Label>
                  <Input
                    id="phone"
                    type="number"
                    value={formData.phoneSystem}
                    onChange={(e) => handleInputChange('phoneSystem', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banking">Banking Fees</Label>
                  <Input
                    id="banking"
                    type="number"
                    value={formData.bankingFees}
                    onChange={(e) => handleInputChange('bankingFees', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="misc">Miscellaneous</Label>
                  <Input
                    id="misc"
                    type="number"
                    value={formData.miscellaneous}
                    onChange={(e) => handleInputChange('miscellaneous', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Operating Cost Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Staffing:</span>
                    <span>${monthlyStaffing.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities:</span>
                    <span>${monthlyUtilities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance:</span>
                    <span>${monthlyInsurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operations:</span>
                    <span>${monthlyOperating.toLocaleString()}</span>
                  </div>
                  {monthlyLease > 0 && (
                    <div className="flex justify-between">
                      <span>Lease:</span>
                      <span>${monthlyLease.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Monthly Total:</span>
                    <span className="text-xl font-bold text-primary">
                      ${totalMonthlyOperating.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Annual Total:</span>
                    <span className="font-bold">
                      ${annualOperating.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  💡 Don't forget to factor in payroll taxes (typically 15-20% of wages) and benefits
                </div>
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
          Continue to Revenue Programs
        </Button>
      </div>
    </div>
  );
};

export default Operating;
