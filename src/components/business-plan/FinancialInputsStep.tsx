import React from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DollarSign, TrendingUp, Landmark } from 'lucide-react';

export default function FinancialInputsStep() {
  const { data, updateData } = useBusinessPlan();
  const { financials } = data;

  const updateStartup = (field: string, value: number) => {
    updateData('financials', {
      startupCosts: {
        ...financials.startupCosts,
        [field]: value,
      },
    });
  };

  const updateMonthly = (field: string, value: number) => {
    updateData('financials', {
      monthlyOperatingCosts: {
        ...financials.monthlyOperatingCosts,
        [field]: value,
      },
    });
  };

  const updateRevenue = (field: string, value: number) => {
    updateData('financials', {
      revenueAssumptions: {
        ...financials.revenueAssumptions,
        [field]: value,
      },
    });
  };

  const updateFinancing = (field: string, value: any) => {
    updateData('financials', {
      financing: {
        ...financials.financing,
        [field]: value,
      },
    });
  };

  // Calculate totals
  const subtotalStartup = 
    financials.startupCosts.leaseDeposit +
    financials.startupCosts.buildoutConstruction +
    financials.startupCosts.equipmentTechnology +
    financials.startupCosts.preOpeningCosts +
    financials.startupCosts.workingCapitalReserve;
  
  const contingency = subtotalStartup * (financials.startupCosts.contingencyPercentage / 100);
  const totalStartup = subtotalStartup + contingency;

  const totalMonthlyOpex = Object.values(financials.monthlyOperatingCosts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Financial Inputs</h2>
        <p className="text-muted-foreground">Configure your startup costs, operating expenses, and financing</p>
      </div>

      {/* Startup Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Startup Costs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Lease Deposit</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.startupCosts.leaseDeposit}
                  onChange={(e) => updateStartup('leaseDeposit', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Buildout/Construction</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.startupCosts.buildoutConstruction}
                  onChange={(e) => updateStartup('buildoutConstruction', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Equipment & Technology</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.startupCosts.equipmentTechnology}
                  onChange={(e) => updateStartup('equipmentTechnology', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Pre-Opening Costs</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.startupCosts.preOpeningCosts}
                  onChange={(e) => updateStartup('preOpeningCosts', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Working Capital Reserve</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.startupCosts.workingCapitalReserve}
                  onChange={(e) => updateStartup('workingCapitalReserve', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Contingency (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[financials.startupCosts.contingencyPercentage]}
                  onValueChange={([v]) => updateStartup('contingencyPercentage', v)}
                  min={5}
                  max={25}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-right font-medium">{financials.startupCosts.contingencyPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotalStartup.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contingency ({financials.startupCosts.contingencyPercentage}%)</span>
              <span>${contingency.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mt-2">
              <span>Total Startup Cost</span>
              <span className="text-primary">${totalStartup.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Operating Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Operating Costs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Rent</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.monthlyOperatingCosts.rent}
                  onChange={(e) => updateMonthly('rent', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Utilities</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.monthlyOperatingCosts.utilities}
                  onChange={(e) => updateMonthly('utilities', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Insurance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.monthlyOperatingCosts.insurance}
                  onChange={(e) => updateMonthly('insurance', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Marketing</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.monthlyOperatingCosts.marketing}
                  onChange={(e) => updateMonthly('marketing', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Maintenance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.monthlyOperatingCosts.maintenance}
                  onChange={(e) => updateMonthly('maintenance', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Software/Subscriptions</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.monthlyOperatingCosts.software}
                  onChange={(e) => updateMonthly('software', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Other</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={financials.monthlyOperatingCosts.other}
                  onChange={(e) => updateMonthly('other', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Monthly OpEx</span>
              <span className="text-primary">${totalMonthlyOpex.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Annual (excluding staffing)</span>
              <span>${(totalMonthlyOpex * 12).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="font-medium">Utilization Targets by Year</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Year 1</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[financials.revenueAssumptions.year1Utilization]}
                    onValueChange={([v]) => updateRevenue('year1Utilization', v)}
                    min={20}
                    max={80}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">{financials.revenueAssumptions.year1Utilization}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Year 2</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[financials.revenueAssumptions.year2Utilization]}
                    onValueChange={([v]) => updateRevenue('year2Utilization', v)}
                    min={20}
                    max={80}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">{financials.revenueAssumptions.year2Utilization}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Year 3</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[financials.revenueAssumptions.year3Utilization]}
                    onValueChange={([v]) => updateRevenue('year3Utilization', v)}
                    min={20}
                    max={80}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">{financials.revenueAssumptions.year3Utilization}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Membership Growth Rate (%/yr)</Label>
              <Input
                type="number"
                value={financials.revenueAssumptions.membershipGrowthRate}
                onChange={(e) => updateRevenue('membershipGrowthRate', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Lesson Hours per Week</Label>
              <Input
                type="number"
                value={financials.revenueAssumptions.lessonHoursPerWeek}
                onChange={(e) => updateRevenue('lessonHoursPerWeek', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Parties per Month</Label>
              <Input
                type="number"
                value={financials.revenueAssumptions.partiesPerMonth}
                onChange={(e) => updateRevenue('partiesPerMonth', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Financing Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="font-medium">Equity vs Debt Split</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Equity</span>
              <Slider
                value={[financials.financing.equityPercentage]}
                onValueChange={([v]) => {
                  updateFinancing('equityPercentage', v);
                  updateFinancing('debtPercentage', 100 - v);
                }}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">Debt</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Equity: {financials.financing.equityPercentage}% (${Math.round(totalStartup * financials.financing.equityPercentage / 100).toLocaleString()})</span>
              <span>Debt: {financials.financing.debtPercentage}% (${Math.round(totalStartup * financials.financing.debtPercentage / 100).toLocaleString()})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.25"
                value={financials.financing.interestRate}
                onChange={(e) => updateFinancing('interestRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Loan Term (years)</Label>
              <Input
                type="number"
                value={financials.financing.loanTermYears}
                onChange={(e) => updateFinancing('loanTermYears', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">SBA Loan</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={financials.financing.sbaLoan}
                  onCheckedChange={(v) => updateFinancing('sbaLoan', v)}
                />
                <span className="text-sm text-muted-foreground">
                  {financials.financing.sbaLoan ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
