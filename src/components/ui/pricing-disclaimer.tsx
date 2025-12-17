import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LeadGate from "@/components/shared/LeadGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingDisclaimerProps {
  className?: string;
  showButton?: boolean;
  buttonLabel?: string;
}

export const PricingDisclaimer = ({ 
  className, 
  showButton = true,
  buttonLabel = "Finalize Best Pricing"
}: PricingDisclaimerProps) => {
  const [showLeadGate, setShowLeadGate] = useState(false);

  const handleLeadSubmit = async (data: { name: string; email: string; phone?: string; city?: string; state?: string }) => {
    try {
      // Save lead to database
      const { error: dbError } = await supabase.from('leads').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        city: data.city || null,
        state: data.state || null,
        source: 'finalize-pricing',
      });

      if (dbError) throw dbError;

      // Sync to Google Sheets
      await supabase.functions.invoke('sync-lead-to-sheets', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          state: data.state,
          source: 'finalize-pricing',
          source_detail: 'pricing-disclaimer-cta',
        }
      });

      // Send confirmation emails
      await supabase.functions.invoke('send-lead-emails', {
        body: {
          leadName: data.name,
          leadEmail: data.email,
          leadPhone: data.phone,
          leadCity: data.city,
          leadState: data.state,
          source: 'finalize-pricing',
        }
      });

      setShowLeadGate(false);
      toast.success("Thank you! A Facility Specialist will contact you shortly to finalize your pricing.");
    } catch (error) {
      console.error('Lead submission error:', error);
      toast.error("Failed to submit. Please try again.");
    }
  };

  return (
    <>
      <div className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200",
        className
      )}>
        <div className="flex items-start gap-2 flex-1">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm">
            Prices are only estimates - contact a Facility Specialist to finalize.
          </p>
        </div>
        {showButton && (
          <Button
            size="sm"
            className="bg-gradient-primary text-white border-0 whitespace-nowrap"
            onClick={() => setShowLeadGate(true)}
          >
            {buttonLabel}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <LeadGate
        isOpen={showLeadGate}
        onClose={() => setShowLeadGate(false)}
        mode="modal"
        title="Finalize Your Pricing"
        description="A Facility Specialist will review your estimates and provide accurate, customized pricing for your project."
        submitButtonText="Get Final Pricing"
        onSubmit={handleLeadSubmit}
        showOptionalFields={true}
        showOutreachField={false}
      />
    </>
  );
};
