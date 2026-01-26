import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LeadGate from "@/components/shared/LeadGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EquipmentLineItem {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface EquipmentCategory {
  category: string;
  items: EquipmentLineItem[];
  subtotal: number;
}

interface EquipmentTotals {
  equipment: number;
  flooring: number;
  installation: number;
  grandTotal: number;
}

interface PricingDisclaimerProps {
  className?: string;
  showButton?: boolean;
  buttonLabel?: string;
  equipmentItems?: EquipmentCategory[];
  equipmentTotals?: EquipmentTotals;
  facilityDetails?: {
    sport?: string;
    size?: string;
  };
}

export const PricingDisclaimer = ({ 
  className, 
  showButton = true,
  buttonLabel = "Finalize Best Pricing",
  equipmentItems,
  equipmentTotals,
  facilityDetails,
}: PricingDisclaimerProps) => {
  const [showLeadGate, setShowLeadGate] = useState(false);

  const handleLeadSubmit = async (data: { name: string; email: string; phone?: string; city?: string; state?: string }) => {
    try {
      // Save lead to database with equipment summary
      const { error: dbError } = await supabase.from('leads').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        city: data.city || null,
        state: data.state || null,
        source: 'finalize-pricing',
        facility_type: facilityDetails?.sport || null,
        facility_size: facilityDetails?.size || null,
        estimated_budget: equipmentTotals?.grandTotal || null,
      });

      if (dbError) throw dbError;

      // Sync to Google Sheets with equipment details
      await supabase.functions.invoke('sync-lead-to-sheets', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          state: data.state,
          source: 'finalize-pricing',
          source_detail: 'pricing-disclaimer-cta',
          facilityType: facilityDetails?.sport,
          facilitySize: facilityDetails?.size,
          estimatedBudget: equipmentTotals?.grandTotal,
          equipmentItems: equipmentItems,
          equipmentTotals: equipmentTotals,
        }
      });

      // Send confirmation emails WITH equipment data
      await supabase.functions.invoke('send-lead-emails', {
        body: {
          customerEmail: data.email,
          customerName: data.name,
          leadData: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            state: data.state,
          },
          facilityDetails: facilityDetails,
          equipmentItems: equipmentItems,
          equipmentTotals: equipmentTotals,
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
