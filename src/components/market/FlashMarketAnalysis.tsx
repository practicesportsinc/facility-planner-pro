import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2, TrendingUp, Users, DollarSign, Download, ArrowRight, RefreshCw, Wrench, HardHat, Calculator, FileText, Shield, BarChart3, Trophy, Target } from "lucide-react";
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

interface NearbyFacility {
  name: string;
  vicinity: string;
  rating?: number;
  types: string[];
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
  nearbyFacilities?: NearbyFacility[];
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

// Calculate revenue potential from demographics + demand scores
function calculateRevenuePotential(data: MarketData) {
  const { demographics, sportDemandScores } = data;
  const pop = demographics.population15Min;
  
  const sportRevenues = Object.entries(sportDemandScores)
    .map(([sport, demand]) => {
      const participants = Math.round(pop * (demand / 100) * 0.08);
      return {
        sport: sport.charAt(0).toUpperCase() + sport.slice(1),
        participants,
        revenueLow: participants * 500,
        revenueHigh: participants * 1200,
      };
    })
    .sort((a, b) => b.revenueHigh - a.revenueHigh);

  // Total from top 3 sports
  const top3 = sportRevenues.slice(0, 3);
  const totalLow = top3.reduce((sum, s) => sum + s.revenueLow, 0);
  const totalHigh = top3.reduce((sum, s) => sum + s.revenueHigh, 0);

  return { sportRevenues, totalLow, totalHigh };
}

export const FlashMarketAnalysis = () => {
  const [searchParams] = useSearchParams();
  const [zipCode, setZipCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const hasAutoAnalyzed = useRef(false);

  // Auto-analyze from URL parameter
  useEffect(() => {
    const urlZip = searchParams.get('zip');
    if (urlZip && urlZip.length === 5 && !hasAutoAnalyzed.current) {
      hasAutoAnalyzed.current = true;
      setZipCode(urlZip);
      // Trigger analysis after state update
      setTimeout(() => {
        analyzeZip(urlZip);
      }, 100);
    }
  }, [searchParams]);

  const analyzeZip = async (zip: string) => {
    if (!zip || zip.length !== 5) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-location', {
        body: { zipCode: zip, radius: 15 }
      });

      if (error) {
        // Extract the user-friendly message from the edge function response
        let message = "Failed to analyze location. Please try again.";
        try {
          const context = JSON.parse(error.message || "{}");
          if (context?.error) message = context.error;
        } catch {
          // Try reading from error.context if available (FunctionsHttpError)
          if (error.context) {
            try {
              const body = await error.context.json();
              if (body?.error) message = body.error;
            } catch { /* ignore */ }
          }
        }
        toast.error(message);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

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

  const handleAnalyze = async () => {
    await analyzeZip(zipCode);
  };

  const handleUnlock = async (leadData: any) => {
    try {
      await supabase.functions.invoke('sync-lead-to-sheets', {
        body: {
          ...leadData,
          source: 'flash-market-analysis',
          source_detail: `report-unlock-${zipCode}`,
        },
      });

      await supabase.functions.invoke('send-lead-emails', {
        body: {
          customerEmail: leadData.email,
          customerName: leadData.name,
          leadData: {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            city: leadData.city || marketData?.location.city,
            state: leadData.state || marketData?.location.state,
          },
          facilityDetails: {
            location: `${marketData?.location.city}, ${marketData?.location.state} ${zipCode}`,
          },
          source: 'flash-market-analysis',
        },
      });

      toast.success("Full report unlocked!");
    } catch (error) {
      console.error('Error processing lead:', error);
      toast.success("Report unlocked!");
    }
    setIsUnlocked(true);
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
    const revenuePotential = calculateRevenuePotential(marketData);

    const formatRevenue = (num: number) => {
      if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
      if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
      return `$${num}`;
    };

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
                <span className="font-semibold">{(marketData.demographics.youthPercentage ?? 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pop. Growth Rate</span>
                <span className="font-semibold">{(marketData.demographics.populationGrowthRate ?? 0).toFixed(1)}%</span>
              </div>
            </div>
          </Card>

          {/* Revenue Potential Card (free zone teaser) */}
          <Card className="p-6 border-primary/30 bg-primary/5 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Revenue Potential</h3>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-primary">{formatRevenue(revenuePotential.totalLow)}</span>
              <span className="text-xl text-muted-foreground"> – {formatRevenue(revenuePotential.totalHigh)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated annual market revenue (top 3 sports)
            </p>
          </Card>

        </div>

        {/* Sport Demand — teased with progressive blur when locked */}
        <div className="mb-6">
          <SportDemandList sports={sportDemandArray} blurRows={!isUnlocked} />
        </div>

        {/* Gated Zone — blurred until lead submits contact info */}
        <div className="relative">
          {/* Blurred content */}
          <div className={!isUnlocked ? "blur-md pointer-events-none select-none" : ""}>
            {/* Per-Sport Revenue Breakdown */}
            <div className="mb-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-muted-foreground">Revenue Potential by Sport</h3>
                </div>
                <div className="space-y-3">
                  {revenuePotential.sportRevenues.slice(0, 6).map((sr) => (
                    <div key={sr.sport} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sr.sport}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{formatRevenue(sr.revenueLow)} – {formatRevenue(sr.revenueHigh)}</span>
                        <span className="text-xs text-muted-foreground ml-2">({formatNumber(sr.participants)} participants)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Competitive Analysis Section */}
            {marketData.competitiveAnalysis && (
              <div className="pt-4 mb-6">
                <h3 className="text-xl font-semibold mb-4">Competitive Landscape</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <CompetitiveLandscape data={marketData.competitiveAnalysis} nearbyFacilities={marketData.nearbyFacilities} />
                </div>
              </div>
            )}

            {/* Next Steps Section */}
            <div className="pt-8 border-t">
              <h3 className="text-xl font-semibold mb-2">What's Next?</h3>
              <p className="text-muted-foreground mb-6">
                Use your market insights to start planning your facility
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/?mode=equipment" className="group">
                  <Card className="p-4 h-full hover:shadow-lg transition-all hover:border-primary/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Wrench className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Equipment Pricing</h4>
                    <p className="text-sm text-muted-foreground">Get detailed equipment quotes for your sport</p>
                  </Card>
                </Link>

                <Link to="/building-config" className="group">
                  <Card className="p-4 h-full hover:shadow-lg transition-all hover:border-primary/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <HardHat className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Building Config</h4>
                    <p className="text-sm text-muted-foreground">Estimate construction costs for your facility</p>
                  </Card>
                </Link>

                <Link to="/calculator" className="group">
                  <Card className="p-4 h-full hover:shadow-lg transition-all border-primary/30 hover:border-primary">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Calculator className="w-6 h-6 text-secondary" />
                    </div>
                    <h4 className="font-semibold mb-1">Full Facility</h4>
                    <p className="text-sm text-muted-foreground">Complete financial model with revenue projections</p>
                  </Card>
                </Link>

                <Link to="/business-plan" className="group">
                  <Card className="p-4 h-full hover:shadow-lg transition-all hover:border-primary/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Business Plan</h4>
                    <p className="text-sm text-muted-foreground">Create investor-ready plan for this market</p>
                  </Card>
                </Link>
              </div>
            </div>
          </div>

          {/* Overlay + inline lead gate (only when locked) */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-8">
              {/* Gradient fade from transparent to background */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background pointer-events-none" />
              
              {/* Inline lead capture form */}
              <div className="relative z-10 w-full max-w-lg mx-auto">
                <LeadGate
                  isOpen={true}
                  onClose={() => {}}
                  onSubmit={handleUnlock}
                  mode="inline"
                  title="🔓 Unlock the Full Market Report"
                  description="Enter your contact info to see sport demand rankings, competitive landscape, and next steps"
                  defaultCity={marketData.location.city}
                  defaultState={marketData.location.state}
                  showOutreachField={false}
                  showCancelButton={false}
                  submitButtonText="Unlock Full Report"
                />
              </div>
            </div>
          )}
        </div>
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
        Results in under 30 seconds • No signup required
      </p>

      {/* What You'll Get */}
      <div className="mt-10 text-left">
        <h3 className="text-lg font-semibold text-center mb-4">What You'll Get</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Market Score</p>
              <p className="text-xs text-muted-foreground">Viability rating out of 100</p>
            </div>
          </Card>
          <Card className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Demographics</p>
              <p className="text-xs text-muted-foreground">Population & income data</p>
            </div>
          </Card>
          <Card className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Sport Demand</p>
              <p className="text-xs text-muted-foreground">Ranked by local interest</p>
            </div>
          </Card>
          <Card className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Competition</p>
              <p className="text-xs text-muted-foreground">Gaps & saturation analysis</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Trust & Social Proof */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          Free — no signup required
        </div>
        <p className="text-xs text-muted-foreground">Used by 500+ facility planners nationwide</p>
      </div>
    </div>
  );
};
