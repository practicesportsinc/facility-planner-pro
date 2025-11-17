import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Handshake, Plug, Package, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Partnerships = () => {
  const partnershipTypes = [
    {
      icon: <Plug className="h-10 w-10 text-primary" />,
      title: "Technology Partners",
      description: "Integrate our facility planning tools into your platform",
      benefits: [
        "API access to our calculation engine",
        "White-label calculator widgets",
        "Co-branded solutions",
        "Technical support and documentation"
      ]
    },
    {
      icon: <Package className="h-10 w-10 text-primary" />,
      title: "Equipment Suppliers",
      description: "Join our preferred vendor program",
      benefits: [
        "Featured placement in cost library",
        "Direct leads from facility builders",
        "Co-marketing opportunities",
        "Volume purchase programs"
      ]
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Facility Consultants",
      description: "Access our tools and receive qualified referrals",
      benefits: [
        "White-label access to all calculators",
        "Qualified lead referrals",
        "Revenue sharing opportunities",
        "Joint proposal development"
      ]
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      title: "Real Estate Developers",
      description: "Collaborate on facility planning and feasibility",
      benefits: [
        "Co-marketing of properties",
        "Feasibility analysis tools",
        "Tenant introductions",
        "Development consulting"
      ]
    }
  ];

  const tiers = [
    {
      name: "Referral Partner",
      description: "Earn commissions by referring clients",
      features: [
        "20% referral commission",
        "Marketing materials provided",
        "Partner portal access",
        "Monthly payouts"
      ]
    },
    {
      name: "Strategic Partner",
      description: "Deep integration and co-marketing",
      features: [
        "White-label tool access",
        "Co-branded marketing campaigns",
        "Dedicated account manager",
        "Custom integration support"
      ]
    },
    {
      name: "Enterprise Partner",
      description: "Full API access and custom solutions",
      features: [
        "Complete API access",
        "Custom feature development",
        "Priority support (24/7)",
        "Exclusive territory options"
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Handshake className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Partnership Opportunities</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our growing network of partners and unlock new revenue streams while providing 
            exceptional value to your clients
          </p>
        </div>

        {/* Partnership Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Programs</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {partnershipTypes.map((type, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="mb-4">{type.icon}</div>
                  <CardTitle className="text-2xl">{type.title}</CardTitle>
                  <CardDescription className="text-base">{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Tiers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, idx) => (
              <Card key={idx} className={idx === 1 ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Partner with SportsFacility.ai?</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Market-Leading Technology</h3>
                <p className="text-sm text-muted-foreground">
                  Access the most comprehensive sports facility planning tools in the industry
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Qualified Lead Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Receive pre-qualified leads actively planning facility projects
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Revenue Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple monetization models including commissions and licensing
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Dedicated Support</h3>
                <p className="text-sm text-muted-foreground">
                  Account managers and technical support to ensure your success
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application CTA */}
        <Card className="max-w-3xl mx-auto p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Partner?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Complete our partnership application to get started, or schedule a call to discuss 
            how we can work together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-primary">
              <Link to="/b2b/contact">Apply for Partnership</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="https://practicesportsinc.setmore.com/" target="_blank" rel="noopener noreferrer">
                Schedule Discovery Call
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Partnerships;
