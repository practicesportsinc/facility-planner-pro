import { cn } from "@/lib/utils";

interface MarketScoreCardProps {
  score: number;
  className?: string;
}

export const MarketScoreCard = ({ score, className }: MarketScoreCardProps) => {
  const getScoreColor = () => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBackground = () => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getVerdict = () => {
    if (score >= 80) return "Excellent Opportunity";
    if (score >= 70) return "Strong Opportunity";
    if (score >= 60) return "Good Potential";
    if (score >= 50) return "Moderate Potential";
    if (score >= 40) return "Limited Opportunity";
    return "Challenging Market";
  };

  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div className={cn("bg-card border rounded-xl p-6", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Market Score</h3>
      <div className="flex items-center gap-4">
        <div className={cn("text-5xl font-bold", getScoreColor())}>
          {score}
        </div>
        <div className="text-2xl text-muted-foreground">/100</div>
      </div>
      <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getScoreBackground())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={cn("mt-3 font-semibold", getScoreColor())}>
        {getVerdict()}
      </p>
    </div>
  );
};
