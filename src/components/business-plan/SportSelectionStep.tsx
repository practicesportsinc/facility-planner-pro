import React from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SportAssessment } from '@/types/businessPlan';

const AVAILABLE_SPORTS = [
  { 
    id: 'baseball', 
    label: 'Baseball', 
    icon: '⚾',
    defaultAssessment: { localDemand: 'high', revenuePerHour: 55, spaceEfficiency: 'medium', equipmentCost: 'high', competitionLevel: 'medium' }
  },
  { 
    id: 'softball', 
    label: 'Softball', 
    icon: '🥎',
    defaultAssessment: { localDemand: 'medium', revenuePerHour: 50, spaceEfficiency: 'medium', equipmentCost: 'medium', competitionLevel: 'low' }
  },
  { 
    id: 'basketball', 
    label: 'Basketball', 
    icon: '🏀',
    defaultAssessment: { localDemand: 'high', revenuePerHour: 60, spaceEfficiency: 'high', equipmentCost: 'low', competitionLevel: 'high' }
  },
  { 
    id: 'volleyball', 
    label: 'Volleyball', 
    icon: '🏐',
    defaultAssessment: { localDemand: 'medium', revenuePerHour: 55, spaceEfficiency: 'high', equipmentCost: 'low', competitionLevel: 'medium' }
  },
  { 
    id: 'pickleball', 
    label: 'Pickleball', 
    icon: '🏓',
    defaultAssessment: { localDemand: 'high', revenuePerHour: 40, spaceEfficiency: 'high', equipmentCost: 'low', competitionLevel: 'medium' }
  },
  { 
    id: 'soccer', 
    label: 'Soccer/Futsal', 
    icon: '⚽',
    defaultAssessment: { localDemand: 'high', revenuePerHour: 65, spaceEfficiency: 'low', equipmentCost: 'medium', competitionLevel: 'high' }
  },
  { 
    id: 'lacrosse', 
    label: 'Lacrosse', 
    icon: '🥍',
    defaultAssessment: { localDemand: 'low', revenuePerHour: 55, spaceEfficiency: 'low', equipmentCost: 'medium', competitionLevel: 'low' }
  },
  { 
    id: 'golf', 
    label: 'Golf Simulators', 
    icon: '⛳',
    defaultAssessment: { localDemand: 'medium', revenuePerHour: 50, spaceEfficiency: 'high', equipmentCost: 'high', competitionLevel: 'medium' }
  },
];

const SECONDARY_OFFERINGS = [
  { id: 'speed_training', label: 'Speed & Agility Training' },
  { id: 'strength_conditioning', label: 'Strength & Conditioning' },
  { id: 'video_analysis', label: 'Video Analysis' },
  { id: 'pro_shop', label: 'Pro Shop / Retail' },
  { id: 'pitching_machines', label: 'Pitching Machines' },
  { id: 'virtual_reality', label: 'VR Training' },
  { id: 'recovery_services', label: 'Recovery Services' },
  { id: 'nutrition_coaching', label: 'Nutrition Coaching' },
];

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'high': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function SportSelectionStep() {
  const { data, updateData } = useBusinessPlan();
  const { sportSelection } = data;

  const toggleSport = (sportId: string) => {
    const sportConfig = AVAILABLE_SPORTS.find(s => s.id === sportId);
    if (!sportConfig) return;

    const existing = sportSelection.primarySports.find(s => s.sport === sportId);
    
    if (existing) {
      // Toggle selection
      const updated = sportSelection.primarySports.map(s =>
        s.sport === sportId ? { ...s, selected: !s.selected } : s
      );
      updateData('sportSelection', { primarySports: updated });
    } else {
      // Add new sport with default assessment
      const newSport: SportAssessment = {
        sport: sportId,
        selected: true,
        ...sportConfig.defaultAssessment as any,
      };
      updateData('sportSelection', { 
        primarySports: [...sportSelection.primarySports, newSport] 
      });
    }
  };

  const updateSportAssessment = (sportId: string, field: keyof SportAssessment, value: any) => {
    const updated = sportSelection.primarySports.map(s =>
      s.sport === sportId ? { ...s, [field]: value } : s
    );
    updateData('sportSelection', { primarySports: updated });
  };

  const toggleSecondary = (offeringId: string) => {
    const current = sportSelection.secondaryOfferings;
    const updated = current.includes(offeringId)
      ? current.filter(o => o !== offeringId)
      : [...current, offeringId];
    updateData('sportSelection', { secondaryOfferings: updated });
  };

  const selectedSports = sportSelection.primarySports.filter(s => s.selected);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Sport Selection & Mix</h2>
        <p className="text-muted-foreground">Choose your primary sports and assess market fit</p>
      </div>

      {/* Sport Selection Grid */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Primary Sports</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AVAILABLE_SPORTS.map((sport) => {
            const sportData = sportSelection.primarySports.find(s => s.sport === sport.id);
            const isSelected = sportData?.selected;
            
            return (
              <Card
                key={sport.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => toggleSport(sport.id)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <span className="text-3xl mb-2">{sport.icon}</span>
                  <div className="font-medium text-foreground">{sport.label}</div>
                  {isSelected && (
                    <Badge variant="outline" className="mt-2 text-xs">Selected</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sport Assessment Table */}
      {selectedSports.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Sport Assessment</Label>
          <p className="text-sm text-muted-foreground">Adjust ratings based on your local market knowledge</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sport</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Local Demand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">$/Hour</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Space Efficiency</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Equipment Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Competition</th>
                </tr>
              </thead>
              <tbody>
                {selectedSports.map((sport) => {
                  const sportConfig = AVAILABLE_SPORTS.find(s => s.id === sport.sport);
                  return (
                    <tr key={sport.sport} className="border-b border-border">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{sportConfig?.icon}</span>
                          <span className="font-medium">{sportConfig?.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={sport.localDemand}
                          onValueChange={(v) => updateSportAssessment(sport.sport, 'localDemand', v)}
                        >
                          <SelectTrigger className={`w-24 ${getRatingColor(sport.localDemand)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={sport.revenuePerHour}
                          onChange={(e) => updateSportAssessment(sport.sport, 'revenuePerHour', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={sport.spaceEfficiency}
                          onValueChange={(v) => updateSportAssessment(sport.sport, 'spaceEfficiency', v)}
                        >
                          <SelectTrigger className={`w-24 ${getRatingColor(sport.spaceEfficiency)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={sport.equipmentCost}
                          onValueChange={(v) => updateSportAssessment(sport.sport, 'equipmentCost', v)}
                        >
                          <SelectTrigger className={`w-24 ${getRatingColor(sport.equipmentCost === 'low' ? 'high' : sport.equipmentCost === 'high' ? 'low' : 'medium')}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={sport.competitionLevel}
                          onValueChange={(v) => updateSportAssessment(sport.sport, 'competitionLevel', v)}
                        >
                          <SelectTrigger className={`w-24 ${getRatingColor(sport.competitionLevel === 'low' ? 'high' : sport.competitionLevel === 'high' ? 'low' : 'medium')}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Secondary Offerings */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Secondary Offerings</Label>
        <p className="text-sm text-muted-foreground">Add complementary services to increase revenue</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SECONDARY_OFFERINGS.map((offering) => (
            <Card
              key={offering.id}
              className={`cursor-pointer transition-all ${
                sportSelection.secondaryOfferings.includes(offering.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => toggleSecondary(offering.id)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <Checkbox
                  checked={sportSelection.secondaryOfferings.includes(offering.id)}
                  className="pointer-events-none"
                />
                <span className="text-sm font-medium">{offering.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
