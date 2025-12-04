import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BuildingConfig } from "@/utils/buildingCalculator";
import { Shovel, Building, Car, Plug, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteOptionsStepProps {
  config: BuildingConfig;
  updateConfig: (updates: Partial<BuildingConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SITE_OPTIONS = [
  {
    id: 'sitePrep',
    label: 'Site Preparation & Grading',
    description: 'Clearing, grading, and compaction for building pad',
    icon: Shovel,
    cost: '$2-4/SF',
    recommended: true,
  },
  {
    id: 'concreteFoundation',
    label: 'Concrete Foundation',
    description: '6" reinforced concrete slab with vapor barrier',
    icon: Building,
    cost: '$8-12/SF',
    recommended: true,
  },
  {
    id: 'parking',
    label: 'Parking Lot',
    description: 'Asphalt parking (sized to ~40% of building)',
    icon: Car,
    cost: '$4-6/SF',
    recommended: true,
  },
  {
    id: 'utilities',
    label: 'Utilities Connection',
    description: 'Water, sewer, and gas connections to site',
    icon: Plug,
    cost: '$15K-40K',
    recommended: true,
  },
  {
    id: 'sprinklerSystem',
    label: 'Fire Sprinkler System',
    description: 'Required in most jurisdictions for this building size',
    icon: Droplets,
    cost: '$3-5/SF',
    recommended: false,
  },
];

export function SiteOptionsStep({ config, updateConfig, onNext, onBack }: SiteOptionsStepProps) {
  const selectedCount = SITE_OPTIONS.filter(opt => config[opt.id as keyof BuildingConfig]).length;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Site & Foundation Options</h2>
        <p className="text-muted-foreground">
          Select the site work and infrastructure items to include in your estimate.
        </p>
      </div>

      <div className="space-y-3">
        {SITE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isChecked = config[option.id as keyof BuildingConfig] as boolean;
          
          return (
            <Card
              key={option.id}
              className={cn(
                "cursor-pointer transition-all",
                isChecked ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
              )}
              onClick={() => updateConfig({ [option.id]: !isChecked })}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => updateConfig({ [option.id]: checked })}
                    className="pointer-events-none"
                  />
                  
                  <div className={cn(
                    "p-2 rounded-lg",
                    isChecked ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {option.recommended && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Typical
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">{option.cost}</div>
                    <div className="text-xs text-muted-foreground">est. range</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Selected Site Work</div>
              <div className="text-sm text-muted-foreground">
                {selectedCount} of {SITE_OPTIONS.length} items selected
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  updateConfig({
                    sitePrep: true,
                    concreteFoundation: true,
                    parking: true,
                    utilities: true,
                    sprinklerSystem: true,
                  });
                }}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  updateConfig({
                    sitePrep: false,
                    concreteFoundation: false,
                    parking: false,
                    utilities: false,
                    sprinklerSystem: false,
                  });
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-gradient-primary">
          View Estimate
        </Button>
      </div>
    </div>
  );
}
