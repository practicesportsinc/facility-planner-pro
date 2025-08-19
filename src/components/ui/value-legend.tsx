import { Badge } from "@/components/ui/badge";

export function ValueLegend() {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-success"></div>
        <span className="text-sm text-muted-foreground">Revenue (+)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-destructive"></div>
        <span className="text-sm text-muted-foreground">Operating Costs (-)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
        <span className="text-sm text-muted-foreground">One-time CapEx</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <span className="text-sm text-muted-foreground">Net Income</span>
      </div>
    </div>
  );
}