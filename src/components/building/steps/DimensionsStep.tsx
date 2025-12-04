import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BuildingConfig } from "@/utils/buildingCalculator";
import { Ruler, ArrowUpDown, Square } from "lucide-react";

interface DimensionsStepProps {
  config: BuildingConfig;
  updateConfig: (updates: Partial<BuildingConfig>) => void;
  onNext: () => void;
}

const PRESETS = [
  { label: "Small (10,000 SF)", width: 80, length: 125, height: 20 },
  { label: "Medium (15,000 SF)", width: 100, length: 150, height: 20 },
  { label: "Large (24,000 SF)", width: 120, length: 200, height: 24 },
  { label: "XL (40,000 SF)", width: 150, length: 267, height: 24 },
];

export function DimensionsStep({ config, updateConfig, onNext }: DimensionsStepProps) {
  const grossSF = config.width * config.length;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Building Dimensions</h2>
        <p className="text-muted-foreground">
          Enter your building dimensions or select a preset size below.
        </p>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            className={`h-auto py-3 flex flex-col ${
              config.width === preset.width && config.length === preset.length
                ? 'border-primary bg-primary/10'
                : ''
            }`}
            onClick={() => updateConfig({ 
              width: preset.width, 
              length: preset.length,
              eaveHeight: preset.height 
            })}
          >
            <span className="font-medium">{preset.label}</span>
            <span className="text-xs text-muted-foreground">
              {preset.width}' × {preset.length}'
            </span>
          </Button>
        ))}
      </div>

      {/* Custom Dimensions */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="width" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Width (feet)
              </Label>
              <Input
                id="width"
                type="number"
                min={40}
                max={300}
                value={config.width}
                onChange={(e) => updateConfig({ width: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="length" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Length (feet)
              </Label>
              <Input
                id="length"
                type="number"
                min={40}
                max={500}
                value={config.length}
                onChange={(e) => updateConfig({ length: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eaveHeight" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Eave Height (feet)
              </Label>
              <Input
                id="eaveHeight"
                type="number"
                min={14}
                max={40}
                value={config.eaveHeight}
                onChange={(e) => updateConfig({ eaveHeight: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 20' for baseball, 24' for basketball/volleyball
              </p>
            </div>
          </div>

          {/* Calculated Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                <Square className="h-3 w-3" />
                Gross SF
              </div>
              <div className="text-2xl font-bold text-primary">
                {grossSF.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground text-sm mb-1">Bay Spacing</div>
              <div className="text-lg font-semibold">
                {config.width <= 60 ? "20'" : config.width <= 100 ? "25'" : "30'"} 
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground text-sm mb-1">Perimeter</div>
              <div className="text-lg font-semibold">
                {(2 * (config.width + config.length)).toLocaleString()} LF
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground text-sm mb-1">Clear Height</div>
              <div className="text-lg font-semibold">{config.eaveHeight}'</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          className="bg-gradient-primary"
          disabled={grossSF < 1000}
        >
          Continue to Doors & Openings
        </Button>
      </div>
    </div>
  );
}
