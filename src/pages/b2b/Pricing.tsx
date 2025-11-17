import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, DollarSign, ArrowRight } from "lucide-react";
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
      highlighted: false
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
      highlighted: true
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
      highlighted: false
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
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <DollarSign className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">B2B Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Flexible pricing options designed to scale with your business. From referral partnerships 
            to enterprise API access, we have a solution that fits your needs.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, idx) => (
            <Card
              key={idx}
              className={tier.highlighted ? "border-primary shadow-xl relative" : ""}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-1">{tier.price}</div>
                  <div className="text-sm text-muted-foreground">{tier.setup}</div>
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
