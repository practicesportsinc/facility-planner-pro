import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

// Wizard steps
import ProjectBasics from "@/components/calculator/steps/ProjectBasics";
import FacilityPlan from "@/components/calculator/steps/FacilityPlan";
import Equipment from "@/components/calculator/steps/Equipment";
import SiteCosts from "@/components/calculator/steps/SiteCosts";
import Operating from "@/components/calculator/steps/Operating";
import Revenue from "@/components/calculator/steps/Revenue";
import Financing from "@/components/calculator/steps/Financing";
import Sensitivity from "@/components/calculator/steps/Sensitivity";
import LeadCapture from "@/components/calculator/steps/LeadCapture";
import Results from "@/components/calculator/steps/Results";

const STEPS = [
  { id: 1, title: "Project Basics", component: ProjectBasics },
  { id: 2, title: "Facility Plan", component: FacilityPlan },
  { id: 3, title: "Equipment", component: Equipment },
  { id: 4, title: "Site & Building", component: SiteCosts },
  { id: 5, title: "Operating Costs", component: Operating },
  { id: 6, title: "Revenue Programs", component: Revenue },
  { id: 7, title: "Financing", component: Financing },
  { id: 8, title: "Sensitivity Analysis", component: Sensitivity },
  { id: 9, title: "Contact Information", component: LeadCapture },
  { id: 10, title: "Results & Reports", component: Results },
];

const Calculator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatorData, setCalculatorData] = useState({});

  const currentStepData = STEPS.find(step => step.id === currentStep);
  const StepComponent = currentStepData?.component;
  
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const updateData = (stepData: any) => {
    setCalculatorData(prev => ({
      ...prev,
      [currentStep]: stepData
    }));
  };

  return (
    <Layout className="py-8">
      <div className="container mx-auto px-4">
        {/* Progress Header */}
        <Card className="mb-8 shadow-custom-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl">Facility Budget Calculator</CardTitle>
                <CardDescription>
                  Step {currentStep} of {STEPS.length}: {currentStepData?.title}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Auto-saved
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Step Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-full text-left p-3 rounded-md text-sm transition-smooth ${
                      step.id === currentStep
                        ? 'bg-primary text-primary-foreground shadow-custom-sm'
                        : step.id < currentStep
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-medium mr-3">
                        {step.id}
                      </span>
                      <span className="truncate">{step.title}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-custom-lg">
              <CardContent className="p-8">
                {StepComponent && (
                  <StepComponent
                    data={calculatorData[currentStep] || {}}
                    onUpdate={updateData}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    allData={calculatorData}
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                variant="hero"
                onClick={handleNext}
                disabled={currentStep === STEPS.length}
              >
                {currentStep === STEPS.length ? 'Complete' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calculator;