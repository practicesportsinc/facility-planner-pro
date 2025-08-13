import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Building2, Wrench, AlertTriangle } from "lucide-react";

interface SiteCostsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const SiteCosts = ({ data, onUpdate, onNext, onPrevious, allData }: SiteCostsProps) => {
  const facilityType = allData[2]?.facilityType || '';
  const squareFootage = allData[2]?.totalSquareFootage || allData[2]?.recommendSquareFootage ? 25000 : 0;

  const [formData, setFormData] = useState({
    // Land/Lease costs
    landPrice: data.landPrice || '',
    landSize: data.landSize || '',
    leaseRate: data.leaseRate || '',
    leaseTerm: data.leaseTerm || '10',
    
    // Building costs
    buildingCostPerSqFt: data.buildingCostPerSqFt || '180',
    purchasePrice: data.purchasePrice || '',
    
    // Improvements
    tenantImprovements: data.tenantImprovements || '',
    renovationCosts: data.renovationCosts || '',
    
    // Soft costs
    architectDesign: data.architectDesign || '',
    permits: data.permits || '',
    engineering: data.engineering || '',
    legalProfessional: data.legalProfessional || '',
    
    // Contingency
    contingencyPercentage: data.contingencyPercentage || '10',
    
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  // Calculate estimated costs
  const estimatedBuildingCost = facilityType === 'build' ? 
    squareFootage * Number(formData.buildingCostPerSqFt || 0) : 0;
  
  const estimatedSoftCosts = facilityType === 'build' ? estimatedBuildingCost * 0.15 : 0;
  const estimatedTenantImprovements = facilityType === 'lease' ? squareFootage * 50 : 0;

  const totalHardCosts = facilityType === 'build' ? 
    estimatedBuildingCost + Number(formData.landPrice || 0) :
    facilityType === 'buy' ? Number(formData.purchasePrice || 0) :
    Number(formData.tenantImprovements || estimatedTenantImprovements);

  const totalSoftCosts = Number(formData.architectDesign || 0) + 
    Number(formData.permits || 0) + 
    Number(formData.engineering || 0) + 
    Number(formData.legalProfessional || 0);

  const subtotal = totalHardCosts + totalSoftCosts;
  const contingency = subtotal * (Number(formData.contingencyPercentage || 0) / 100);
  const totalProjectCost = subtotal + contingency;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Site & Building Costs</h2>
        <p className="text-muted-foreground">
          {facilityType === 'build' && 'Land acquisition and construction costs'}
          {facilityType === 'buy' && 'Purchase price and renovation costs'}
          {facilityType === 'lease' && 'Lease terms and tenant improvement costs'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Land/Lease Section */}
          {(facilityType === 'build' || facilityType === 'lease') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  {facilityType === 'build' ? 'Land Acquisition' : 'Lease Terms'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {facilityType === 'build' ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landPrice">Land Purchase Price</Label>
                      <Input
                        id="landPrice"
                        type="number"
                        placeholder="e.g., 500000"
                        value={formData.landPrice}
                        onChange={(e) => handleInputChange('landPrice', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landSize">Land Size (acres)</Label>
                      <Input
                        id="landSize"
                        type="number"
                        placeholder="e.g., 5"
                        value={formData.landSize}
                        onChange={(e) => handleInputChange('landSize', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leaseRate">Monthly Lease Rate</Label>
                      <Input
                        id="leaseRate"
                        type="number"
                        placeholder="e.g., 15000"
                        value={formData.leaseRate}
                        onChange={(e) => handleInputChange('leaseRate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lease Term (years)</Label>
                      <Select value={formData.leaseTerm} onValueChange={(value) => handleInputChange('leaseTerm', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 years</SelectItem>
                          <SelectItem value="10">10 years</SelectItem>
                          <SelectItem value="15">15 years</SelectItem>
                          <SelectItem value="20">20 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Building Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-secondary" />
                {facilityType === 'build' && 'Construction Costs'}
                {facilityType === 'buy' && 'Purchase & Renovation'}
                {facilityType === 'lease' && 'Tenant Improvements'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {facilityType === 'build' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buildingCost">Building Cost per Sq Ft</Label>
                      <Input
                        id="buildingCost"
                        type="number"
                        value={formData.buildingCostPerSqFt}
                        onChange={(e) => handleInputChange('buildingCostPerSqFt', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Building Cost (Estimated)</Label>
                      <div className="p-3 bg-muted rounded-md">
                        ${estimatedBuildingCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on {squareFootage.toLocaleString()} sq ft × ${formData.buildingCostPerSqFt}/sq ft
                  </div>
                </div>
              )}

              {facilityType === 'buy' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Building Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      placeholder="e.g., 2500000"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renovationCosts">Renovation Costs</Label>
                    <Input
                      id="renovationCosts"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.renovationCosts}
                      onChange={(e) => handleInputChange('renovationCosts', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {facilityType === 'lease' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenantImprovements">Tenant Improvement Costs</Label>
                    <Input
                      id="tenantImprovements"
                      type="number"
                      placeholder={`e.g., ${estimatedTenantImprovements}`}
                      value={formData.tenantImprovements}
                      onChange={(e) => handleInputChange('tenantImprovements', e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated at $50/sq ft for {squareFootage.toLocaleString()} sq ft = ${estimatedTenantImprovements.toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Soft Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-accent" />
                Professional & Soft Costs
              </CardTitle>
              <CardDescription>
                Architectural, engineering, permits, and professional fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="architectDesign">Architect & Design</Label>
                  <Input
                    id="architectDesign"
                    type="number"
                    placeholder={`e.g., ${Math.round(estimatedSoftCosts * 0.4)}`}
                    value={formData.architectDesign}
                    onChange={(e) => handleInputChange('architectDesign', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineering">Engineering</Label>
                  <Input
                    id="engineering"
                    type="number"
                    placeholder={`e.g., ${Math.round(estimatedSoftCosts * 0.3)}`}
                    value={formData.engineering}
                    onChange={(e) => handleInputChange('engineering', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permits">Permits & Inspections</Label>
                  <Input
                    id="permits"
                    type="number"
                    placeholder={`e.g., ${Math.round(estimatedSoftCosts * 0.2)}`}
                    value={formData.permits}
                    onChange={(e) => handleInputChange('permits', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalProfessional">Legal & Professional</Label>
                  <Input
                    id="legalProfessional"
                    type="number"
                    placeholder={`e.g., ${Math.round(estimatedSoftCosts * 0.1)}`}
                    value={formData.legalProfessional}
                    onChange={(e) => handleInputChange('legalProfessional', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contingency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                Contingency
              </CardTitle>
              <CardDescription>
                Buffer for unexpected costs and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="contingency">Contingency Percentage</Label>
                <Select value={formData.contingencyPercentage} onValueChange={(value) => handleInputChange('contingencyPercentage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5% - Low risk</SelectItem>
                    <SelectItem value="10">10% - Standard</SelectItem>
                    <SelectItem value="15">15% - Higher risk</SelectItem>
                    <SelectItem value="20">20% - High risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Hard Costs:</span>
                    <span>${totalHardCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soft Costs:</span>
                    <span>${totalSoftCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contingency ({formData.contingencyPercentage}%):</span>
                    <span>${contingency.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Project Cost:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${totalProjectCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {facilityType === 'lease' && (
                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    Plus monthly lease: ${Number(formData.leaseRate || 0).toLocaleString()}
                  </div>
                )}
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
          Continue to Operating Costs
        </Button>
      </div>
    </div>
  );
};

export default SiteCosts;