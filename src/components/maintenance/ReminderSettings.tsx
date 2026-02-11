import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ReminderPreferences, Cadence, MaintenanceWizardState, MaintenancePlan } from '@/types/maintenance';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const CADENCE_OPTIONS: { value: Cadence; label: string; defaultOn: boolean }[] = [
  { value: 'daily', label: 'Daily', defaultOn: false },
  { value: 'weekly', label: 'Weekly', defaultOn: false },
  { value: 'monthly', label: 'Monthly', defaultOn: true },
  { value: 'quarterly', label: 'Quarterly', defaultOn: true },
  { value: 'annual', label: 'Annual', defaultOn: true },
];

function getNextSendAt(cadence: Cadence, preferredDay: string, preferredTime: string): string {
  const now = new Date();
  const [hours, minutes] = preferredTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  switch (cadence) {
    case 'daily':
      if (target <= now) target.setDate(target.getDate() + 1);
      break;
    case 'weekly': {
      const dayIndex = DAYS.indexOf(preferredDay);
      const currentDay = (target.getDay() + 6) % 7; // Monday=0
      let diff = dayIndex - currentDay;
      if (diff < 0 || (diff === 0 && target <= now)) diff += 7;
      target.setDate(target.getDate() + diff);
      break;
    }
    case 'monthly':
      target.setDate(1);
      if (target <= now) target.setMonth(target.getMonth() + 1);
      break;
    case 'quarterly':
      target.setDate(1);
      target.setMonth(Math.ceil((now.getMonth() + 1) / 3) * 3);
      if (target <= now) target.setMonth(target.getMonth() + 3);
      break;
    case 'annual':
      target.setMonth(0, 1);
      if (target <= now) target.setFullYear(target.getFullYear() + 1);
      break;
  }
  return target.toISOString();
}

interface Props {
  state: MaintenanceWizardState;
  plan: MaintenancePlan;
  onUpdate: (prefs: ReminderPreferences) => void;
}

export function ReminderSettings({ state, plan, onUpdate }: Props) {
  const [prefs, setPrefs] = useState<ReminderPreferences>(state.reminderPreferences);
  const [saving, setSaving] = useState(false);
  const [recipientInput, setRecipientInput] = useState(prefs.additionalRecipients.join(', '));

  const toggleCadence = (cadence: Cadence) => {
    setPrefs((p) => ({
      ...p,
      cadences: p.cadences.includes(cadence)
        ? p.cadences.filter((c) => c !== cadence)
        : [...p.cadences, cadence],
    }));
  };

  const handleSave = async () => {
    if (!state.email) {
      toast({ title: 'Email required', description: 'Please complete the Location step with your email first.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const additionalRecipients = recipientInput
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.includes('@'));

      const updatedPrefs: ReminderPreferences = { ...prefs, additionalRecipients };
      const allRecipients = [state.email, ...additionalRecipients];

      // Upsert the maintenance plan
      const { data: planRow, error: planError } = await supabase
        .from('maintenance_plans')
        .upsert({
          email: state.email,
          name: state.name || null,
          location_city: state.locationCity || null,
          location_state: state.locationState || null,
          location_zip: state.locationZip || null,
          selected_assets: state.selectedAssets as any,
          plan_data: plan as any,
          plan_version: plan.version,
          reminder_preferences: updatedPrefs as any,
          reminders_active: updatedPrefs.enabled,
        }, { onConflict: 'email' })
        .select('id')
        .single();

      if (planError) throw planError;
      const planId = planRow.id;

      // Delete existing reminders for this plan
      await supabase.from('maintenance_reminders').update({ is_active: false }).eq('plan_id', planId);

      // Create new reminder rows for each selected cadence
      if (updatedPrefs.enabled && updatedPrefs.cadences.length > 0) {
        const reminders = updatedPrefs.cadences.map((cadence) => ({
          plan_id: planId,
          cadence,
          next_send_at: getNextSendAt(cadence, updatedPrefs.preferredDay, updatedPrefs.preferredTime),
          recipients: allRecipients,
          is_active: true,
        }));

        const { error: remError } = await supabase.from('maintenance_reminders').insert(reminders);
        if (remError) throw remError;
      }

      onUpdate(updatedPrefs);
      toast({ title: 'Reminder preferences saved', description: updatedPrefs.enabled ? `You'll receive reminders for ${updatedPrefs.cadences.join(', ')} tasks.` : 'Reminders have been disabled.' });
    } catch (err: any) {
      console.error('Failed to save reminders:', err);
      toast({ title: 'Error saving preferences', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Email Reminders</h3>
        </div>
        <Switch
          checked={prefs.enabled}
          onCheckedChange={(enabled) => setPrefs((p) => ({ ...p, enabled }))}
        />
      </div>

      {prefs.enabled && (
        <div className="space-y-4 pt-2">
          {/* Cadence checkboxes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Which reminders do you want?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CADENCE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={prefs.cadences.includes(opt.value)}
                    onCheckedChange={() => toggleCadence(opt.value)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Day & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-1 block">Preferred day</Label>
              <Select value={prefs.preferredDay} onValueChange={(v) => setPrefs((p) => ({ ...p, preferredDay: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1 block">Preferred time</Label>
              <Select value={prefs.preferredTime} onValueChange={(v) => setPrefs((p) => ({ ...p, preferredTime: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional recipients */}
          <div>
            <Label className="text-sm mb-1 block">Additional recipients (comma-separated)</Label>
            <Input
              placeholder="manager@facility.com, tech@facility.com"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            You can manage or cancel reminders anytime via the link in each reminder email.
          </p>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving…' : 'Save Reminder Preferences'}
          </Button>
        </div>
      )}
    </Card>
  );
}
