import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import LeadGate from "@/components/shared/LeadGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const B2BContact = () => {
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
          message: leadData.message || '',
          source: 'b2b-contact',
          referrer: document.referrer || window.location.href,
        }
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "Our B2B team will contact you within 1 business day.",
      });

      setShowLeadGate(false);
    } catch (error) {
      console.error('Error submitting B2B contact:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Please try again or contact us directly.",
      });
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email",
      content: "info@practicesports.com",
      link: "mailto:info@practicesports.com"
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Phone",
      content: "800.877.6787 | 402.592.2000",
      link: "tel:8008776787"
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Office",
      content: "14706 Giles Rd. Omaha, NE 68138",
      link: "https://maps.google.com/?q=14706+Giles+Rd+Omaha+NE+68138"
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: "Schedule Meeting",
      content: "Book a B2B consultation",
      link: "https://practicesportsinc.setmore.com/"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Our B2B Team</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to explore partnership opportunities? Get in touch with our business development team 
            to discuss how SportsFacility.ai can help grow your business.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and our team will get back to you within 1 business day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-primary"
                  onClick={() => setShowLeadGate(true)}
                >
                  Submit Inquiry
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                {contactMethods.map((method, idx) => (
                  <Card key={idx}>
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="mt-1">{method.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{method.title}</h3>
                        <a
                          href={method.link}
                          target={method.link.startsWith('http') ? '_blank' : undefined}
                          rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {method.content}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 6:00 PM CST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">9:00 AM - 2:00 PM CST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Practice Sports, Inc.</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Practice Sports, Inc. is a leading provider of sports facility planning tools and consulting 
                  services. With decades of combined experience, our team helps entrepreneurs, developers, and 
                  facility owners bring their sports facility visions to life through data-driven planning and 
                  strategic partnerships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <LeadGate
          isOpen={showLeadGate}
          onClose={() => setShowLeadGate(false)}
          onSubmit={handleLeadSubmit}
          title="B2B Contact Form"
          description="Tell us about your partnership interest and we'll get back to you shortly."
          showOptionalFields={true}
          showMessageField={true}
          submitButtonText="Submit"
          showCancelButton={false}
        />
      </div>
    </Layout>
  );
};

export default B2BContact;
