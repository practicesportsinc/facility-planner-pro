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
    if (!project?.responses?.find((r: any) => r.questionId === 'project_name')?.value) missing.push("project name");
    if (!project?.responses?.find((r: any) => r.questionId === 'location')?.value) missing.push("location");
    
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

      if (!data?.pdfBuffer) {
        throw new Error('No PDF data received');
      }

      // Convert base64 to blob and download
      const binaryString = atob(data.pdfBuffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const projectName = project?.responses?.find((r: any) => r.questionId === 'project_name')?.value || 'SportsFacility';
      const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `${sanitizedName}_BusinessPlan_${Date.now()}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Business plan downloaded successfully!");
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