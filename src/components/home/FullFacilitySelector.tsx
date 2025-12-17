import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Sparkles, Calculator, ArrowLeft } from "lucide-react";
import { EquipmentQuote } from "@/types/equipment";

interface FullFacilitySelectorProps {
  onBack?: () => void;
  equipmentQuote?: EquipmentQuote | null;
}

export const FullFacilitySelector = ({ onBack, equipmentQuote }: FullFacilitySelectorProps) => {
  const navigate = useNavigate();

  const handleSelectPath = (path: string) => {
    const equipmentData = equipmentQuote ? {
      sport: equipmentQuote.sport,
      units: equipmentQuote.inputs.units,
      spaceSize: equipmentQuote.inputs.spaceSize,
      totals: equipmentQuote.totals,
      lineItems: equipmentQuote.lineItems,
      fromEquipmentQuote: true
    } : null;
    
    navigate(path, { state: { equipmentData } });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Planning Path</h2>
        <p className="text-lg text-muted-foreground">
          {equipmentQuote 
            ? `Your ${equipmentQuote.sport} equipment quote will be carried forward` 
            : 'All paths guide you to professional results'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Easy Wizard */}
        <Card 
          onClick={() => handleSelectPath('/wizard/easy')} 
          className="h-full shadow-custom-md hover:shadow-custom-lg transition-smooth hover:border-primary/50 cursor-pointer group"
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Zap className="h-8 w-8 text-warning" />
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                Fastest
              </Badge>
            </div>
            <CardTitle className="text-2xl group-hover:text-primary transition-smooth">
              Quick Start
            </CardTitle>
            <CardDescription className="text-base">
              1-2 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Quick setup with smart defaults. Perfect for getting started fast.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Ultra-quick setup
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Smart recommendations
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Simple questions
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Wizard Builder */}
        <Card 
          onClick={() => handleSelectPath('/wizard')} 
          className="h-full shadow-custom-md hover:shadow-custom-lg transition-smooth hover:border-primary/50 cursor-pointer border-primary/30 group"
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Recommended
              </Badge>
            </div>
            <CardTitle className="text-2xl group-hover:text-primary transition-smooth">
              Guided Builder
            </CardTitle>
            <CardDescription className="text-base">
              3-5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Guided questions with proven templates. Get realistic numbers effortlessly.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Step-by-step guidance
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Proven templates
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Professional results
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Calculator */}
        <Card 
          onClick={() => handleSelectPath('/calculator')} 
          className="h-full shadow-custom-md hover:shadow-custom-lg transition-smooth hover:border-primary/50 cursor-pointer group"
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Calculator className="h-8 w-8 text-info" />
              <Badge variant="secondary" className="bg-info/10 text-info border-info/20">
                Most Detailed
              </Badge>
            </div>
            <CardTitle className="text-2xl group-hover:text-primary transition-smooth">
              Full Calculator
            </CardTitle>
            <CardDescription className="text-base">
              5-10 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete control over every line item. Custom budgeting with detailed analysis.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Line-item control
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Financing scenarios
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Custom models
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {onBack && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Options
          </Button>
        </div>
      )}
    </div>
  );
};
