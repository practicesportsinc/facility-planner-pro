import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingConfig } from "@/utils/buildingCalculator";
import { Check, Sparkles, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinishLevelStepProps {
  config: BuildingConfig;
  updateConfig: (updates: Partial<BuildingConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FINISH_OPTIONS = [
  {
    value: 'basic' as const,
    label: 'Basic',
    icon: Sparkles,
    description: 'Functional finish for training facilities',
    features: [
      'Standard metal panels',
      'Basic insulation (R-19)',
      'Exposed structure interior',
      'Standard lighting',
      'Basic HVAC',
    ],
    costNote: '~15% below standard',
  },
  {
    value: 'standard' as const,
    label: 'Standard',
    icon: Star,
    description: 'Professional finish for most sports facilities',
    features: [
      'Upgraded metal panels with liner',
      'Enhanced insulation (R-25)',
      'Painted interior structure',
      'LED high-bay lighting',
      'Zoned HVAC system',
    ],
    costNote: 'Baseline pricing',
    recommended: true,
  },
  {
    value: 'premium' as const,
    label: 'Premium',
    icon: Crown,
    description: 'High-end finish for elite facilities',
    features: [
      'Premium architectural panels',
      'Superior insulation (R-30+)',
      'Finished interior walls',
      'Smart LED lighting system',
      'Climate-controlled HVAC',
    ],
    costNote: '~25% above standard',
  },
];

export function FinishLevelStep({ config, updateConfig, onNext, onBack }: FinishLevelStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Finish Level</h2>
        <p className="text-muted-foreground">
          Select the overall finish quality for your building. This affects materials, insulation, and systems.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {FINISH_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = config.finishLevel === option.value;
          
          return (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg relative",
                isSelected 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "hover:border-muted-foreground/30"
              )}
              onClick={() => updateConfig({ finishLevel: option.value })}
            >
              {option.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "mx-auto p-3 rounded-full mb-2",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{option.label}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={cn(
                        "h-4 w-4 mt-0.5 flex-shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className={cn(
                  "text-center py-2 rounded-lg text-sm font-medium",
                  isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {option.costNote}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-primary">
          Continue to Site Options
        </Button>
      </div>
    </div>
  );
}
