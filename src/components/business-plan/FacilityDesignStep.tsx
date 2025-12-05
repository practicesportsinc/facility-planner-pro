import React from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ruler, ArrowUpDown } from 'lucide-react';

const CEILING_HEIGHTS = [
  { value: 16, label: '16 ft', suitable: ['Pickleball', 'Batting cages'] },
  { value: 18, label: '18 ft', suitable: ['Pickleball', 'Volleyball (rec)'] },
  { value: 20, label: '20 ft', suitable: ['Baseball cages', 'Volleyball'] },
  { value: 24, label: '24 ft', suitable: ['Basketball', 'Volleyball (comp)'] },
  { value: 28, label: '28+ ft', suitable: ['Basketball (comp)', 'Multi-sport'] },
];

const SPACE_CATEGORIES = [
  { key: 'playingTrainingAreas', label: 'Playing/Training Areas', recommended: 70 },
  { key: 'lobbyCheckIn', label: 'Lobby & Check-In', recommended: 8 },
  { key: 'partyTeamRoom', label: 'Party/Team Room', recommended: 6 },
  { key: 'proShop', label: 'Pro Shop/Retail', recommended: 4 },
  { key: 'restrooms', label: 'Restrooms/Lockers', recommended: 5 },
  { key: 'officeAdmin', label: 'Office/Admin', recommended: 4 },
  { key: 'storageMechanical', label: 'Storage/Mechanical', recommended: 3 },
];

const TECHNOLOGY_OPTIONS = [
  'HitTrax Baseball/Softball',
  'Rapsodo Pitching',
  'Video Analysis System',
  'Court Booking Software',
  'POS System',
  'Member Management Software',
  'Digital Displays/Scoreboards',
  'WiFi for Guests',
  'Security Cameras',
  'Access Control System',
];

const BUILDOUT_OPTIONS = [
  'HVAC Installation/Upgrade',
  'Electrical Upgrade (200+ amp)',
  'LED Lighting Package',
  'Plumbing (restrooms)',
  'Fire Sprinkler System',
  'Rubber/Sport Flooring',
  'Turf Installation',
  'Netting Systems',
  'Wall Padding',
  'Parking Lot Improvements',
];

export default function FacilityDesignStep() {
  const { data, updateData } = useBusinessPlan();
  const { facilityDesign } = data;

  const handleSpaceChange = (key: string, value: number) => {
    updateData('facilityDesign', {
      spaceAllocation: {
        ...facilityDesign.spaceAllocation,
        [key]: value,
      },
    });
  };

  const toggleTechnology = (tech: string) => {
    const current = facilityDesign.technologyRequirements;
    const updated = current.includes(tech)
      ? current.filter(t => t !== tech)
      : [...current, tech];
    updateData('facilityDesign', { technologyRequirements: updated });
  };

  const toggleBuildout = (item: string) => {
    const current = facilityDesign.buildOutRequirements;
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateData('facilityDesign', { buildOutRequirements: updated });
  };

  const totalAllocation = Object.values(facilityDesign.spaceAllocation).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Facility Design</h2>
        <p className="text-muted-foreground">Configure your facility size, layout, and equipment needs</p>
      </div>

      {/* Size and Height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Total Square Footage
          </Label>
          <div className="space-y-2">
            <Slider
              value={[facilityDesign.totalSquareFootage]}
              onValueChange={([v]) => updateData('facilityDesign', { totalSquareFootage: v })}
              min={5000}
              max={50000}
              step={1000}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5,000 SF</span>
              <span className="font-medium text-foreground">{facilityDesign.totalSquareFootage.toLocaleString()} SF</span>
              <span>50,000 SF</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Ceiling Height
          </Label>
          <Select
            value={facilityDesign.ceilingHeight.toString()}
            onValueChange={(v) => updateData('facilityDesign', { ceilingHeight: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CEILING_HEIGHTS.map((h) => (
                <SelectItem key={h.value} value={h.value.toString()}>
                  {h.label} - {h.suitable.join(', ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Space Allocation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Space Allocation</Label>
          <span className={`text-sm font-medium ${totalAllocation === 100 ? 'text-green-500' : 'text-yellow-500'}`}>
            Total: {totalAllocation}%
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPACE_CATEGORIES.map((cat) => {
            const value = facilityDesign.spaceAllocation[cat.key as keyof typeof facilityDesign.spaceAllocation];
            const sqft = Math.round((value / 100) * facilityDesign.totalSquareFootage);
            
            return (
              <Card key={cat.key} className="border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{cat.label}</span>
                    <span className="text-sm text-muted-foreground">{sqft.toLocaleString()} SF</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[value]}
                      onValueChange={([v]) => handleSpaceChange(cat.key, v)}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-sm font-medium">{value}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Technology Requirements */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Technology Requirements</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {TECHNOLOGY_OPTIONS.map((tech) => (
            <Card
              key={tech}
              className={`cursor-pointer transition-all ${
                facilityDesign.technologyRequirements.includes(tech)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => toggleTechnology(tech)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <Checkbox
                  checked={facilityDesign.technologyRequirements.includes(tech)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{tech}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Build-Out Requirements */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Build-Out Requirements</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {BUILDOUT_OPTIONS.map((item) => (
            <Card
              key={item}
              className={`cursor-pointer transition-all ${
                facilityDesign.buildOutRequirements.includes(item)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => toggleBuildout(item)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <Checkbox
                  checked={facilityDesign.buildOutRequirements.includes(item)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{item}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Facility Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Size</div>
              <div className="font-semibold text-foreground">{facilityDesign.totalSquareFootage.toLocaleString()} SF</div>
            </div>
            <div>
              <div className="text-muted-foreground">Ceiling Height</div>
              <div className="font-semibold text-foreground">{facilityDesign.ceilingHeight} ft</div>
            </div>
            <div>
              <div className="text-muted-foreground">Training Area</div>
              <div className="font-semibold text-foreground">
                {Math.round((facilityDesign.spaceAllocation.playingTrainingAreas / 100) * facilityDesign.totalSquareFootage).toLocaleString()} SF
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Tech Items</div>
              <div className="font-semibold text-foreground">{facilityDesign.technologyRequirements.length} selected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
