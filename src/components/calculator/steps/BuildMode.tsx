import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, ShoppingCart, FileText, AlertTriangle } from "lucide-react";
import { HelpTooltip } from "@/components/ui/help-tooltip";

interface BuildModeProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData?: any;
}

const BuildMode = ({ data, onUpdate, onNext, onPrevious }: BuildModeProps) => {
  const [formData, setFormData] = useState({
    buildMode: data.buildMode || 'build',
    regionMultiplier: data.regionMultiplier || '1.00',
    
    // Build mode
    landCost: data.landCost || '',
    buildingCostPerSf: data.buildingCostPerSf || '180',
    siteworkPct: data.siteworkPct || '15',
    tiCostPerSf: data.tiCostPerSf || '45',
    softCostsPct: data.softCostsPct || '8',
    contingencyPct: data.contingencyPct || '10',
    fixturesAllowance: data.fixturesAllowance || '25000',
    itSecurityAllowance: data.itSecurityAllowance || '15000',
    
    // Buy mode
    purchasePrice: data.purchasePrice || '',
    closingCostsPct: data.closingCostsPct || '3',
    dueDiligenceCosts: data.dueDiligenceCosts || '8500',
    renovationCostPerSf: data.renovationCostPerSf || '65',
    
    // Lease mode
    baseRentPerSfYear: data.baseRentPerSfYear || '18',
    nnnPerSfYear: data.nnnPerSfYear || '6',
    camPerSfYear: data.camPerSfYear || '3',
    freeRentMonths: data.freeRentMonths || '3',
    tiAllowancePerSf: data.tiAllowancePerSf || '35',
    leaseYears: data.leaseYears || '10',
    annualEscalationPct: data.annualEscalationPct || '2.5',
    securityDepositMonths: data.securityDepositMonths || '2',
    
    // Common
    clearHeight: data.clearHeight || '',
    columnSpacing: data.columnSpacing || '',
    parkingRatio: data.parkingRatio || '3.5',
    
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleModeChange = (mode: string) => {
    const newData = { ...formData, buildMode: mode };
    setFormData(newData);
    onUpdate(newData);
  };

  const getBuildChecklist = () => [
    "Zoning and permitting requirements",
    "ADA compliance and egress planning", 
    "Fire suppression system design",
    "Sprinkler water supply capacity",
    "Parking count estimate (3.5 spaces per 1,000 sf typical)"
  ];

  const getBuyChecklist = () => [
    "Phase I environmental assessment",
    "Structural engineering inspection",
    "Roof and HVAC system age/condition",
    "Code upgrade requirements assessment"
  ];

  const getLeaseChecklist = () => [
    "Exclusive use clause negotiations",
    "Hours of operation allowances",
    "Signage rights and restrictions",
    "Assignment and subletting rights",
    "Renewal options and terms"
  ];

  const isValid = formData.buildMode && formData.regionMultiplier;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Build, Buy, or Lease?</h2>
        <p className="text-muted-foreground">
          Choose your facility acquisition strategy and configure the costs
        </p>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Strategy</CardTitle>
          <CardDescription>Select how you plan to acquire your facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: 'build', label: 'Build New', icon: Building, desc: 'Ground-up construction' },
              { id: 'buy', label: 'Buy Existing', icon: ShoppingCart, desc: 'Purchase and renovate' },
              { id: 'lease', label: 'Lease Space', icon: FileText, desc: 'Rent and build-out' }
            ].map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 cursor-pointer transition-smooth hover:shadow-custom-md ${
                  formData.buildMode === option.id
                    ? 'border-primary bg-primary/5 shadow-custom-sm'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleModeChange(option.id)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <option.icon className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Region Multiplier */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Cost Adjustment</CardTitle>
          <CardDescription>Adjust costs for your local market (Omaha baseline = 1.00)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="regionMultiplier">Region Multiplier</Label>
              <HelpTooltip fieldId="region_multiplier" label="Region Multiplier" />
            </div>
            <Input
              id="regionMultiplier"
              type="number"
              step="0.05"
              placeholder="1.00"
              value={formData.regionMultiplier}
              onChange={(e) => handleInputChange('regionMultiplier', e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Higher cost markets: 1.10-1.35 • Lower cost markets: 0.85-0.95
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Content Based on Mode */}
      {formData.buildMode === 'build' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Build New - Cost Inputs</CardTitle>
              <CardDescription>Construction and development costs (user-adjustable; varies by market)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="landCost">Land Cost ($)</Label>
                    <HelpTooltip fieldId="land_cost" label="Land Cost" />
                  </div>
                  <Input
                    id="landCost"
                    type="number"
                    placeholder="500000"
                    value={formData.landCost}
                    onChange={(e) => handleInputChange('landCost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="buildingCostPerSf">Building Cost ($/sf)</Label>
                    <HelpTooltip fieldId="building_cost_per_sf" label="Building Cost" />
                  </div>
                  <Input
                    id="buildingCostPerSf"
                    type="number"
                    placeholder="180"
                    value={formData.buildingCostPerSf}
                    onChange={(e) => handleInputChange('buildingCostPerSf', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="siteworkPct">Sitework (%)</Label>
                    <HelpTooltip fieldId="sitework_pct" label="Sitework" />
                  </div>
                  <Input
                    id="siteworkPct"
                    type="number"
                    placeholder="15"
                    value={formData.siteworkPct}
                    onChange={(e) => handleInputChange('siteworkPct', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tiCostPerSf">TI Cost ($/sf)</Label>
                    <HelpTooltip fieldId="ti_cost_per_sf" label="TI Cost" />
                  </div>
                  <Input
                    id="tiCostPerSf"
                    type="number"
                    placeholder="45"
                    value={formData.tiCostPerSf}
                    onChange={(e) => handleInputChange('tiCostPerSf', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="softCostsPct">Soft Costs (%)</Label>
                    <HelpTooltip fieldId="soft_costs_pct" label="Soft Costs" />
                  </div>
                  <Input
                    id="softCostsPct"
                    type="number"
                    placeholder="8"
                    value={formData.softCostsPct}
                    onChange={(e) => handleInputChange('softCostsPct', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contingencyPct">Contingency (%)</Label>
                    <HelpTooltip fieldId="contingency_pct" label="Contingency" />
                  </div>
                  <Input
                    id="contingencyPct"
                    type="number"
                    placeholder="10"
                    value={formData.contingencyPct}
                    onChange={(e) => handleInputChange('contingencyPct', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fixturesAllowance">Fixtures Allowance ($)</Label>
                    <HelpTooltip fieldId="fixtures_allowance" label="Fixtures Allowance" />
                  </div>
                  <Input
                    id="fixturesAllowance"
                    type="number"
                    placeholder="25000"
                    value={formData.fixturesAllowance}
                    onChange={(e) => handleInputChange('fixturesAllowance', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="itSecurityAllowance">IT/Security Allowance ($)</Label>
                  <HelpTooltip fieldId="it_security_allowance" label="IT/Security Allowance" />
                </div>
                <Input
                  id="itSecurityAllowance"
                  type="number"
                  placeholder="15000"
                  value={formData.itSecurityAllowance}
                  onChange={(e) => handleInputChange('itSecurityAllowance', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                Build New Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getBuildChecklist().map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`build-${index}`} />
                    <Label htmlFor={`build-${index}`} className="text-sm">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {formData.buildMode === 'buy' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Buy Existing - Cost Inputs</CardTitle>
              <CardDescription>Purchase and renovation costs (user-adjustable; varies by market)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                    <HelpTooltip fieldId="purchase_price" label="Purchase Price" />
                  </div>
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="1200000"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="closingCostsPct">Closing Costs (%)</Label>
                    <HelpTooltip fieldId="closing_costs_pct" label="Closing Costs" />
                  </div>
                  <Input
                    id="closingCostsPct"
                    type="number"
                    placeholder="3"
                    value={formData.closingCostsPct}
                    onChange={(e) => handleInputChange('closingCostsPct', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dueDiligenceCosts">Due Diligence Costs ($)</Label>
                    <HelpTooltip fieldId="due_diligence_costs" label="Due Diligence Costs" />
                  </div>
                  <Input
                    id="dueDiligenceCosts"
                    type="number"
                    placeholder="8500"
                    value={formData.dueDiligenceCosts}
                    onChange={(e) => handleInputChange('dueDiligenceCosts', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="renovationCostPerSf">Renovation Cost ($/sf)</Label>
                    <HelpTooltip fieldId="renovation_cost_per_sf" label="Renovation Cost" />
                  </div>
                  <Input
                    id="renovationCostPerSf"
                    type="number"
                    placeholder="65"
                    value={formData.renovationCostPerSf}
                    onChange={(e) => handleInputChange('renovationCostPerSf', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="softCostsPct">Soft Costs (%)</Label>
                    <HelpTooltip fieldId="soft_costs_pct" label="Soft Costs" />
                  </div>
                  <Input
                    id="softCostsPct"
                    type="number"
                    placeholder="8"
                    value={formData.softCostsPct}
                    onChange={(e) => handleInputChange('softCostsPct', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contingencyPct">Contingency (%)</Label>
                    <HelpTooltip fieldId="contingency_pct" label="Contingency" />
                  </div>
                  <Input
                    id="contingencyPct"
                    type="number"
                    placeholder="10"
                    value={formData.contingencyPct}
                    onChange={(e) => handleInputChange('contingencyPct', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                Buy Existing Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getBuyChecklist().map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`buy-${index}`} />
                    <Label htmlFor={`buy-${index}`} className="text-sm">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {formData.buildMode === 'lease' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Lease Space - Terms & Costs</CardTitle>
              <CardDescription>Lease terms and build-out costs (user-adjustable; varies by market)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="baseRentPerSfYear">Base Rent ($/sf/year)</Label>
                    <HelpTooltip fieldId="base_rent_per_sf_year" label="Base Rent" />
                  </div>
                  <Input
                    id="baseRentPerSfYear"
                    type="number"
                    placeholder="18"
                    value={formData.baseRentPerSfYear}
                    onChange={(e) => handleInputChange('baseRentPerSfYear', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nnnPerSfYear">NNN ($/sf/year)</Label>
                    <HelpTooltip fieldId="nnn_per_sf_year" label="NNN" />
                  </div>
                  <Input
                    id="nnnPerSfYear"
                    type="number"
                    placeholder="6"
                    value={formData.nnnPerSfYear}
                    onChange={(e) => handleInputChange('nnnPerSfYear', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="camPerSfYear">CAM ($/sf/year)</Label>
                    <HelpTooltip fieldId="cam_per_sf_year" label="CAM" />
                  </div>
                  <Input
                    id="camPerSfYear"
                    type="number"
                    placeholder="3"
                    value={formData.camPerSfYear}
                    onChange={(e) => handleInputChange('camPerSfYear', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="freeRentMonths">Free Rent (months)</Label>
                    <HelpTooltip fieldId="free_rent_months" label="Free Rent" />
                  </div>
                  <Input
                    id="freeRentMonths"
                    type="number"
                    placeholder="3"
                    value={formData.freeRentMonths}
                    onChange={(e) => handleInputChange('freeRentMonths', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tiAllowancePerSf">TI Allowance ($/sf)</Label>
                    <HelpTooltip fieldId="ti_allowance_per_sf" label="TI Allowance" />
                  </div>
                  <Input
                    id="tiAllowancePerSf"
                    type="number"
                    placeholder="35"
                    value={formData.tiAllowancePerSf}
                    onChange={(e) => handleInputChange('tiAllowancePerSf', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="leaseYears">Lease Term (years)</Label>
                    <HelpTooltip fieldId="lease_years" label="Lease Term" />
                  </div>
                  <Select value={formData.leaseYears} onValueChange={(value) => handleInputChange('leaseYears', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 years</SelectItem>
                      <SelectItem value="7">7 years</SelectItem>
                      <SelectItem value="10">10 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="annualEscalationPct">Annual Escalation (%)</Label>
                    <HelpTooltip fieldId="annual_escalation_pct" label="Annual Escalation" />
                  </div>
                  <Input
                    id="annualEscalationPct"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.annualEscalationPct}
                    onChange={(e) => handleInputChange('annualEscalationPct', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="securityDepositMonths">Security Deposit (months)</Label>
                    <HelpTooltip fieldId="security_deposit_months" label="Security Deposit" />
                  </div>
                  <Input
                    id="securityDepositMonths"
                    type="number"
                    placeholder="2"
                    value={formData.securityDepositMonths}
                    onChange={(e) => handleInputChange('securityDepositMonths', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                Lease Agreement Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getLeaseChecklist().map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`lease-${index}`} />
                    <Label htmlFor={`lease-${index}`} className="text-sm">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Common Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Facility Specifications</CardTitle>
          <CardDescription>Physical constraints and parking requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clearHeight">Clear Height (ft)</Label>
              <Input
                id="clearHeight"
                type="number"
                placeholder="24"
                value={formData.clearHeight}
                onChange={(e) => handleInputChange('clearHeight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="columnSpacing">Column Spacing (ft)</Label>
              <Input
                id="columnSpacing"
                type="number"
                placeholder="40"
                value={formData.columnSpacing}
                onChange={(e) => handleInputChange('columnSpacing', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parkingRatio">Parking Ratio (spaces/1000sf)</Label>
              <Input
                id="parkingRatio"
                type="number"
                step="0.1"
                placeholder="3.5"
                value={formData.parkingRatio}
                onChange={(e) => handleInputChange('parkingRatio', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button 
          variant="hero" 
          onClick={onNext}
          disabled={!isValid}
        >
          Continue to Facility Plan
        </Button>
      </div>
    </div>
  );
};

export default BuildMode;