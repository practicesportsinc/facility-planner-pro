import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, DollarSign, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import LeadGate from "@/components/shared/LeadGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const B2BPricing = () => {
  const [showLeadGate, setShowLeadGate] = useState(false);

  const handleLeadSubmit = async (leadData: any) => {
    try {
      // Call edge function to sync lead
      const { error } = await supabase.functions.invoke('sync-lead-to-sheets', {
        body: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone || '',
          businessName: leadData.business_name || '',
          city: leadData.city || '',
          state: leadData.state || '',
          source: 'b2b-pricing-quote',
          referrer: document.referrer || window.location.href,
        }
      });

      if (error) throw error;

      toast({
        title: "Quote request submitted!",
        description: "Our team will prepare a custom proposal and contact you within 1 business day.",
      });

      setShowLeadGate(false);
    } catch (error) {
      console.error('Error submitting pricing quote:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Please try again or contact us directly.",
      });
    }
  };

  const pricingTiers = [
    {
      name: "Referral Partner",
      description: "Earn commissions by referring clients",
      price: "Free to join",
      setup: "No setup fees",
      features: [
        "20% referral commission",
        "Partner portal access",
        "Marketing materials",
        "Monthly payouts",
        "Basic analytics",
        "Email support"
      ],
      cta: "Apply Now",
      highlighted: false,
      badge: null
    },
    {
      name: "Featured Supplier",
      description: "Become a recommended partner and receive qualified project leads",
      price: "$749/month",
      setup: "$999 setup fee",
      features: [
        "AI-matched qualified leads in your service area",
        "Real-time lead notifications with project details",
        "Smart lead matching - only projects that fit your profile",
        "Exclusive category positioning (limited slots)",
        "Market intelligence dashboard with demand trends",
        "Verified Supplier trust badge",
        "Automated lead nurturing for long-term projects",
        "Direct CRM integration via API/webhook",
        "Performance-based bonus leads program",
        "Co-creation content marketing opportunities",
        "Competitive intelligence & benchmarking",
        "Automated follow-up sequences & templates",
        "Featured in customer emails & PDFs",
        "Dedicated partner success manager",
        "24-hour priority support"
      ],
      cta: "Become a Featured Supplier",
      highlighted: true,
      badge: "Most Popular for Suppliers",
      annualPrice: "$7,990/year (Save 11%)",
      limitedAvailability: true
    },
    {
      name: "White Label",
      description: "Branded calculator tools for your platform",
      price: "Starting at $2,500/mo",
      setup: "$5,000 setup fee",
      features: [
        "Full calculator suite with your branding",
        "Custom domain and styling",
        "Lead management system",
        "Priority support",
        "Monthly usage reports",
        "Co-marketing opportunities",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      highlighted: false,
      badge: null
    },
    {
      name: "API Access",
      description: "Integrate our calculation engine",
      price: "Custom pricing",
      setup: "Varies by scope",
      features: [
        "Full API access",
        "Unlimited API calls",
        "Custom integrations",
        "Technical documentation",
        "Developer support",
        "SLA guarantee (99.9%)",
        "White-glove onboarding"
      ],
      cta: "Request Quote",
      highlighted: false,
      badge: null
    }
  ];

  const addOns = [
    {
      name: "Custom Features",
      description: "Tailored calculator modifications for your specific needs",
      pricing: "Quote-based"
    },
    {
      name: "Consulting Services",
      description: "Expert guidance on facility planning and business development",
      pricing: "$200-$500/hour"
    },
    {
      name: "Co-Marketing Campaigns",
      description: "Joint promotional activities and lead generation initiatives",
      pricing: "Revenue share"
    },
    {
      name: "Training & Support",
      description: "Comprehensive training for your team on using our tools",
      pricing: "$1,500/session"
    },
    {
      name: "Premium Placement Upgrade",
      description: "Guaranteed #1 position in your category with 'Our #1 Recommended Partner' designation",
      pricing: "+$200/month"
    },
    {
      name: "Multi-Category Access",
      description: "Expand to additional service categories and increase lead volume by 40-60%",
      pricing: "+$300/month per category"
    },
    {
      name: "Enhanced Analytics Package",
      description: "Real-time SMS alerts, predictive forecasting, and competitive benchmarking",
      pricing: "+$150/month"
    },
    {
      name: "Lead Guarantee Program",
      description: "Minimum 20 qualified leads per month or get 50% refund/free month",
      pricing: "+$500/month"
    },
    {
      name: "White-Glove Onboarding",
      description: "1-on-1 training, custom playbook, CRM setup, and 30 days optimization consulting",
      pricing: "$1,500 one-time"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <DollarSign className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">B2B Pricing & Partnerships</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Flexible pricing options designed to scale with your business. From referral partnerships 
            to our popular Featured Supplier program, enterprise white-label solutions, and API access.
          </p>
          <p className="text-lg text-primary font-semibold max-w-2xl mx-auto">
            🏆 Featured Suppliers receive AI-matched, qualified project leads from facility owners actively planning real projects
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier, idx) => (
            <Card
              key={idx}
              className={tier.highlighted ? "border-primary shadow-xl relative" : ""}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {tier.badge}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {tier.name}
                  {tier.name === "Featured Supplier" && <Star className="h-5 w-5 text-primary fill-current" />}
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-1">{tier.price}</div>
                  {tier.annualPrice && (
                    <div className="text-sm text-primary font-semibold mb-1">{tier.annualPrice}</div>
                  )}
                  <div className="text-sm text-muted-foreground">{tier.setup}</div>
                  {tier.limitedAvailability && (
                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      ⚠️ Limited to 5 suppliers per category/metro
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={tier.highlighted ? "w-full bg-gradient-primary" : "w-full"}
                  variant={tier.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link to="/b2b/contact">{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Additional Services</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {addon.name}
                    <span className="text-sm font-normal text-primary">{addon.pricing}</span>
                  </CardTitle>
                  <CardDescription>{addon.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Supplier Benefits Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 mb-16 max-w-5xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-8 w-8 text-primary fill-current" />
              <CardTitle className="text-3xl">Why Become a Featured Supplier?</CardTitle>
            </div>
            <CardDescription className="text-center text-base">
              Unlike traditional directories that blast every lead to dozens of suppliers, we use AI to match leads 
              with suppliers based on project fit, service area, and specialization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3">🎯 Higher Quality Leads</h3>
                <p className="text-sm text-muted-foreground">
                  Every lead includes detailed project data: budget, timeline, facility type, square footage, 
                  and location. Our AI pre-qualifies leads with A/B/C scoring so you focus on the best opportunities first.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3">📊 Market Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Access real-time dashboards showing average project budgets in your category, most requested 
                  products, geographic demand trends, and seasonal patterns to optimize your business.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3">🏆 Exclusive Positioning</h3>
                <p className="text-sm text-muted-foreground">
                  Limited to just 5 suppliers per category per metro area. This creates real exclusivity and 
                  higher lead volume compared to directories listing 20+ competitors.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3">⚡ Smart Automation</h3>
                <p className="text-sm text-muted-foreground">
                  Automated lead nurturing, follow-up sequences, CRM integration, and performance-based bonus 
                  leads. We help you convert 30-40% more leads than competitors' directories.
                </p>
              </div>
            </div>
            
            <div className="bg-background/80 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-1">How many leads can I expect per month?</p>
                  <p className="text-sm text-muted-foreground">
                    Featured Suppliers typically receive 15-40 qualified leads monthly, depending on category, 
                    service area, and season. We provide transparent analytics to track your ROI.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">What makes your leads different from other directories?</p>
                  <p className="text-sm text-muted-foreground">
                    Our leads come from facility planners actively using our calculator tools to plan real projects. 
                    Each lead includes budget, timeline, and detailed requirements—not just contact info. Plus, our 
                    AI matches leads to suppliers based on fit, so you waste less time on unqualified prospects.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Can I try it before committing?</p>
                  <p className="text-sm text-muted-foreground">
                    Yes! Start month-to-month at $749/mo. Upgrade to annual billing ($7,990/year) to save 11% 
                    and lock in exclusive category positioning.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">How quickly will I start receiving leads?</p>
                  <p className="text-sm text-muted-foreground">
                    Once approved and onboarded (typically 3-5 business days), you'll start receiving leads immediately. 
                    Most suppliers get their first lead within the first week.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-primary mb-3">
                ⚡ Featured suppliers convert 35% more leads than competitors' directories
              </p>
              <Button size="lg" className="bg-gradient-primary" asChild>
                <Link to="/b2b/contact">Apply to Become a Featured Supplier</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Volume Discounts */}
        <Card className="bg-slate-50 dark:bg-slate-900 mb-16 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Volume & Partner Discounts</CardTitle>
            <CardDescription>
              Special pricing available for high-volume users and strategic partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Annual prepayment:</strong> Save 15% on monthly fees with annual contracts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Multi-product bundles:</strong> Combine white-label and API access for reduced rates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Strategic partners:</strong> Custom pricing for co-marketing and exclusive territories
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Non-profits & education:</strong> Special rates for educational institutions and 501(c)(3) organizations
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Custom Quote CTA */}
        <Card className="max-w-3xl mx-auto p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Custom Pricing?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Every business is unique. Request a custom quote tailored to your specific requirements, 
            volume, and partnership goals.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary"
            onClick={() => setShowLeadGate(true)}
          >
            Request Custom Quote
          </Button>
        </Card>

        <LeadGate
          isOpen={showLeadGate}
          onClose={() => setShowLeadGate(false)}
          onSubmit={handleLeadSubmit}
          title="Custom Pricing Request"
          description="Tell us about your needs and we'll create a custom pricing proposal for your business."
          showOptionalFields={true}
        />
      </div>
    </Layout>
  );
};

export default B2BPricing;
