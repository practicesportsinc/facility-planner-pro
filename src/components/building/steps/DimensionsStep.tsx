import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BuildingConfig, getMaxRecommendedHeight } from "@/utils/buildingCalculator";
import { Ruler, ArrowUpDown, Square, AlertTriangle } from "lucide-react";
import { SportIcon, SportKey, SPORT_LABELS } from "@/components/home/SportIcons";

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

const BUILDING_SPORTS: SportKey[] = [
  'baseball_softball',
  'basketball',
  'volleyball',
  'pickleball',
  'soccer_indoor_small_sided',
  'football',
  'multi_sport'
];

export function DimensionsStep({ config, updateConfig, onNext }: DimensionsStepProps) {
  const grossSF = config.width * config.length;
  const sports = config.sports || [];
  const recommendedHeight = getMaxRecommendedHeight(sports);
  const isHeightOptimal = config.eaveHeight >= recommendedHeight;

  const toggleSport = (sport: SportKey) => {
    const updated = sports.includes(sport)
      ? sports.filter(s => s !== sport)
      : [...sports, sport];
    updateConfig({ sports: updated });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Building Dimensions</h2>
        <p className="text-muted-foreground">
          Enter your building dimensions or select a preset size below.
        </p>
      </div>

      {/* Sport Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-2">What sports will be played?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select your sports to get an eave height recommendation.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {BUILDING_SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => toggleSport(sport)}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                sports.includes(sport)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <SportIcon kind={sport} size={40} />
              <span className="text-xs mt-1 text-center leading-tight">{SPORT_LABELS[sport]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Height Recommendation */}
      {sports.length > 0 && (
        <div className={`p-4 rounded-lg border ${isHeightOptimal ? 'bg-primary/10 border-primary/20' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium">
                Recommended Eave Height: {recommendedHeight}'
              </p>
              <p className="text-sm text-muted-foreground">
                Based on: {sports.map(s => SPORT_LABELS[s as SportKey]).join(', ')}
              </p>
            </div>
            {config.eaveHeight !== recommendedHeight && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateConfig({ eaveHeight: recommendedHeight })}
              >
                Use Recommended
              </Button>
            )}
          </div>
          {!isHeightOptimal && (
            <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Current height ({config.eaveHeight}') may be too low for your selected sports.</span>
            </div>
          )}
          {(sports.includes('soccer_indoor_small_sided') || sports.includes('soccer') || sports.includes('football')) && (
            <p className="text-xs text-muted-foreground mt-2">
              Note: 40' is suitable for most practice and recreational use. Full-size indoor soccer domes typically require 50-65' clearance, and football facilities with punting may need 65'+ or specialized dome structures.
            </p>
          )}
        </div>
      )}

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
                {sports.length > 0 
                  ? `Recommended: ${recommendedHeight}' for ${sports.map(s => SPORT_LABELS[s as SportKey]).join(', ')}`
                  : "16' pickleball, 20' baseball, 24' basketball/volleyball, 40' soccer/football"
                }
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
