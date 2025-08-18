import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  async function handleDownload(format: 'html' | 'pdf') {
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
          includeImages,
          format
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate business plan');
      }

      if (!data?.htmlContent) {
        throw new Error('No business plan content received');
      }

      if (format === 'pdf' && data.isPrintFormat) {
        // For PDF format, open in new window with print dialog
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.htmlContent);
          newWindow.document.close();
          toast.success("Business plan opened for PDF generation. Use Ctrl+P or Cmd+P to save as PDF.");
        } else {
          // Fallback: download as HTML if popup blocked
          const blob = new Blob([data.htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `${project?.leadData?.business || 'business'}-plan-print.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
          toast.success("Business plan downloaded with print formatting. Open the file and use Ctrl+P to generate PDF.");
        }
      } else {
        // Handle regular HTML download
        const blob = new Blob([data.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project?.leadData?.business || 'business'}-plan.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        toast.success("Business plan HTML downloaded!");
      }
      
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={busy}
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
          title="Generate comprehensive business plan with AI analysis"
        >
          <Building className="w-5 h-5" />
          {busy ? "Generating…" : "Generate Business Plan"}
          <Download className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload('html')} disabled={busy}>
          <FileText className="w-4 h-4 mr-2" />
          Download as HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('pdf')} disabled={busy}>
          <Download className="w-4 h-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}