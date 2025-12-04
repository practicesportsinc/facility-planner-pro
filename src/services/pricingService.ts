import { supabase } from "@/integrations/supabase/client";
import { COST_LIBRARY, CostItem } from "@/data/costLibrary";

export interface LivePriceData {
  id: string;
  cost_library_id: string;
  product_name: string;
  source_url: string;
  scraped_price: number | null;
  price_tier: string;
  unit: string;
  last_synced_at: string;
  sync_status: string;
  sync_error: string | null;
  is_active: boolean;
  fallback_override_low: number | null;
  fallback_override_mid: number | null;
  fallback_override_high: number | null;
}

export interface PriceResult {
  price: number;
  isLive: boolean;
  tier: 'low' | 'mid' | 'high';
  lastSynced?: string;
  isOverride?: boolean;
}

// Cache for live pricing data
let pricingCache: Map<string, LivePriceData> = new Map();
let lastCacheUpdate: Date | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchAllLivePricing(): Promise<LivePriceData[]> {
  // Use type assertion since table may not be in generated types yet
  const { data, error } = await (supabase as any)
    .from('product_pricing')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('[pricingService] Error fetching live pricing:', error);
    return [];
  }

  // Update cache
  pricingCache.clear();
  (data || []).forEach((item: LivePriceData) => {
    pricingCache.set(item.cost_library_id, item);
  });
  lastCacheUpdate = new Date();

  return data || [];
}

export async function getLivePrice(
  costLibraryId: string, 
  tier: 'low' | 'mid' | 'high' = 'mid'
): Promise<PriceResult> {
  // Check if cache needs refresh
  const now = new Date();
  if (!lastCacheUpdate || now.getTime() - lastCacheUpdate.getTime() > CACHE_TTL_MS) {
    await fetchAllLivePricing();
  }

  const liveData = pricingCache.get(costLibraryId);
  const fallbackItem = COST_LIBRARY[costLibraryId];

  // If we have a valid scraped price, use it
  if (liveData?.scraped_price && liveData.sync_status === 'success') {
    return {
      price: liveData.scraped_price,
      isLive: true,
      tier,
      lastSynced: liveData.last_synced_at,
    };
  }

  // Check for fallback override in database
  const overrideKey = `fallback_override_${tier}` as keyof LivePriceData;
  if (liveData && liveData[overrideKey] !== null) {
    return {
      price: liveData[overrideKey] as number,
      isLive: false,
      tier,
      isOverride: true,
    };
  }

  // Fall back to cost library
  if (fallbackItem) {
    return {
      price: fallbackItem.costTiers[tier],
      isLive: false,
      tier,
    };
  }

  // No price available
  return {
    price: 0,
    isLive: false,
    tier,
  };
}

export async function syncPricing(costLibraryId?: string): Promise<{
  success: boolean;
  synced: number;
  errors: number;
  message?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('sync-pricing', {
      body: costLibraryId 
        ? { cost_library_id: costLibraryId }
        : { sync_all: true },
    });

    if (error) {
      console.error('[pricingService] Sync error:', error);
      return { success: false, synced: 0, errors: 1, message: error.message };
    }

    // Invalidate cache after sync
    lastCacheUpdate = null;

    return {
      success: data.success,
      synced: data.synced || 0,
      errors: data.errors || 0,
      message: data.message,
    };
  } catch (err) {
    console.error('[pricingService] Sync exception:', err);
    return { success: false, synced: 0, errors: 1, message: String(err) };
  }
}

export async function updateProductMapping(
  costLibraryId: string,
  sourceUrl: string,
  productName?: string
): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('product_pricing')
    .upsert({
      cost_library_id: costLibraryId,
      source_url: sourceUrl,
      product_name: productName || COST_LIBRARY[costLibraryId]?.name || costLibraryId,
      is_active: true,
      sync_status: 'pending',
    }, {
      onConflict: 'cost_library_id',
    });

  if (error) {
    console.error('[pricingService] Update mapping error:', error);
    return false;
  }

  return true;
}

export async function toggleProductActive(
  costLibraryId: string, 
  isActive: boolean
): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('product_pricing')
    .update({ is_active: isActive })
    .eq('cost_library_id', costLibraryId);

  if (error) {
    console.error('[pricingService] Toggle active error:', error);
    return false;
  }

  return true;
}

export async function updateFallbackPrices(
  costLibraryId: string,
  prices: { low: number | null; mid: number | null; high: number | null }
): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('product_pricing')
    .upsert({
      cost_library_id: costLibraryId,
      product_name: COST_LIBRARY[costLibraryId]?.name || costLibraryId,
      fallback_override_low: prices.low,
      fallback_override_mid: prices.mid,
      fallback_override_high: prices.high,
      is_active: true,
    }, {
      onConflict: 'cost_library_id',
    });

  if (error) {
    console.error('[pricingService] Update fallback prices error:', error);
    return false;
  }

  // Invalidate cache
  lastCacheUpdate = null;
  return true;
}

// Hook for React components
export function useLivePricing() {
  return {
    fetchAllLivePricing,
    getLivePrice,
    syncPricing,
    updateProductMapping,
    toggleProductActive,
    updateFallbackPrices,
  };
}
