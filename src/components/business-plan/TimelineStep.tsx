import React from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calendar, ListChecks } from 'lucide-react';
import { TimelinePhase, ChecklistItem } from '@/types/businessPlan';
import { format, addMonths, parseISO } from 'date-fns';

const DEFAULT_PHASES: Omit<TimelinePhase, 'startDate' | 'endDate'>[] = [
  { phase: 'Feasibility & Planning', status: 'not_started' },
  { phase: 'Site Search & Selection', status: 'not_started' },
  { phase: 'Lease Negotiation', status: 'not_started' },
  { phase: 'Design & Permitting', status: 'not_started' },
  { phase: 'Construction & Buildout', status: 'not_started' },
  { phase: 'Equipment Installation', status: 'not_started' },
  { phase: 'Hiring & Training', status: 'not_started' },
  { phase: 'Pre-Opening Marketing', status: 'not_started' },
  { phase: 'Soft Opening', status: 'not_started' },
  { phase: 'Grand Opening', status: 'not_started' },
];

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'dueDate'>[] = [
  { item: 'Complete market research and feasibility analysis', completed: false },
  { item: 'Finalize business plan and financial projections', completed: false },
  { item: 'Secure financing/investment commitments', completed: false },
  { item: 'Identify and tour potential sites', completed: false },
  { item: 'Negotiate and sign lease agreement', completed: false },
  { item: 'Hire architect/designer for space planning', completed: false },
  { item: 'Obtain necessary permits and licenses', completed: false },
  { item: 'Select and order equipment', completed: false },
  { item: 'Hire General Manager', completed: false },
  { item: 'Launch pre-opening marketing campaign', completed: false },
];

export default function TimelineStep() {
  const { data, updateData } = useBusinessPlan();
  const { timeline, projectOverview } = data;

  // Initialize phases if empty
  React.useEffect(() => {
    if (timeline.phases.length === 0) {
      // Use targetOpeningDate if available, otherwise default to 12 months from now
      const baseDate = projectOverview.targetOpeningDate 
        ? parseISO(`${projectOverview.targetOpeningDate}-01`)
        : addMonths(new Date(), 12);
      
      const phases: TimelinePhase[] = DEFAULT_PHASES.map((p, i) => ({
        ...p,
        startDate: format(addMonths(baseDate, -12 + i), 'yyyy-MM'),
        endDate: format(addMonths(baseDate, -11 + i), 'yyyy-MM'),
      }));
      
      updateData('timeline', { 
        phases,
        targetOpeningDate: timeline.targetOpeningDate || projectOverview.targetOpeningDate || format(baseDate, 'yyyy-MM')
      });
    }
    
    if (timeline.checklist.length === 0) {
      const checklist: ChecklistItem[] = DEFAULT_CHECKLIST.map((c) => ({
        ...c,
        dueDate: '',
      }));
      updateData('timeline', { checklist });
    }
  }, []);

  const updatePhase = (index: number, field: keyof TimelinePhase, value: any) => {
    const updated = timeline.phases.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    updateData('timeline', { phases: updated });
  };

  const addPhase = () => {
    const newPhase: TimelinePhase = {
      phase: '',
      startDate: '',
      endDate: '',
      status: 'not_started',
    };
    updateData('timeline', { phases: [...timeline.phases, newPhase] });
  };

  const removePhase = (index: number) => {
    updateData('timeline', { phases: timeline.phases.filter((_, i) => i !== index) });
  };

  const updateChecklist = (index: number, field: keyof ChecklistItem, value: any) => {
    const updated = timeline.checklist.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateData('timeline', { checklist: updated });
  };

  const addChecklistItem = () => {
    updateData('timeline', {
      checklist: [...timeline.checklist, { item: '', completed: false, dueDate: '' }],
    });
  };

  const removeChecklistItem = (index: number) => {
    updateData('timeline', { checklist: timeline.checklist.filter((_, i) => i !== index) });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Implementation Timeline</h2>
        <p className="text-muted-foreground">Plan your project phases and key milestones</p>
      </div>

      {/* Target Opening */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Target Opening Date</Label>
        <Input
          type="month"
          value={timeline.targetOpeningDate || projectOverview.targetOpeningDate}
          onChange={(e) => updateData('timeline', { targetOpeningDate: e.target.value })}
          className="max-w-xs"
        />
      </div>

      {/* Project Phases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Project Phases
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addPhase}>
            <Plus className="w-4 h-4 mr-1" />
            Add Phase
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeline.phases.map((phase, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-sm">Phase</Label>
                  <Input
                    value={phase.phase}
                    onChange={(e) => updatePhase(index, 'phase', e.target.value)}
                    placeholder="Phase name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Start</Label>
                  <Input
                    type="month"
                    value={phase.startDate}
                    onChange={(e) => updatePhase(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">End</Label>
                  <Input
                    type="month"
                    value={phase.endDate}
                    onChange={(e) => updatePhase(index, 'endDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={phase.status}
                    onValueChange={(v) => updatePhase(index, 'status', v)}
                  >
                    <SelectTrigger className={getStatusColor(phase.status)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePhase(index)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      {timeline.phases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {timeline.phases.map((phase, index) => (
                <div key={index} className="flex items-center gap-4 mb-4 last:mb-0">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'in_progress' ? 'bg-blue-500' : 'bg-muted'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{phase.phase || `Phase ${index + 1}`}</span>
                      <span className="text-sm text-muted-foreground">
                        {phase.startDate && phase.endDate && `${phase.startDate} → ${phase.endDate}`}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          phase.status === 'completed' ? 'bg-green-500 w-full' :
                          phase.status === 'in_progress' ? 'bg-blue-500 w-1/2' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Checklist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Action Checklist
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addChecklistItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeline.checklist.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => updateChecklist(index, 'completed', checked)}
              />
              <Input
                value={item.item}
                onChange={(e) => updateChecklist(index, 'item', e.target.value)}
                placeholder="Action item"
                className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
              />
              <Input
                type="date"
                value={item.dueDate}
                onChange={(e) => updateChecklist(index, 'dueDate', e.target.value)}
                className="w-40"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeChecklistItem(index)}
                className="text-destructive"
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
