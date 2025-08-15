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

  // Initialize sport ratios when multiple sports are selected
  useEffect(() => {
    const selectedSports: string[] = responses.primary_sport || [];
    const sportRatios: Record<string, number> = responses.sport_ratios || {};
    
    if (selectedSports.length > 1 && Object.keys(sportRatios).length === 0) {
      const initialRatio = Math.floor(100 / selectedSports.length);
      const newRatios: Record<string, number> = {};
      selectedSports.forEach((sport, index) => {
        newRatios[sport] = index === 0 ? 100 - (initialRatio * (selectedSports.length - 1)) : initialRatio;
      });
      setResponses(prev => ({ ...prev, sport_ratios: newRatios }));
    }
    
    // Initialize feature products based on selected sports
    if (selectedSports.length > 0 && !responses.feature_products) {
      const defaults = getDefaultProductsBySpots(selectedSports);
      if (defaults.length > 0) {
        setResponses(prev => ({ ...prev, feature_products: defaults }));
      }
    }
  }, [responses.primary_sport]);

  // Initialize product quantities when products are selected or facility size changes
  useEffect(() => {
    const selectedProducts = responses.feature_products || [];
    const facilitySize = responses.facility_size || 'medium';
    const quantities = responses.product_quantities || {};
    
    if (selectedProducts.length > 0) {
      // Recalculate quantities if facility size changed or if no quantities exist
      if (Object.keys(quantities).length === 0 || responses.facility_size) {
        const newQuantities = getDefaultQuantities(selectedProducts, facilitySize);
        setResponses(prev => ({ ...prev, product_quantities: newQuantities }));
      }
    }
  }, [responses.feature_products, responses.facility_size, responses.custom_facility_size]);

  const getDefaultProductsBySpots = (sports: string[]): string[] => {
    // Sport to products mapping - updated to match the complete catalog
    const defaults: Record<string, string[]> = {
      baseball_softball: ["batting_cages","pitching_machines","l_screens","ball_carts","divider_curtains","turf_area_sf"],
      basketball: ["basketball_hoops","scoreboards","hardwood_floor_area_sf","divider_curtains"],
      volleyball: ["volleyball_systems","ref_stands","scoreboards","rubber_floor_area_sf","divider_curtains"],
      pickleball: ["pickleball_nets","paddle_starter_sets","rubber_floor_area_sf","divider_curtains"],
      soccer_indoor_small_sided: ["soccer_goals_pair","turf_area_sf","divider_curtains","training_turf_zone"],
      soccer: ["soccer_goals_pair","turf_area_sf","divider_curtains","training_turf_zone"], // alias
      multi_sport: ["divider_curtains","turf_area_sf","rubber_floor_area_sf","scoreboards"],
      football: ['turf_area_sf', 'divider_curtains'],
      lacrosse: ['turf_area_sf', 'divider_curtains'],
      tennis: ['divider_curtains', 'hardwood_floor_area_sf'],
      fitness: ['rubber_floor_area_sf']
    };
    
    const allProducts = new Set<string>();
    sports.forEach(sport => {
      defaults[sport]?.forEach(product => allProducts.add(product));
    });
    
    return Array.from(allProducts);
  };

  const getDefaultQuantities = (products: string[], facilitySize: string): Record<string, number> => {
    const sizeMultipliers = { small: 0.7, medium: 1, large: 1.3, xl: 1.6 };
    const multiplier = sizeMultipliers[facilitySize] || 1;
    const totalSqft = getSqftBySize(facilitySize);
    
    const defaults: Record<string, number> = {
      batting_cages: Math.round(6 * multiplier),
      pitching_machines: Math.round(3 * multiplier),
      l_screens: Math.round(6 * multiplier),
      ball_carts: Math.round(3 * multiplier),
      volleyball_systems: Math.round(4 * multiplier),
      ref_stands: Math.round(4 * multiplier),
      divider_curtains: Math.round(4 * multiplier),
      basketball_hoops: Math.round(4 * multiplier),
      scoreboards: Math.round(2 * multiplier),
      pickleball_nets: Math.round(6 * multiplier),
      paddle_starter_sets: Math.round(12 * multiplier),
      soccer_goals_pair: Math.round(2 * multiplier),
      training_turf_zone: Math.round(1 * multiplier),
      turf_area_sf: Math.round((totalSqft * 0.35) / 100) * 100,
      rubber_floor_area_sf: Math.round((totalSqft * 0.25) / 100) * 100,
      hardwood_floor_area_sf: Math.round((totalSqft * 0.30) / 100) * 100
    };
    
    const quantities: Record<string, number> = {};
    products.forEach(product => {
      quantities[product] = defaults[product] || 0;
    });
    
    return quantities;
  };

  const getSqftBySize = (size: string): number => {
    // If custom size, get the exact square footage from custom input
    if (size === 'custom') {
      const customSqft = parseInt(responses.custom_facility_size || '0');
      return customSqft > 0 ? customSqft : 22000; // Default to medium if invalid
    }
    
    const sizes = { small: 12000, medium: 22000, large: 40000, xl: 60000 };
    return sizes[size as keyof typeof sizes] || 22000;
  };

  // Filter questions based on dependencies
  const getVisibleQuestions = () => {
    return WIZARD_QUESTIONS.filter(question => {
      if (!question.dependsOn) return true;
      
      const dependentValue = responses[question.dependsOn.questionId];
      
      // Special handling for sport ratios - show if facility size is selected and multiple sports selected
      if (question.id === 'sport_ratios') {
        const primarySports = responses.primary_sport;
        return dependentValue && Array.isArray(primarySports) && primarySports.length > 1;
      }
      
      // Special handling for feature products - show if sport ratios exist
      if (question.id === 'feature_products') {
        return dependentValue && typeof dependentValue === 'object' && Object.keys(dependentValue).length > 0;
      }
      
      // Special handling for product quantities - show if products selected
      if (question.id === 'product_quantities') {
        return Array.isArray(dependentValue) && dependentValue.length > 0;
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

    // Auto-advance for single selection questions, but not if a text field will be shown
    const shouldAutoAdvance = currentQuestion.type === 'single' && 
                             !isLastStep && 
                             !(currentQuestion.textField && value === currentQuestion.textField.dependsOnValue);
    
    if (shouldAutoAdvance) {
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
    
    // Special validation for feature products
    if (currentQuestion.id === 'feature_products') {
      return Array.isArray(response) && response.length > 0;
    }
    
    // Special validation for product quantities
    if (currentQuestion.id === 'product_quantities') {
      if (!response || typeof response !== 'object') return false;
      return Object.values(response).some((qty: any) => qty > 0);
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
          <div className="space-y-6">
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
            
            {/* Text field for custom input */}
            {currentQuestion.textField && 
             currentValue === currentQuestion.textField.dependsOnValue && (
              <div className="max-w-md">
                <Label htmlFor={currentQuestion.textField.id}>
                  {currentQuestion.textField.label}
                </Label>
                <Input
                  id={currentQuestion.textField.id}
                  type="number"
                  value={responses[currentQuestion.textField.id] || ''}
                  onChange={(e) => setResponses(prev => ({
                    ...prev,
                    [currentQuestion.textField!.id]: e.target.value
                  }))}
                  placeholder={currentQuestion.textField.placeholder || "Enter value..."}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        );

      case 'multiple':
        // Special handling for feature products
        if (currentQuestion.id === 'feature_products') {
          const selectedProducts = Array.isArray(currentValue) ? currentValue : [];
          const productLabels: Record<string, string> = {
            batting_cages: "Batting Cages (70' x 15')",
            pitching_machines: "Pitching Machines",
            l_screens: "L-Screens / Protective Screens",
            ball_carts: "Ball Carts / Buckets",
            volleyball_systems: "Volleyball Systems (standards+net)",
            ref_stands: "Referee Stands",
            divider_curtains: "Divider Curtains/Nets",
            basketball_hoops: "Basketball Hoops/Goals",
            scoreboards: "Scoreboards/Shot Clocks (set)",
            pickleball_nets: "Pickleball Nets (portable/permanent)",
            paddle_starter_sets: "Pickleball Paddle Starter Sets (4 paddles + balls)",
            soccer_goals_pair: "Indoor Soccer Goals (pair)",
            training_turf_zone: "Training Turf Zones",
            turf_area_sf: "Indoor Turf (area)",
            rubber_floor_area_sf: "Rubber Flooring (area)",
            hardwood_floor_area_sf: "Hardwood Flooring (area)"
          };

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">
                  Selected: {selectedProducts.length} products
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentQuestion.options?.map((option) => {
                  const isSelected = selectedProducts.includes(option.id);
                  return (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-smooth hover:shadow-custom-md ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-custom-sm'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                      onClick={() => {
                        const updated = isSelected
                          ? selectedProducts.filter(p => p !== option.id)
                          : [...selectedProducts, option.id];
                        handleResponse(updated);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`font-semibold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                              {option.label}
                            </div>
                            {isSelected && (
                              <div className="text-primary-foreground">✓</div>
                            )}
                          </div>
                          {option.description && (
                            <div className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {option.description}
                            </div>
                          )}
                          <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs">
                            Unit: {option.id.includes('_sf') ? 'sf' : 'ea'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        }

        // Default multiple choice handling
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
        // Special handling for product quantities
        if (currentQuestion.id === 'product_quantities') {
          const selectedProducts = responses.feature_products || [];
          const quantities: Record<string, number> = currentValue || {};
          const facilitySize = responses.facility_size || 'medium';
          const totalSqft = getSqftBySize(facilitySize);

          const productSpecs: Record<string, { min: number; max: number; step: number; default: number; helper: string }> = {
            batting_cages: { min: 0, max: 16, step: 1, default: 6, helper: "Typical for this size: 6" },
            pitching_machines: { min: 0, max: 12, step: 1, default: 3, helper: "Typical: 1 per 2 cages" },
            l_screens: { min: 0, max: 24, step: 1, default: 6, helper: "Typical: 1 per cage" },
            ball_carts: { min: 0, max: 24, step: 1, default: 3, helper: "Typical: 1 per 2 cages" },
            volleyball_systems: { min: 0, max: 12, step: 1, default: 4, helper: "Typical: 1 per court" },
            ref_stands: { min: 0, max: 12, step: 1, default: 4, helper: "Typical: 1 per court" },
            divider_curtains: { min: 0, max: 12, step: 1, default: 4, helper: "Use to separate courts/zones" },
            basketball_hoops: { min: 0, max: 12, step: 1, default: 4, helper: "Full court = 2, half = 1" },
            scoreboards: { min: 0, max: 8, step: 1, default: 2, helper: "1-2 per facility typical" },
            pickleball_nets: { min: 0, max: 16, step: 1, default: 6, helper: "Typical: 1 per court" },
            paddle_starter_sets: { min: 0, max: 24, step: 1, default: 12, helper: "Optional starter sets" },
            soccer_goals_pair: { min: 0, max: 6, step: 1, default: 2, helper: "1 pair per field" },
            training_turf_zone: { min: 0, max: 4, step: 1, default: 1, helper: "Designated training areas" },
            turf_area_sf: { min: 0, max: totalSqft, step: 100, default: Math.round((totalSqft * 0.35) / 100) * 100, helper: "Cap at building gross SF. Defaults scale with size." },
            rubber_floor_area_sf: { min: 0, max: totalSqft, step: 100, default: Math.round((totalSqft * 0.25) / 100) * 100, helper: "Cap at building gross SF. Defaults scale with size." },
            hardwood_floor_area_sf: { min: 0, max: totalSqft, step: 100, default: Math.round((totalSqft * 0.30) / 100) * 100, helper: "Cap at building gross SF. Defaults scale with size." }
          };

          const productLabels: Record<string, string> = {
            batting_cages: "Batting Cages (70' x 15')",
            pitching_machines: "Pitching Machines",
            l_screens: "L-Screens / Protective Screens",
            ball_carts: "Ball Carts / Buckets",
            volleyball_systems: "Volleyball Systems (standards+net)",
            ref_stands: "Referee Stands",
            divider_curtains: "Divider Curtains/Nets",
            basketball_hoops: "Basketball Hoops/Goals",
            scoreboards: "Scoreboards/Shot Clocks (set)",
            pickleball_nets: "Pickleball Nets (portable/permanent)",
            paddle_starter_sets: "Pickleball Paddle Starter Sets (4 paddles + balls)",
            soccer_goals_pair: "Indoor Soccer Goals (pair)",
            training_turf_zone: "Training Turf Zones",
            turf_area_sf: "Indoor Turf (area)",
            rubber_floor_area_sf: "Rubber Flooring (area)",
            hardwood_floor_area_sf: "Hardwood Flooring (area)"
          };

          const updateQuantity = (productId: string, newValue: number) => {
            const newQuantities = { ...quantities, [productId]: newValue };
            handleResponse(newQuantities);
          };

          return (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">
                  Selected: {selectedProducts.length} products
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                  Edit products →
                </Button>
              </div>

              <div className="grid gap-6">
                {selectedProducts.map((productId) => {
                  const specs = productSpecs[productId];
                  const currentQty = quantities[productId] || specs?.default || 0;
                  
                  return (
                    <Card key={productId}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              {productLabels[productId] || productId}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min={specs?.min || 0}
                                max={specs?.max || 100}
                                step={specs?.step || 1}
                                value={currentQty}
                                onChange={(e) => updateQuantity(productId, parseInt(e.target.value) || 0)}
                                className="w-20 text-center"
                              />
                              <span className="text-sm text-muted-foreground">
                                {productId.includes('_sf') ? 'sf' : 'ea'}
                              </span>
                            </div>
                          </div>
                          
                          <Slider
                            value={[currentQty]}
                            onValueChange={(value) => updateQuantity(productId, value[0])}
                            min={specs?.min || 0}
                            max={specs?.max || 100}
                            step={specs?.step || 1}
                            className="w-full"
                          />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {specs?.min || 0}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {specs?.max || 100}
                            </span>
                          </div>
                          
                          {specs?.helper && (
                            <p className="text-xs text-muted-foreground">
                              {specs.helper}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <Button variant="outline" size="sm" onClick={() => {
                  const defaults = getDefaultQuantities(selectedProducts, facilitySize);
                  handleResponse(defaults);
                }}>
                  Use typical for my sport
                </Button>
              </div>
            </div>
          );
        }

        // Special handling for sport ratios
        if (currentQuestion.id === 'sport_ratios') {
          const selectedSports: string[] = responses.primary_sport || [];
          const sportRatios: Record<string, number> = currentValue || {};
          
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