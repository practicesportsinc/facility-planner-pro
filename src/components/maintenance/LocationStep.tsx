import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { MaintenanceWizardState } from '@/types/maintenance';

interface Props {
  state: MaintenanceWizardState;
  onChange: (partial: Partial<MaintenanceWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function LocationStep({ state, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Facility Location & Contact</h2>
        <p className="text-muted-foreground mt-1">
          Your location helps with contractor guidance. Email is required to receive your plan.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Your Name *</Label>
            <Input value={state.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="John Smith" />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" value={state.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="john@facility.com" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Facility Name</Label>
          <Input value={state.facilityName} onChange={(e) => onChange({ facilityName: e.target.value })} placeholder="(optional)" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={state.locationCity} onChange={(e) => onChange({ locationCity: e.target.value })} placeholder="(optional)" />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input value={state.locationState} onChange={(e) => onChange({ locationState: e.target.value })} placeholder="(optional)" />
          </div>
          <div className="space-y-1.5">
            <Label>ZIP Code</Label>
            <Input
              value={state.locationZip}
              onChange={(e) => onChange({ locationZip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
              placeholder="(optional)"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button
          onClick={onNext}
          disabled={!state.name.trim() || !state.email.trim() || !state.email.includes('@')}
          size="lg"
        >
          Generate My Plan
        </Button>
      </div>
    </div>
  );
}
