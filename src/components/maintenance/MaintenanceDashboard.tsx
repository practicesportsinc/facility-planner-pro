import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Download, ChevronLeft, Wrench, ClipboardCheck, UserCheck, Mail, Loader2 } from 'lucide-react';
import { generateMaintenancePlan } from '@/utils/maintenanceEngine';
import { MAINTENANCE_ASSETS } from '@/data/maintenanceAssets';
import { ContractorGuidance } from './ContractorGuidance';
import { ReminderSettings } from './ReminderSettings';
import type { MaintenanceWizardState, Cadence, ScheduledTask, ReminderPreferences } from '@/types/maintenance';
import { generateMaintenancePlanPdf, generateMaintenancePlanPdfBase64 } from '@/utils/maintenancePlanPdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CADENCE_LABELS: Record<Cadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

function TaskList({ tasks }: { tasks: ScheduledTask[] }) {
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground py-4">No tasks for this cadence.</p>;

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <ClipboardCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{task.assetName}</span>
              {task.quantity > 1 && <Badge variant="secondary" className="text-xs">×{task.quantity}</Badge>}
              {task.isModified && <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">Modified cadence</Badge>}
              {task.docRequired && <Badge variant="outline" className="text-xs">Doc required</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs ${task.staffCanDo ? 'text-green-600' : 'text-amber-600'}`}>
                {task.staffCanDo ? '✓ Staff can do' : '⚠ Requires contractor'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  state: MaintenanceWizardState;
  onBack: () => void;
  onUpdateState: (partial: Partial<MaintenanceWizardState>) => void;
}

export function MaintenanceDashboard({ state, onBack, onUpdateState }: Props) {
  const plan = useMemo(() => generateMaintenancePlan(state.selectedAssets), [state.selectedAssets]);

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const totalTasks = Object.values(plan.tasks).reduce((sum, arr) => sum + arr.length, 0);

  const handleDownloadPdf = async () => {
    await generateMaintenancePlanPdf(state, plan);
  };

  const handleEmailPlan = async () => {
    if (!state.email) {
      toast.error('No email address found. Please go back and enter your email.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const pdfBase64 = await generateMaintenancePlanPdfBase64(state, plan);

      // Send via existing send-lead-emails edge function
      const { error: emailError } = await supabase.functions.invoke('send-lead-emails', {
        body: {
          customerEmail: state.email,
          customerName: state.name || 'Facility Owner',
          leadData: {
            name: state.name || 'Facility Owner',
            email: state.email,
          },
          facilityDetails: {
            sport: state.sports?.join(', ') || 'Multi-sport',
            projectType: 'Maintenance Plan',
            location: [state.locationCity, state.locationState, state.locationZip].filter(Boolean).join(', ') || undefined,
          },
          pdfAttachment: {
            filename: `maintenance-plan-${state.facilityName || 'facility'}.pdf`,
            content: pdfBase64,
          },
          source: 'maintenance-plan',
        },
      });

      if (emailError) throw emailError;

      // Capture lead in database
      await supabase.from('leads').insert({
        name: state.name || 'Facility Owner',
        email: state.email,
        source: 'maintenance-plan',
        city: state.locationCity || null,
        state: state.locationState || null,
        facility_type: 'Maintenance Plan',
        sports: state.sports?.join(', ') || null,
      });

      toast.success(`Plan emailed to ${state.email}`);
    } catch (err: any) {
      console.error('Email send error:', err);
      toast.error('Failed to send email. Please try downloading the PDF instead.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Your Maintenance Plan</h2>
        <p className="text-muted-foreground mt-1">
          {state.selectedAssets.length} assets • {totalTasks} scheduled tasks • Version {plan.version}
        </p>
      </div>

      {/* Red Flags */}
      {plan.redFlags.length > 0 && (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Red Flags — Immediate Action Required</h3>
          </div>
          <div className="space-y-3">
            {plan.redFlags.map((rf) => (
              <div key={rf.assetId}>
                <p className="text-sm font-medium">{rf.assetName}</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                  {rf.flags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Schedule Tabs */}
      <Tabs defaultValue="weekly">
        <TabsList className="w-full justify-start">
          {(Object.keys(CADENCE_LABELS) as Cadence[]).map((c) => (
            <TabsTrigger key={c} value={c} className="flex gap-1.5">
              {CADENCE_LABELS[c]}
              <Badge variant="secondary" className="text-xs">{plan.tasks[c].length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(CADENCE_LABELS) as Cadence[]).map((c) => (
          <TabsContent key={c} value={c}>
            <TaskList tasks={plan.tasks[c]} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Contractor Guidance */}
      <ContractorGuidance contractorNeeds={plan.contractorNeeds} />

      {/* Reminder Settings */}
      <ReminderSettings
        state={state}
        plan={plan}
        onUpdate={(prefs: ReminderPreferences) => onUpdateState({ reminderPreferences: prefs })}
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleEmailPlan} disabled={isSendingEmail}>
            {isSendingEmail ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
            {isSendingEmail ? 'Sending…' : 'Email Plan'}
          </Button>
          <Button onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
