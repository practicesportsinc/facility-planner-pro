import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank, CreditCard, Gift } from "lucide-react";

interface FinancingProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const Financing = ({ data, onUpdate, onNext, onPrevious, allData }: FinancingProps) => {
  // Get total project cost from previous steps
  const equipmentCost = allData[3]?.equipment?.reduce((sum: number, item: any) => sum + (item.cost * item.quantity), 0) || 0;
  const siteCosts = 1000000; // This would come from step 4 calculations
  const totalProjectCost = equipmentCost + siteCosts;

  const [formData, setFormData] = useState({
    // Equity
    personalEquity: data.personalEquity || Math.round(totalProjectCost * 0.25).toString(),
    partnerEquity: data.partnerEquity || '0',
    
    // Debt
    bankLoanAmount: data.bankLoanAmount || Math.round(totalProjectCost * 0.65).toString(),
    interestRate: data.interestRate || '7.5',
    loanTermYears: data.loanTermYears || '20',
    
    // SBA/Alternative
    sbaLoanAmount: data.sbaLoanAmount || '0',
    sbaInterestRate: data.sbaInterestRate || '6.5',
    sbaTermYears: data.sbaTermYears || '25',
    
    // Equipment Financing
    equipmentFinancing: data.equipmentFinancing || '0',
    equipmentRate: data.equipmentRate || '8.5',
    equipmentTerm: data.equipmentTerm || '7',
    
    // Grants
    federalGrants: data.federalGrants || '0',
    stateGrants: data.stateGrants || '0',
    localGrants: data.localGrants || '0',
    foundationGrants: data.foundationGrants || '0',
    
    // Working Capital
    workingCapital: data.workingCapital || '150000',
    
    ...data
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  // Calculate totals
  const totalEquity = Number(formData.personalEquity) + Number(formData.partnerEquity);
  const totalDebt = Number(formData.bankLoanAmount) + Number(formData.sbaLoanAmount) + Number(formData.equipmentFinancing);
  const totalGrants = Number(formData.federalGrants) + Number(formData.stateGrants) + Number(formData.localGrants) + Number(formData.foundationGrants);
  const totalFunding = totalEquity + totalDebt + totalGrants + Number(formData.workingCapital);

  // Calculate monthly payments
  const calculatePayment = (principal: number, rate: number, years: number) => {
    if (principal === 0 || rate === 0) return 0;
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const bankPayment = calculatePayment(Number(formData.bankLoanAmount), Number(formData.interestRate), Number(formData.loanTermYears));
  const sbaPayment = calculatePayment(Number(formData.sbaLoanAmount), Number(formData.sbaInterestRate), Number(formData.sbaTermYears));
  const equipmentPayment = calculatePayment(Number(formData.equipmentFinancing), Number(formData.equipmentRate), Number(formData.equipmentTerm));
  
  const totalMonthlyDebtService = bankPayment + sbaPayment + equipmentPayment;

  const fundingGap = totalProjectCost - totalFunding;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Financing Structure</h2>
        <p className="text-muted-foreground">
          Plan how you'll fund your ${totalProjectCost.toLocaleString()} project
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Equity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PiggyBank className="h-5 w-5 mr-2 text-primary" />
                Equity Investment
              </CardTitle>
              <CardDescription>Your personal investment and partner contributions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personalEquity">Your Personal Equity</Label>
                  <Input
                    id="personalEquity"
                    type="number"
                    value={formData.personalEquity}
                    onChange={(e) => handleInputChange('personalEquity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerEquity">Partner/Investor Equity</Label>
                  <Input
                    id="partnerEquity"
                    type="number"
                    value={formData.partnerEquity}
                    onChange={(e) => handleInputChange('partnerEquity', e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Total Equity: ${totalEquity.toLocaleString()} ({Math.round((totalEquity / totalProjectCost) * 100)}% of project)
              </div>
            </CardContent>
          </Card>

          {/* Traditional Financing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-secondary" />
                Traditional Bank Financing
              </CardTitle>
              <CardDescription>Commercial real estate loans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankLoan">Loan Amount</Label>
                  <Input
                    id="bankLoan"
                    type="number"
                    value={formData.bankLoanAmount}
                    onChange={(e) => handleInputChange('bankLoanAmount', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term (years)</Label>
                  <Select value={formData.loanTermYears} onValueChange={(value) => handleInputChange('loanTermYears', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="25">25 years</SelectItem>
                      <SelectItem value="30">30 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {Number(formData.bankLoanAmount) > 0 && (
                <div className="text-sm text-muted-foreground">
                  Monthly Payment: ${bankPayment.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SBA Financing */}
          <Card>
            <CardHeader>
              <CardTitle>SBA Loans</CardTitle>
              <CardDescription>Small Business Administration financing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sbaLoan">SBA Loan Amount</Label>
                  <Input
                    id="sbaLoan"
                    type="number"
                    value={formData.sbaLoanAmount}
                    onChange={(e) => handleInputChange('sbaLoanAmount', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sbaRate">Interest Rate (%)</Label>
                  <Input
                    id="sbaRate"
                    type="number"
                    step="0.1"
                    value={formData.sbaInterestRate}
                    onChange={(e) => handleInputChange('sbaInterestRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term (years)</Label>
                  <Select value={formData.sbaTermYears} onValueChange={(value) => handleInputChange('sbaTermYears', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="25">25 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {Number(formData.sbaLoanAmount) > 0 && (
                <div className="text-sm text-muted-foreground">
                  Monthly Payment: ${sbaPayment.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Financing */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Financing</CardTitle>
              <CardDescription>Separate financing for equipment purchases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentFinancing">Equipment Loan Amount</Label>
                  <Input
                    id="equipmentFinancing"
                    type="number"
                    placeholder={equipmentCost.toString()}
                    value={formData.equipmentFinancing}
                    onChange={(e) => handleInputChange('equipmentFinancing', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipmentRate">Interest Rate (%)</Label>
                  <Input
                    id="equipmentRate"
                    type="number"
                    step="0.1"
                    value={formData.equipmentRate}
                    onChange={(e) => handleInputChange('equipmentRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term (years)</Label>
                  <Select value={formData.equipmentTerm} onValueChange={(value) => handleInputChange('equipmentTerm', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 years</SelectItem>
                      <SelectItem value="5">5 years</SelectItem>
                      <SelectItem value="7">7 years</SelectItem>
                      <SelectItem value="10">10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Equipment cost from previous step: ${equipmentCost.toLocaleString()}
                {Number(formData.equipmentFinancing) > 0 && (
                  <> • Monthly Payment: ${equipmentPayment.toLocaleString()}</>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-success" />
                Grants & Incentives
              </CardTitle>
              <CardDescription>Non-repayable funding sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="federalGrants">Federal Grants</Label>
                  <Input
                    id="federalGrants"
                    type="number"
                    value={formData.federalGrants}
                    onChange={(e) => handleInputChange('federalGrants', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateGrants">State/Regional Grants</Label>
                  <Input
                    id="stateGrants"
                    type="number"
                    value={formData.stateGrants}
                    onChange={(e) => handleInputChange('stateGrants', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localGrants">Local/Municipal Grants</Label>
                  <Input
                    id="localGrants"
                    type="number"
                    value={formData.localGrants}
                    onChange={(e) => handleInputChange('localGrants', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundationGrants">Foundation Grants</Label>
                  <Input
                    id="foundationGrants"
                    type="number"
                    value={formData.foundationGrants}
                    onChange={(e) => handleInputChange('foundationGrants', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Capital */}
          <Card>
            <CardHeader>
              <CardTitle>Working Capital</CardTitle>
              <CardDescription>Operating cash for first months of operation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="workingCapital">Working Capital Reserve</Label>
                <Input
                  id="workingCapital"
                  type="number"
                  value={formData.workingCapital}
                  onChange={(e) => handleInputChange('workingCapital', e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                  Recommended: 3-6 months of operating expenses
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Financing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Equity:</span>
                    <span>${totalEquity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Debt:</span>
                    <span>${totalDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Grants:</span>
                    <span>${totalGrants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Working Capital:</span>
                    <span>${Number(formData.workingCapital).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Funding:</span>
                    <span className="text-xl font-bold text-primary">
                      ${totalFunding.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Project Cost:</span>
                    <span>${totalProjectCost.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between mt-2 ${fundingGap > 0 ? 'text-destructive' : 'text-success'}`}>
                    <span className="font-medium">
                      {fundingGap > 0 ? 'Funding Gap:' : 'Surplus:'}
                    </span>
                    <span className="font-bold">
                      ${Math.abs(fundingGap).toLocaleString()}
                    </span>
                  </div>
                </div>

                {totalMonthlyDebtService > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Monthly Debt Service:</span>
                      <span className="text-lg font-bold text-warning">
                        ${totalMonthlyDebtService.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      This will be deducted from monthly cash flow
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  💡 Lenders typically require 20-30% equity investment
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
          Continue to Sensitivity Analysis
        </Button>
      </div>
    </div>
  );
};

export default Financing;