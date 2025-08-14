import { TOOLTIP_LIBRARY } from "@/data/tooltipLibrary";
import { FIELD_LABELS, GLOSSARY_EXTRA, type GlossaryEntry, type GlossaryCategory, type GlossaryMode } from "@/data/glossaryData";

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

function getAlphaKey(label: string): string {
  const firstChar = label.charAt(0).toUpperCase();
  return /[A-Z]/.test(firstChar) ? firstChar : "#";
}

function deriveCategory(fieldId: string, appliesInModes: readonly string[]): GlossaryCategory {
  // Cost-related fields
  if (fieldId.includes('cost') || fieldId.includes('price') || fieldId.includes('allowance') || 
      fieldId.includes('rent') || fieldId.includes('nnn') || fieldId.includes('cam')) {
    return "Cost";
  }
  
  // Finance-related fields
  if (fieldId.includes('pct') || fieldId.includes('escalation') || fieldId.includes('deposit') || 
      fieldId.includes('closing') || fieldId.includes('contingency') || fieldId.includes('soft_costs')) {
    return "Finance";
  }
  
  // Operations-related fields
  if (fieldId.includes('sf') || fieldId.includes('years') || fieldId.includes('months') || 
      fieldId.includes('multiplier')) {
    return "Operations";
  }
  
  return "Cost"; // Default fallback
}

let glossaryIndex: GlossaryEntry[] | null = null;

export function buildGlossaryIndex(): GlossaryEntry[] {
  if (glossaryIndex) {
    return glossaryIndex;
  }

  const entries: GlossaryEntry[] = [];

  // Process TOOLTIP_LIBRARY entries
  Object.entries(TOOLTIP_LIBRARY).forEach(([fieldId, tooltipData]) => {
    const label = FIELD_LABELS[fieldId as keyof typeof FIELD_LABELS] || fieldId;
    const category = deriveCategory(fieldId, tooltipData.applies_in_modes || []);
    
    const entry: GlossaryEntry = {
      field_id: fieldId,
      label,
      short_tip: tooltipData.short_tip,
      long_tip: tooltipData.long_tip,
      units: tooltipData.units,
      formula: (tooltipData as any).formula,
      applies_in_modes: [...(tooltipData.applies_in_modes || [])] as GlossaryMode[],
      range_hint: (tooltipData as any).range_hint,
      pitfalls: (tooltipData as any).pitfalls,
      category,
      synonyms: [],
      related: [],
      alphaKey: getAlphaKey(label),
      slug: toKebabCase(label)
    };
    
    entries.push(entry);
  });

  // Process GLOSSARY_EXTRA entries
  Object.entries(GLOSSARY_EXTRA).forEach(([fieldId, extraData]) => {
    // Skip if already exists in TOOLTIP_LIBRARY
    if (entries.find(e => e.field_id === fieldId)) {
      return;
    }
    
    const entry: GlossaryEntry = {
      field_id: fieldId,
      label: extraData.label,
      short_tip: extraData.short_tip,
      long_tip: (extraData as any).long_tip,
      units: (extraData as any).units,
      formula: (extraData as any).formula,
      applies_in_modes: [...extraData.applies_in_modes] as GlossaryMode[],
      range_hint: undefined,
      pitfalls: undefined,
      category: extraData.category as GlossaryCategory,
      synonyms: [...((extraData as any).synonyms || [])],
      related: [...((extraData as any).related || [])],
      alphaKey: getAlphaKey(extraData.label),
      slug: toKebabCase(extraData.label)
    };
    
    entries.push(entry);
  });

  // Sort by label
  entries.sort((a, b) => a.label.localeCompare(b.label));
  
  glossaryIndex = entries;
  return entries;
}

export interface GlossaryFilters {
  mode?: GlossaryMode | 'all';
  category?: GlossaryCategory | 'all';
}

export function searchGlossary(query: string, filters: GlossaryFilters = {}): GlossaryEntry[] {
  const entries = buildGlossaryIndex();
  
  if (!query || query.length < 2) {
    return filterEntries(entries, filters);
  }
  
  const lowerQuery = query.toLowerCase();
  
  const matchedEntries = entries.filter(entry => {
    // Match on label
    if (entry.label.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Match on short_tip
    if (entry.short_tip.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Match on synonyms
    if (entry.synonyms && entry.synonyms.some(synonym => 
      synonym.toLowerCase().includes(lowerQuery)
    )) {
      return true;
    }
    
    return false;
  });
  
  return filterEntries(matchedEntries, filters);
}

function filterEntries(entries: GlossaryEntry[], filters: GlossaryFilters): GlossaryEntry[] {
  let filtered = entries;
  
  if (filters.mode && filters.mode !== 'all') {
    filtered = filtered.filter(entry => 
      entry.applies_in_modes.includes(filters.mode as GlossaryMode)
    );
  }
  
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(entry => entry.category === filters.category);
  }
  
  return filtered;
}

export function getEntryByFieldId(fieldId: string): GlossaryEntry | null {
  const entries = buildGlossaryIndex();
  return entries.find(entry => entry.field_id === fieldId) || null;
}

export function getEntryBySlug(slug: string): GlossaryEntry | null {
  const entries = buildGlossaryIndex();
  return entries.find(entry => entry.slug === slug) || null;
}

export function groupEntriesByAlpha(entries: GlossaryEntry[]): Record<string, GlossaryEntry[]> {
  const grouped: Record<string, GlossaryEntry[]> = {};
  
  entries.forEach(entry => {
    const key = entry.alphaKey;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry);
  });
  
  return grouped;
}

export function getAlphaKeys(): string[] {
  const entries = buildGlossaryIndex();
  const keys = new Set(entries.map(entry => entry.alphaKey));
  const sortedKeys = Array.from(keys).sort();
  
  // Ensure # comes last
  const alphaKeys = sortedKeys.filter(key => key !== '#');
  if (sortedKeys.includes('#')) {
    alphaKeys.push('#');
  }
  
  return alphaKeys;
}