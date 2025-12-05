import React from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, DollarSign, Clock, Users } from 'lucide-react';
import { MembershipTier, PartyPackage } from '@/types/businessPlan';

export default function ProgrammingStep() {
  const { data, updateData } = useBusinessPlan();
  const { programming } = data;

  const updateRentalPricing = (field: string, value: number) => {
    updateData('programming', {
      rentalPricing: {
        ...programming.rentalPricing,
        [field]: value,
      },
    });
  };

  const updateLessonPricing = (field: string, value: number) => {
    updateData('programming', {
      lessonPricing: {
        ...programming.lessonPricing,
        [field]: value,
      },
    });
  };

  const updateHours = (field: string, value: string) => {
    updateData('programming', {
      hoursOfOperation: {
        ...programming.hoursOfOperation,
        [field]: value,
      },
    });
  };

  const updateStaffing = (role: string, field: string, value: number) => {
    updateData('programming', {
      staffingPlan: {
        ...programming.staffingPlan,
        [role]: {
          ...programming.staffingPlan[role as keyof typeof programming.staffingPlan],
          [field]: value,
        },
      },
    });
  };

  const updateMembershipTier = (index: number, field: keyof MembershipTier, value: any) => {
    const updated = programming.membershipTiers.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    );
    updateData('programming', { membershipTiers: updated });
  };

  const addMembershipTier = () => {
    updateData('programming', {
      membershipTiers: [...programming.membershipTiers, { name: '', monthlyPrice: 0, benefits: [] }],
    });
  };

  const removeMembershipTier = (index: number) => {
    updateData('programming', {
      membershipTiers: programming.membershipTiers.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Programming & Operations</h2>
        <p className="text-muted-foreground">Define your pricing, hours, and staffing plan</p>
      </div>

      {/* Rental Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Rental Pricing (per hour)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Standard Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={programming.rentalPricing.standardRate}
                  onChange={(e) => updateRentalPricing('standardRate', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Peak Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={programming.rentalPricing.peakRate}
                  onChange={(e) => updateRentalPricing('peakRate', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Off-Peak Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={programming.rentalPricing.offPeakRate}
                  onChange={(e) => updateRentalPricing('offPeakRate', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Team Block Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={programming.rentalPricing.teamBlockRate}
                  onChange={(e) => updateRentalPricing('teamBlockRate', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Tiers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membership Tiers
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addMembershipTier}>
            <Plus className="w-4 h-4 mr-1" />
            Add Tier
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {programming.membershipTiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tier Name</Label>
                  <Input
                    value={tier.name}
                    onChange={(e) => updateMembershipTier(index, 'name', e.target.value)}
                    placeholder="e.g., Individual"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Monthly Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={tier.monthlyPrice}
                      onChange={(e) => updateMembershipTier(index, 'monthlyPrice', parseInt(e.target.value) || 0)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMembershipTier(index)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Lesson Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Private ($/hr)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={programming.lessonPricing.privateRate}
                  onChange={(e) => updateLessonPricing('privateRate', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Semi-Private ($/hr)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={programming.lessonPricing.semiPrivateRate}
                  onChange={(e) => updateLessonPricing('semiPrivateRate', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Group ($/person)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={programming.lessonPricing.groupRate}
                  onChange={(e) => updateLessonPricing('groupRate', parseInt(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Instructor Split (%)</Label>
              <Input
                type="number"
                value={programming.lessonPricing.instructorSplit}
                onChange={(e) => updateLessonPricing('instructorSplit', parseInt(e.target.value) || 0)}
                max={100}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hours of Operation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Hours of Operation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="font-medium">Weekdays</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Open</Label>
                  <Input
                    type="time"
                    value={programming.hoursOfOperation.weekdayOpen}
                    onChange={(e) => updateHours('weekdayOpen', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Close</Label>
                  <Input
                    type="time"
                    value={programming.hoursOfOperation.weekdayClose}
                    onChange={(e) => updateHours('weekdayClose', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="font-medium">Weekends</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Open</Label>
                  <Input
                    type="time"
                    value={programming.hoursOfOperation.weekendOpen}
                    onChange={(e) => updateHours('weekendOpen', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Close</Label>
                  <Input
                    type="time"
                    value={programming.hoursOfOperation.weekendClose}
                    onChange={(e) => updateHours('weekendClose', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staffing Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staffing Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg space-y-3">
              <Label className="font-medium">General Manager</Label>
              <div className="space-y-2">
                <Label className="text-sm">Annual Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={programming.staffingPlan.generalManager.salary}
                    onChange={(e) => updateStaffing('generalManager', 'salary', parseInt(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg space-y-3">
              <Label className="font-medium">Head Instructor</Label>
              <div className="space-y-2">
                <Label className="text-sm">Annual Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={programming.staffingPlan.headInstructor.salary}
                    onChange={(e) => updateStaffing('headInstructor', 'salary', parseInt(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg space-y-3">
              <Label className="font-medium">Front Desk Staff</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm">Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={programming.staffingPlan.frontDesk.hourlyRate}
                      onChange={(e) => updateStaffing('frontDesk', 'hourlyRate', parseInt(e.target.value) || 0)}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm"># of Staff</Label>
                  <Input
                    type="number"
                    value={programming.staffingPlan.frontDesk.count}
                    onChange={(e) => updateStaffing('frontDesk', 'count', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg space-y-3">
              <Label className="font-medium">Part-Time Staff</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm">Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={programming.staffingPlan.partTimeStaff.hourlyRate}
                      onChange={(e) => updateStaffing('partTimeStaff', 'hourlyRate', parseInt(e.target.value) || 0)}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm"># of Staff</Label>
                  <Input
                    type="number"
                    value={programming.staffingPlan.partTimeStaff.count}
                    onChange={(e) => updateStaffing('partTimeStaff', 'count', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
