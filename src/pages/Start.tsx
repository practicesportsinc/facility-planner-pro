import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Sparkles, Calculator, Users, Clock, Target, TrendingUp } from "lucide-react";

const Start = () => {
  // Fire analytics event
  const handlePathSelected = (path: 'easy' | 'pro') => {
    // Track analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'path_selected', {
        path,
        timestamp: Date.now()
      });
    }
  };

  return (
    <Layout>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              How do you want to plan your facility?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose your planning approach. Both paths give you professional results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Easy Plan Tile */}
            <Link 
              to="/wizard"
              onClick={() => handlePathSelected('easy')}
              className="ps-card group hover:shadow-custom-lg transition-smooth cursor-pointer"
            >
              <div className="p-8 text-center">
                <div className="bg-gradient-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">Easy Plan</h3>
                <p className="text-lg font-medium mb-3 text-success">Recommended</p>
                <p className="text-muted-foreground mb-6">
                  Fast setup with smart defaults. Get realistic numbers in 3-5 minutes using our guided wizard.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>3-5 minute setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Sport-specific presets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Instant KPI results</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Pro Calculator Tile */}
            <Link 
              to="/calculator"
              onClick={() => handlePathSelected('pro')}
              className="ps-card group hover:shadow-custom-lg transition-smooth cursor-pointer"
            >
              <div className="p-8 text-center">
                <div className="bg-gradient-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-smooth">
                  <Calculator className="h-10 w-10 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-secondary">Pro Calculator</h3>
                <p className="text-lg font-medium mb-3 text-info">Advanced Control</p>
                <p className="text-muted-foreground mb-6">
                  Full control over every line item. Custom budgeting with detailed financing and sensitivity analysis.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-secondary" />
                    <span>Line-item budgeting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    <span>Financing scenarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" />
                    <span>Custom staffing models</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary CTAs */}
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/wizard-results" 
                className="ps-btn text-primary hover:text-primary/80 transition-smooth"
              >
                See Example Plans
              </Link>
              <Link 
                to="/legal" 
                className="ps-btn text-primary hover:text-primary/80 transition-smooth"
              >
                Talk to a Coach
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Both paths can be upgraded. Start simple, get detailed later.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Start;