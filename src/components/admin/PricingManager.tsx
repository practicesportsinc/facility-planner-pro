import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, XCircle, Clock, ExternalLink, Loader2, Pencil } from "lucide-react";
import { COST_LIBRARY } from "@/data/costLibrary";
import { 
  fetchAllLivePricing, 
  syncPricing, 
  updateProductMapping,
  toggleProductActive,
  updateFallbackPrices,
  LivePriceData 
} from "@/services/pricingService";

export function PricingManager() {
  const [livePrices, setLivePrices] = useState<LivePriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingItem, setSyncingItem] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [editingFallback, setEditingFallback] = useState<string | null>(null);
  const [fallbackInputs, setFallbackInputs] = useState({ low: "", mid: "", high: "" });

  useEffect(() => {
    loadPricing();
  }, []);

  async function loadPricing() {
    setIsLoading(true);
    const data = await fetchAllLivePricing();
    setLivePrices(data);
    setIsLoading(false);
  }

  async function handleSyncAll() {
    setIsSyncing(true);
    toast.info("Starting price sync for all products...");
    
    const result = await syncPricing();
    
    if (result.success) {
      toast.success(`Synced ${result.synced} products. ${result.errors} errors.`);
      await loadPricing();
    } else {
      toast.error(`Sync failed: ${result.message}`);
    }
    
    setIsSyncing(false);
  }

  async function handleSyncOne(costLibraryId: string) {
    setSyncingItem(costLibraryId);
    
    const result = await syncPricing(costLibraryId);
    
    if (result.success) {
      toast.success(`Synced ${costLibraryId}`);
      await loadPricing();
    } else {
      toast.error(`Failed to sync ${costLibraryId}`);
    }
    
    setSyncingItem(null);
  }

  async function handleSaveUrl(costLibraryId: string) {
    const success = await updateProductMapping(costLibraryId, urlInput);
    
    if (success) {
      toast.success("URL updated");
      await loadPricing();
    } else {
      toast.error("Failed to update URL");
    }
    
    setEditingUrl(null);
    setUrlInput("");
  }

  async function handleToggleActive(costLibraryId: string, currentActive: boolean) {
    const success = await toggleProductActive(costLibraryId, !currentActive);
    
    if (success) {
      toast.success(`${costLibraryId} ${!currentActive ? 'enabled' : 'disabled'}`);
      await loadPricing();
    }
  }

  async function handleSaveFallback(costLibraryId: string) {
    const prices = {
      low: fallbackInputs.low ? parseFloat(fallbackInputs.low) : null,
      mid: fallbackInputs.mid ? parseFloat(fallbackInputs.mid) : null,
      high: fallbackInputs.high ? parseFloat(fallbackInputs.high) : null,
    };

    const success = await updateFallbackPrices(costLibraryId, prices);
    
    if (success) {
      toast.success("Fallback prices updated");
      await loadPricing();
    } else {
      toast.error("Failed to update fallback prices");
    }
    
    setEditingFallback(null);
    setFallbackInputs({ low: "", mid: "", high: "" });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Synced</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case 'no_price_found':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> No Price</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  }

  function formatPrice(price: number | null) {
    if (price === null) return "—";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  }

  // Merge live prices with cost library to show all items
  const allItems = Object.entries(COST_LIBRARY).map(([id, item]) => {
    const liveData = livePrices.find(p => p.cost_library_id === id);
    return {
      id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      fallbackDefault: item.costTiers,
      fallbackOverride: {
        low: liveData?.fallback_override_low ?? null,
        mid: liveData?.fallback_override_mid ?? null,
        high: liveData?.fallback_override_high ?? null,
      },
      livePrice: liveData?.scraped_price || null,
      sourceUrl: liveData?.source_url || null,
      lastSynced: liveData?.last_synced_at || null,
      syncStatus: liveData?.sync_status || 'not_configured',
      syncError: liveData?.sync_error || null,
      isActive: liveData?.is_active ?? false,
      hasLiveConfig: !!liveData,
      hasOverride: liveData?.fallback_override_low !== null || 
                   liveData?.fallback_override_mid !== null || 
                   liveData?.fallback_override_high !== null,
    };
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Live Pricing Manager</CardTitle>
              <CardDescription>
                Sync prices from practicesports.com via Firecrawl. ~1 credit per product synced.
              </CardDescription>
            </div>
            <Button 
              onClick={handleSyncAll} 
              disabled={isSyncing}
              className="bg-gradient-primary"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync All ({livePrices.filter(p => p.is_active).length} products)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <strong>Configured:</strong> {livePrices.length} products | 
            <strong className="ml-2">Active:</strong> {livePrices.filter(p => p.is_active).length} | 
            <strong className="ml-2">Synced:</strong> {livePrices.filter(p => p.sync_status === 'success').length}
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {allItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 border rounded-lg ${!item.isActive && item.hasLiveConfig ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      {item.hasLiveConfig && getStatusBadge(item.syncStatus)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {/* Fallback Prices Section */}
                      {editingFallback === item.id ? (
                        <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                          <div className="text-xs font-medium">Edit Fallback Prices (per {item.unit})</div>
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <label className="text-xs text-muted-foreground">Low</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={fallbackInputs.low}
                                onChange={(e) => setFallbackInputs(prev => ({ ...prev, low: e.target.value }))}
                                placeholder={item.fallbackDefault.low.toString()}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-muted-foreground">Mid</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={fallbackInputs.mid}
                                onChange={(e) => setFallbackInputs(prev => ({ ...prev, mid: e.target.value }))}
                                placeholder={item.fallbackDefault.mid.toString()}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-muted-foreground">High</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={fallbackInputs.high}
                                onChange={(e) => setFallbackInputs(prev => ({ ...prev, high: e.target.value }))}
                                placeholder={item.fallbackDefault.high.toString()}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveFallback(item.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingFallback(null);
                              setFallbackInputs({ low: "", mid: "", high: "" });
                            }}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            <strong>Fallback:</strong>{" "}
                            {item.hasOverride ? (
                              <span className="text-amber-600">
                                ${item.fallbackOverride.low ?? item.fallbackDefault.low} / 
                                ${item.fallbackOverride.mid ?? item.fallbackDefault.mid} / 
                                ${item.fallbackOverride.high ?? item.fallbackDefault.high}
                                <Badge variant="outline" className="ml-1 text-xs">override</Badge>
                              </span>
                            ) : (
                              <span>
                                ${item.fallbackDefault.low} / ${item.fallbackDefault.mid} / ${item.fallbackDefault.high}
                              </span>
                            )}
                            /{item.unit}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingFallback(item.id);
                              setFallbackInputs({
                                low: item.fallbackOverride.low?.toString() || "",
                                mid: item.fallbackOverride.mid?.toString() || "",
                                high: item.fallbackOverride.high?.toString() || "",
                              });
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {item.livePrice && (
                        <div className="text-green-600">
                          <strong>Live:</strong> {formatPrice(item.livePrice)}/{item.unit}
                        </div>
                      )}
                      
                      {editingUrl === item.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://practicesports.com/product/..."
                            className="text-sm"
                          />
                          <Button size="sm" onClick={() => handleSaveUrl(item.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingUrl(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {item.sourceUrl ? (
                            <a 
                              href={item.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 truncate max-w-md"
                            >
                              {item.sourceUrl.replace('https://practicesports.com', '')}
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic">No URL configured</span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingUrl(item.id);
                              setUrlInput(item.sourceUrl || '');
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                      
                      {item.lastSynced && (
                        <div className="text-xs">Last synced: {formatDate(item.lastSynced)}</div>
                      )}
                      
                      {item.syncError && (
                        <div className="text-xs text-destructive">Error: {item.syncError}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {item.hasLiveConfig && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncOne(item.id)}
                          disabled={syncingItem === item.id || !item.isActive}
                        >
                          {syncingItem === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant={item.isActive ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                        >
                          {item.isActive ? "Disable" : "Enable"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
