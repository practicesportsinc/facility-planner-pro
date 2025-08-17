import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WizardStep {
  path: string;
  label: string;
}

const wizardSteps: WizardStep[] = [
  { path: "/wizard/easy/start", label: "Sports" },
  { path: "/wizard/easy/size", label: "Size" },
  { path: "/wizard/easy/products", label: "Equipment" },
  { path: "/wizard/easy/context", label: "Location" },
  { path: "/wizard/easy/results", label: "Results" },
];

export function WizardStepNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentStepIndex = wizardSteps.findIndex(step => step.path === location.pathname);
  
  // Don't show if not in wizard
  if (currentStepIndex === -1) {
    return null;
  }

  const progress = ((currentStepIndex + 1) / wizardSteps.length) * 100;
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < wizardSteps.length - 1;

  const handlePrevious = () => {
    if (canGoBack) {
      navigate(wizardSteps[currentStepIndex - 1].path);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      navigate(wizardSteps[currentStepIndex + 1].path);
    }
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="container max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={!canGoBack}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {wizardSteps.length}
            </div>
            <div className="font-medium">
              {wizardSteps[currentStepIndex].label}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={!canGoForward}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {wizardSteps.map((step, index) => (
            <span 
              key={step.path}
              className={index <= currentStepIndex ? "text-primary font-medium" : ""}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}