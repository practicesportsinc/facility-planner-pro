import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Sparkles, Target, MapPin, Users, DollarSign, Calendar, Zap } from "lucide-react";
import { WIZARD_QUESTIONS, generateRecommendations } from "@/data/wizardQuestions";
import { WizardQuestion, WizardResponse, WizardResult } from "@/types/wizard";
import { toast } from "sonner";

interface FacilityWizardProps {
  onComplete?: (result: WizardResult) => void;
  onClose?: () => void;
}

export const FacilityWizard = ({ onComplete, onClose }: FacilityWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [result, setResult] = useState<WizardResult | null>(null);

  // Filter questions based on dependencies
  const getVisibleQuestions = () => {
    return WIZARD_QUESTIONS.filter(question => {
      if (!question.dependsOn) return true;
      
      const dependentValue = responses[question.dependsOn.questionId];
      
      // Special handling for sport ratios - show if multiple sports selected
      if (question.id === 'sport_ratios') {
        return Array.isArray(dependentValue) && dependentValue.length > 1;
      }
      
      // Check if dependent value matches any of the required values
      if (Array.isArray(dependentValue)) {
        return question.dependsOn.values.some(value => dependentValue.includes(value));
      }
      
      return question.dependsOn.values.includes(dependentValue);
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentStep];
  const isLastStep = currentStep === visibleQuestions.length - 1;
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

  const handleResponse = (value: string | string[] | number | Record<string, number>) => {
    const newResponses = { ...responses, [currentQuestion.id]: value };
    setResponses(newResponses);

    // Auto-advance for single selection questions
    if (currentQuestion.type === 'single' && !isLastStep) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    }
  };

  const canContinue = () => {
    if (!currentQuestion.required) return true;
    const response = responses[currentQuestion.id];
    
    // Special validation for sport ratios
    if (currentQuestion.id === 'sport_ratios') {
      if (!response || typeof response !== 'object') return false;
      const total = Object.values(response).reduce((sum: number, value: any) => sum + (value || 0), 0);
      return total === 100;
    }
    
    return response !== undefined && response !== '' && 
           (Array.isArray(response) ? response.length > 0 : true);
  };

  const handleNext = () => {
    if (isLastStep) {
      // Generate recommendations
      const recommendations = generateRecommendations(responses);
      const wizardResponses: WizardResponse[] = Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value,
        label: WIZARD_QUESTIONS.find(q => q.id === questionId)?.title
      }));

      const finalResult: WizardResult = {
        responses: wizardResponses,
        recommendations
      };

      setResult(finalResult);
      onComplete?.(finalResult);
      toast.success("Facility recommendations generated!");
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    const currentValue = responses[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'single':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-smooth hover:shadow-custom-md ${
                  currentValue === option.id
                    ? 'border-primary bg-primary/5 shadow-custom-sm'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleResponse(option.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {option.icon && (
                      <div className="text-2xl">{option.icon}</div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      )}
                      {option.recommended && (
                        <Badge variant="secondary" className="mt-2">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options?.map((option) => {
                const isSelected = Array.isArray(currentValue) && currentValue.includes(option.id);
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-smooth hover:shadow-custom-md ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-custom-sm'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      const current = Array.isArray(currentValue) ? currentValue : [];
                      const updated = isSelected
                        ? current.filter(v => v !== option.id)
                        : [...current, option.id];
                      handleResponse(updated);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {option.icon && (
                          <div className="text-2xl">{option.icon}</div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {option.description}
                            </div>
                          )}
                          {option.recommended && (
                            <Badge variant="secondary" className="mt-2">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        {isSelected && (
                          <div className="text-primary">✓</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Conditional text field for "other" option */}
            {currentQuestion.textField && 
             Array.isArray(currentValue) && 
             currentValue.includes(currentQuestion.textField.dependsOnValue) && (
              <div className="max-w-md">
                <Label htmlFor={currentQuestion.textField.id}>
                  {currentQuestion.textField.label}
                </Label>
                <Input
                  id={currentQuestion.textField.id}
                  type="text"
                  value={responses[currentQuestion.textField.id] || ''}
                  onChange={(e) => setResponses(prev => ({
                    ...prev,
                    [currentQuestion.textField!.id]: e.target.value
                  }))}
                  placeholder={currentQuestion.textField.placeholder || "Enter details..."}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        );

      case 'input':
        return (
          <div className="max-w-md">
            <Label htmlFor={currentQuestion.id}>{currentQuestion.title}</Label>
            <Input
              id={currentQuestion.id}
              type="text"
              value={currentValue || ''}
              onChange={(e) => handleResponse(e.target.value)}
              placeholder="Enter your response..."
              className="mt-2"
            />
          </div>
        );

      case 'range':
        // Special handling for sport ratios
        if (currentQuestion.id === 'sport_ratios') {
          const selectedSports: string[] = responses.primary_sport || [];
          const sportRatios: Record<string, number> = currentValue || {};
          
          // Initialize ratios if not set
          useEffect(() => {
            if (selectedSports.length > 0 && Object.keys(sportRatios).length === 0) {
              const initialRatio = Math.floor(100 / selectedSports.length);
              const newRatios: Record<string, number> = {};
              selectedSports.forEach((sport, index) => {
                newRatios[sport] = index === 0 ? 100 - (initialRatio * (selectedSports.length - 1)) : initialRatio;
              });
              handleResponse(newRatios);
            }
          }, [selectedSports]);

          const getTotalPercentage = (): number => {
            return Object.values(sportRatios).reduce((sum: number, value: number) => sum + (value || 0), 0);
          };

          const updateSportRatio = (sport: string, newValue: number) => {
            const newRatios = { ...sportRatios, [sport]: newValue };
            const currentTotal = Object.values(sportRatios).reduce((sum: number, value: number) => sum + (value || 0), 0);
            
            // If over 100%, proportionally reduce other sports
            if (newValue > 0) {
              const otherSports = selectedSports.filter(s => s !== sport);
              const remainingTotal = 100 - newValue;
              const otherTotal = currentTotal - (sportRatios[sport] || 0);
              
              if (otherTotal > 0) {
                otherSports.forEach(otherSport => {
                  const currentRatio = sportRatios[otherSport] || 0;
                  const proportion = currentRatio / otherTotal;
                  newRatios[otherSport] = Math.max(0, Math.round(remainingTotal * proportion));
                });
              }
            }
            
            handleResponse(newRatios);
          };

          const sportLabels: Record<string, string> = {
            baseball_softball: "Baseball/Softball",
            basketball: "Basketball", 
            volleyball: "Volleyball",
            pickleball: "Pickleball",
            soccer: "Soccer",
            football: "Football",
            lacrosse: "Lacrosse",
            tennis: "Tennis",
            multi_sport: "Multi-Sport",
            fitness: "Fitness/Training"
          };

          return (
            <div className="max-w-2xl space-y-6">
              {selectedSports.map((sport) => (
                <div key={sport} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>{sportLabels[sport] || sport}</Label>
                    <span className="text-sm font-medium">{sportRatios[sport] || 0}%</span>
                  </div>
                  <Slider
                    value={[sportRatios[sport] || 0]}
                    onValueChange={(value) => updateSportRatio(sport, value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total:</span>
                  <span className={`text-sm font-bold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {getTotalPercentage()}%
                  </span>
                </div>
                {getTotalPercentage() !== 100 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Adjust the sliders so the total equals 100%
                  </p>
                )}
              </div>
            </div>
          );
        }
        
        // Default range handling
        return (
          <div className="max-w-md">
            <Label htmlFor={currentQuestion.id}>
              {currentQuestion.title}
              {currentValue && ` (${currentValue}${currentQuestion.unit || ''})`}
            </Label>
            <input
              id={currentQuestion.id}
              type="range"
              min={currentQuestion.min || 0}
              max={currentQuestion.max || 100}
              step={currentQuestion.step || 1}
              value={currentValue || currentQuestion.min || 0}
              onChange={(e) => handleResponse(parseInt(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{currentQuestion.min}{currentQuestion.unit}</span>
              <span>{currentQuestion.max}{currentQuestion.unit}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Your Facility Recommendations
            </CardTitle>
            <CardDescription>
              Based on your responses, here's what we recommend for your facility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Facility Type</h3>
                </div>
                <p className="text-lg">{result.recommendations.facilityType}</p>
                
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Recommended Size</h3>
                </div>
                <p className="text-lg">{result.recommendations.suggestedSize.toLocaleString()} sq ft</p>
                
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Estimated Capacity</h3>
                </div>
                <p className="text-lg">{result.recommendations.estimatedCapacity} courts/cages</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Business Model</h3>
                </div>
                <p className="text-lg">{result.recommendations.businessModel}</p>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Layout Design</h3>
                </div>
                <p className="text-lg">{result.recommendations.layout}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Key Features & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.keyFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button onClick={() => window.location.href = '/wizard-results'} className="flex-1">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="text-center">
                    Generate My Financials<br />& Business Plan
                  </span>
                </div>
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/calculator'}>
                Customize My Plan
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Facility Design Wizard</h1>
          <div className="text-sm text-muted-foreground">
            Question {currentStep + 1} of {visibleQuestions.length}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.title}</CardTitle>
            {currentQuestion.description && (
              <CardDescription>{currentQuestion.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {renderQuestionContent()}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canContinue()}
        >
          {isLastStep ? 'Get Recommendations' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};