import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BuildingConfig, BuildingEstimate, calculateBuildingEstimate, DEFAULT_BUILDING_CONFIG } from "@/utils/buildingCalculator";
import { DimensionsStep } from "./steps/DimensionsStep";
import { DoorsStep } from "./steps/DoorsStep";
import { FinishLevelStep } from "./steps/FinishLevelStep";
import { SiteOptionsStep } from "./steps/SiteOptionsStep";
import { BuildingEstimateStep } from "./steps/BuildingEstimateStep";
import { Progress } from "@/components/ui/progress";

type WizardStep = 'dimensions' | 'doors' | 'finish' | 'site' | 'estimate';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'doors', label: 'Doors' },
  { id: 'finish', label: 'Finish' },
  { id: 'site', label: 'Site' },
  { id: 'estimate', label: 'Estimate' },
];

export function BuildingConfigWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>('dimensions');
  const [config, setConfig] = useState<BuildingConfig>(DEFAULT_BUILDING_CONFIG);
  
  const currentStepIndex = STEPS.findIndex(s => s.id === step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  
  const updateConfig = (updates: Partial<BuildingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };
  
  const estimate: BuildingEstimate = calculateBuildingEstimate(config);
  
  const handleDownload = () => {
    // TODO: Implement PDF download with lead gate
    toast.info("PDF download coming soon!");
  };
  
  const handleContinueToCalculator = () => {
    // Pass building estimate data to calculator
    navigate('/calculator', { 
      state: { 
        buildingData: {
          config,
          estimate,
        }
      } 
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                if (i < currentStepIndex) setStep(s.id);
              }}
              className={`text-sm font-medium transition-colors ${
                s.id === step 
                  ? 'text-primary' 
                  : i < currentStepIndex 
                    ? 'text-muted-foreground hover:text-foreground cursor-pointer' 
                    : 'text-muted-foreground/50'
              }`}
              disabled={i > currentStepIndex}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      {step === 'dimensions' && (
        <DimensionsStep 
          config={config}
          updateConfig={updateConfig}
          onNext={() => setStep('doors')}
        />
      )}
      
      {step === 'doors' && (
        <DoorsStep
          config={config}
          updateConfig={updateConfig}
          onNext={() => setStep('finish')}
          onBack={() => setStep('dimensions')}
        />
      )}
      
      {step === 'finish' && (
        <FinishLevelStep
          config={config}
          updateConfig={updateConfig}
          onNext={() => setStep('site')}
          onBack={() => setStep('doors')}
        />
      )}
      
      {step === 'site' && (
        <SiteOptionsStep
          config={config}
          updateConfig={updateConfig}
          onNext={() => setStep('estimate')}
          onBack={() => setStep('finish')}
        />
      )}
      
      {step === 'estimate' && (
        <BuildingEstimateStep
          config={config}
          estimate={estimate}
          onBack={() => setStep('site')}
          onDownload={handleDownload}
          onContinueToCalculator={handleContinueToCalculator}
        />
      )}
    </div>
  );
}
