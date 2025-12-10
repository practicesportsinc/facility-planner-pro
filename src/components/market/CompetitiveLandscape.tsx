import { Card } from "@/components/ui/card";
import { Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FacilityEstimate {
  count: number;
  saturation: 'underserved' | 'balanced' | 'saturated';
}

interface MarketGap {
  sport: string;
  opportunity: number;
  reason: string;
}

interface CompetitiveAnalysisData {
  competitionScore: number;
  facilityEstimates: Record<string, FacilityEstimate>;
  marketGaps: MarketGap[];
  insights: string[];
}

interface CompetitiveLandscapeProps {
  data: CompetitiveAnalysisData;
  className?: string;
}

export const CompetitiveLandscape = ({ data, className }: CompetitiveLandscapeProps) => {
  const { competitionScore, facilityEstimates, marketGaps, insights } = data;

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-green-500';
    if (score > 60) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getScoreLabel = (score: number) => {
    if (score < 40) return 'Low Competition';
    if (score > 60) return 'High Competition';
    return 'Moderate Competition';
  };

  const getSaturationColor = (saturation: string) => {
    switch (saturation) {
      case 'underserved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'saturated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getSaturationLabel = (saturation: string) => {
    switch (saturation) {
      case 'underserved': return 'Underserved ✓';
      case 'saturated': return 'Saturated';
      default: return 'Balanced';
    }
  };

  const formatSportName = (sport: string) => {
    return sport.charAt(0).toUpperCase() + sport.slice(1);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Competition Score Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">Competition Level</h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={cn("text-4xl font-bold", getScoreColor(competitionScore))}>
              {competitionScore}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <span className={cn("text-sm font-medium px-3 py-1 rounded-full", 
            competitionScore < 40 ? 'bg-green-500/20 text-green-400' :
            competitionScore > 60 ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          )}>
            {getScoreLabel(competitionScore)}
          </span>
        </div>

        {/* Competition gauge */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
              competitionScore < 40 ? 'bg-green-500' :
              competitionScore > 60 ? 'bg-red-500' : 'bg-yellow-500'
            )}
            style={{ width: `${competitionScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Low (Better)</span>
          <span>High</span>
        </div>
      </Card>

      {/* Facility Saturation */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">Estimated Facilities in Area</h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(facilityEstimates).map(([sport, data]) => (
            <div key={sport} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{formatSportName(sport)}</span>
                <span className="text-muted-foreground text-sm">~{data.count} facilities</span>
              </div>
              <span className={cn(
                "text-xs px-2 py-1 rounded border",
                getSaturationColor(data.saturation)
              )}>
                {getSaturationLabel(data.saturation)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Market Gaps */}
      {marketGaps.length > 0 && (
        <Card className="p-6 border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-medium text-green-400">Top Market Opportunities</h3>
          </div>
          
          <div className="space-y-4">
            {marketGaps.map((gap, index) => (
              <div key={gap.sport} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{gap.sport}</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                      {gap.opportunity}% opportunity
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{gap.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground">Key Insights</h3>
          </div>
          
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
