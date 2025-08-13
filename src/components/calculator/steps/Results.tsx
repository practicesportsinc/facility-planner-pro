import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Mail, Calendar, TrendingUp, DollarSign, Target, Clock } from "lucide-react";

interface ResultsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

const Results = ({ data, onUpdate, onNext, onPrevious, allData }: ResultsProps) => {
  const [emailSent, setEmailSent] = useState(false);

  // Extract data from previous steps
  const projectData = allData[1] || {};
  const facilityData = allData[2] || {};
  const equipmentData = allData[3] || {};
  const leadData = allData[9] || {};

  // Calculate key metrics (simplified for demo)
  const totalCapEx = 1750000; // From site + equipment costs
  const monthlyOpEx = 35000; // From operating costs step
  const monthlyRevenue = 48000; // From revenue step
  const monthlyDebtService = 12500; // From financing step

  const monthlyNetCashFlow = monthlyRevenue - monthlyOpEx - monthlyDebtService;
  const annualNetCashFlow = monthlyNetCashFlow * 12;
  const simpleROI = (annualNetCashFlow / totalCapEx) * 100;
  const paybackPeriod = totalCapEx / annualNetCashFlow;
  const breakEvenMonth = monthlyOpEx / (monthlyRevenue - monthlyOpEx);

  const handleEmailReport = () => {
    // Here we would send the report via email
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const handleScheduleConsultation = () => {
    // Here we would open scheduling system
    window.open('https://calendly.com/practicesports', '_blank');
  };

  const summaryData = {
    totalInvestment: totalCapEx,
    monthlyRevenue: monthlyRevenue,
    monthlyExpenses: monthlyOpEx + monthlyDebtService,
    monthlyCashFlow: monthlyNetCashFlow,
    annualCashFlow: annualNetCashFlow,
    roi: simpleROI,
    paybackYears: paybackPeriod,
    breakEvenMonths: breakEvenMonth,
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Facility Analysis Results</h2>
        <p className="text-muted-foreground">
          Comprehensive financial projections for {projectData.projectName || 'your sports facility'}
        </p>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">${summaryData.totalInvestment.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cash Flow</p>
                <p className={`text-2xl font-bold ${summaryData.monthlyCashFlow > 0 ? 'text-success' : 'text-destructive'}`}>
                  ${summaryData.monthlyCashFlow.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annual ROI</p>
                <p className={`text-2xl font-bold ${summaryData.roi > 10 ? 'text-success' : summaryData.roi > 5 ? 'text-warning' : 'text-destructive'}`}>
                  {summaryData.roi.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payback Period</p>
                <p className="text-2xl font-bold">{summaryData.paybackYears.toFixed(1)} years</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="financial">Financial Details</TabsTrigger>
          <TabsTrigger value="timeline">Project Timeline</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Project Name:</span>
                    <span className="text-sm font-medium">{projectData.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm font-medium">{projectData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sports:</span>
                    <span className="text-sm font-medium">{projectData.selectedSports?.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Facility Type:</span>
                    <span className="text-sm font-medium capitalize">{facilityData.facilityType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Square Footage:</span>
                    <span className="text-sm font-medium">
                      {(facilityData.totalSquareFootage || 25000).toLocaleString()} sq ft
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Investment Required:</span>
                    <span className="text-sm font-bold">${summaryData.totalInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projected Monthly Revenue:</span>
                    <span className="text-sm font-medium">${summaryData.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Operating Expenses:</span>
                    <span className="text-sm font-medium">${summaryData.monthlyExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground">Net Monthly Cash Flow:</span>
                    <span className={`text-sm font-bold ${summaryData.monthlyCashFlow > 0 ? 'text-success' : 'text-destructive'}`}>
                      ${summaryData.monthlyCashFlow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Break-even:</span>
                    <span className="text-sm font-medium">{summaryData.breakEvenMonths.toFixed(0)} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Investment Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success mb-1">
                    {summaryData.roi > 15 ? 'Strong' : summaryData.roi > 10 ? 'Good' : 'Moderate'}
                  </div>
                  <div className="text-sm text-muted-foreground">ROI Potential</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    ${(summaryData.annualCashFlow / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Annual Cash Flow</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {summaryData.paybackYears < 5 ? 'Fast' : summaryData.paybackYears < 8 ? 'Moderate' : 'Long-term'}
                  </div>
                  <div className="text-sm text-muted-foreground">Payback Timeline</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Memberships</span>
                    <span className="font-medium">$18,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Court/Field Rentals</span>
                    <span className="font-medium">$12,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lessons & Training</span>
                    <span className="font-medium">$8,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Camps & Clinics</span>
                    <span className="font-medium">$4,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Events & Parties</span>
                    <span className="font-medium">$2,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retail & Concessions</span>
                    <span className="font-medium">$1,200</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Monthly Revenue</span>
                    <span>${summaryData.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Staffing</span>
                    <span className="font-medium">$18,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities</span>
                    <span className="font-medium">$4,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span className="font-medium">$2,900</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing</span>
                    <span className="font-medium">$3,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance & Supplies</span>
                    <span className="font-medium">$2,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Operating</span>
                    <span className="font-medium">$4,000</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Debt Service</span>
                    <span className="font-medium">$12,500</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Monthly Expenses</span>
                    <span>${summaryData.monthlyExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Estimated phases from start to grand opening</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { phase: 'Planning & Design', duration: '2-4 months', description: 'Architectural plans, permits, financing' },
                  { phase: 'Site Preparation', duration: '1-2 months', description: 'Site work, utilities, foundation' },
                  { phase: 'Construction', duration: '4-8 months', description: 'Building construction and build-out' },
                  { phase: 'Equipment Installation', duration: '2-3 weeks', description: 'Sports equipment and technology setup' },
                  { phase: 'Pre-Opening', duration: '4-6 weeks', description: 'Staff hiring, marketing, soft opening' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{item.phase}</h3>
                        <span className="text-sm text-muted-foreground">{item.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h3 className="font-medium text-success mb-2">💰 Financial Strengths</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Strong projected ROI of {summaryData.roi.toFixed(1)}%</li>
                      <li>• Positive monthly cash flow from month 1</li>
                      <li>• Conservative membership projections leave room for upside</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h3 className="font-medium text-warning mb-2">⚠️ Areas to Consider</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Consider additional revenue streams (birthday parties, corporate events)</li>
                      <li>• Plan for seasonal variations in membership and usage</li>
                      <li>• Budget for first-year marketing to build membership base</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <h3 className="font-medium text-info mb-2">📈 Growth Opportunities</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Expand lesson programs during off-peak hours</li>
                      <li>• Develop tournament hosting capabilities</li>
                      <li>• Consider adding fitness/training programs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Get your detailed report and connect with our facility experts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="hero" 
              onClick={handleEmailReport}
              disabled={emailSent}
            >
              <Mail className="h-4 w-4 mr-2" />
              {emailSent ? 'Report Sent!' : 'Email Full Report'}
            </Button>

            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Print/Save PDF
            </Button>

            <Button variant="success" onClick={handleScheduleConsultation}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="hero" onClick={() => window.location.href = '/'}>
          Start New Calculation
        </Button>
      </div>
    </div>
  );
};

export default Results;