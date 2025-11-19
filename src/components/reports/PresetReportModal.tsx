import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacilityPreset } from "@/data/facilityPresets";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Download,
  Edit3,
  CheckCircle2,
  Maximize2,
  Target
} from "lucide-react";

interface PresetReportModalProps {
  preset: FacilityPreset;
  open: boolean;
  onClose: () => void;
}

export function PresetReportModal({ preset, open, onClose }: PresetReportModalProps) {
  const navigate = useNavigate();

  const monthlyEBITDA = preset.financials.monthlyRevenue - preset.financials.monthlyOpEx;
  const annualRevenue = preset.financials.monthlyRevenue * 12;
  const annualEBITDA = monthlyEBITDA * 12;
  const roi = (annualEBITDA / preset.financials.estimatedCapEx) * 100;
  const breakEvenMonths = preset.financials.estimatedCapEx / monthlyEBITDA;

  const handleCustomize = () => {
    // Navigate to calculator with preset data pre-populated
    navigate('/calculator', { 
      state: { 
        presetId: preset.id,
        presetData: preset 
      } 
    });
    onClose();
  };

  const handleDownload = () => {
    // TODO: Implement lead gate + PDF generation
    console.log("Download report for:", preset.id);
  };

  const handleSchedule = () => {
    window.open('https://practicesportsinc.setmore.com/', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{preset.name}</DialogTitle>
          <p className="text-muted-foreground">{preset.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Image */}
          <div className="relative overflow-hidden rounded-lg aspect-video">
            <img
              src={preset.image}
              alt={preset.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Maximize2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Square Feet</span>
                </div>
                <p className="text-2xl font-bold">{preset.configuration.grossSF.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Investment</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(preset.financials.estimatedCapEx)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Monthly Rev</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(preset.financials.monthlyRevenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Break-Even</span>
                </div>
                <p className="text-2xl font-bold">{Math.ceil(breakEvenMonths)} mo</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Investment (CapEx)</span>
                <span className="font-semibold">{formatCurrency(preset.financials.estimatedCapEx)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Annual Revenue (Projected)</span>
                <span className="font-semibold text-green-600">{formatCurrency(annualRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Annual OpEx</span>
                <span className="font-semibold">{formatCurrency(preset.financials.monthlyOpEx * 12)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold">Annual EBITDA</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(annualEBITDA)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Return on Investment</span>
                <span className="font-bold text-primary text-lg">{roi.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Facility Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preset.configuration.basketball_courts_full && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{preset.configuration.basketball_courts_full} Full Basketball Courts</span>
                  </div>
                )}
                {preset.configuration.pickleball_courts && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{preset.configuration.pickleball_courts} Pickleball Courts</span>
                  </div>
                )}
                {preset.configuration.baseball_tunnels && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{preset.configuration.baseball_tunnels} Batting Cages</span>
                  </div>
                )}
                {preset.configuration.volleyball_courts && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{preset.configuration.volleyball_courts} Volleyball Courts</span>
                  </div>
                )}
                {preset.configuration.soccer_field_small && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{preset.configuration.soccer_field_small} Small Soccer Field</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{preset.configuration.clearHeight}' Clear Height</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Popular Features & Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {preset.popularFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <strong>Target Market:</strong> {preset.targetMarket}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Button
              onClick={handleCustomize}
              className="w-full bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
              size="lg"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Customize This Layout
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
            
            <Button
              onClick={handleSchedule}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Consultation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
