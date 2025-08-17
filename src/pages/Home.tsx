import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { Calculator, TrendingUp, FileText, Users, Target, Clock, Sparkles, BookOpen } from "lucide-react";
import QuickEstimatesButton from "@/components/QuickEstimatesButton";
import VisualDesignerHome from "@/components/home/VisualDesignerHome";

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Amazing Sports Facility Idea?
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get itemized estimates + full business plan, in minutes - FREE.<br />
              Real Estate. Op Expenses. Revenue. Equipment.<br />
              Start faster, smarter - with SportsFacility.ai
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate('/start')}>
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Designer Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <VisualDesignerHome />
        </div>
      </section>

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
              Get your complete facility analysis in just 10 minutes
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
    </Layout>
  );
};

export default Home;