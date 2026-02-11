import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Info } from 'lucide-react';
import { MAINTENANCE_ASSETS } from '@/data/maintenanceAssets';
import { ASSET_CLASS_LABELS } from '@/data/maintenanceAssets';
import type { AssetSelection } from '@/types/maintenance';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  sports: string[];
  selections: AssetSelection[];
  onChange: (selections: AssetSelection[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AssetSelectionStep({ sports, selections, onChange, onNext, onBack }: Props) {
  // Filter assets that match at least one selected sport
  const relevantAssets = MAINTENANCE_ASSETS.filter((asset) =>
    asset.sports.some((s) => sports.includes(s))
  );

  // Group by class
  const grouped = relevantAssets.reduce<Record<string, typeof relevantAssets>>((acc, asset) => {
    const key = asset.assetClass;
    if (!acc[key]) acc[key] = [];
    acc[key].push(asset);
    return acc;
  }, {});

  const selectedIds = new Set(selections.map((s) => s.assetId));

  const toggle = (assetId: string) => {
    if (selectedIds.has(assetId)) {
      onChange(selections.filter((s) => s.assetId !== assetId));
    } else {
      onChange([
        ...selections,
        { assetId, quantity: 1, motorized: false, ageBucket: '0-3', usageIntensity: 'moderate' },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">What equipment is in your facility?</h2>
        <p className="text-muted-foreground mt-1">Select all equipment and assets present. We've filtered based on your sports.</p>
      </div>

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cls, assets]) => (
          <div key={cls} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Class {cls}: {ASSET_CLASS_LABELS[cls]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assets.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <Card
                    key={asset.id}
                    onClick={() => toggle(asset.id)}
                    className={`cursor-pointer p-4 flex items-start gap-3 transition-all hover:shadow-md ${
                      isSelected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <div className={`mt-0.5 rounded-full p-1 ${isSelected ? 'bg-primary' : 'bg-muted'}`}>
                      <Check className={`h-3 w-3 ${isSelected ? 'text-primary-foreground' : 'text-transparent'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm">{asset.name}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">{asset.description}</TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{asset.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={selections.length === 0} size="lg">Continue</Button>
      </div>
    </div>
  );
}
