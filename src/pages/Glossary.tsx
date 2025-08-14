import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Download, Printer, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { searchGlossary, getEntryByFieldId, getEntryBySlug, groupEntriesByAlpha, getAlphaKeys, type GlossaryFilters } from "@/services/glossaryIndex";
import { type GlossaryEntry, type GlossaryCategory, type GlossaryMode } from "@/data/glossaryData";
import { EntryCard } from "@/components/glossary/EntryCard";

export default function Glossary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<GlossaryFilters>({ mode: 'all', category: 'all' });
  const [results, setResults] = useState<GlossaryEntry[]>([]);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        const searchResults = searchGlossary(searchQuery, filters);
        setResults(searchResults);
        
        // Optional telemetry
        if (searchQuery.length >= 2) {
          // console.log('glossary_search', { query: searchQuery, length: searchQuery.length });
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Handle URL parameters
  useEffect(() => {
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    
    if (id) {
      const entry = getEntryByFieldId(id);
      if (entry) {
        setHighlightedFieldId(id);
        setTimeout(() => {
          const entryElement = document.getElementById(`entry-${id}`);
          if (entryElement) {
            entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } else if (slug) {
      const entry = getEntryBySlug(slug);
      if (entry) {
        setHighlightedFieldId(entry.field_id);
        setTimeout(() => {
          const entryElement = document.getElementById(`entry-${entry.field_id}`);
          if (entryElement) {
            entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [searchParams]);

  // Initial load
  useEffect(() => {
    if (results.length === 0 && !searchQuery) {
      const allResults = searchGlossary("", filters);
      setResults(allResults);
    }
  }, [searchQuery, filters, results.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    const firstEntry = results.find(entry => entry.alphaKey === alphaKey);
    if (firstEntry) {
      const entryElement = document.getElementById(`entry-${firstEntry.field_id}`);
      if (entryElement) {
        entryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleNavigateToTerm = (fieldId: string) => {
    const entry = getEntryByFieldId(fieldId);
    if (entry) {
      setHighlightedFieldId(fieldId);
      setSearchParams({ id: fieldId });
      
      setTimeout(() => {
        const entryElement = document.getElementById(`entry-${fieldId}`);
        if (entryElement) {
          entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would integrate with the Report Generator from Prompt J
    toast({
      title: "PDF Export",
      description: "PDF download functionality would be implemented here",
    });
  };

  const handleDownloadCSV = () => {
    const csvHeaders = ['Label', 'Field ID', 'Category', 'Applies To', 'Short Tip', 'Units'];
    const csvRows = results.map(entry => [
      entry.label,
      entry.field_id,
      entry.category,
      entry.applies_in_modes.join(';'),
      entry.short_tip.replace(/"/g, '""'),
      entry.units || ''
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'practice-sports-glossary.csv';
    link.click();
    
    toast({
      title: "CSV Downloaded",
      description: "Glossary exported to CSV file",
    });
  };

  const groupedResults = groupEntriesByAlpha(results);
  const alphaKeys = getAlphaKeys();
  const availableAlphaKeys = alphaKeys.filter(key => groupedResults[key]?.length > 0);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground">Learn More Glossary</h1>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="hidden sm:flex"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="hidden sm:flex"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCSV}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
            
            <p className="text-muted-foreground">
              Comprehensive definitions and explanations for all terms used in the sports facility calculator.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search terms (min 2 chars)... Press '/' to focus"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              <div>
                <h4 className="text-sm font-medium mb-2">Filter by Mode</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={filters.mode === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleModeFilter('all')}
                  >
                    All
                  </Badge>
                  {(['build', 'buy', 'lease', 'global'] as const).map(mode => (
                    <Badge
                      key={mode}
                      variant={filters.mode === mode ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => handleModeFilter(mode)}
                    >
                      {mode}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <h4 className="text-sm font-medium mb-2">Filter by Category</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={filters.category === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleCategoryFilter('all')}
                  >
                    All
                  </Badge>
                  {(['Cost', 'Finance', 'Revenue', 'Operations'] as const).map(category => (
                    <Badge
                      key={category}
                      variant={filters.category === category ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleCategoryFilter(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* A-Z Index */}
              {availableAlphaKeys.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Jump to Letter</h4>
                  <div className="flex flex-wrap gap-1">
                    {availableAlphaKeys.map(key => (
                      <Button
                        key={key}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAlphaJump(key)}
                        className="h-8 w-8 p-0 font-mono"
                        aria-label={`Jump to ${key === '#' ? 'symbols' : key}`}
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div ref={contentRef} className="space-y-6">
            {results.length > 0 ? (
              Object.entries(groupedResults).map(([alphaKey, entries]) => (
                <div key={alphaKey}>
                  <h2 className="text-2xl font-semibold text-foreground mb-4 border-b pb-2">
                    {alphaKey === '#' ? 'Symbols & Numbers' : alphaKey}
                  </h2>
                  <div className="space-y-4">
                    {entries.map(entry => (
                      <EntryCard
                        key={entry.field_id}
                        entry={entry}
                        isHighlighted={entry.field_id === highlightedFieldId}
                        onNavigateToTerm={handleNavigateToTerm}
                        onFocusField={(fieldId) => {
                          // Navigate to calculator if field needs focusing
                          navigate('/calculator');
                          toast({
                            title: "Navigate to Calculator",
                            description: "Open the Calculator to edit this field",
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {searchQuery.length > 0 && searchQuery.length < 2
                      ? "Type at least 2 characters to search"
                      : "No terms found matching your criteria"}
                  </p>
                  {searchQuery.length >= 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="mt-4"
                    >
                      Clear search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              All figures are planning estimates. Actual costs vary by market, vendor, and design. 
              Validate with a professional quote.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}