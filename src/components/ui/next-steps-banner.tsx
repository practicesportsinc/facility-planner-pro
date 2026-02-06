import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Users, Download, Edit, CheckCircle } from "lucide-react";
import SourcingPlan from "@/components/calculator/steps/SourcingPlan";
import LeadGate from "@/components/shared/LeadGate";
import { toast } from "sonner";
import { dispatchLead } from "@/services/leadDispatch";
import useAnalytics from "@/hooks/useAnalytics";
import { generateResearchKitPDF } from "@/utils/researchKitGenerator";

interface NextStepsBannerProps {
  sourcingData?: {
    outreach_preference?: "supplier_outreach" | "self_research" | "undecided";
    supplier_categories?: string[];
    research_kit_sent?: boolean;
    leadData?: any;
  };
  onSourcingUpdate?: (data: any) => void;
}

export const NextStepsBanner = ({ sourcingData, onSourcingUpdate }: NextStepsBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const { trackExportClicked, trackLeadSubmitted } = useAnalytics();

  if (isDismissed) return null;

  const preference = sourcingData?.outreach_preference || "undecided";

  const handleModalSubmit = (data: any) => {
    onSourcingUpdate?.(data);
    setIsModalOpen(false);
  };

  const handleLeadSubmit = async (leadData: any) => {
    // Dispatch to Make.com
    await dispatchLead({
      firstName: leadData.name.split(' ')[0] || leadData.name,
      lastName: leadData.name.split(' ').slice(1).join(' ') || '',
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      city: leadData.city,
      state: leadData.state,
      source: 'next_steps_research_kit',
    });

    trackLeadSubmitted('next_steps_kit_gated', leadData);
    
    onSourcingUpdate?.({
      ...sourcingData,
      outreach_preference: "self_research",
      research_kit_sent: true,
      leadData
    });
    
    // Generate and download the PDF
    await generateResearchKitPDF({
      supplierCategories: sourcingData?.supplier_categories
    });
    
    toast.success("Research kit downloading...");
    setShowLeadGate(false);
  };

  const handleDownloadKit = async () => {
    // Check if lead data exists
    const hasLeadData = sourcingData?.leadData?.email && sourcingData?.leadData?.name;
    
    if (!hasLeadData) {
      trackExportClicked('next_steps_kit', true);
      setShowLeadGate(true);
      return;
    }

    trackExportClicked('next_steps_kit', false);
    
    // Generate and download the PDF
    await generateResearchKitPDF({
      supplierCategories: sourcingData?.supplier_categories
    });
    
    toast.success("DIY Research Kit downloaded!");
    onSourcingUpdate?.({
      ...sourcingData,
      outreach_preference: "self_research",
      research_kit_sent: true
    });
  };

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {preference === "undecided" && (
          <div className="space-y-4">
            <CardDescription>
              Ready to move forward? Choose how you'd like to handle supplier outreach.
            </CardDescription>
            <div className="flex flex-wrap gap-3">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <Users className="h-4 w-4 mr-2" />
                    Get Supplier Quotes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Supplier Outreach Setup</DialogTitle>
                    <DialogDescription>
                      Configure your supplier outreach preferences
                    </DialogDescription>
                  </DialogHeader>
                  <SourcingPlan
                    data={{ ...sourcingData, outreach_preference: "supplier_outreach" }}
                    onUpdate={handleModalSubmit}
                    onNext={() => setIsModalOpen(false)}
                    onPrevious={() => setIsModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleDownloadKit}>
                <Download className="h-4 w-4 mr-2" />
                Download DIY Research Kit
              </Button>
            </div>
          </div>
        )}

        {preference === "supplier_outreach" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="font-medium">We'll introduce you to suppliers</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <CardDescription>
              Based on your preferences, we'll connect you with vetted suppliers in these categories:
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              {sourcingData?.supplier_categories?.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Categories
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Update Supplier Preferences</DialogTitle>
                  <DialogDescription>
                    Modify your supplier categories and preferences
                  </DialogDescription>
                </DialogHeader>
                <SourcingPlan
                  data={sourcingData}
                  onUpdate={handleModalSubmit}
                  onNext={() => setIsModalOpen(false)}
                  onPrevious={() => setIsModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {preference === "self_research" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="font-medium">DIY Research Kit</span>
              {sourcingData?.research_kit_sent && (
                <Badge variant="secondary">Sent</Badge>
              )}
            </div>
            <CardDescription>
              You've chosen to research suppliers independently. Our toolkit will help you evaluate options effectively.
            </CardDescription>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleDownloadKit}>
                <Download className="h-4 w-4 mr-2" />
                {sourcingData?.research_kit_sent ? "Re-send Kit" : "Download Kit"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <LeadGate
        isOpen={showLeadGate}
        onClose={() => setShowLeadGate(false)}
        onSubmit={handleLeadSubmit}
        title="Unlock Research Kit"
        description="Get your comprehensive DIY supplier research toolkit"
        showOptionalFields={true}
      />
    </Card>
  );
};