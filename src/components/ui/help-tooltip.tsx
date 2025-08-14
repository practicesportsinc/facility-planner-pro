import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { HelpCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOLTIP_LIBRARY, type TooltipKey } from "@/data/tooltipLibrary";

interface HelpTooltipProps {
  fieldId: TooltipKey;
  label: string;
  className?: string;
  onOpenGlossary?: (fieldId: string) => void;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ fieldId, label, className, onOpenGlossary }) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const tooltipData = TOOLTIP_LIBRARY[fieldId];

  if (!tooltipData) {
    return null;
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setPopoverOpen(!popoverOpen);
    } else if (event.key === "Escape" && popoverOpen) {
      setPopoverOpen(false);
    } else if (event.shiftKey && event.key === "?") {
      event.preventDefault();
      setPopoverOpen(true);
    }
  };

  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    
    // Optional telemetry
    if (open) {
      // console.log('popover_opened', { field_id: fieldId });
    }
  };

  const handleTooltipTrigger = () => {
    // Optional telemetry
    // console.log('tooltip_viewed', { field_id: fieldId });
  };

  const handleLearnMore = () => {
    setPopoverOpen(false);
    if (onOpenGlossary) {
      onOpenGlossary(fieldId);
    }
  };

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-5 w-5 p-0 text-muted-foreground hover:text-foreground ml-1 inline-flex items-center justify-center",
                  className
                )}
                aria-label={`Help: ${label}`}
                onKeyDown={handleKeyDown}
                onMouseEnter={handleTooltipTrigger}
                onFocus={handleTooltipTrigger}
              >
                <HelpCircle className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>

          <TooltipContent
            side="top"
            className="max-w-xs text-sm leading-relaxed"
            role="tooltip"
          >
            {tooltipData.short_tip}
          </TooltipContent>

          <PopoverContent
            className="w-96 max-w-[360px] p-4 space-y-3"
            side="right"
            align="start"
            role="dialog"
            aria-labelledby={`help-title-${fieldId}`}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setPopoverOpen(false);
              }
            }}
          >
            <div className="space-y-3">
              <h4 id={`help-title-${fieldId}`} className="font-semibold text-foreground">
                {label}
              </h4>

              {tooltipData.long_tip && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">What this means</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tooltipData.long_tip}
                  </p>
                </div>
              )}

              {tooltipData.units && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Units & input type</h5>
                  <p className="text-sm text-muted-foreground">
                    {tooltipData.units}
                  </p>
                </div>
              )}

              {'formula' in tooltipData && tooltipData.formula && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">How we use it</h5>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {tooltipData.formula}
                  </p>
                </div>
              )}

              {tooltipData.applies_in_modes && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Applies to</h5>
                  <p className="text-sm text-muted-foreground">
                    {tooltipData.applies_in_modes.join(", ")} mode{tooltipData.applies_in_modes.length > 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {'range_hint' in tooltipData && tooltipData.range_hint && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Typical range</h5>
                  <p className="text-sm text-muted-foreground">
                    {tooltipData.range_hint}
                  </p>
                </div>
              )}

              {'pitfalls' in tooltipData && tooltipData.pitfalls && tooltipData.pitfalls.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Common mistakes</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {tooltipData.pitfalls.map((pitfall, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-destructive mr-1">•</span>
                        {pitfall}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learn More Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLearnMore}
                  className="w-full"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Learn more
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Tooltip>
      </Popover>
    </TooltipProvider>
  );
};