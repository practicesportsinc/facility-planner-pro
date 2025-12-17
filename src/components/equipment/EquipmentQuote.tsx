import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Mail, ArrowRight } from "lucide-react";
import { EquipmentQuote } from "@/types/equipment";
import { SPORT_LABELS } from "@/components/home/SportIcons";
import { PricingDisclaimer } from "@/components/ui/pricing-disclaimer";
import useAnalytics from "@/hooks/useAnalytics";
import { toast } from "sonner";
interface EquipmentQuoteDisplayProps {
  quote: EquipmentQuote;
  onRequestReview: () => void;
  onUpgradeToFull: () => void;
  onStartOver: () => void;
}

export const EquipmentQuoteDisplay = ({ 
  quote, 
  onRequestReview, 
  onUpgradeToFull,
  onStartOver 
}: EquipmentQuoteDisplayProps) => {
  const { track } = useAnalytics();

  const handleDownload = () => {
    track('equipment_quote_downloaded', { 
      sport: quote.sport,
      total: quote.totals.grandTotal 
    });
    toast.success("Quote download coming soon!");
  };

  const handleRequestReview = () => {
    track('equipment_expert_requested', { 
      sport: quote.sport,
      total: quote.totals.grandTotal 
    });
    onRequestReview();
  };

  const handleUpgrade = () => {
    track('equipment_upgrade_clicked', { 
      sport: quote.sport,
      total: quote.totals.grandTotal 
    });
    onUpgradeToFull();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3">Your Equipment Quote</h2>
        <p className="text-muted-foreground text-lg">
          Estimated pricing for {SPORT_LABELS[quote.sport]} equipment
        </p>
      </div>

      <Card className="p-8 mb-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Sport</div>
            <div className="font-semibold">{SPORT_LABELS[quote.sport]}</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Units</div>
            <div className="font-semibold">{quote.inputs.units}</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Space</div>
            <div className="font-semibold capitalize">{quote.inputs.spaceSize}</div>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total</div>
            <div className="font-bold text-primary">{formatCurrency(quote.totals.grandTotal)}</div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Line Items by Category */}
        {quote.lineItems.map((category, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="font-semibold text-lg mb-4">{category.category}</h3>
            <div className="space-y-3">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.unitCost)}
                    </div>
                  </div>
                  <div className="font-semibold">{formatCurrency(item.totalCost)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <div className="font-medium text-muted-foreground">Subtotal</div>
              <div className="font-semibold">{formatCurrency(category.subtotal)}</div>
            </div>
          </div>
        ))}

        <Separator className="my-8" />

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-lg">
            <div className="text-muted-foreground">Equipment & Materials</div>
            <div className="font-semibold">{formatCurrency(quote.totals.equipment + quote.totals.flooring)}</div>
          </div>
          <div className="flex justify-between items-center text-lg">
            <div className="text-muted-foreground">Installation (est.)</div>
            <div className="font-semibold">{formatCurrency(quote.totals.installation)}</div>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-2xl font-bold">
            <div>Total Project Cost</div>
            <div className="text-primary">{formatCurrency(quote.totals.grandTotal)}</div>
          </div>
        </div>

        {/* Disclaimer */}
        <PricingDisclaimer className="mt-6" />
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleDownload}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Quote
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleRequestReview}
          className="w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          Request Expert Review
        </Button>
        
        <Button 
          size="lg"
          onClick={handleUpgrade}
          className="w-full"
        >
          Full Facility Plan
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="text-center mt-6">
        <Button 
          variant="ghost"
          onClick={onStartOver}
        >
          Start Over
        </Button>
      </div>
    </div>
  );
};
