import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, MessageSquare, DollarSign, Building2, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const B2B = () => {
  const features = [
    {
      icon: <Handshake className="h-12 w-12 text-primary" />,
      title: "Partnerships",
      description: "White-label solutions and strategic partnerships for equipment suppliers, consultants, and developers",
      link: "/b2b/partnerships"
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      title: "Contact",
      description: "Get in touch with our B2B team to discuss collaboration opportunities",
      link: "/b2b/contact"
    },
    {
      icon: <DollarSign className="h-12 w-12 text-primary" />,
      title: "Pricing",
      description: "Custom pricing for enterprise solutions, API access, and white-label tools",
      link: "/b2b/pricing"
    }
  ];

  const benefits = [
    {
      icon: <Building2 className="h-8 w-8 text-primary" />,
      title: "Lead Generation",
      content: "Access qualified leads from our platform for your facility building or consulting services"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "White-Label Tools",
      content: "Integrate our calculators into your platform with your branding and customization"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Co-Marketing",
      content: "Joint promotional opportunities and strategic marketing partnerships"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Partner with SportsFacility.ai
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Empower your business with our sports facility planning tools. Join equipment suppliers, consultants, 
            developers, and technology partners who leverage our platform to grow their businesses.
          </p>
          <Button size="lg" asChild className="bg-gradient-primary">
            <a href="https://practicesportsinc.setmore.com/" target="_blank" rel="noopener noreferrer">
              Schedule B2B Consultation
            </a>
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link to={feature.link}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Partner with Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Who We Work With</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equipment Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get featured in our cost library and connect with facility builders
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facility Consultants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access our tools and receive qualified referrals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real Estate Developers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Co-market opportunities and feasibility analysis
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technology Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  API integrations and white-label solutions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Partner?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss how SportsFacility.ai can help grow your business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-primary">
              <Link to="/b2b/contact">Contact B2B Team</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/b2b/partnerships">View Partnership Options</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default B2B;
