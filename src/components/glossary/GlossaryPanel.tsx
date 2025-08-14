import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchGlossary, getEntryByFieldId, groupEntriesByAlpha, getAlphaKeys, type GlossaryFilters } from "@/services/glossaryIndex";
import { type GlossaryEntry, type GlossaryCategory, type GlossaryMode } from "@/data/glossaryData";
import { EntryCard } from "./EntryCard";

interface GlossaryPanelProps {
  isOpen: boolean;
  initialFieldId?: string | null;
  onClose: () => void;
  onFocusField?: (fieldId: string) => void;
}

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({
  isOpen,
  initialFieldId,
  onClose,
  onFocusField
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<GlossaryFilters>({ mode: 'all', category: 'all' });
  const [results, setResults] = useState<GlossaryEntry[]>([]);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        const searchResults = searchGlossary(searchQuery, filters);
        setResults(searchResults);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Handle initial field ID
  useEffect(() => {
    if (isOpen && initialFieldId) {
      setHighlightedFieldId(initialFieldId);
      
      // Perform search to ensure the entry is visible
      const entry = getEntryByFieldId(initialFieldId);
      if (entry) {
        setSearchQuery("");
        setFilters({ mode: 'all', category: 'all' });
        
        // Scroll to entry after a short delay to allow rendering
        setTimeout(() => {
          const entryElement = document.getElementById(`entry-${initialFieldId}`);
          if (entryElement && scrollAreaRef.current) {
            entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [isOpen, initialFieldId]);

  // Focus search on open and keyboard shortcut
  useEffect(() => {
    if (isOpen) {
      // Focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      // Listen for / key to focus search
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          searchInputRef.current?.focus();
        } else if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'ArrowLeft' && e.altKey) {
          // Alt+← navigate back
          e.preventDefault();
          // Could implement history here
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Initial load
  useEffect(() => {
    if (isOpen && results.length === 0 && !searchQuery) {
      const allResults = searchGlossary("", filters);
      setResults(allResults);
    }
  }, [isOpen, searchQuery, filters, results.length]);

  const handleModeFilter = (mode: GlossaryMode | 'all') => {
    setFilters(prev => ({ ...prev, mode }));
    
    // Optional telemetry
    // console.log('glossary_filter', { type: 'mode', value: mode });
  };

  const handleCategoryFilter = (category: GlossaryCategory | 'all') => {
    setFilters(prev => ({ ...prev, category }));
    
    // Optional telemetry
    // console.log('glossary_filter', { type: 'category', value: category });
  };

  const handleAlphaJump = (alphaKey: string) => {
    // Find first entry with this alpha key
    const firstEntry = results.find(entry => entry.alphaKey === alphaKey);
    if (firstEntry) {
      const entryElement = document.getElementById(`entry-${firstEntry.field_id}`);
      if (entryElement && scrollAreaRef.current) {
        entryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleNavigateToTerm = (fieldId: string) => {
    setHighlightedFieldId(fieldId);
    setSearchQuery("");
    setFilters({ mode: 'all', category: 'all' });
    
    setTimeout(() => {
      const entryElement = document.getElementById(`entry-${fieldId}`);
      if (entryElement && scrollAreaRef.current) {
        entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleBackToForm = () => {
    onClose();
    // Could focus the last active form field
  };

  const groupedResults = groupEntriesByAlpha(results);
  const alphaKeys = getAlphaKeys();
  const availableAlphaKeys = alphaKeys.filter(key => groupedResults[key]?.length > 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[420px] p-0 flex flex-col"
        role="dialog"
        aria-labelledby="glossary-panel-title"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle id="glossary-panel-title" className="text-lg font-semibold">
            Learn More Glossary
          </SheetTitle>
          
          <div className="space-y-3 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search terms (min 2 chars)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    // Optional telemetry
                    // console.log('glossary_search', { query: e.target.value, length: e.target.value.length });
                  }
                }}
                className="pl-10 pr-4"
                aria-label="Search glossary terms"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Mode Filters */}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={filters.mode === 'all' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => handleModeFilter('all')}
              >
                All
              </Badge>
              {(['build', 'buy', 'lease', 'global'] as const).map(mode => (
                <Badge
                  key={mode}
                  variant={filters.mode === mode ? 'default' : 'outline'}
                  className="cursor-pointer text-xs capitalize"
                  onClick={() => handleModeFilter(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={filters.category === 'all' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => handleCategoryFilter('all')}
              >
                All
              </Badge>
              {(['Cost', 'Finance', 'Revenue', 'Operations'] as const).map(category => (
                <Badge
                  key={category}
                  variant={filters.category === category ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* A-Z Index */}
            {availableAlphaKeys.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {availableAlphaKeys.map(key => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlphaJump(key)}
                    className="h-6 w-6 p-0 text-xs font-mono"
                    aria-label={`Jump to ${key === '#' ? 'symbols' : key}`}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {results.length > 0 ? (
              Object.entries(groupedResults).map(([alphaKey, entries]) => (
                <div key={alphaKey}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 sticky top-0 bg-background z-10 py-1">
                    {alphaKey === '#' ? 'Symbols' : alphaKey}
                  </h3>
                  <div className="space-y-3">
                    {entries.map(entry => (
                      <EntryCard
                        key={entry.field_id}
                        entry={entry}
                        isHighlighted={entry.field_id === highlightedFieldId}
                        onNavigateToTerm={handleNavigateToTerm}
                        onFocusField={onFocusField}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery.length > 0 && searchQuery.length < 2
                    ? "Type at least 2 characters to search"
                    : "No terms found matching your criteria"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t flex flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button variant="default" onClick={handleBackToForm} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to form
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};