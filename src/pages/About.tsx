import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Target, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              About SportsFacility.ai
            </h1>
            <p className="text-xl text-muted-foreground">
              Building the future of modern sports facilities
            </p>
          </div>

          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Who We Are
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                SportsFacility.ai is a product of <strong>Practice Sports, Inc.</strong>, a leading provider of sports facility solutions. 
                We've developed this comprehensive platform to help entrepreneurs, facility owners, and organizations make informed decisions 
                about their sports facility investments.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With decades of combined experience in sports facility design, construction, and operations, we understand the complexity 
                of planning and budgeting for sports facilities. Our AI-powered tools simplify this process, providing accurate estimates 
                and actionable insights in minutes instead of weeks.
              </p>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to democratize access to professional-grade facility planning tools. Whether you're exploring a 
                small training center or a multi-million dollar complex, our platform provides the insights you need to make 
                confident, data-driven decisions about your sports facility investment.
              </p>
            </CardContent>
          </Card>

          {/* What We Offer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                What We Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Quick Estimates</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant ballpark figures for your facility concept in under 2 minutes.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Guided Wizard</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step planning with personalized recommendations and facility layouts.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Advanced Calculator</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed financial modeling with revenue projections, staffing, and ROI analysis.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Expert Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with our facility specialists for personalized guidance and quotes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team/Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Our Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Practice Sports, Inc. has been a trusted partner for sports facilities across the United States. Our team 
                includes facility designers, equipment specialists, financial analysts, and sports industry veterans who bring 
                real-world experience to every aspect of our platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We've helped hundreds of clients navigate the complex process of facility planning, from initial concept to 
                grand opening. Our tools are built on this expertise, refined through years of feedback and continuous improvement.
              </p>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="border-primary/20 bg-gradient-subtle">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Ready to Start Planning?</h2>
                <p className="text-muted-foreground">
                  Use our free tools to explore your facility concept, or connect with our team for personalized guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-gradient-primary text-white">
                    <Link to="/start">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="https://practicesportsinc.setmore.com/" target="_blank" rel="noopener noreferrer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Consultation
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
              <CardDescription>We'd love to hear from you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-1">Practice Sports, Inc.</p>
                  <p className="text-muted-foreground">14706 Giles Rd</p>
                  <p className="text-muted-foreground">Omaha, NE 68138</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Contact</p>
                  <p className="text-muted-foreground">Phone: 800.877.6787 | 402.592.2000</p>
                  <p className="text-muted-foreground">
                    Email: <a href="mailto:info@practicesports.com" className="text-primary hover:underline">info@practicesports.com</a>
                  </p>
                  <p className="text-muted-foreground">
                    Web: <a href="https://practicesports.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">practicesports.com</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default About;
