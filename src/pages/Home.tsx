import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { Calculator, TrendingUp, FileText, Users, Target, Clock, Sparkles, BookOpen } from "lucide-react";

import { FacilityPresetGallery } from "@/components/home/FacilityPresetGallery";
import { InlineChatInput } from "@/components/home/InlineChatInput";
import { clearChatHistory } from "@/utils/chatHelpers";
import { useChat } from "@/contexts/ChatContext";
import { PathSelector } from "@/components/equipment/PathSelector";
import { SportSelector } from "@/components/equipment/SportSelector";
import { SportQuestionnaire } from "@/components/equipment/SportQuestionnaire";
import { EquipmentQuoteDisplay } from "@/components/equipment/EquipmentQuote";
import { SportKey } from "@/components/home/SportIcons";
import { EquipmentInputs, EquipmentQuote } from "@/types/equipment";
import { calculateEquipmentQuote } from "@/utils/equipmentCalculator";
import useAnalytics from "@/hooks/useAnalytics";

type FlowStep = 'path' | 'sport' | 'questionnaire' | 'quote' | 'facility';

const Home = () => {
  const navigate = useNavigate();
  const { openChat } = useChat();
  const { track } = useAnalytics();
  const [searchParams] = useSearchParams();
  const [flowStep, setFlowStep] = useState<FlowStep>('path');
  const [selectedSport, setSelectedSport] = useState<SportKey | null>(null);
  const [quote, setQuote] = useState<EquipmentQuote | null>(null);

  // Initialize flow based on URL parameters
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'equipment') {
      setFlowStep('sport');
    } else if (mode === 'facility') {
      setFlowStep('facility');
    }
  }, [searchParams]);

  const handleChatSend = (message: string) => {
    clearChatHistory();
    openChat(message);
  };

  const handlePathSelect = (path: 'equipment' | 'facility') => {
    if (path === 'equipment') {
      setFlowStep('sport');
    } else {
      setFlowStep('facility');
    }
  };

  const handleSportSelect = (sport: SportKey) => {
    setSelectedSport(sport);
    setFlowStep('questionnaire');
  };

  const handleQuestionnaireSubmit = (inputs: EquipmentInputs) => {
    const generatedQuote = calculateEquipmentQuote(inputs);
    setQuote(generatedQuote);
    setFlowStep('quote');
    track('equipment_quote_generated', { 
      sport: inputs.sport,
      units: inputs.units,
      total: generatedQuote.totals.grandTotal 
    });
  };

  const handleRequestReview = () => {
    openChat("I'd like an expert to review my equipment quote");
  };

  const handleUpgradeToFull = () => {
    setFlowStep('facility');
  };

  const handleStartOver = () => {
    setFlowStep('path');
    setSelectedSport(null);
    setQuote(null);
  };

  const handleBackToPath = () => {
    setFlowStep('path');
    setSelectedSport(null);
  };

  const handleBackToSport = () => {
    setFlowStep('sport');
  };
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight py-2">
              Amazing Sports Facility Idea?
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            </p>
            <div className="mt-12">
              {flowStep === 'path' && (
                <PathSelector onSelectPath={handlePathSelect} />
              )}
              
              {flowStep === 'sport' && (
                <SportSelector onSelectSport={handleSportSelect} onBack={handleBackToPath} />
              )}
              
              {flowStep === 'questionnaire' && selectedSport && (
                <SportQuestionnaire 
                  sport={selectedSport} 
                  onSubmit={handleQuestionnaireSubmit}
                  onBack={handleBackToSport}
                />
              )}
              
              {flowStep === 'quote' && quote && (
                <EquipmentQuoteDisplay 
                  quote={quote}
                  onRequestReview={handleRequestReview}
                  onUpgradeToFull={handleUpgradeToFull}
                  onStartOver={handleStartOver}
                />
              )}
              
              {flowStep === 'facility' && (
                <InlineChatInput onSend={handleChatSend} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Facility Preset Gallery Section - Only show for facility flow */}
      {flowStep === 'facility' && (
        <section className="pt-8 pb-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Or Start with a Proven Layout
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Click any facility for instant rough estimates and customize to fit
              </p>
            </div>
            <FacilityPresetGallery />
          </div>
        </section>
      )}


      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Plan Your Facility</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive calculator covers every aspect of sports facility planning and operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-custom-md hover:shadow-custom-lg transition-smooth">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Financial Projections</CardTitle>
                <CardDescription>
                  Complete P&L forecasts, break-even analysis, ROI calculations, and payback periods
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-custom-md hover:shadow-custom-lg transition-smooth">
              <CardHeader>
                <Calculator className="h-8 w-8 text-secondary mb-2" />
                <CardTitle>Startup & Operating Costs</CardTitle>
                <CardDescription>
                  Detailed equipment lists, construction costs, staffing, utilities, and ongoing expenses
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-custom-md hover:shadow-custom-lg transition-smooth">
              <CardHeader>
                <Target className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Revenue Modeling</CardTitle>
                <CardDescription>
                  Memberships, rentals, lessons, camps, leagues, and events with utilization forecasting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-custom-md hover:shadow-custom-lg transition-smooth">
              <CardHeader>
                <Users className="h-8 w-8 text-info mb-2" />
                <CardTitle>Multi-Sport Support</CardTitle>
                <CardDescription>
                  Baseball, basketball, volleyball, pickleball, soccer, football, lacrosse, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-custom-md hover:shadow-custom-lg transition-smooth">
              <CardHeader>
                <FileText className="h-8 w-8 text-success mb-2" />
                <CardTitle>Professional Reports</CardTitle>
                <CardDescription>
                  Download detailed PDF reports and CSV data for presentations and funding applications
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-custom-md hover:shadow-custom-lg transition-smooth">
              <CardHeader>
                <Clock className="h-8 w-8 text-warning mb-2" />
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Phase-by-phase timeline estimates from planning to grand opening
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get your complete facility analysis in minutes!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Input Your Details</h3>
              <p className="text-muted-foreground">
                Tell us about your location, sports, facility type, and business goals
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Review & Customize</h3>
              <p className="text-muted-foreground">
                Adjust our recommendations to match your specific needs and budget
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-hero rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Report</h3>
              <p className="text-muted-foreground">
                Download comprehensive financial projections and connect with our experts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Turn Your Vision Into Reality?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your free facility calculation today and get the insights you need to make confident decisions.
            </p>
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/start">
                <Calculator className="mr-2 h-5 w-5" />
                Start Your Free Plan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="container mx-auto">
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <Link to="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
            <Link to="/legal" className="hover:text-primary transition-colors">
              Legal
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Home;