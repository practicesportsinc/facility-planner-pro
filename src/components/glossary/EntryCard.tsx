import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Copy, ExternalLink, Focus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { type GlossaryEntry } from "@/data/glossaryData";

interface EntryCardProps {
  entry: GlossaryEntry;
  isHighlighted?: boolean;
  onNavigateToTerm?: (fieldId: string) => void;
  onFocusField?: (fieldId: string) => void;
  className?: string;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  isHighlighted = false,
  onNavigateToTerm,
  onFocusField,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(isHighlighted);

  const handleCopyDefinition = () => {
    const definition = `${entry.label}: ${entry.short_tip}${entry.units ? ` (${entry.units})` : ''}`;
    navigator.clipboard.writeText(definition);
    toast({
      title: "Definition copied",
      description: `Copied definition for "${entry.label}"`,
    });
    
    // Optional telemetry
    // console.log('glossary_copy', { field_id: entry.field_id });
  };

  const handleDeepLink = () => {
    const url = `/glossary/${entry.slug}?id=${entry.field_id}`;
    navigator.clipboard.writeText(window.location.origin + url);
    toast({
      title: "Link copied",
      description: "Deep link copied to clipboard",
    });
    
    // Optional telemetry
    // console.log('glossary_deeplink', { field_id: entry.field_id });
  };

  const handleFocusField = () => {
    if (onFocusField) {
      onFocusField(entry.field_id);
    } else {
      // Try to focus the field directly
      const fieldElement = document.querySelector(`[data-field-id="${entry.field_id}"]`) as HTMLElement;
      if (fieldElement) {
        fieldElement.focus();
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast({
          title: "Field focused",
          description: `Focused on "${entry.label}" input`,
        });
      } else {
        toast({
          title: "Field not found",
          description: "Open this in the Cost Inputs step to edit.",
          variant: "default"
        });
      }
    }
    
    // Optional telemetry
    // console.log('glossary_focus_field', { field_id: entry.field_id });
  };

  const getModeChip = (mode: string) => {
    const colors = {
      build: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      buy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      lease: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      global: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    
    return (
      <Badge 
        key={mode} 
        variant="secondary" 
        className={cn("text-xs", colors[mode as keyof typeof colors])}
      >
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </Badge>
    );
  };

  const getCategoryChip = (category: string) => {
    const colors = {
      Cost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Finance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Revenue: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      Operations: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
    };
    
    return (
      <Badge 
        variant="outline" 
        className={cn("text-xs", colors[category as keyof typeof colors])}
      >
        {category}
      </Badge>
    );
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isHighlighted && "ring-2 ring-primary ring-opacity-50 bg-primary/5",
        className
      )}
      id={`entry-${entry.field_id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {entry.label}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex flex-wrap gap-1">
                {entry.applies_in_modes.map(getModeChip)}
              </div>
              {getCategoryChip(entry.category)}
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {entry.short_tip}
            </p>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyDefinition}
              className="h-8 w-8 p-0"
              aria-label={`Copy definition for ${entry.label}`}
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeepLink}
              className="h-8 w-8 p-0"
              aria-label={`Copy deep link for ${entry.label}`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFocusField}
              className="h-8 w-8 p-0"
              aria-label={`Focus ${entry.label} field`}
            >
              <Focus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {(entry.long_tip || entry.units || entry.formula || entry.range_hint || entry.pitfalls?.length || entry.related?.length) && (
        <CardContent className="pt-0">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between text-sm"
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${entry.label}`}
              >
                <span>{isExpanded ? 'Show less' : 'Show details'}</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 mt-4">
              {entry.long_tip && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">What this means</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entry.long_tip}
                  </p>
                </div>
              )}

              {entry.units && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Units & input type</h5>
                  <p className="text-sm text-muted-foreground">
                    {entry.units}
                  </p>
                </div>
              )}

              {entry.formula && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">How we use it</h5>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {entry.formula}
                  </p>
                </div>
              )}

              {entry.range_hint && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Typical range</h5>
                  <p className="text-sm text-muted-foreground">
                    {entry.range_hint}
                  </p>
                </div>
              )}

              {entry.pitfalls && entry.pitfalls.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Common mistakes</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {entry.pitfalls.map((pitfall, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-destructive mr-1">•</span>
                        {pitfall}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.related && entry.related.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-foreground mb-1">Related terms</h5>
                  <div className="flex flex-wrap gap-1">
                    {entry.related.map((relatedId) => (
                      <Button
                        key={relatedId}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => onNavigateToTerm?.(relatedId)}
                      >
                        {relatedId.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
};