import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const QuickEstimate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sport: '',
    size: '',
    location: ''
  });

  const [estimate, setEstimate] = useState<{
    equipmentCost: number;
    installationEstimate: number;
    totalProject: number;
    monthlyRevenue: number;
  } | null>(null);

  const generateQuickEstimate = () => {
    if (!formData.sport || !formData.size || !formData.location) {
      toast.error("Please fill in all fields");
      return;
    }

    // Quick estimation logic based on simple multipliers
    const baseCosts = {
      basketball: { equipment: 25000, total: 150000, revenue: 12000 },
      volleyball: { equipment: 20000, total: 120000, revenue: 10000 },
      pickleball: { equipment: 15000, total: 100000, revenue: 8000 },
      baseball_softball: { equipment: 35000, total: 180000, revenue: 15000 },
      soccer: { equipment: 30000, total: 200000, revenue: 18000 },
      multi_sport: { equipment: 40000, total: 220000, revenue: 20000 }
    };

    const sizeMultipliers = {
      small: 0.6,
      medium: 1.0,
      large: 1.8,
      xl: 2.5
    };

    const locationMultipliers = {
      urban: 1.3,
      suburban: 1.0,
      rural: 0.8
    };

    const base = baseCosts[formData.sport as keyof typeof baseCosts] || baseCosts.multi_sport;
    const sizeMultiplier = sizeMultipliers[formData.size as keyof typeof sizeMultipliers] || 1;
    const locationMultiplier = locationMultipliers[formData.location as keyof typeof locationMultipliers] || 1;

    const equipmentCost = Math.round(base.equipment * sizeMultiplier * locationMultiplier);
    const installationEstimate = Math.round(equipmentCost * 0.3);
    
    const finalEstimate = {
      equipmentCost,
      installationEstimate,
      totalProject: Math.round(base.total * sizeMultiplier * locationMultiplier) + installationEstimate,
      monthlyRevenue: Math.round(base.revenue * sizeMultiplier * locationMultiplier)
    };

    setEstimate(finalEstimate);

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quick_estimate_generated', {
        sport: formData.sport,
        size: formData.size,
        location: formData.location,
        equipment_cost: finalEstimate.equipmentCost,
        total_cost: finalEstimate.totalProject
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Layout>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/start')}
              className="absolute left-4 top-24"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              Quick Estimate
            </h1>
            <p className="text-lg text-muted-foreground">
              Get instant ballpark numbers for your sports facility project
            </p>
          </div>

          <Card className="ps-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="sport">Primary Sport</Label>
                <Select value={formData.sport} onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your main sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                    <SelectItem value="baseball_softball">Baseball/Softball</SelectItem>
                    <SelectItem value="soccer">Soccer</SelectItem>
                    <SelectItem value="multi_sport">Multi-Sport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size">Facility Size</Label>
                <Select value={formData.size} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (Under 10,000 sq ft)</SelectItem>
                    <SelectItem value="medium">Medium (10,000 - 25,000 sq ft)</SelectItem>
                    <SelectItem value="large">Large (25,000 - 50,000 sq ft)</SelectItem>
                    <SelectItem value="xl">Extra Large (50,000+ sq ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location Type</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urban">Urban/Downtown</SelectItem>
                    <SelectItem value="suburban">Suburban</SelectItem>
                    <SelectItem value="rural">Rural/Outskirts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateQuickEstimate} 
                className="w-full"
                size="lg"
              >
                Get Quick Estimate
              </Button>
            </CardContent>
          </Card>

          {estimate && (
            <Card className="ps-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Your Quick Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="text-center p-6 bg-gradient-primary rounded-lg">
                    <div className="text-white/80 text-sm font-medium mb-1">Equipment & Outfitting</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(estimate.equipmentCost)}</div>
                    <div className="text-white/60 text-xs mt-1">Installation estimate (30%): {formatCurrency(estimate.installationEstimate)}</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-secondary rounded-lg">
                    <div className="text-white/80 text-sm font-medium mb-1">Total Project Cost</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(estimate.totalProject)}</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-hero rounded-lg">
                    <div className="text-white/80 text-sm font-medium mb-1">Est. Monthly Revenue</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(estimate.monthlyRevenue)}</div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong>Note:</strong> These are rough estimates for initial planning. 
                    For detailed analysis with financing options, try our Wizard Builder or Custom Calculator.
                  </p>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/wizard')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Get Detailed Analysis
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/calculator')}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Custom Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default QuickEstimate;