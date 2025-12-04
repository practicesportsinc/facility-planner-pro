import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingConfig } from "@/utils/buildingCalculator";
import { Minus, Plus, DoorOpen, Warehouse, Store, Grid3X3 } from "lucide-react";

interface DoorsStepProps {
  config: BuildingConfig;
  updateConfig: (updates: Partial<BuildingConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface DoorItemProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  min?: number;
  max?: number;
}

function DoorItem({ label, description, value, onChange, icon, min = 0, max = 10 }: DoorItemProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {icon}
            </div>
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange(Math.max(min, value - 1))}
              disabled={value <= min}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{value}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange(Math.min(max, value + 1))}
              disabled={value >= max}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DoorsStep({ config, updateConfig, onNext, onBack }: DoorsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Doors & Openings</h2>
        <p className="text-muted-foreground">
          Configure the doors, windows, and entry points for your building.
        </p>
      </div>

      <div className="space-y-4">
        <DoorItem
          label="Roll-Up Door 12' × 14'"
          description="Large overhead doors for equipment access"
          value={config.rollUpDoors12x14}
          onChange={(v) => updateConfig({ rollUpDoors12x14: v })}
          icon={<Warehouse className="h-5 w-5" />}
        />
        
        <DoorItem
          label="Roll-Up Door 10' × 12'"
          description="Standard overhead doors"
          value={config.rollUpDoors10x12}
          onChange={(v) => updateConfig({ rollUpDoors10x12: v })}
          icon={<Warehouse className="h-5 w-5" />}
        />
        
        <DoorItem
          label="Man Doors (3' × 7')"
          description="Steel personnel doors with hardware"
          value={config.manDoors}
          onChange={(v) => updateConfig({ manDoors: v })}
          icon={<DoorOpen className="h-5 w-5" />}
        />
        
        <DoorItem
          label="Glass Storefront Entry"
          description="Double-door glass entry with frame"
          value={config.storefrontEntry}
          onChange={(v) => updateConfig({ storefrontEntry: v })}
          icon={<Store className="h-5 w-5" />}
        />
        
        <DoorItem
          label="Windows (4' × 4')"
          description="Insulated fixed windows"
          value={config.windows}
          onChange={(v) => updateConfig({ windows: v })}
          icon={<Grid3X3 className="h-5 w-5" />}
          max={20}
        />
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Openings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Large Roll-Ups</div>
              <div className="font-semibold">{config.rollUpDoors12x14}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Std Roll-Ups</div>
              <div className="font-semibold">{config.rollUpDoors10x12}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Man Doors</div>
              <div className="font-semibold">{config.manDoors}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Storefront</div>
              <div className="font-semibold">{config.storefrontEntry}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Windows</div>
              <div className="font-semibold">{config.windows}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-primary">
          Continue to Finish Level
        </Button>
      </div>
    </div>
  );
}
