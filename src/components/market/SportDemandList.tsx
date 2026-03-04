import { cn } from "@/lib/utils";

interface SportDemand {
  sport: string;
  score: number;
}

interface SportDemandListProps {
  sports: SportDemand[];
  className?: string;
  blurRows?: boolean;
}

const sportIcons: Record<string, string> = {
  baseball: "⚾",
  basketball: "🏀",
  volleyball: "🏐",
  pickleball: "🏓",
  soccer: "⚽",
  football: "🏈",
  tennis: "🎾",
  hockey: "🏒",
  lacrosse: "🥍",
  golf: "⛳",
};

const blurLevels = [0, 1, 3, 5, 7];
const opacityLevels = [1, 0.8, 0.6, 0.4, 0.3];

export const SportDemandList = ({ sports, className, blurRows }: SportDemandListProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-400";
  };

  return (
    <div className={cn("bg-card border rounded-xl p-6", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Sports by Demand</h3>
      <div className="space-y-4">
        {sports.slice(0, 5).map((sport, index) => {
          const isBlurred = blurRows && index > 0;
          return (
          <div
            key={sport.sport}
            className={cn("space-y-1", isBlurred && "pointer-events-none select-none")}
            style={isBlurred ? { filter: `blur(${blurLevels[index]}px)`, opacity: opacityLevels[index] } : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sportIcons[sport.sport.toLowerCase()] || "🏟️"}</span>
                <span className="font-medium capitalize">{sport.sport}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{sport.score}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", getScoreColor(sport.score))}
                style={{ width: `${sport.score}%` }}
              />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
