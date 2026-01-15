import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, DollarSign, TrendingUp, Calendar, ArrowRight, Building, MapPin, Edit3, Download, Printer } from "lucide-react";
import { ValuePill } from "@/components/ui/value-pill";
import { generateProjectId, saveProjectState } from "@/utils/projectState";
import useAnalytics from "@/hooks/useAnalytics";
import { COST_LIBRARY, getCostByTier, calculateItemTotal, type CostItem } from "@/data/costLibrary";
import LeadGate from "@/components/shared/LeadGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PricingDisclaimer } from "@/components/ui/pricing-disclaimer";

// Quick estimate types
type SizeKey = "small" | "small_plus" | "medium" | "large" | "giant" | "arena";
type SportKey = 
  | "baseball_softball"
  | "basketball" 
  | "volleyball"
  | "pickleball"
  | "soccer"
  | "football"
  | "lacrosse"
  | "tennis"
  | "multi_sport"
  | "fitness";

interface QuickEstimate {
  sport: SportKey;
  size: SizeKey;
  location: string;
  budget?: string;
}

interface EstimateResults {
  grossSF: number;
  capexTotal: number;
  opexMonthly: number;
  revenueMonthly: number;
  ebitdaMonthly: number;
  breakEvenMonths: number | null;
}

// Pre-populated sports data with realistic averages
const SPORTS_DATA: Record<SportKey, { label: string; avgRevenue: number; avgCapex: number; icon: string }> = {
  baseball_softball: { label: "Baseball/Softball", avgRevenue: 28000, avgCapex: 185000, icon: "⚾" },
  basketball: { label: "Basketball", avgRevenue: 35000, avgCapex: 220000, icon: "🏀" },
  volleyball: { label: "Volleyball", avgRevenue: 22000, avgCapex: 165000, icon: "🏐" },
  pickleball: { label: "Pickleball", avgRevenue: 18000, avgCapex: 145000, icon: "🏓" },
  soccer: { label: "Soccer", avgRevenue: 32000, avgCapex: 195000, icon: "⚽" },
  football: { label: "Football", avgRevenue: 38000, avgCapex: 240000, icon: "🏈" },
  lacrosse: { label: "Lacrosse", avgRevenue: 26000, avgCapex: 175000, icon: "🥍" },
  tennis: { label: "Tennis", avgRevenue: 24000, avgCapex: 185000, icon: "🎾" },
  multi_sport: { label: "Multi-Sport", avgRevenue: 42000, avgCapex: 280000, icon: "🏟️" },
  fitness: { label: "Fitness/Training", avgRevenue: 35000, avgCapex: 195000, icon: "💪" }
};

const SIZE_DATA: Record<SizeKey, { label: string; sqft: string; multiplier: number }> = {
  small: { label: "Small", sqft: "2K-5K SF", multiplier: 0.7 },
  small_plus: { label: "Small+", sqft: "5K-8K SF", multiplier: 0.85 },
  medium: { label: "Medium", sqft: "8K-15K SF", multiplier: 1.0 },
  large: { label: "Large", sqft: "15K-25K SF", multiplier: 1.4 },
  giant: { label: "Giant", sqft: "25K-40K SF", multiplier: 1.8 },
  arena: { label: "Arena", sqft: "40K+ SF", multiplier: 2.5 }
};

const LOCATION_MULTIPLIERS: Record<string, number> = {
  "low": 0.8,
  "average": 1.0,
  "high": 1.2,
  "premium": 1.4
};

interface QuickEstimateFlowProps {
  onClose: () => void;
}

export const QuickEstimateFlow = ({ onClose }: QuickEstimateFlowProps) => {
  const navigate = useNavigate();
  const { track } = useAnalytics();
  
  const [step, setStep] = useState(1);
  const [estimate, setEstimate] = useState<QuickEstimate>({
    sport: "basketball",
    size: "medium", 
    location: "average"
  });
  const [customizing, setCustomizing] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [leadGateMode, setLeadGateMode] = useState<'pdf' | 'analysis'>('pdf');

  // Calculate quick estimate results
  const results = useMemo((): EstimateResults => {
    const sportData = SPORTS_DATA[estimate.sport];
    const sizeData = SIZE_DATA[estimate.size];
    const locationMultiplier = LOCATION_MULTIPLIERS[estimate.location] || 1.0;
    
    const grossSF = Math.round(8000 * sizeData.multiplier);
    const capexTotal = Math.round(sportData.avgCapex * sizeData.multiplier * locationMultiplier);
    const revenueMonthly = Math.round(sportData.avgRevenue * sizeData.multiplier * locationMultiplier);
    const opexMonthly = Math.round(revenueMonthly * 0.65); // Typical 65% OpEx ratio
    const ebitdaMonthly = revenueMonthly - opexMonthly;
    const breakEvenMonths = ebitdaMonthly > 0 ? Math.ceil(capexTotal / Math.max(ebitdaMonthly, 1)) : null;

    return {
      grossSF,
      capexTotal,
      opexMonthly,
      revenueMonthly,
      ebitdaMonthly,
      breakEvenMonths
    };
  }, [estimate]);

  // Calculate equipment package
  const equipmentPackage = useMemo(() => {
    return getEquipmentPackage(estimate.sport, estimate.size, estimate.location);
  }, [estimate]);

  const handleQuickStart = () => {
    console.log('🚀 [handleQuickStart] User clicked "View Detailed Analysis"');
    track('quick_start_clicked', estimate);
    
    // Show lead gate for "View Detailed Analysis" path
    setLeadGateMode('analysis');
    setShowLeadGate(true);
  };

  const handleAnalysisWithLead = async (leadData: any) => {
    console.log('📊 [handleAnalysisWithLead] Processing lead for detailed analysis', leadData);
    
    const projectId = generateProjectId('quick');
    track('lead_captured_analysis', { ...leadData, estimate });
    track('equipment_package_viewed', { sport: estimate.sport, equipmentTotal: equipmentPackage.total });
    
    // Dispatch lead to backend (saves to DB + syncs to Google Sheets)
    const syncResult = await dispatchLeadData(leadData, projectId, 'analysis');
    
    // Send lead emails (annotate with sync status) with itemized equipment breakdown
    try {
      console.log('📧 [handleAnalysisWithLead] Sending lead emails...');
      const roi = results.ebitdaMonthly > 0 ? ((results.ebitdaMonthly * 12) / results.capexTotal * 100) : 0;
      
      // Format equipment package for email
      const formattedEquipmentItems = equipmentPackage.items.length > 0 ? [{
        category: 'Equipment Package',
        items: equipmentPackage.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.total,
        })),
        subtotal: equipmentPackage.total,
      }] : undefined;
      
      const equipmentTotals = equipmentPackage.total > 0 ? {
        equipment: equipmentPackage.total,
        flooring: 0,
        installation: Math.round(equipmentPackage.total * 0.15),
        grandTotal: equipmentPackage.total + Math.round(equipmentPackage.total * 0.15),
      } : undefined;
      
      await supabase.functions.invoke('send-lead-emails', {
        body: {
          customerEmail: leadData.email,
          customerName: leadData.name,
          leadData: {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            city: leadData.city,
            state: leadData.state,
            location: leadData.location,
            allowOutreach: leadData.allowOutreach,
          },
          facilityDetails: {
            sport: SPORTS_DATA[estimate.sport].label,
            projectType: `${SPORTS_DATA[estimate.sport].label} Facility`,
            size: `${results.grossSF} sq ft`,
          },
          estimates: {
            totalInvestment: results.capexTotal,
            monthlyRevenue: results.revenueMonthly,
            annualRevenue: results.revenueMonthly * 12,
            roi: roi,
            breakEven: results.breakEvenMonths,
          },
          equipmentItems: formattedEquipmentItems,
          equipmentTotals: equipmentTotals,
          source: 'quick-estimate',
          syncFailed: !syncResult.success,
          syncError: syncResult.error,
        },
      });
      console.log('✅ [handleAnalysisWithLead] Lead emails sent successfully');
    } catch (error) {
      console.error('❌ [handleAnalysisWithLead] Error sending lead emails:', error);
    }
    
    // Save project data with lead info
    const projectData = {
      mode: 'quick' as const,
      scenario_name: `Quick ${SPORTS_DATA[estimate.sport].label} Estimate`,
      location_city: estimate.location === "premium" ? "San Francisco" : 
                    estimate.location === "high" ? "Denver" : 
                    estimate.location === "low" ? "Phoenix" : "Atlanta",
      location_state_province: estimate.location === "premium" ? "CA" : 
                              estimate.location === "high" ? "CO" : 
                              estimate.location === "low" ? "AZ" : "GA",
      currency: "USD",
      selectedSports: [estimate.sport],
      facility_plan: {
        build_mode: "lease",
        clear_height_ft: 22,
        total_sqft: results.grossSF,
        admin_pct_addon: 12,
        circulation_pct_addon: 20,
        court_or_cage_counts: getCourtCounts(estimate.sport, estimate.size)
      },
      opex_inputs: getOpexDefaults(estimate.size),
      revenue_programs: getRevenueDefaults(estimate.sport, estimate.size),
      financing: getFinancingDefaults(),
      estimates: results,
      equipmentPackage: {
        ...equipmentPackage,
        installationEstimate: Math.round(equipmentPackage.total * 1.0),
        totalWithInstall: equipmentPackage.total + Math.round(equipmentPackage.total * 1.0)
      }
    };

    // Add lead data to project state
    (projectData as any).lead = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      city: leadData.city,
      state: leadData.state,
      outreach: leadData.outreach,
      captured_at: new Date().toISOString()
    };
    
    console.log('💾 [handleAnalysisWithLead] Saving project data:', projectData);
    saveProjectState(projectId, projectData);
    track('quick_estimate_completed', { estimate, results });
    
    // Close the dialog before navigating
    onClose();
    
    console.log('🧭 [handleAnalysisWithLead] Navigating to Calculator');
    navigate(`/calculator?projectId=${projectId}&mode=quick`);
  };

  // Reusable function to dispatch lead data with inline sync and retry
  const dispatchLeadData = async (leadData: any, projectId: string, sourceDetail: 'pdf' | 'analysis') => {
    console.log(`📋 [dispatchLeadData/${sourceDetail}] Starting lead dispatch...`, {
      name: leadData.name,
      email: leadData.email,
      source: 'quick-estimate',
      sourceDetail
    });
    
    // Prepare payload for sync-lead-to-sheets
    const payload = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      business: SPORTS_DATA[estimate.sport].label,
      city: leadData.city,
      state: leadData.state,
      facilityType: SPORTS_DATA[estimate.sport].label,
      facilitySize: SIZE_DATA[estimate.size].label,
      sports: SPORTS_DATA[estimate.sport].label,
      estimatedSquareFootage: results.grossSF,
      estimatedBudget: results.capexTotal,
      estimatedMonthlyRevenue: results.revenueMonthly,
      estimatedROI: results.ebitdaMonthly > 0 ? ((results.ebitdaMonthly * 12) / results.capexTotal * 100) : 0,
      breakEvenMonths: results.breakEvenMonths || undefined,
      monthlyOpex: results.opexMonthly,
      source: 'quick-estimate',
      source_detail: `quick-estimate/${sourceDetail}`,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      reportData: {
        selectedSports: [estimate.sport],
        businessModel: SPORTS_DATA[estimate.sport].label,
        locationType: estimate.location,
        financialMetrics: {
          capexTotal: results.capexTotal,
          revenueMonthly: results.revenueMonthly,
          opexMonthly: results.opexMonthly,
          ebitdaMonthly: results.ebitdaMonthly,
          breakEvenMonths: results.breakEvenMonths,
          grossSF: results.grossSF
        },
        wizardResponses: {
          sport: estimate.sport,
          size: estimate.size,
          location: estimate.location,
          budget: estimate.budget
        },
        recommendations: {}
      }
    };
    
    console.log(`📤 [dispatchLeadData/${sourceDetail}] Invoking sync-lead-to-sheets with payload:`, {
      email: payload.email,
      facilityType: payload.facilityType,
      facilitySize: payload.facilitySize,
      estimatedBudget: payload.estimatedBudget,
      source_detail: payload.source_detail
    });
    
    let lastError: any = null;
    
    // Try twice: initial attempt + 1 retry
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('sync-lead-to-sheets', {
          body: payload
        });
        
        if (error) {
          lastError = error;
          console.error(`❌ [dispatchLeadData/${sourceDetail}] Attempt ${attempt}/2 failed with error:`, error);
          
          if (attempt < 2) {
            console.log(`🔄 [dispatchLeadData/${sourceDetail}] Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        } else {
          console.log(`✅ [dispatchLeadData/${sourceDetail}] Success on attempt ${attempt}! Result:`, data);
          toast({
            title: "Lead Saved!",
            description: "Your estimate has been saved and synced to our system.",
          });
          return { success: true, leadId: data?.leadId, error: null };
        }
      } catch (exception: any) {
        lastError = exception;
        console.error(`💥 [dispatchLeadData/${sourceDetail}] Attempt ${attempt}/2 threw exception:`, exception);
        
        if (attempt < 2) {
          console.log(`🔄 [dispatchLeadData/${sourceDetail}] Retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }
    
    // Both attempts failed
    const errorMessage = lastError?.message || lastError?.toString() || 'Failed to sync lead to Google Sheets';
    console.error(`❌ [dispatchLeadData/${sourceDetail}] All attempts exhausted. Final error:`, errorMessage);
    
    toast({
      title: "Lead Sync Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { success: false, leadId: null, error: errorMessage };
  };

  const handlePdfDownload = () => {
    console.log('📥 [handlePdfDownload] User clicked "Download / Print PDF"');
    track('pdf_download_clicked', estimate);
    setLeadGateMode('pdf');
    setShowLeadGate(true);
  };

  const handleLeadSubmit = async (leadData: any) => {
    console.log('📄 [handleLeadSubmit] Processing lead for PDF generation', leadData);
    
    const projectId = generateProjectId('quick');
    track('lead_captured_pdf', { ...leadData, estimate });
    
    // Dispatch lead to backend (saves to DB + syncs to Google Sheets)
    const syncResult = await dispatchLeadData(leadData, projectId, 'pdf');
    
    // Send lead emails (annotate with sync status) with itemized equipment breakdown
    try {
      const roi = results.ebitdaMonthly > 0 ? ((results.ebitdaMonthly * 12) / results.capexTotal * 100) : 0;
      
      // Format equipment package for email
      const formattedEquipmentItems = equipmentPackage.items.length > 0 ? [{
        category: 'Equipment Package',
        items: equipmentPackage.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.total,
        })),
        subtotal: equipmentPackage.total,
      }] : undefined;
      
      const equipmentTotals = equipmentPackage.total > 0 ? {
        equipment: equipmentPackage.total,
        flooring: 0,
        installation: Math.round(equipmentPackage.total * 0.15),
        grandTotal: equipmentPackage.total + Math.round(equipmentPackage.total * 0.15),
      } : undefined;
      
      await supabase.functions.invoke('send-lead-emails', {
        body: {
          customerEmail: leadData.email,
          customerName: leadData.name,
          leadData: {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            city: leadData.city,
            state: leadData.state,
            location: leadData.location,
            allowOutreach: leadData.allowOutreach,
          },
          facilityDetails: {
            sport: SPORTS_DATA[estimate.sport].label,
            projectType: `${SPORTS_DATA[estimate.sport].label} Facility`,
            size: `${results.grossSF} sq ft`,
          },
          estimates: {
            totalInvestment: results.capexTotal,
            monthlyRevenue: results.revenueMonthly,
            annualRevenue: results.revenueMonthly * 12,
            roi: roi,
            breakEven: results.breakEvenMonths,
          },
          equipmentItems: formattedEquipmentItems,
          equipmentTotals: equipmentTotals,
          source: 'quick-estimate',
          syncFailed: !syncResult.success,
          syncError: syncResult.error,
        },
      });
      console.log('✅ [handleLeadSubmit] Lead emails sent successfully');
    } catch (error) {
      console.error('❌ [handleLeadSubmit] Error sending lead emails:', error);
    }
    
    // Save lead data to project state
    saveProjectState(projectId, {
      mode: 'quick',
      lead: {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        city: leadData.city,
        state: leadData.state,
        outreach: leadData.outreach,
        captured_at: new Date().toISOString()
      }
    });
    
    console.log('🖨️ [handleLeadSubmit] Generating PDF report');
    generatePdfReport();
  };
  const generatePdfReport = () => {
    // Create a simple HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${SPORTS_DATA[estimate.sport].label} Facility Estimate</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .metrics { display: flex; justify-content: space-between; margin: 30px 0; }
          .metric { text-align: center; flex: 1; }
          .metric h3 { margin: 0; font-size: 24px; color: #333; }
          .metric p { margin: 5px 0 0 0; color: #666; }
          .financial { margin: 30px 0; }
          .financial table { width: 100%; border-collapse: collapse; }
          .financial th, .financial td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .equipment { margin: 30px 0; }
          .equipment-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${SPORTS_DATA[estimate.sport].icon} ${SPORTS_DATA[estimate.sport].label} Facility Estimate</h1>
          <p>Facility Size: ${SIZE_DATA[estimate.size].label} (${SIZE_DATA[estimate.size].sqft})</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="metrics">
          <div class="metric">
            <h3>${results.grossSF.toLocaleString()}</h3>
            <p>Square Feet</p>
          </div>
          <div class="metric">
            <h3>$${(results.capexTotal/1000).toFixed(0)}K</h3>
            <p>Initial Investment</p>
          </div>
          <div class="metric">
            <h3>$${(results.revenueMonthly/1000).toFixed(0)}K</h3>
            <p>Monthly Revenue</p>
          </div>
          <div class="metric">
            <h3>${results.breakEvenMonths ? `${results.breakEvenMonths}mo` : 'N/A'}</h3>
            <p>Break Even</p>
          </div>
        </div>
        
        <div class="financial">
          <h2>Monthly Financial Overview</h2>
          <table>
            <tr><td>Gross Revenue</td><td>$${results.revenueMonthly.toLocaleString()}</td></tr>
            <tr><td>Operating Expenses</td><td>-$${results.opexMonthly.toLocaleString()}</td></tr>
            <tr style="font-weight: bold; border-top: 2px solid #333;"><td>Net Operating Income</td><td>$${results.ebitdaMonthly.toLocaleString()}</td></tr>
          </table>
        </div>
        
        ${equipmentPackage.items.length > 0 ? `
        <div class="equipment">
          <h2>Equipment Package</h2>
          ${equipmentPackage.items.map(item => `
            <div class="equipment-item">
              <span>${item.name} (${item.quantity} ${item.unit})</span>
              <span>$${item.total.toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="equipment-item" style="font-weight: bold; border-top: 2px solid #333; margin-top: 10px;">
            <span>Total Equipment + Installation</span>
            <span>$${(equipmentPackage.total + Math.round(equipmentPackage.total * 1.0)).toLocaleString()}</span>
          </div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>This estimate uses industry averages. For detailed projections, visit SportsFacility.ai</p>
        </div>
      </body>
      </html>
    `;
    
    // Create a new window and write the HTML content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <Zap className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">Quick Facility Estimate</CardTitle>
          </div>
          <p className="text-muted-foreground">Get instant financial projections in under 30 seconds</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Sport Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Primary Sport</Label>
              <span className="text-sm text-muted-foreground">(Showing potential monthly revenue)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(SPORTS_DATA).map(([key, data]) => (
                <Button
                  key={key}
                  variant={estimate.sport === key ? "default" : "outline"}
                  className="h-16 justify-start space-x-3"
                  onClick={() => setEstimate(prev => ({ ...prev, sport: key as SportKey }))}
                >
                  <span className="text-2xl">{data.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{data.label}</div>
                    <ValuePill 
                      value={data.avgRevenue} 
                      type="revenue" 
                      period="monthly"
                      className="text-xs mt-1"
                    />
                  </div>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              These figures represent potential gross revenue — we'll estimate costs and net profit next.
            </p>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Facility Size</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SIZE_DATA).map(([key, data]) => (
                <Button
                  key={key}
                  variant={estimate.size === key ? "default" : "outline"}
                  className="h-14 flex flex-col"
                  onClick={() => setEstimate(prev => ({ ...prev, size: key as SizeKey }))}
                >
                  <div className="font-medium">{data.label}</div>
                  <div className="text-xs opacity-70">{data.sqft}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Location Cost Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Market Cost Level</Label>
            <Select 
              value={estimate.location} 
              onValueChange={(value) => setEstimate(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Cost Market (Phoenix, Atlanta)</SelectItem>
                <SelectItem value="average">Average Market (Dallas, Chicago)</SelectItem>
                <SelectItem value="high">High Cost Market (Denver, Boston)</SelectItem>
                <SelectItem value="premium">Premium Market (SF, NYC)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => setStep(2)} 
            size="lg" 
            className="w-full bg-gradient-primary"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Quick Estimate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <span className="text-2xl mr-2">{SPORTS_DATA[estimate.sport].icon}</span>
          Your {SPORTS_DATA[estimate.sport].label} Facility Estimate
        </CardTitle>
        <p className="text-muted-foreground">
          {SIZE_DATA[estimate.size].label} facility • {SIZE_DATA[estimate.size].sqft}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Building className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{results.grossSF.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Square Feet</div>
          </Card>
          
          <Card className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">${(results.capexTotal/1000).toFixed(0)}K</div>
            <div className="text-sm text-muted-foreground">Initial Investment</div>
          </Card>
          
          <Card className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">${(results.revenueMonthly/1000).toFixed(0)}K</div>
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
          </Card>
          
          <Card className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {results.breakEvenMonths ? `${results.breakEvenMonths}mo` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Break Even</div>
          </Card>
        </div>

        {/* Pricing Disclaimer */}
        <PricingDisclaimer className="mb-6" />

        {/* Financial Summary */}
        <Card className="p-6 bg-gradient-subtle">
          <h3 className="font-semibold mb-4">Monthly Financial Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Gross Revenue</span>
              <span className="font-medium text-green-600">${results.revenueMonthly.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Operating Expenses</span>
              <span className="font-medium text-red-600">-${results.opexMonthly.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-semibold">
              <span>Net Operating Income</span>
              <span className={results.ebitdaMonthly >= 0 ? "text-green-600" : "text-red-600"}>
                ${results.ebitdaMonthly.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Equipment Package */}
        {equipmentPackage.items.length > 0 ? (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">{SPORTS_DATA[estimate.sport].icon}</span>
              Standard Equipment Package
            </h3>
            <div className="space-y-3">
              {equipmentPackage.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} • {item.tier} tier
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.total.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.unitCost.toLocaleString()}/{item.unit}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Equipment Subtotal</span>
                  <span>${equipmentPackage.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Installation</span>
                  <span>${Math.round(equipmentPackage.total * 1.0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Equipment + Installation</span>
                  <span>${(equipmentPackage.total + Math.round(equipmentPackage.total * 1.0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Core equipment for a {SIZE_DATA[estimate.size].label.toLowerCase()} {SPORTS_DATA[estimate.sport].label.toLowerCase()} facility. Additional equipment and customization available in detailed analysis.
            </p>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="font-semibold mb-2">Equipment Package</h3>
            <p className="text-muted-foreground">
              Standard equipment package coming soon for {SPORTS_DATA[estimate.sport].label}.
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Adjust Parameters
            </Button>
            
            <Button
              onClick={handlePdfDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download / Print PDF
            </Button>
          </div>
          
          <Button
            onClick={handleQuickStart}
            size="lg"
            className="w-full bg-gradient-primary"
          >
            View Detailed Analysis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          This quick estimate uses industry averages. Click "View Detailed Analysis" to customize all parameters and get precise projections.
        </p>
        </CardContent>
        
        <LeadGate
          isOpen={showLeadGate}
          onClose={() => setShowLeadGate(false)}
          onSubmit={leadGateMode === 'pdf' ? handleLeadSubmit : handleAnalysisWithLead}
          title={leadGateMode === 'pdf' ? "Download Your Facility Estimate" : "Start Your Detailed Analysis"}
          description={leadGateMode === 'pdf' ? "Get your complete PDF report delivered to your inbox" : "Get a personalized consultation based on your project details"}
          showOptionalFields={true}
        />
      </Card>
    );
};

// Helper functions for generating realistic defaults
function getCourtCounts(sport: SportKey, size: SizeKey): Record<string, number> {
  const multiplier = SIZE_DATA[size].multiplier;
  
  const baseCounts: Record<SportKey, Record<string, number>> = {
    basketball: { basketball_courts_full: Math.round(2 * multiplier) },
    volleyball: { volleyball_courts: Math.round(3 * multiplier) },
    baseball_softball: { baseball_tunnels: Math.round(6 * multiplier) },
    pickleball: { pickleball_courts: Math.round(4 * multiplier) },
    soccer: { soccer_field_small: Math.round(1 * multiplier) },
    football: { football_field: Math.round(1 * multiplier) },
    lacrosse: { lacrosse_field: Math.round(1 * multiplier) },
    tennis: { tennis_courts: Math.round(2 * multiplier) },
    multi_sport: { 
      basketball_courts_full: Math.round(1 * multiplier),
      volleyball_courts: Math.round(1 * multiplier)
    },
    fitness: { fitness_area_sf: Math.round(3000 * multiplier) }
  };
  
  return baseCounts[sport] || {};
}

function getOpexDefaults(size: SizeKey) {
  const sportData = SPORTS_DATA.basketball; // Use basketball as baseline
  const sizeData = SIZE_DATA[size];
  const targetRevenueMonthly = Math.round(sportData.avgRevenue * sizeData.multiplier);
  const targetOpexMonthly = Math.round(targetRevenueMonthly * 0.65); // 65% OpEx ratio
  
  // Calculate fixed costs scaled by size
  const fixedCosts = {
    utilities_monthly: Math.round(2000 * sizeData.multiplier),
    insurance_monthly: Math.round(1200 * sizeData.multiplier),
    maintenance_monthly: Math.round(800 * sizeData.multiplier),
    marketing_monthly: Math.round(1500 * sizeData.multiplier),
    software_monthly: 400,
    other_monthly: Math.round(600 * sizeData.multiplier)
  };
  
  const totalFixedCosts = Object.values(fixedCosts).reduce((sum, cost) => sum + cost, 0);
  const remainingForStaffing = targetOpexMonthly - totalFixedCosts;
  
  // Calculate staffing FTEs to hit remaining budget (allow decimals for part-time)
  const HOURS_PER_FTE_MONTH = 173;
  const baseFtes = [
    { role: "General Manager", ftes: 1, loaded_wage_per_hr: 35 },
    { role: "Operations Staff", ftes: 1.0, loaded_wage_per_hr: 25 },
    { role: "Coaches/Instructors", ftes: 1.5, loaded_wage_per_hr: 30 },
    { role: "Front Desk", ftes: 0.8, loaded_wage_per_hr: 18 }
  ];
  
  // Calculate current staffing cost
  const currentStaffingCost = baseFtes.reduce((sum, role) => 
    sum + (role.ftes * role.loaded_wage_per_hr * HOURS_PER_FTE_MONTH), 0);
  
  // Scale FTEs proportionally to hit target
  const scaleFactor = remainingForStaffing / currentStaffingCost;
  const adjustedStaffing = baseFtes.map(role => ({
    ...role,
    ftes: parseFloat((role.ftes * scaleFactor).toFixed(1))
  }));
  
  return {
    staffing: adjustedStaffing,
    ...fixedCosts
  };
}

function getRevenueDefaults(sport: SportKey, size: SizeKey) {
  const sportData = SPORTS_DATA[sport];
  const sizeData = SIZE_DATA[size];
  const targetRevenueMonthly = Math.round(sportData.avgRevenue * sizeData.multiplier);
  
  // Sport-specific revenue mix percentages (memberships/rentals/lessons)
  const revenueMix: Record<SportKey, { membership: number; rental: number; lesson: number }> = {
    basketball: { membership: 30, rental: 40, lesson: 30 },
    volleyball: { membership: 25, rental: 45, lesson: 30 },
    baseball_softball: { membership: 20, rental: 30, lesson: 50 },
    pickleball: { membership: 35, rental: 50, lesson: 15 },
    soccer: { membership: 25, rental: 35, lesson: 40 },
    football: { membership: 20, rental: 30, lesson: 50 },
    lacrosse: { membership: 25, rental: 40, lesson: 35 },
    tennis: { membership: 30, rental: 45, lesson: 25 },
    multi_sport: { membership: 30, rental: 40, lesson: 30 },
    fitness: { membership: 60, rental: 25, lesson: 15 }
  };
  
  const mix = revenueMix[sport];
  const membershipTarget = Math.round(targetRevenueMonthly * (mix.membership / 100));
  const rentalTarget = Math.round(targetRevenueMonthly * (mix.rental / 100));
  const lessonTarget = Math.round(targetRevenueMonthly * (mix.lesson / 100));
  
  // Calculate membership counts to hit target
  const individualPrice = 65;
  const familyPrice = 110;
  const totalMembers = Math.round(membershipTarget / ((individualPrice * 0.7) + (familyPrice * 0.3)));
  const individualMembers = Math.round(totalMembers * 0.7);
  const familyMembers = Math.round(totalMembers * 0.3);
  
  // Calculate rental utilization to hit target
  const rentalRate = 50;
  const utilHoursPerWeek = Math.round((rentalTarget * 4) / (rentalRate * 4.345)); // 4.345 weeks/month
  
  // Calculate lesson parameters to hit target
  const avgRatePerHr = 70;
  const hoursPerCoachWeek = 15;
  const utilizationPct = 70;
  const coachCount = Math.max(1, Math.round(lessonTarget / (avgRatePerHr * hoursPerCoachWeek * 4.345 * (utilizationPct / 100))));
  
  return {
    memberships: [
      { name: "Individual", price_month: individualPrice, members: individualMembers },
      { name: "Family", price_month: familyPrice, members: familyMembers }
    ],
    rentals: [
      { unit: "hourly_rental", rate_per_hr: rentalRate, util_hours_per_week: utilHoursPerWeek }
    ],
    lessons: [
      { coach_count: coachCount, avg_rate_per_hr: avgRatePerHr, hours_per_coach_week: hoursPerCoachWeek, utilization_pct: utilizationPct }
    ],
    camps_clinics: [
      { sessions_per_year: 12, avg_price: 225, capacity: Math.round(25 * sizeData.multiplier), fill_rate_pct: 75 }
    ]
  };
}

function getFinancingDefaults() {
  return {
    lease_terms: {
      base_rent_per_sf_year: 14,
      nnn_per_sf_year: 4,
      cam_per_sf_year: 2,
      free_rent_months: 3,
      ti_allowance_per_sf: 10,
      lease_years: 7,
      annual_escalation_pct: 3
    }
  };
}

// Equipment package calculation
interface EquipmentItem {
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
  tier: 'low' | 'mid' | 'high';
}

interface EquipmentPackage {
  items: EquipmentItem[];
  total: number;
}

function getEquipmentPackage(sport: SportKey, size: SizeKey, location: string): EquipmentPackage {
  const sizeMultiplier = SIZE_DATA[size].multiplier;
  const courtCounts = getCourtCounts(sport, size);
  
  // Map location to cost tier
  const tierMap: Record<string, 'low' | 'mid' | 'high'> = {
    low: 'low',
    average: 'mid', 
    high: 'high',
    premium: 'high'
  };
  const tier = tierMap[location] || 'mid';

  const items: EquipmentItem[] = [];

  switch (sport) {
    case 'baseball_softball':
      const tunnels = courtCounts.baseball_tunnels || Math.round(6 * sizeMultiplier);
      
      // Batting tunnel nets
      const tunnelNet = COST_LIBRARY.tunnel_net;
      if (tunnelNet) {
        const unitCost = getCostByTier(tunnelNet, tier);
        const total = calculateItemTotal(tunnelNet, tunnels, tier);
        items.push({
          name: tunnelNet.name,
          quantity: tunnels,
          unit: tunnelNet.unit,
          unitCost,
          total,
          tier
        });
      }

      // Pitching machines (1 per 2 tunnels)
      const machines = Math.max(1, Math.round(tunnels / 2));
      const pitchingMachine = COST_LIBRARY.pitching_machines;
      if (pitchingMachine) {
        const unitCost = getCostByTier(pitchingMachine, tier);
        const total = calculateItemTotal(pitchingMachine, machines, tier);
        items.push({
          name: pitchingMachine.name,
          quantity: machines,
          unit: pitchingMachine.unit,
          unitCost,
          total,
          tier
        });
      }

      // L-screens (1 per tunnel)
      const lScreen = COST_LIBRARY.l_screens;
      if (lScreen) {
        const unitCost = getCostByTier(lScreen, tier);
        const total = calculateItemTotal(lScreen, tunnels, tier);
        items.push({
          name: lScreen.name,
          quantity: tunnels,
          unit: lScreen.unit,
          unitCost,
          total,
          tier
        });
      }

      // Portable mounds (1 per 3 tunnels)
      const mounds = Math.max(1, Math.round(tunnels / 3));
      const portableMound = COST_LIBRARY.portable_mounds;
      if (portableMound) {
        const unitCost = getCostByTier(portableMound, tier);
        const total = calculateItemTotal(portableMound, mounds, tier);
        items.push({
          name: portableMound.name,
          quantity: mounds,
          unit: portableMound.unit,
          unitCost,
          total,
          tier
        });
      }

      // Batting tees (2 per tunnel)
      const tees = tunnels * 2;
      const battingTee = COST_LIBRARY.tees;
      if (battingTee) {
        const unitCost = getCostByTier(battingTee, tier);
        const total = calculateItemTotal(battingTee, tees, tier);
        items.push({
          name: battingTee.name,
          quantity: tees,
          unit: battingTee.unit,
          unitCost,
          total,
          tier
        });
      }
      break;

    case 'basketball':
      const bbCourts = courtCounts.basketball_courts_full || Math.round(2 * sizeMultiplier);
      
      // Competition hoops (2 per court)
      const hoops = bbCourts * 2;
      const competitionHoop = COST_LIBRARY.competition_hoops;
      if (competitionHoop) {
        const unitCost = getCostByTier(competitionHoop, tier);
        const total = calculateItemTotal(competitionHoop, hoops, tier);
        items.push({
          name: competitionHoop.name,
          quantity: hoops,
          unit: competitionHoop.unit,
          unitCost,
          total,
          tier
        });
      }
      break;

    case 'volleyball':
      const vbCourts = courtCounts.volleyball_courts || Math.round(3 * sizeMultiplier);
      
      // Volleyball net systems (1 per court)
      const vbNet = COST_LIBRARY.volleyball_net_systems;
      if (vbNet) {
        const unitCost = getCostByTier(vbNet, tier);
        const total = calculateItemTotal(vbNet, vbCourts, tier);
        items.push({
          name: vbNet.name,
          quantity: vbCourts,
          unit: vbNet.unit,
          unitCost,
          total,
          tier
        });
      }
      break;

    case 'pickleball':
      const pbCourts = courtCounts.pickleball_courts || Math.round(4 * sizeMultiplier);
      
      // Pickleball nets (1 per court)
      const pbNet = COST_LIBRARY.pickleball_nets;
      if (pbNet) {
        const unitCost = getCostByTier(pbNet, tier);
        const total = calculateItemTotal(pbNet, pbCourts, tier);
        items.push({
          name: pbNet.name,
          quantity: pbCourts,
          unit: pbNet.unit,
          unitCost,
          total,
          tier
        });
      }
      break;

    case 'soccer':
      const soccerFields = courtCounts.soccer_field_small || Math.round(1 * sizeMultiplier);
      
      // Soccer goals (1 pair per field)
      const soccerGoal = COST_LIBRARY.soccer_goals;
      if (soccerGoal) {
        const unitCost = getCostByTier(soccerGoal, tier);
        const total = calculateItemTotal(soccerGoal, soccerFields, tier);
        items.push({
          name: soccerGoal.name,
          quantity: soccerFields,
          unit: soccerGoal.unit,
          unitCost,
          total,
          tier
        });
      }
      break;
  }

  const total = items.reduce((sum, item) => sum + item.total, 0);

  return { items, total };
}