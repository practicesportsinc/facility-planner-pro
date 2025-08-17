import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import { ChevronLeft, ChevronRight, Save, Zap } from "lucide-react";

// Wizard steps
import ProjectBasics from "@/components/calculator/steps/ProjectBasics";
import BuildMode from "@/components/calculator/steps/BuildMode";
import FacilityPlan from "@/components/calculator/steps/FacilityPlan";
import Equipment from "@/components/calculator/steps/Equipment";
import StaffingAndOpEx from "@/components/calculator/steps/StaffingAndOpEx";
import RevenuePrograms from "@/components/calculator/steps/RevenuePrograms";
import Financing from "@/components/calculator/steps/Financing";
import KpiResults from "@/components/calculator/steps/KpiResults";
import LeadCapture from "@/components/calculator/steps/LeadCapture";
import SourcingPlan from "@/components/calculator/steps/SourcingPlan";
import Results from "@/components/calculator/steps/Results";

const STEPS = [
  { id: 1, title: "Project Basics", component: ProjectBasics },
  { id: 2, title: "Build/Buy/Lease", component: BuildMode },
  { id: 3, title: "Facility Plan", component: FacilityPlan },
  { id: 4, title: "Equipment", component: Equipment },
  { id: 5, title: "Staffing & OpEx", component: StaffingAndOpEx },
  { id: 6, title: "Revenue Programs", component: RevenuePrograms },
  { id: 7, title: "Financing", component: Financing },
  { id: 8, title: "Financial Overview", component: KpiResults },
  { id: 9, title: "Sourcing Plan", component: SourcingPlan },
  { id: 10, title: "Contact Information", component: LeadCapture },
  { id: 11, title: "Complete Analysis", component: Results },
];

const Calculator = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const mode = searchParams.get('mode');
  const isQuickMode = mode === 'quick';
  const isWizardMode = mode === 'wizard';
  const contentRef = useRef<HTMLDivElement>(null);
  
  // If it's quick mode, start at the KPI Results step (step 8)
  const [currentStep, setCurrentStep] = useState(isQuickMode || isWizardMode ? 8 : 1);
  const [calculatorData, setCalculatorData] = useState({});

  // Load data from localStorage (quick estimate or wizard)
  useEffect(() => {
    if (isQuickMode && projectId) {
      const savedData = localStorage.getItem(`ps:project:${projectId}`);
      if (savedData) {
        try {
          const projectData = JSON.parse(savedData);
          // Convert the project data to calculator format for display
          setCalculatorData({
            1: { // Project Basics
              projectName: projectData.scenario_name,
              location: `${projectData.location_city}, ${projectData.location_state_province}`,
              currency: projectData.currency,
              selectedSports: projectData.selectedSports || []
            },
            2: { // Build Mode
              buildMode: projectData.facility_plan.build_mode
            },
            3: { // Facility Plan
              ...projectData.facility_plan,
              // Convert amenities object to array format expected by FacilityPlan
              amenities: projectData.facility_plan.amenities ? 
                Object.entries(projectData.facility_plan.amenities)
                  .filter(([key, value]) => value === true)
                  .map(([key]) => key) : [],
              // Convert court_or_cage_counts to individual fields expected by FacilityPlan
              facilityType: projectData.facility_plan.build_mode || '',
              clearHeight: projectData.facility_plan.clear_height_ft?.toString() || '20',
              totalSquareFootage: projectData.facility_plan.total_sqft?.toString() || '',
              // Map court/cage counts from quick estimate format
              numberOfCourts: projectData.facility_plan.court_or_cage_counts?.basketball_courts_full || 
                             projectData.facility_plan.court_or_cage_counts?.volleyball_courts || 
                             projectData.facility_plan.court_or_cage_counts?.pickleball_courts || '',
              numberOfFields: projectData.facility_plan.court_or_cage_counts?.soccer_field_small || '',
              numberOfCages: projectData.facility_plan.court_or_cage_counts?.baseball_tunnels || '',
              // Add sports data for square footage recommendations
              selectedSports: projectData.selectedSports || []
            },
            5: { // Staffing & OpEx
              ...projectData.opex_inputs
            },
            6: { // Revenue Programs
              ...projectData.revenue_programs
            },
            7: { // Financing
              ...projectData.financing
            }
          });
        } catch (error) {
          console.error('Error loading quick estimate data:', error);
        }
      }
    } else if (mode === 'wizard') {
      // Load wizard result data
      const wizardData = localStorage.getItem('wizard-result');
      if (wizardData) {
        try {
          const wizardResult = JSON.parse(wizardData);
          const responses = wizardResult.responses.reduce((acc: any, response: any) => {
            acc[response.questionId] = response.value;
            return acc;
          }, {});

          // Map wizard responses to calculator format
          setCalculatorData({
            1: { // Project Basics
              projectName: responses.facility_name || '',
              location: responses.location_type || '',
              selectedSports: Array.isArray(responses.primary_sport) ? responses.primary_sport : [responses.primary_sport].filter(Boolean),
              stage_code: responses.project_stage || 'concept',
              budget: responses.budget || ''
            },
            2: { // Build Mode
              buildMode: responses.buildType || 'lease'
            },
            3: { // Facility Plan
              totalSquareFootage: responses.squareFootage?.toString() || '',
              selectedSports: Array.isArray(responses.sports) ? responses.sports : [responses.sports].filter(Boolean),
              amenities: Array.isArray(responses.amenities) ? responses.amenities : []
            },
            6: { // Revenue Programs
              primaryRevenue: Array.isArray(responses.revenueModel) ? responses.revenueModel : [responses.revenueModel].filter(Boolean)
            }
          });
        } catch (error) {
          console.error('Error loading wizard data:', error);
        }
      }
    }
  }, [isQuickMode, projectId, mode]);

  // Auto-scroll to content when in quick mode
  useEffect(() => {
    if (isQuickMode && contentRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
    }
  }, [isQuickMode, currentStep]);

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

  const handleNavigateToStep = (stepId: number) => {
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
                <CardTitle className="text-2xl flex items-center">
                  {(isQuickMode || isWizardMode) && <Zap className="h-6 w-6 mr-2 text-primary" />}
                  {isQuickMode ? 'Quick Estimate Analysis' : isWizardMode ? 'Wizard Results Review' : 'Facility Budget Calculator'}
                </CardTitle>
                <CardDescription>
                  {isQuickMode 
                    ? 'Your instant facility projections • Customize any section for refined estimates'
                    : isWizardMode
                    ? 'Review and refine your facility recommendations'
                    : `Step ${currentStep} of ${STEPS.length}: ${currentStepData?.title}`
                  }
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isQuickMode ? 'Quick Estimate' : 'Auto-saved'}
              </Button>
            </div>
            {!isQuickMode && !isWizardMode && <Progress value={progress} className="h-2" />}
            {(isQuickMode || isWizardMode) && (
              <div className="bg-gradient-subtle border border-primary/20 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">
                      {isQuickMode ? 'Quick Estimate Generated' : 'Wizard Recommendations Ready'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isQuickMode 
                        ? 'Your instant projections are ready for review. Navigate to any step to customize parameters for more accurate results.'
                        : 'Your facility recommendations have been pre-filled. Review and customize each section to refine your plan.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
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
          <div className="lg:col-span-3" ref={contentRef}>
            <Card className="shadow-custom-lg">
              <CardContent className="p-8">
                {StepComponent && (
                  currentStep === 8 ? (
                    <KpiResults
                      data={calculatorData[currentStep] || {}}
                      onUpdate={updateData}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      allData={calculatorData}
                      onNavigateToStep={handleNavigateToStep}
                    />
                  ) : (
                    <StepComponent
                      data={calculatorData[currentStep] || {}}
                      onUpdate={updateData}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      allData={calculatorData}
                    />
                  )
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