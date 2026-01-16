import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { Calculator, TrendingUp, FileText, Users, Target, Clock, Sparkles, BookOpen } from "lucide-react";

import { FacilityPresetGallery } from "@/components/home/FacilityPresetGallery";
import { FullFacilitySelector } from "@/components/home/FullFacilitySelector";
import { InlineChatInput } from "@/components/home/InlineChatInput";
import { clearChatHistory } from "@/utils/chatHelpers";
import { useChat } from "@/contexts/ChatContext";
import { PathSelector } from "@/components/equipment/PathSelector";
import { SportSelector } from "@/components/equipment/SportSelector";
import { SportQuestionnaire } from "@/components/equipment/SportQuestionnaire";
import { EquipmentQuoteDisplay } from "@/components/equipment/EquipmentQuote";
import { SportKey, SPORT_LABELS } from "@/components/home/SportIcons";
import { EquipmentInputs, EquipmentQuote } from "@/types/equipment";
import { calculateEquipmentQuote } from "@/utils/equipmentCalculator";
import useAnalytics from "@/hooks/useAnalytics";
import LeadGate from "@/components/shared/LeadGate";
import { submitLeadToDatabase } from "@/utils/leadSubmission";
import { toast } from "sonner";

type FlowStep = 'path' | 'sport' | 'questionnaire' | 'quote' | 'facility' | 'market-select';

const Home = () => {
  const navigate = useNavigate();
  const { openChat } = useChat();
  const { track } = useAnalytics();
  const [searchParams] = useSearchParams();
  const [flowStep, setFlowStep] = useState<FlowStep>('path');
  const [selectedSport, setSelectedSport] = useState<SportKey | null>(null);
  const [quote, setQuote] = useState<EquipmentQuote | null>(null);
  const [equipmentQuoteForUpgrade, setEquipmentQuoteForUpgrade] = useState<EquipmentQuote | null>(null);
  const [isLeadGateOpen, setIsLeadGateOpen] = useState(false);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const flowContentRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect for hero image
  useEffect(() => {
    const handleScroll = () => {
      if (heroImageRef.current) {
        const scrollY = window.scrollY;
        // Move image at 40% of scroll speed for subtle parallax
        heroImageRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize flow based on URL parameters
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'equipment') {
      setFlowStep('sport');
    } else if (mode === 'facility') {
      setFlowStep('facility');
    }
  }, [searchParams]);

  // Scroll to flow content when step changes (or top for path selection)
  useEffect(() => {
    if (flowStep !== 'path') {
      flowContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [flowStep]);

  const handleChatSend = (message: string) => {
    clearChatHistory();
    openChat(message);
  };

  const handlePathSelect = (path: 'equipment' | 'facility' | 'market') => {
    if (path === 'equipment') {
      setFlowStep('sport');
    } else if (path === 'market') {
      setFlowStep('market-select');
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
    setIsLeadGateOpen(true);
  };

  const handleLeadSubmit = async (leadData: any) => {
    // Format equipment list as readable text for Google Sheets
    const equipmentSummary = quote?.lineItems.map(category => 
      `${category.category}:\n${category.items.map(item => 
        `  - ${item.name}: ${item.quantity} × $${item.unitCost.toLocaleString()} = $${item.totalCost.toLocaleString()}`
      ).join('\n')}`
    ).join('\n\n');

    const enrichedData = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      city: leadData.city,
      state: leadData.state,
      message: leadData.message,
      facility_type: quote ? SPORT_LABELS[quote.sport] : undefined,
      estimated_budget: quote?.totals.grandTotal,
      source: 'equipment_quote_review',
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      // Include full equipment data
      equipmentItems: quote?.lineItems,
      equipmentSummary: equipmentSummary,
      equipmentTotals: quote?.totals,
      equipmentInputs: quote?.inputs,
    };

    const result = await submitLeadToDatabase(enrichedData);
    
    if (result.success) {
      toast.success("Review request submitted! Our team will contact you soon.");
      setIsLeadGateOpen(false);
      track('equipment_review_lead_submitted', {
        sport: quote?.sport,
        total: quote?.totals.grandTotal
      });
    } else {
      toast.error(result.error || "Failed to submit request. Please try again.");
    }
  };

  const handleUpgradeToFull = () => {
    setEquipmentQuoteForUpgrade(quote);
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
      {/* Hero Image Banner - Extended behind header with parallax */}
      <div className="relative h-[calc(150px+7rem)] md:h-[calc(180px+8rem)] w-full overflow-hidden -mt-28 md:-mt-32">
        <img 
          ref={heroImageRef}
          src="/images/home-gallery/hero-facility.jpg"
          alt="Professional sports training facility"
          className="w-full h-[120%] object-cover object-center will-change-transform"
        />
        {/* Gradient overlay blends with header */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        
        {/* Heading overlay - positioned in visible area below header */}
        <div className="absolute inset-0 flex items-center justify-center pt-28 md:pt-32">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center px-4 drop-shadow-lg animate-enter">
            Amazing Sports Facility Idea?
          </h1>
        </div>
      </div>

      {/* Main Content Section */}
      <section ref={flowContentRef} className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            </p>
            <div className="mt-8">
              {flowStep === 'path' && (
                <>
                  <PathSelector onSelectPath={handlePathSelect} />
                  <InlineChatInput onSend={handleChatSend} />
                </>
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
                <FullFacilitySelector onBack={handleBackToPath} equipmentQuote={equipmentQuoteForUpgrade} />
              )}
              
              {flowStep === 'market-select' && (
                <div className="w-full max-w-3xl mx-auto mb-16">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-3">Market Analysis / Biz Plan</h2>
                    <p className="text-muted-foreground text-lg">Quick check or comprehensive plan?</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card 
                      onClick={() => navigate('/market-analysis')} 
                      className="cursor-pointer p-6 hover:shadow-lg transition-all hover:border-primary/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">Flash Analysis</h3>
                      <p className="text-sm text-success mb-3">~30 seconds</p>
                      <p className="text-muted-foreground mb-4">Quick demographics and sports demand for any ZIP code</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Population & income data</li>
                        <li>• Sports demand ranking</li>
                        <li>• Market opportunity score</li>
                      </ul>
                    </Card>

                    <Card 
                      onClick={() => navigate('/business-plan')} 
                      className="cursor-pointer p-6 hover:shadow-lg transition-all hover:border-primary/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">Full Business Plan</h3>
                      <p className="text-sm text-info mb-3">~15 minutes</p>
                      <p className="text-muted-foreground mb-4">Create an investor-ready business plan for your facility</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Market & competitive analysis</li>
                        <li>• Financial projections</li>
                        <li>• Professional PDF export</li>
                      </ul>
                    </Card>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToPath}
                    className="mt-6"
                  >
                    ← Back
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture for Expert Review */}
      <LeadGate
        isOpen={isLeadGateOpen}
        onClose={() => setIsLeadGateOpen(false)}
        onSubmit={handleLeadSubmit}
        title="Request Expert Review"
        description={`Get personalized advice on your ${quote ? SPORT_LABELS[quote.sport] : ''} equipment quote from our experts.`}
        mode="modal"
        showOptionalFields={true}
        showMessageField={true}
        showPartnershipField={false}
        showOutreachField={false}
        submitButtonText="Request Review"
        showCancelButton={true}
        cancelButtonText="Cancel"
      />

      {/* Only show generic content sections on the main path selection */}
      {flowStep === 'path' && (
        <>
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
        </>
      )}
    </Layout>
  );
};

export default Home;