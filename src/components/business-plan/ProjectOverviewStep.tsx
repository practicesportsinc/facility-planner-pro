import React from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Building, MapPin, Calendar, Hammer } from 'lucide-react';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const PROJECT_STAGES = [
  { value: 'concept', label: 'Concept / Idea Stage', description: 'Just exploring the possibility' },
  { value: 'feasibility', label: 'Feasibility Analysis', description: 'Evaluating viability and market' },
  { value: 'site_search', label: 'Site Search', description: 'Actively looking for location' },
  { value: 'financing', label: 'Securing Financing', description: 'Working on funding' },
  { value: 'construction', label: 'Construction / Buildout', description: 'Building or renovating' },
];

const BUILD_MODES = [
  { value: 'lease', label: 'Lease Existing Space', icon: Building, description: 'Find and lease commercial space' },
  { value: 'buy', label: 'Buy Existing Building', icon: Building, description: 'Purchase and renovate' },
  { value: 'build', label: 'Build New', icon: Hammer, description: 'Ground-up construction' },
];

export default function ProjectOverviewStep() {
  const { data, updateData } = useBusinessPlan();
  const { projectOverview } = data;

  const handleChange = (field: string, value: string) => {
    updateData('projectOverview', { [field]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Project Overview</h2>
        <p className="text-muted-foreground">Tell us about your sports facility project</p>
      </div>

      {/* Facility Name */}
      <div className="space-y-2">
        <Label htmlFor="facilityName" className="text-base font-medium">Facility Name</Label>
        <Input
          id="facilityName"
          placeholder="e.g., Diamond Performance Center"
          value={projectOverview.facilityName}
          onChange={(e) => handleChange('facilityName', e.target.value)}
          className="text-lg"
        />
      </div>

      {/* Location */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={projectOverview.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={projectOverview.state} onValueChange={(v) => handleChange('state', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              placeholder="ZIP Code"
              value={projectOverview.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              maxLength={5}
            />
          </div>
        </div>
      </div>

      {/* Target Opening Date */}
      <div className="space-y-2">
        <Label htmlFor="targetOpeningDate" className="text-base font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Target Opening Date
        </Label>
        <Input
          id="targetOpeningDate"
          type="month"
          value={projectOverview.targetOpeningDate}
          onChange={(e) => handleChange('targetOpeningDate', e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Project Stage */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Project Stage</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROJECT_STAGES.map((stage) => (
            <Card
              key={stage.value}
              className={`cursor-pointer transition-all hover:border-primary ${
                projectOverview.projectStage === stage.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
              onClick={() => handleChange('projectStage', stage.value)}
            >
              <CardContent className="p-4">
                <div className="font-medium text-foreground">{stage.label}</div>
                <div className="text-sm text-muted-foreground">{stage.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Build Mode */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Build Mode</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BUILD_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.value}
                className={`cursor-pointer transition-all hover:border-primary ${
                  projectOverview.buildMode === mode.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => handleChange('buildMode', mode.value)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Icon className={`w-8 h-8 mb-2 ${
                    projectOverview.buildMode === mode.value ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="font-medium text-foreground">{mode.label}</div>
                  <div className="text-sm text-muted-foreground">{mode.description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
