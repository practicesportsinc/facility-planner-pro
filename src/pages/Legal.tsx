import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";

const Legal = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Legal Information</h1>
          <p className="text-muted-foreground">
            Terms of use, privacy policy, and important disclaimers
          </p>
        </div>

        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms">Terms of Use</TabsTrigger>
            <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  How we collect, use, and protect your information
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Information We Collect</h3>
                <p>
                  We collect information you provide directly to us when using our facility calculator, 
                  including project details, contact information, and facility specifications.
                </p>

                <h3>How We Use Your Information</h3>
                <ul>
                  <li>To provide accurate cost calculations and recommendations</li>
                  <li>To send you your calculation results and reports</li>
                  <li>To follow up on your project and provide expert consultation</li>
                  <li>To improve our calculator and services</li>
                </ul>

                <h3>Information Sharing</h3>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy.
                </p>

                <h3>Data Security</h3>
                <p>
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h3>Contact Us</h3>
                <p>
                  If you have questions about this Privacy Policy, please contact us at 
                  privacy@practicesports.com
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Use</CardTitle>
                <CardDescription>
                  Conditions for using our facility calculator service
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Acceptance of Terms</h3>
                <p>
                  By using our facility calculator, you agree to these Terms of Use. 
                  If you do not agree, please do not use our service.
                </p>

                <h3>Service Description</h3>
                <p>
                  Our calculator provides estimates for sports facility development costs, 
                  operating expenses, and revenue projections based on the information you provide.
                </p>

                <h3>User Responsibilities</h3>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Use the service for legitimate business planning purposes</li>
                  <li>Not attempt to reverse engineer or compromise our systems</li>
                  <li>Respect intellectual property rights</li>
                </ul>

                <h3>Limitations of Use</h3>
                <p>
                  You may not use our service for any unlawful purpose or in any way that 
                  could damage, disable, or impair our systems.
                </p>

                <h3>Modifications</h3>
                <p>
                  We reserve the right to modify these terms at any time. 
                  Continued use constitutes acceptance of modified terms.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disclaimer">
            <Card>
              <CardHeader>
                <CardTitle>Important Disclaimer</CardTitle>
                <CardDescription>
                  Please read carefully before using our calculator
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
                  <h3 className="text-warning font-semibold mb-2">⚠️ Estimates Only</h3>
                  <p className="text-sm mb-0">
                    All calculations provided are estimates based on general industry data and 
                    your inputs. Actual costs may vary significantly.
                  </p>
                </div>

                <h3>No Guarantee of Accuracy</h3>
                <p>
                  While we strive to provide accurate estimates, we make no warranties about 
                  the completeness, reliability, or accuracy of the calculations. Results should 
                  not be the sole basis for financial decisions.
                </p>

                <h3>Professional Consultation Recommended</h3>
                <p>
                  Before making significant financial commitments, consult with qualified 
                  professionals including:
                </p>
                <ul>
                  <li>Certified Public Accountants (CPAs)</li>
                  <li>Business attorneys</li>
                  <li>Commercial real estate professionals</li>
                  <li>Construction contractors and architects</li>
                  <li>Sports facility consultants</li>
                </ul>

                <h3>Regional Variations</h3>
                <p>
                  Costs vary significantly by geographic location, local regulations, 
                  market conditions, and other factors not fully captured in our calculator.
                </p>

                <h3>Market Conditions</h3>
                <p>
                  Economic conditions, material costs, labor availability, and other factors 
                  change frequently and may impact actual project costs.
                </p>

                <h3>Limitation of Liability</h3>
                <p>
                  PracticeSports and its affiliates shall not be liable for any direct, 
                  indirect, incidental, or consequential damages arising from the use of 
                  our calculator or reliance on its results.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Legal;