import React from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, AlertTriangle, Shield, Target } from 'lucide-react';
import { RiskItem, GoNoGoCondition } from '@/types/businessPlan';

const DEFAULT_RISKS: RiskItem[] = [
  { risk: 'Demand below projections', likelihood: 'medium', impact: 'high', mitigation: 'Conservative ramp-up, flexible staffing model' },
  { risk: 'New competitor enters market', likelihood: 'medium', impact: 'medium', mitigation: 'Differentiation strategy, customer loyalty programs' },
  { risk: 'Construction delays/cost overruns', likelihood: 'medium', impact: 'medium', mitigation: 'Contingency budget, fixed-price contracts where possible' },
  { risk: 'Key instructor/staff departure', likelihood: 'low', impact: 'medium', mitigation: 'Cross-training, competitive compensation, non-compete agreements' },
  { risk: 'Safety incident/liability', likelihood: 'low', impact: 'high', mitigation: 'Comprehensive insurance, strict safety protocols, staff training' },
  { risk: 'Economic recession', likelihood: 'low', impact: 'high', mitigation: 'Diversified revenue streams, lean operations, cash reserves' },
];

const DEFAULT_GO_NO_GO: GoNoGoCondition[] = [
  { condition: 'Maximum lease rate', threshold: '$15/SF NNN or less', met: null },
  { condition: 'Pre-opening memberships', threshold: '50+ members signed before opening', met: null },
  { condition: 'Key staff hired', threshold: 'GM and Head Instructor confirmed', met: null },
  { condition: 'Financing secured', threshold: 'Loan approval or committed equity', met: null },
];

export default function RiskAssessmentStep() {
  const { data, updateData } = useBusinessPlan();
  const { riskAssessment } = data;

  // Initialize with defaults if empty
  React.useEffect(() => {
    if (riskAssessment.keyRisks.length === 0) {
      updateData('riskAssessment', { keyRisks: DEFAULT_RISKS });
    }
    if (riskAssessment.goNoGoConditions.length === 0) {
      updateData('riskAssessment', { goNoGoConditions: DEFAULT_GO_NO_GO });
    }
  }, []);

  const updateRisk = (index: number, field: keyof RiskItem, value: any) => {
    const updated = riskAssessment.keyRisks.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    updateData('riskAssessment', { keyRisks: updated });
  };

  const addRisk = () => {
    updateData('riskAssessment', {
      keyRisks: [...riskAssessment.keyRisks, { risk: '', likelihood: 'medium', impact: 'medium', mitigation: '' }],
    });
  };

  const removeRisk = (index: number) => {
    updateData('riskAssessment', {
      keyRisks: riskAssessment.keyRisks.filter((_, i) => i !== index),
    });
  };

  const updateCondition = (index: number, field: keyof GoNoGoCondition, value: any) => {
    const updated = riskAssessment.goNoGoConditions.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateData('riskAssessment', { goNoGoConditions: updated });
  };

  const addCondition = () => {
    updateData('riskAssessment', {
      goNoGoConditions: [...riskAssessment.goNoGoConditions, { condition: '', threshold: '', met: null }],
    });
  };

  const removeCondition = (index: number) => {
    updateData('riskAssessment', {
      goNoGoConditions: riskAssessment.goNoGoConditions.filter((_, i) => i !== index),
    });
  };

  const getRiskScore = (likelihood: string, impact: string) => {
    const scores: Record<string, number> = { low: 1, medium: 2, high: 3 };
    return scores[likelihood] * scores[impact];
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score <= 4) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Risk Assessment</h2>
        <p className="text-muted-foreground">Identify risks and define go/no-go conditions</p>
      </div>

      {/* Risk Tolerance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Tolerance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={riskAssessment.riskTolerance}
            onValueChange={(v) => updateData('riskAssessment', { riskTolerance: v as any })}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border border-border rounded-lg flex-1">
              <RadioGroupItem value="conservative" id="conservative" />
              <Label htmlFor="conservative" className="flex-1 cursor-pointer">
                <div className="font-medium">Conservative</div>
                <div className="text-sm text-muted-foreground">Lower risk, slower growth</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border border-border rounded-lg flex-1">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                <div className="font-medium">Moderate</div>
                <div className="text-sm text-muted-foreground">Balanced approach</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border border-border rounded-lg flex-1">
              <RadioGroupItem value="aggressive" id="aggressive" />
              <Label htmlFor="aggressive" className="flex-1 cursor-pointer">
                <div className="font-medium">Aggressive</div>
                <div className="text-sm text-muted-foreground">Higher risk, faster growth</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Key Risks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Key Risks
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addRisk}>
            <Plus className="w-4 h-4 mr-1" />
            Add Risk
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {riskAssessment.keyRisks.map((risk, index) => {
            const score = getRiskScore(risk.likelihood, risk.impact);
            return (
              <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm">Risk Description</Label>
                    <Input
                      value={risk.risk}
                      onChange={(e) => updateRisk(index, 'risk', e.target.value)}
                      placeholder="Describe the risk"
                    />
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-medium border ${getRiskColor(score)}`}>
                    Score: {score}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRisk(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Likelihood</Label>
                    <Select
                      value={risk.likelihood}
                      onValueChange={(v) => updateRisk(index, 'likelihood', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Impact</Label>
                    <Select
                      value={risk.impact}
                      onValueChange={(v) => updateRisk(index, 'impact', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Mitigation Strategy</Label>
                  <Textarea
                    value={risk.mitigation}
                    onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                    placeholder="How will you address this risk?"
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Go/No-Go Conditions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Go/No-Go Conditions
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addCondition}>
            <Plus className="w-4 h-4 mr-1" />
            Add Condition
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Define the conditions that must be met before proceeding with the project
          </p>
          {riskAssessment.goNoGoConditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Condition</Label>
                  <Input
                    value={condition.condition}
                    onChange={(e) => updateCondition(index, 'condition', e.target.value)}
                    placeholder="e.g., Maximum lease rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Threshold</Label>
                  <Input
                    value={condition.threshold}
                    onChange={(e) => updateCondition(index, 'threshold', e.target.value)}
                    placeholder="e.g., $15/SF NNN or less"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select
                  value={condition.met === null ? 'pending' : condition.met ? 'met' : 'not_met'}
                  onValueChange={(v) => updateCondition(index, 'met', v === 'pending' ? null : v === 'met')}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="met">Met ✓</SelectItem>
                    <SelectItem value="not_met">Not Met</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(index)}
                className="text-destructive mt-6"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
