import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MAINTENANCE_ASSETS } from '@/data/maintenanceAssets';
import type { AgeBucket, AssetSelection, UsageIntensity } from '@/types/maintenance';

interface Props {
  selections: AssetSelection[];
  onChange: (selections: AssetSelection[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AssetDetailsStep({ selections, onChange, onNext, onBack }: Props) {
  const update = (idx: number, partial: Partial<AssetSelection>) => {
    const updated = [...selections];
    updated[idx] = { ...updated[idx], ...partial };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Tell us about your equipment</h2>
        <p className="text-muted-foreground mt-1">Optional details help us customize your maintenance cadences. Skip any you're unsure about.</p>
      </div>

      <div className="space-y-4">
        {selections.map((sel, idx) => {
          const asset = MAINTENANCE_ASSETS.find((a) => a.id === sel.assetId);
          if (!asset) return null;

          return (
            <Card key={sel.assetId} className="p-4 space-y-4">
              <h3 className="font-semibold">{asset.name}</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={sel.quantity}
                    onChange={(e) => update(idx, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Age</Label>
                  <Select value={sel.ageBucket} onValueChange={(v) => update(idx, { ageBucket: v as AgeBucket })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-3">0–3 years</SelectItem>
                      <SelectItem value="4-7">4–7 years</SelectItem>
                      <SelectItem value="8-12">8–12 years</SelectItem>
                      <SelectItem value="13+">13+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Usage</Label>
                  <Select value={sel.usageIntensity} onValueChange={(v) => update(idx, { usageIntensity: v as UsageIntensity })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {asset.motorizedOption && (
                  <div className="flex items-center gap-2 self-end pb-1">
                    <Switch
                      checked={sel.motorized}
                      onCheckedChange={(v) => update(idx, { motorized: v })}
                    />
                    <Label className="text-xs">Motorized</Label>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} size="lg">Continue</Button>
      </div>
    </div>
  );
}
