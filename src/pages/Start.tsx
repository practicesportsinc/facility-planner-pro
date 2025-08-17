import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calculator, Users, Clock, Target, TrendingUp, Zap, Wrench, ArrowLeft } from "lucide-react";

interface StartProps {}

const Start = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'path' | 'scope'>('path');
  const [selectedPath, setSelectedPath] = useState<'quick' | 'wizard' | 'calculator' | null>(null);

  // Analytics tracking
  const handlePathSelected = (path: 'quick' | 'wizard' | 'calculator') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'path_selected', {
        path,
        timestamp: Date.now()
      });
    }
    setSelectedPath(path);
    setCurrentStep('scope');
  };

  const handleScopeSelected = (scope: 'equipment' | 'turnkey') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'scope_selected', {
        path: selectedPath,
        scope,
        timestamp: Date.now()
      });
    }

    // Route based on path and scope selection
    if (selectedPath === 'quick') {
      // Quick Estimate opens in modal regardless of scope
      // For now, redirect to wizard with scope parameter
      navigate(scope === 'equipment' ? '/wizard?scope=equipment' : '/wizard');
    } else if (selectedPath === 'wizard') {
      navigate(scope === 'equipment' ? '/wizard?scope=equipment' : '/wizard');
    } else if (selectedPath === 'calculator') {
      if (scope === 'equipment') {
        // Phase 1: Fallback to wizard for equipment-only
        navigate('/wizard?scope=equipment');
      } else {
        navigate('/calculator');
      }
    }
  };

  const handleBack = () => {
    setCurrentStep('path');
    setSelectedPath(null);
  };

  if (currentStep === 'path') {
    return (
      <Layout>
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
                How do you want to plan your facility?
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Choose your planning approach. All paths give you professional results.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Quick Estimate */}
              <Card 
                className="ps-card group hover:shadow-custom-lg transition-smooth cursor-pointer"
                onClick={() => handlePathSelected('quick')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                    <Zap className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-primary">Quick Estimate</h3>
                  <p className="text-lg font-medium mb-3 text-success">1 minute</p>
                  <p className="text-muted-foreground mb-6">
                    Instant ballpark numbers. Perfect for initial planning and budget discussions.
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Ultra-fast setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span>Rough estimates</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wizard Builder */}
              <Card 
                className="ps-card group hover:shadow-custom-lg transition-smooth cursor-pointer border-primary/50"
                onClick={() => handlePathSelected('wizard')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                    <Sparkles className="h-10 w-10 text-secondary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-secondary">Wizard Builder</h3>
                  <p className="text-lg font-medium mb-3 text-success">Recommended • 2-3 minutes</p>
                  <p className="text-muted-foreground mb-6">
                    Guided questions with smart defaults. Get realistic numbers with minimal effort.
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-secondary" />
                      <span>Quick guided setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-secondary" />
                      <span>Smart presets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-secondary" />
                      <span>Professional results</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Calculator */}
              <Card 
                className="ps-card group hover:shadow-custom-lg transition-smooth cursor-pointer"
                onClick={() => handlePathSelected('calculator')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-hero rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                    <Calculator className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Custom Calculator</h3>
                  <p className="text-lg font-medium mb-3 text-info">5-10 minutes</p>
                  <p className="text-muted-foreground mb-6">
                    Full control over every line item. Custom budgeting with detailed analysis.
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span>Line-item control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>Financing scenarios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Custom models</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary CTAs */}
            <div className="text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="ghost" asChild>
                  <a href="/wizard-results">See Example Plans</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/legal">Talk to a Coach</a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                All paths can be customized later. Start simple, get detailed when needed.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Step 2: Scope Selection
  return (
    <Layout>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="absolute left-4 top-24"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              What are your needs?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              This helps us focus on the most relevant costs for your project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Equipment Only */}
            <Card 
              className="ps-card group hover:shadow-custom-lg transition-smooth cursor-pointer"
              onClick={() => handleScopeSelected('equipment')}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                  <Wrench className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Equipment Outfitting Only</h3>
                <p className="text-lg font-medium mb-3 text-info">I have a facility</p>
                <p className="text-muted-foreground mb-6">
                  You already have a space or building. Focus on equipment, flooring, and outfitting costs only.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />
                    <span>Equipment & gear</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Flooring & surfaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Installation costs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Turnkey */}
            <Card 
              className="ps-card group hover:shadow-custom-lg transition-smooth cursor-pointer border-primary/50"
              onClick={() => handleScopeSelected('turnkey')}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                  <Calculator className="h-10 w-10 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-secondary">Turnkey Project</h3>
                <p className="text-lg font-medium mb-3 text-success">Complete Solution</p>
                <p className="text-muted-foreground mb-6">
                  Full project planning including real estate, construction, equipment, and operational costs.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-secondary" />
                    <span>Land/building costs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    <span>Construction & build-out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" />
                    <span>Equipment & operations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Start;