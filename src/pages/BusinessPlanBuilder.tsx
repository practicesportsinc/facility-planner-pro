import React from 'react';
import { BusinessPlanProvider, useBusinessPlan } from '@/contexts/BusinessPlanContext';
import Layout from '@/components/layout/Layout';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectOverviewStep from '@/components/business-plan/ProjectOverviewStep';
import MarketAnalysisStep from '@/components/business-plan/MarketAnalysisStep';
import SportSelectionStep from '@/components/business-plan/SportSelectionStep';
import CompetitiveAnalysisStep from '@/components/business-plan/CompetitiveAnalysisStep';
import FacilityDesignStep from '@/components/business-plan/FacilityDesignStep';
import ProgrammingStep from '@/components/business-plan/ProgrammingStep';
import FinancialInputsStep from '@/components/business-plan/FinancialInputsStep';
import RiskAssessmentStep from '@/components/business-plan/RiskAssessmentStep';
import TimelineStep from '@/components/business-plan/TimelineStep';
import ReviewGenerateStep from '@/components/business-plan/ReviewGenerateStep';

const STEPS = [
  { label: 'Project Overview', shortLabel: 'Overview' },
  { label: 'Market & Demographics', shortLabel: 'Market' },
  { label: 'Sport Selection', shortLabel: 'Sports' },
  { label: 'Competitive Analysis', shortLabel: 'Competition' },
  { label: 'Facility Design', shortLabel: 'Facility' },
  { label: 'Programming & Ops', shortLabel: 'Operations' },
  { label: 'Financial Inputs', shortLabel: 'Financials' },
  { label: 'Risk Assessment', shortLabel: 'Risks' },
  { label: 'Timeline', shortLabel: 'Timeline' },
  { label: 'Review & Generate', shortLabel: 'Generate' },
];

function WizardContent() {
  const { currentStep, setCurrentStep, goToNext, goToPrevious, isStepComplete } = useBusinessPlan();
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <ProjectOverviewStep />;
      case 1: return <MarketAnalysisStep />;
      case 2: return <SportSelectionStep />;
      case 3: return <CompetitiveAnalysisStep />;
      case 4: return <FacilityDesignStep />;
      case 5: return <ProgrammingStep />;
      case 6: return <FinancialInputsStep />;
      case 7: return <RiskAssessmentStep />;
      case 8: return <TimelineStep />;
      case 9: return <ReviewGenerateStep />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Business Plan Builder</h1>
            <p className="text-muted-foreground">Create a comprehensive, investor-ready business plan for your sports facility</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="hidden md:flex justify-between mb-8 overflow-x-auto pb-2">
            {STEPS.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`flex flex-col items-center min-w-[80px] transition-all ${
                  index === currentStep
                    ? 'text-primary'
                    : index < currentStep
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-sm font-medium border-2 transition-all ${
                    index === currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : index < currentStep
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted bg-muted'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs text-center">{step.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6 min-h-[500px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={goToNext}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function BusinessPlanBuilder() {
  return (
    <BusinessPlanProvider>
      <WizardContent />
    </BusinessPlanProvider>
  );
}
