import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingDisclaimerProps {
  className?: string;
}

export const PricingDisclaimer = ({ className }: PricingDisclaimerProps) => {
  return (
    <div className={cn(
      "flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200",
      className
    )}>
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <p>
        <strong>Disclaimer:</strong> Pricing displayed is only for budgeting purposes and is not guaranteed. 
        Contact a facility specialist with Practice Sports, Inc. to confirm current pricing.
      </p>
    </div>
  );
};
