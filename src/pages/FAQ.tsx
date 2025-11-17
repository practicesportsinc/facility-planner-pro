import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      category: "General Questions",
      questions: [
        {
          q: "What is SportsFacility.ai?",
          a: "SportsFacility.ai is a comprehensive planning tool powered by Practice Sports, Inc. that helps entrepreneurs, investors, and facility owners estimate costs, revenues, and ROI for sports facility projects. Our calculator provides detailed financial projections and recommendations based on your specific facility requirements."
        },
        {
          q: "Who should use this calculator?",
          a: "Our tools are designed for facility owners, real estate developers, sports entrepreneurs, franchise operators, equipment suppliers, and consultants planning indoor or outdoor sports facilities. Whether you're building a new facility or expanding an existing one, our calculators provide valuable insights."
        },
        {
          q: "Is the calculator free to use?",
          a: "Yes, all our calculator tools (Quick Estimate, Easy Wizard, and Advanced Calculator) are completely free to use. We only ask for your contact information to provide you with detailed results and connect you with facility specialists who can help bring your vision to life."
        },
      ]
    },
    {
      category: "Calculator & Tools",
      questions: [
        {
          q: "How accurate are the cost estimates?",
          a: "Our estimates are based on current market data, industry benchmarks, and real-world facility projects. However, actual costs can vary based on location, market conditions, supplier negotiations, and specific project requirements. We recommend using our estimates for budgeting purposes and consulting with our facility specialists for confirmed pricing."
        },
        {
          q: "What information do I need to provide?",
          a: "The amount of detail required depends on which tool you use. The Quick Estimate requires basic information like facility size and sports. The Easy Wizard asks for more details about your vision and timeline. The Advanced Calculator allows you to customize every aspect including equipment, staffing, and revenue models for the most accurate projections."
        },
        {
          q: "Can I save my project and return later?",
          a: "Currently, you can download your results as a PDF or export facility layouts. For authenticated users (coming soon), you'll be able to save multiple projects and access them anytime. In the meantime, we recommend downloading your results for future reference."
        },
        {
          q: "How do I export my results?",
          a: "You can export your results in multiple ways: download a comprehensive PDF report, generate a Business Plan document, download the DIY Research Kit, or export your facility layout as an SVG file. All export options are available from the results pages after completing your project calculation."
        },
      ]
    },
    {
      category: "Pricing & Services",
      questions: [
        {
          q: "What happens after I submit my contact information?",
          a: "After submission, you'll receive a confirmation email with a summary of your project estimates. Our team at Practice Sports, Inc. will also receive your information and may reach out to discuss your project, answer questions, and provide personalized recommendations. You can also schedule a consultation at any time using our booking system."
        },
        {
          q: "Do you provide consulting services?",
          a: "Yes! Practice Sports, Inc. offers comprehensive facility consulting services including site selection, equipment sourcing, facility design, business planning, and project management. Contact us to learn more about how we can help bring your facility vision to reality."
        },
        {
          q: "Can I get financing recommendations?",
          a: "Our Advanced Calculator includes a Financing step that estimates monthly payments, interest costs, and cash flow impacts based on different financing scenarios. For specific financing options and lender introductions, schedule a consultation with our team."
        },
        {
          q: "Do you work with facility builders?",
          a: "Absolutely! We partner with facility builders, general contractors, equipment suppliers, and sports facility consultants. Visit our B2B section to learn about partnership opportunities, referral programs, and white-label solutions."
        },
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "What sports are supported?",
          a: "We support a wide range of sports including basketball, volleyball, pickleball, tennis, soccer, baseball/softball, football, hockey, gymnastics, cheer/dance, and many more. Our database includes equipment, dimensions, and operational requirements for dozens of sports and activities."
        },
        {
          q: "Can I use the calculator for multiple projects?",
          a: "Yes! You can use our calculators as many times as you need for different projects. Each submission is tracked separately, and you can download results for each project individually."
        },
        {
          q: "How is my data protected?",
          a: "We take data privacy seriously. All information submitted through our forms is encrypted and stored securely. We use your contact information only to provide you with results, follow-up support, and relevant facility planning resources. We never share your data with third parties without your consent. See our Privacy Policy for details."
        },
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about planning your sports facility with SportsFacility.ai
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((category, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((faq, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`${idx}-${qIdx}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="max-w-2xl mx-auto mt-16 p-8 text-center">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our facility specialists are here to help. Schedule a consultation or contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-primary">
              <a href="https://practicesportsinc.setmore.com/" target="_blank" rel="noopener noreferrer">
                Schedule Consultation
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/b2b/contact">Contact Us</Link>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default FAQ;
