import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BuildingConfig, BuildingEstimate, calculateBuildingEstimate, DEFAULT_BUILDING_CONFIG } from "@/utils/buildingCalculator";
import { generateBuildingEstimatePDF } from "@/utils/buildingEstimatePdf";
import { DimensionsStep } from "./steps/DimensionsStep";
import { DoorsStep } from "./steps/DoorsStep";
import { FinishLevelStep } from "./steps/FinishLevelStep";
import { SiteOptionsStep } from "./steps/SiteOptionsStep";
import { BuildingEstimateStep } from "./steps/BuildingEstimateStep";
import { Progress } from "@/components/ui/progress";
import LeadGate from "@/components/shared/LeadGate";
import { supabase } from "@/integrations/supabase/client";

type WizardStep = 'dimensions' | 'doors' | 'finish' | 'site' | 'estimate';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'doors', label: 'Doors' },
  { id: 'finish', label: 'Finish' },
  { id: 'site', label: 'Site' },
  { id: 'estimate', label: 'Estimate' },
];

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  wantsOutreach?: boolean;
}

export function BuildingConfigWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>('dimensions');
  const [config, setConfig] = useState<BuildingConfig>(DEFAULT_BUILDING_CONFIG);
  const [leadGateOpen, setLeadGateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [capturedLead, setCapturedLead] = useState<LeadData | null>(null);
  
  const currentStepIndex = STEPS.findIndex(s => s.id === step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  
  const updateConfig = (updates: Partial<BuildingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };
  
  const estimate: BuildingEstimate = calculateBuildingEstimate(config);
  
  const handleDownload = async () => {
    if (capturedLead) {
      // Lead already captured, generate PDF directly
      await generateBuildingEstimatePDF(config, estimate, capturedLead);
      toast.success("Your building estimate PDF has been downloaded!");
    } else {
      // Fallback - shouldn't happen since estimate is gated
      setLeadGateOpen(true);
    }
  };
  
  const handleViewEstimate = () => {
    if (leadCaptured) {
      setStep('estimate');
    } else {
      setLeadGateOpen(true);
    }
  };

  const handleLeadSubmit = async (leadData: LeadData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare building summary for source_detail
      const buildingSummary = `${config.width}x${config.length}-${config.eaveHeight}ft-${config.finishLevel}`;
      
      // Prepare payload for Google Sheets
      const sheetPayload = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || '',
        city: leadData.city || '',
        state: leadData.state || '',
        source: 'building-estimate',
        source_detail: buildingSummary,
        estimatedSquareFootage: estimate.grossSF,
        estimatedBudget: estimate.total,
        referrer: document.referrer || window.location.href,
        userAgent: navigator.userAgent,
      };

      // Sync to Google Sheets
      console.log('[BuildingWizard] Syncing lead to Google Sheets:', { email: leadData.email, source: 'building-estimate' });
      const { error: sheetError } = await supabase.functions.invoke('sync-lead-to-sheets', {
        body: sheetPayload
      });
      
      if (sheetError) {
        console.error('[BuildingWizard] Google Sheets sync error:', sheetError);
      }

      // Build location string
      const locationParts = [leadData.city, leadData.state].filter(Boolean);
      const locationString = locationParts.join(', ');

      // Group line items by category for the email
      const buildingLineItems = [
        {
          category: 'Building Structure',
          items: estimate.items
            .filter(item => item.category === 'structure')
            .map(item => ({
              name: item.name,
              quantity: 1,
              unitCost: item.total,
              totalCost: item.total,
            })),
          subtotal: estimate.subtotals.structure,
        },
        {
          category: 'Doors & Access',
          items: estimate.items
            .filter(item => item.category === 'doors')
            .map(item => ({
              name: item.name,
              quantity: item.quantity || 1,
              unitCost: item.unitCost || item.total,
              totalCost: item.total,
            })),
          subtotal: estimate.subtotals.doors,
        },
        {
          category: 'Systems (HVAC, Electrical, Plumbing)',
          items: estimate.items
            .filter(item => item.category === 'systems')
            .map(item => ({
              name: item.name,
              quantity: 1,
              unitCost: item.total,
              totalCost: item.total,
            })),
          subtotal: estimate.subtotals.systems,
        },
        {
          category: 'Site Work',
          items: estimate.items
            .filter(item => item.category === 'site_work')
            .map(item => ({
              name: item.name,
              quantity: 1,
              unitCost: item.total,
              totalCost: item.total,
            })),
          subtotal: estimate.subtotals.siteWork,
        },
      ].filter(cat => cat.items.length > 0); // Only include categories with items

      // Send confirmation emails
      console.log('[BuildingWizard] Sending confirmation emails');
      const { error: emailError } = await supabase.functions.invoke('send-lead-emails', {
        body: {
          customerEmail: leadData.email,
          customerName: leadData.name,
          leadData: {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || '',
            city: leadData.city || '',
            state: leadData.state || '',
            wantsOutreach: leadData.wantsOutreach || false,
          },
          facilityDetails: {
            sport: config.sports.length > 0 ? config.sports.join(', ') : 'Multi-Sport',
            size: `${estimate.grossSF.toLocaleString()} SF (${config.width}' x ${config.length}')`,
            location: locationString || undefined,
            projectType: 'Metal Building Estimate',
            buildMode: 'build',
          },
          estimates: {
            totalInvestment: estimate.total,
          },
          // Building line items (uses same format as equipment)
          buildingLineItems,
          buildingTotals: {
            subtotal: estimate.subtotals.structure + estimate.subtotals.doors + estimate.subtotals.systems + estimate.subtotals.siteWork,
            softCosts: estimate.softCosts,
            contingency: estimate.contingency,
            grandTotal: estimate.total,
          },
          source: 'building-estimate',
        }
      });

      if (emailError) {
        console.error('[BuildingWizard] Email send error:', emailError);
      }

      // Save lead data for future PDF downloads
      setCapturedLead(leadData);
      setLeadCaptured(true);
      
      // Navigate to estimate step (first time viewing)
      setStep('estimate');
      toast.success("Thank you! Here's your building estimate.");
      setLeadGateOpen(false);
      
    } catch (error) {
      console.error('[BuildingWizard] Lead submission error:', error);
      toast.error("There was an issue processing your request. Your PDF will still download.");
      // Still save lead and show estimate even if sync fails
      setCapturedLead(leadData);
      setLeadCaptured(true);
      setStep('estimate');
      setLeadGateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleContinueToCalculator = () => {
    navigate('/calculator', { 
      state: { 
        buildingData: {
          config,
          estimate,
          lead: capturedLead,
        }
      } 
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                if (i < currentStepIndex) setStep(s.id);
              }}
              className={`text-sm font-medium transition-colors ${
                s.id === step 
                  ? 'text-primary' 
                  : i < currentStepIndex 
                    ? 'text-muted-foreground hover:text-foreground cursor-pointer' 
                    : 'text-muted-foreground/50'
              }`}
              disabled={i > currentStepIndex}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      {step === 'dimensions' && (
        <DimensionsStep 
          config={config}
          updateConfig={updateConfig}
          onNext={() => setStep('doors')}
        />
      )}
      
      {step === 'doors' && (
        <DoorsStep
          config={config}
          updateConfig={updateConfig}
          onNext={() => setStep('finish')}
          onBack={() => setStep('dimensions')}
        />
      )}
      
      {step === 'finish' && (
        <FinishLevelStep
          config={config}
          updateConfig={updateConfig}
          onNext={() => setStep('site')}
          onBack={() => setStep('doors')}
        />
      )}
      
      {step === 'site' && (
        <SiteOptionsStep
          config={config}
          updateConfig={updateConfig}
          onNext={handleViewEstimate}
          onBack={() => setStep('finish')}
        />
      )}
      
      {step === 'estimate' && (
        <BuildingEstimateStep
          config={config}
          estimate={estimate}
          onBack={() => setStep('site')}
          onDownload={handleDownload}
          onContinueToCalculator={handleContinueToCalculator}
        />
      )}

      {/* Lead Gate Modal */}
      <LeadGate
        isOpen={leadGateOpen}
        onClose={() => setLeadGateOpen(false)}
        onSubmit={handleLeadSubmit}
        mode="modal"
        title="View Your Building Estimate"
        description="Enter your details to see the complete itemized construction estimate for your building."
        showOptionalFields={true}
        showMessageField={false}
        showPartnershipField={false}
        showOutreachField={true}
        submitButtonText={isSubmitting ? "Processing..." : "View My Estimate"}
        showCancelButton={true}
        cancelButtonText="Cancel"
      />
    </div>
  );
}
