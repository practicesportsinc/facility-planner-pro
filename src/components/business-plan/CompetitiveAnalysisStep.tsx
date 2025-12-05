import React, { useState } from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { Competitor } from '@/types/businessPlan';

const MARKET_GAPS = [
  { id: 'geographic', label: 'Geographic Gap', description: 'No facilities nearby' },
  { id: 'technology', label: 'Technology Gap', description: 'Competitors lack modern tech' },
  { id: 'sport_specific', label: 'Sport-Specific Gap', description: 'Underserved sport(s) in area' },
  { id: 'quality', label: 'Quality/Experience Gap', description: 'Low quality options only' },
  { id: 'capacity', label: 'Capacity Gap', description: 'Existing facilities at capacity' },
  { id: 'programming', label: 'Programming Gap', description: 'Limited lesson/camp offerings' },
];

const DIFFERENTIATORS = [
  'State-of-the-art technology (HitTrax, etc.)',
  'Superior facility quality/cleanliness',
  'Expert instruction staff',
  'Flexible scheduling/hours',
  'Competitive pricing',
  'Unique programming/camps',
  'Premium customer service',
  'Convenient location/parking',
  'Multi-sport offerings',
  'Youth development focus',
];

export default function CompetitiveAnalysisStep() {
  const { data, updateData } = useBusinessPlan();
  const { competitiveAnalysis } = data;

  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      name: '',
      distance: 0,
      size: '',
      technology: '',
      utilizationLevel: 'medium',
      strengths: '',
      weaknesses: '',
    };
    updateData('competitiveAnalysis', {
      competitors: [...competitiveAnalysis.competitors, newCompetitor],
    });
  };

  const updateCompetitor = (index: number, field: keyof Competitor, value: any) => {
    const updated = competitiveAnalysis.competitors.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateData('competitiveAnalysis', { competitors: updated });
  };

  const removeCompetitor = (index: number) => {
    const updated = competitiveAnalysis.competitors.filter((_, i) => i !== index);
    updateData('competitiveAnalysis', { competitors: updated });
  };

  const toggleMarketGap = (gapId: string) => {
    const current = competitiveAnalysis.marketGaps;
    const updated = current.includes(gapId)
      ? current.filter(g => g !== gapId)
      : [...current, gapId];
    updateData('competitiveAnalysis', { marketGaps: updated });
  };

  const toggleDifferentiator = (diff: string) => {
    const current = competitiveAnalysis.uniqueDifferentiators;
    const updated = current.includes(diff)
      ? current.filter(d => d !== diff)
      : [...current, diff];
    updateData('competitiveAnalysis', { uniqueDifferentiators: updated });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Competitive Analysis</h2>
        <p className="text-muted-foreground">Analyze your competition and identify your market position</p>
      </div>

      {/* Competitor List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Known Competitors</Label>
          <Button variant="outline" size="sm" onClick={addCompetitor} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Competitor
          </Button>
        </div>

        {competitiveAnalysis.competitors.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No competitors added yet</p>
              <p className="text-sm">Click "Add Competitor" to identify local competition</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {competitiveAnalysis.competitors.map((competitor, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Competitor {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompetitor(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Name</Label>
                      <Input
                        placeholder="Competitor name"
                        value={competitor.name}
                        onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Distance (miles)</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={competitor.distance || ''}
                        onChange={(e) => updateCompetitor(index, 'distance', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Size</Label>
                      <Input
                        placeholder="e.g., 15,000 SF"
                        value={competitor.size}
                        onChange={(e) => updateCompetitor(index, 'size', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Technology Level</Label>
                      <Input
                        placeholder="e.g., Basic, HitTrax, etc."
                        value={competitor.technology}
                        onChange={(e) => updateCompetitor(index, 'technology', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Utilization</Label>
                      <Select
                        value={competitor.utilizationLevel}
                        onValueChange={(v) => updateCompetitor(index, 'utilizationLevel', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (seems empty)</SelectItem>
                          <SelectItem value="medium">Medium (moderate traffic)</SelectItem>
                          <SelectItem value="high">High (always busy)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Strengths</Label>
                      <Textarea
                        placeholder="What do they do well?"
                        value={competitor.strengths}
                        onChange={(e) => updateCompetitor(index, 'strengths', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Weaknesses</Label>
                      <Textarea
                        placeholder="Where do they fall short?"
                        value={competitor.weaknesses}
                        onChange={(e) => updateCompetitor(index, 'weaknesses', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Market Gaps */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Market Gaps Identified</Label>
        <p className="text-sm text-muted-foreground">What opportunities exist in your market?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MARKET_GAPS.map((gap) => (
            <Card
              key={gap.id}
              className={`cursor-pointer transition-all ${
                competitiveAnalysis.marketGaps.includes(gap.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => toggleMarketGap(gap.id)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Checkbox
                  checked={competitiveAnalysis.marketGaps.includes(gap.id)}
                  className="pointer-events-none"
                />
                <div>
                  <div className="font-medium text-foreground">{gap.label}</div>
                  <div className="text-sm text-muted-foreground">{gap.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Unique Differentiators */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Your Unique Differentiators</Label>
        <p className="text-sm text-muted-foreground">How will you stand out from competitors?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DIFFERENTIATORS.map((diff) => (
            <Card
              key={diff}
              className={`cursor-pointer transition-all ${
                competitiveAnalysis.uniqueDifferentiators.includes(diff)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => toggleDifferentiator(diff)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <Checkbox
                  checked={competitiveAnalysis.uniqueDifferentiators.includes(diff)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{diff}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Differentiation Strategy */}
      <div className="space-y-2">
        <Label htmlFor="diffStrategy" className="text-base font-medium">Differentiation Strategy</Label>
        <p className="text-sm text-muted-foreground">Summarize your competitive positioning in 1-2 sentences</p>
        <Textarea
          id="diffStrategy"
          placeholder="e.g., We will be the only facility in the area with HitTrax technology, combined with expert instruction staff that provides a premium training experience..."
          value={competitiveAnalysis.differentiationStrategy}
          onChange={(e) => updateData('competitiveAnalysis', { differentiationStrategy: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}
