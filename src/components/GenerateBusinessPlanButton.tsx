import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  /** Return the current project JSON (from localStorage, wizard data, etc.) */
  getProject: () => any;
  /** Optional: control whether to include an AI cover illustration */
  includeImages?: boolean;
  /** Pass your button classes so it matches the UI */
  className?: string;
  /** Optional: called when download starts / ends */
  onStart?: () => void;
  onDone?: (ok: boolean) => void;
  /** Button variant */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
};

export default function GenerateBusinessPlanButton({
  getProject,
  includeImages = true,
  className = "",
  variant = "outline",
  size = "lg",
  onStart,
  onDone,
}: Props) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    const project = getProject();
    
    // Basic sanity checks
    const missing = [];
    if (!project?.financialMetrics?.space?.grossSF) missing.push("facility size");
    if (!project?.leadData?.business) missing.push("business name");
    if (!project?.leadData?.name) missing.push("project name");
    
    if (missing.length) {
      toast.error(`Please complete ${missing.join(", ")} before generating the business plan.`);
      return;
    }

    setBusy(true);
    onStart?.();
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: { 
          project, 
          includeImages 
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate business plan');
      }

      if (!data?.htmlContent) {
        throw new Error('No business plan content received');
      }

      // Open the business plan in a new window
      const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      if (newWindow) {
        newWindow.document.write(data.htmlContent);
        newWindow.document.close();
        newWindow.focus();
      } else {
        throw new Error('Unable to open new window. Please check your popup blocker settings.');
      }
      
      toast.success("Business plan opened in new window!");
      onDone?.(true);
    } catch (e: any) {
      console.error('Business plan generation error:', e);
      toast.error(`Could not generate business plan: ${e.message || e}`);
      onDone?.(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={busy}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      title="Create a comprehensive business plan PDF"
    >
      <Building className="w-5 h-5" />
      {busy ? "Generating…" : "Generate Business Plan"}
    </Button>
  );
}