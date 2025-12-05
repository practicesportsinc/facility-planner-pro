import React, { useState } from 'react';
import { useBusinessPlan } from '@/contexts/BusinessPlanContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Eye, Calendar, FileText, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LeadGate from '@/components/shared/LeadGate';
import { generateBusinessPlanPdf } from '@/utils/businessPlanPdfGenerator';

const AVAILABLE_SPORTS = [
  { id: 'baseball', label: 'Baseball', icon: '⚾' },
  { id: 'softball', label: 'Softball', icon: '🥎' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { id: 'pickleball', label: 'Pickleball', icon: '🏓' },
  { id: 'soccer', label: 'Soccer/Futsal', icon: '⚽' },
  { id: 'lacrosse', label: 'Lacrosse', icon: '🥍' },
  { id: 'golf', label: 'Golf Simulators', icon: '⛳' },
];

export default function ReviewGenerateStep() {
  const { data, updateData, setCurrentStep } = useBusinessPlan();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [pendingAction, setPendingAction] = useState<'preview' | 'download' | null>(null);

  const handleGenerate = async (action: 'preview' | 'download') => {
    setPendingAction(action);
    setShowLeadGate(true);
  };

  const onLeadSubmitted = async () => {
    setShowLeadGate(false);
    
    if (pendingAction === 'download') {
      await generatePdf();
    } else if (pendingAction === 'preview') {
      await generatePreview();
    }
    
    setPendingAction(null);
  };

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      // Generate AI-enhanced content
      const { data: aiContent, error } = await supabase.functions.invoke('generate-full-business-plan', {
        body: { planData: data },
      });

      if (error) {
        console.error('AI generation error:', error);
        // Continue with basic PDF generation
      }

      // Generate PDF with or without AI content
      await generateBusinessPlanPdf(data, aiContent);
      toast.success('Business plan downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePreview = async () => {
    toast.info('Preview coming soon! For now, please download the PDF.');
  };

  const scheduleConsultation = () => {
    window.open('https://practicesportsinc.setmore.com/', '_blank');
  };

  // Calculate summary metrics
  const totalStartup = 
    data.financials.startupCosts.leaseDeposit +
    data.financials.startupCosts.buildoutConstruction +
    data.financials.startupCosts.equipmentTechnology +
    data.financials.startupCosts.preOpeningCosts +
    data.financials.startupCosts.workingCapitalReserve;
  const contingency = totalStartup * (data.financials.startupCosts.contingencyPercentage / 100);
  const totalCapital = totalStartup + contingency;

  const selectedSports = data.sportSelection.primarySports.filter(s => s.selected);
  const completedPhases = data.timeline.phases.filter(p => p.status === 'completed').length;
  const completedChecklist = data.timeline.checklist.filter(c => c.completed).length;

  // Section completion checks
  const sections = [
    { name: 'Project Overview', complete: !!data.projectOverview.facilityName && !!data.projectOverview.city, step: 0 },
    { name: 'Market Analysis', complete: data.marketAnalysis.customerSegments.length > 0, step: 1 },
    { name: 'Sport Selection', complete: selectedSports.length > 0, step: 2 },
    { name: 'Competitive Analysis', complete: !!data.competitiveAnalysis.differentiationStrategy, step: 3 },
    { name: 'Facility Design', complete: data.facilityDesign.totalSquareFootage > 0, step: 4 },
    { name: 'Programming', complete: data.programming.rentalPricing.standardRate > 0, step: 5 },
    { name: 'Financials', complete: data.financials.startupCosts.buildoutConstruction > 0, step: 6 },
    { name: 'Risk Assessment', complete: data.riskAssessment.keyRisks.length > 0, step: 7 },
    { name: 'Timeline', complete: data.timeline.phases.length > 0, step: 8 },
  ];

  const completedSections = sections.filter(s => s.complete).length;
  const allComplete = completedSections === sections.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Review & Generate</h2>
        <p className="text-muted-foreground">Review your inputs and generate your professional business plan</p>
      </div>

      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {allComplete ? <Check className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
            Completion Status: {completedSections}/{sections.length} Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {sections.map((section) => (
              <button
                key={section.name}
                onClick={() => setCurrentStep(section.step)}
                className={`p-2 rounded text-xs text-center transition-colors ${
                  section.complete 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Facility</div>
            <div className="text-2xl font-bold text-foreground">
              {data.projectOverview.facilityName || 'Not Set'}
            </div>
            <div className="text-sm text-muted-foreground">
              {data.projectOverview.city}, {data.projectOverview.state}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Capital Required</div>
            <div className="text-2xl font-bold text-primary">
              ${totalCapital.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {data.financials.financing.equityPercentage}% equity / {data.financials.financing.debtPercentage}% debt
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Facility Size</div>
            <div className="text-2xl font-bold text-foreground">
              {data.facilityDesign.totalSquareFootage.toLocaleString()} SF
            </div>
            <div className="text-sm text-muted-foreground">
              {data.facilityDesign.ceilingHeight}' ceiling
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Target Opening</div>
            <div className="text-2xl font-bold text-foreground">
              {data.projectOverview.targetOpeningDate || 'TBD'}
            </div>
            <div className="text-sm text-muted-foreground">
              {completedPhases}/{data.timeline.phases.length} phases complete
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sports & Market */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Sports</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSports.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSports.map((sport) => {
                  const config = AVAILABLE_SPORTS.find(s => s.id === sport.sport);
                  return (
                    <span key={sport.sport} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {config?.icon} {config?.label}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No sports selected</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Market Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Population (15 min)</span>
              <span className="font-medium">{data.marketAnalysis.population15Min.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Median Income</span>
              <span className="font-medium">${data.marketAnalysis.medianHouseholdIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer Segments</span>
              <span className="font-medium">{data.marketAnalysis.customerSegments.length} selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Competitors Identified</span>
              <span className="font-medium">{data.competitiveAnalysis.competitors.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projection Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.scenario}
            onValueChange={(v) => updateData('scenario' as any, v as any)}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border border-border rounded-lg flex-1">
              <RadioGroupItem value="conservative" id="sc-conservative" />
              <Label htmlFor="sc-conservative" className="flex-1 cursor-pointer">
                <div className="font-medium">Conservative</div>
                <div className="text-sm text-muted-foreground">Lower projections, higher safety margin</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border border-border rounded-lg flex-1">
              <RadioGroupItem value="base" id="sc-base" />
              <Label htmlFor="sc-base" className="flex-1 cursor-pointer">
                <div className="font-medium">Base Case</div>
                <div className="text-sm text-muted-foreground">Most likely scenario</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border border-border rounded-lg flex-1">
              <RadioGroupItem value="upside" id="sc-upside" />
              <Label htmlFor="sc-upside" className="flex-1 cursor-pointer">
                <div className="font-medium">Upside</div>
                <div className="text-sm text-muted-foreground">Optimistic projections</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          size="lg"
          className="flex-1 bg-primary hover:bg-primary/90"
          onClick={() => handleGenerate('download')}
          disabled={isGenerating || !allComplete}
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Download className="w-5 h-5 mr-2" />
          )}
          Download Business Plan PDF
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={scheduleConsultation}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Schedule Expert Consultation
        </Button>
      </div>

      {!allComplete && (
        <p className="text-center text-sm text-yellow-500">
          Please complete all sections before generating your business plan
        </p>
      )}

      {/* Lead Gate Modal */}
      {showLeadGate && (
        <LeadGate
          title="Download Your Business Plan"
          description="Enter your information to receive your comprehensive business plan"
          source="business-plan-builder"
          sourceDetail={`${data.projectOverview.facilityName}-${data.scenario}`}
          onSubmitSuccess={onLeadSubmitted}
          onClose={() => setShowLeadGate(false)}
        />
      )}
    </div>
  );
}
