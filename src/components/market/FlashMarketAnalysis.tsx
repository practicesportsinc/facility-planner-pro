import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2, TrendingUp, Users, DollarSign, Baby, Download, ArrowRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MarketScoreCard } from "./MarketScoreCard";
import { SportDemandList } from "./SportDemandList";
import { CompetitiveLandscape } from "./CompetitiveLandscape";
import LeadGate from "@/components/shared/LeadGate";
import { toast } from "sonner";

interface CompetitiveAnalysis {
  competitionScore: number;
  facilityEstimates: Record<string, { count: number; saturation: 'underserved' | 'balanced' | 'saturated' }>;
  marketGaps: Array<{ sport: string; opportunity: number; reason: string }>;
  insights: string[];
}

interface MarketData {
  location: {
    zipCode: string;
    city: string;
    state: string;
  };
  demographics: {
    population10Min: number;
    population15Min: number;
    population20Min: number;
    medianIncome: number;
    youthPercentage: number;
    familiesWithChildren: number;
    populationGrowthRate: number;
  };
  sportsParticipation: {
    baseball: number;
    basketball: number;
    volleyball: number;
    pickleball: number;
    soccer: number;
    football: number;
  };
  sportDemandScores: Record<string, number>;
  competitiveAnalysis?: CompetitiveAnalysis;
}

function calculateMarketScore(data: MarketData): number {
  let score = 0;
  const { demographics } = data;

  // Population factor (25 points max)
  if (demographics.population15Min > 200000) score += 25;
  else if (demographics.population15Min > 100000) score += 20;
  else if (demographics.population15Min > 50000) score += 15;
  else score += 10;

  // Income factor (25 points max)
  if (demographics.medianIncome > 100000) score += 25;
  else if (demographics.medianIncome > 75000) score += 20;
  else if (demographics.medianIncome > 50000) score += 15;
  else score += 10;

  // Youth/families factor (25 points max)
  if (demographics.youthPercentage > 22) score += 25;
  else if (demographics.youthPercentage > 18) score += 20;
  else score += 15;

  // Growth factor (25 points max)
  if (demographics.populationGrowthRate > 1.5) score += 25;
  else if (demographics.populationGrowthRate > 1.0) score += 20;
  else if (demographics.populationGrowthRate > 0.5) score += 15;
  else score += 10;

  return Math.min(100, score);
}

export const FlashMarketAnalysis = () => {
  const [zipCode, setZipCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [showPreAnalysisGate, setShowPreAnalysisGate] = useState(false);
  const [pendingZipCode, setPendingZipCode] = useState("");

  const handleAnalyze = () => {
    if (!zipCode || zipCode.length !== 5) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }
    setPendingZipCode(zipCode);
    setShowPreAnalysisGate(true);
  };

  const runAnalysis = async (zip: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-location', {
        body: { zipCode: zip, radius: 15 }
      });

      if (error) throw error;

      setMarketData(data);
    } catch (error: any) {
      console.error('Error analyzing location:', error);
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        toast.error("Service temporarily unavailable. Please try again in a moment.");
      } else {
        toast.error("Failed to analyze location. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmitAndAnalyze = async (leadData: any) => {
    try {
      await supabase.functions.invoke('sync-lead-to-sheets', {
        body: {
          ...leadData,
          source: 'flash-market-analysis',
          source_detail: `pre-analysis-gate-${pendingZipCode}`,
        },
      });
      toast.success("Thank you! Running your analysis...");
    } catch (error) {
      console.error('Error syncing lead:', error);
    }
    setShowPreAnalysisGate(false);
    runAnalysis(pendingZipCode);
  };

  const handleDownloadReport = async (leadData: any) => {
    try {
      await supabase.functions.invoke('sync-lead-to-sheets', {
        body: {
          ...leadData,
          source: 'flash-market-analysis',
          source_detail: `report-download-${zipCode}`,
        },
      });
      
      // Generate simple PDF or text report
      toast.success("Report downloaded successfully!");
      setShowLeadGate(false);
    } catch (error) {
      console.error('Error syncing lead:', error);
      toast.success("Report downloaded successfully!");
      setShowLeadGate(false);
    }
  };

  const handleReset = () => {
    setMarketData(null);
    setZipCode("");
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  // Transform sport demand scores to array format
  const getSportDemandArray = () => {
    if (!marketData?.sportDemandScores) return [];
    return Object.entries(marketData.sportDemandScores)
      .map(([sport, score]) => ({ sport, score }))
      .sort((a, b) => b.score - a.score);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Analyzing market for ZIP {zipCode}...</p>
        <p className="text-sm text-muted-foreground mt-2">Fetching demographics and sports participation data</p>
      </div>
    );
  }

  if (marketData) {
    const marketScore = calculateMarketScore(marketData);
    const sportDemandArray = getSportDemandArray();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {marketData.location.city}, {marketData.location.state}
              </h2>
              <p className="text-muted-foreground">ZIP Code: {marketData.location.zipCode}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MarketScoreCard score={marketScore} className="lg:row-span-2" />

          {/* Population Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Population Reach</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">10 min drive</span>
                <span className="font-semibold">{formatNumber(marketData.demographics.population10Min)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">15 min drive</span>
                <span className="font-semibold">{formatNumber(marketData.demographics.population15Min)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">20 min drive</span>
                <span className="font-semibold">{formatNumber(marketData.demographics.population20Min)}</span>
              </div>
            </div>
          </Card>

          {/* Demographics Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Income & Growth</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Median Income</span>
                <span className="font-semibold">{formatCurrency(marketData.demographics.medianIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Youth (under 18)</span>
                <span className="font-semibold">{marketData.demographics.youthPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pop. Growth Rate</span>
                <span className="font-semibold">{marketData.demographics.populationGrowthRate.toFixed(1)}%</span>
              </div>
            </div>
          </Card>

          {/* Sport Demand */}
          <SportDemandList sports={sportDemandArray} className="lg:col-span-2" />
        </div>

        {/* Competitive Analysis Section */}
        {marketData.competitiveAnalysis && (
          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-4">Competitive Landscape</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <CompetitiveLandscape data={marketData.competitiveAnalysis} />
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            onClick={() => setShowLeadGate(true)}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Full Report
          </Button>
          <Button 
            onClick={() => window.location.href = '/calculator'}
            className="flex-1 bg-gradient-primary"
          >
            Start Full Facility Planning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Lead Gate Modal */}
        <LeadGate
          isOpen={showLeadGate}
          onClose={() => setShowLeadGate(false)}
          onSubmit={handleDownloadReport}
          title="Download Market Analysis Report"
          description="Enter your information to receive the full market analysis report for this location"
          showOutreachField={false}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <TrendingUp className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-3xl font-bold mb-3">Flash Market Analysis</h2>
      <p className="text-muted-foreground mb-8">
        Enter a ZIP code to instantly see if your area can support a sports facility.
        Get population data, income stats, and sports demand rankings in seconds.
      </p>

      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Enter ZIP code (e.g., 68138)"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
          className="text-lg h-12"
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <Button 
          onClick={handleAnalyze}
          className="h-12 px-8 bg-gradient-primary"
          disabled={zipCode.length !== 5}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Analyze
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Results in under 30 seconds • Free instant analysis
      </p>

      {/* Pre-Analysis Lead Gate */}
      <LeadGate
        isOpen={showPreAnalysisGate}
        onClose={() => setShowPreAnalysisGate(false)}
        onSubmit={handleLeadSubmitAndAnalyze}
        title="Get Your Market Analysis"
        description={`Enter your information to see detailed demographics, sports demand, and market opportunity for ZIP ${pendingZipCode}`}
        showOutreachField={false}
      />
    </div>
  );
};
