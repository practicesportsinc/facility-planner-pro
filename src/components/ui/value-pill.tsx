import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ValuePillProps {
  value: number;
  type: 'revenue' | 'cost' | 'capex' | 'net';
  period?: 'monthly' | 'annual' | 'one-time' | 'total';
  label?: string;
  className?: string;
}

const typeStyles = {
  revenue: "bg-success/10 text-success border-success/20",
  cost: "bg-destructive/10 text-destructive border-destructive/20", 
  capex: "bg-muted text-muted-foreground border-border",
  net: "bg-primary/10 text-primary border-primary/20"
};

const periodLabels = {
  monthly: "/mo",
  annual: "/yr", 
  'one-time': "",
  total: ""
};

export function ValuePill({ value, type, period = 'total', label, className }: ValuePillProps) {
  const sign = value < 0 ? '-' : (type === 'revenue' ? '+' : '');
  const absValue = Math.abs(value);
  const formattedValue = absValue >= 1000000 
    ? `$${(absValue / 1000000).toFixed(1)}M`
    : absValue >= 1000 
    ? `$${(absValue / 1000).toFixed(1)}K` 
    : `$${absValue.toFixed(0)}`;
  
  const periodText = periodLabels[period];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium px-3 py-1 text-sm",
        typeStyles[type],
        className
      )}
    >
      {label && <span className="mr-1">{label}:</span>}
      {sign}{formattedValue}{periodText}
    </Badge>
  );
}