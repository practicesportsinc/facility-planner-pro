import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, RefreshCw, Check } from "lucide-react";
import { COST_LIBRARY, calculateItemTotal } from "@/data/costLibrary";

interface EquipmentProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

// Product catalog as specified in requirements
const PRODUCT_CATALOG = [
  {"key":"batting_cages","label":"Batting Cages (70' x 15')","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"counts.baseball_tunnels || 0","description":"Each = one 70′ × 15′ tunnel (hardware + net)"},
  {"key":"pitching_machines","label":"Pitching Machines","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"Math.ceil((counts.baseball_tunnels||0)/2)","description":"Professional pitching machines for batting practice"},
  {"key":"l_screens","label":"L-Screens / Protective Screens","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"counts.baseball_tunnels || 0","description":"Safety screens for batting practice"},
  {"key":"ball_carts","label":"Ball Carts / Buckets","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"Math.ceil((counts.baseball_tunnels||0)/2)","description":"Ball storage and transport carts"},
  {"key":"divider_curtains","label":"Divider Curtains/Nets","unit":"ea","min":0,"max":16,"step":1,"defaultFormula":"Math.max( (counts.volleyball_courts||0)-(1), (counts.pickleball_courts||0)-(1), (counts.basketball_courts_full||0)-(1), (counts.training_turf_zone||0)-(1) )","description":"Motorized or manual court/turf dividers"},
  {"key":"volleyball_systems","label":"Volleyball Systems (standards+net)","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"counts.volleyball_courts || 0","description":"Professional volleyball net systems"},
  {"key":"ref_stands","label":"Referee Stands","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"counts.volleyball_courts || 0","description":"Referee chairs for volleyball games"},
  {"key":"basketball_hoops","label":"Basketball Hoops/Goals","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"(counts.basketball_courts_full||0)*2 + (counts.basketball_courts_half||0)*1","description":"Professional basketball goal systems"},
  {"key":"scoreboards","label":"Scoreboards/Shot Clocks (set)","unit":"ea","min":0,"max":8,"step":1,"defaultFormula":"Math.max((counts.basketball_courts_full||0), (counts.volleyball_courts||0)>0?1:0)","description":"Electronic scoreboards and shot clocks"},
  {"key":"pickleball_nets","label":"Pickleball Nets (portable/permanent)","unit":"ea","min":0,"max":16,"step":1,"defaultFormula":"counts.pickleball_courts || 0","description":"Pickleball net systems"},
  {"key":"paddle_starter_sets","label":"Pickleball Paddle Starter Sets (4 paddles + balls)","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"(counts.pickleball_courts||0) * 2","description":"Starter paddle and ball sets"},
  {"key":"soccer_goals_pair","label":"Indoor Soccer Goals (pair)","unit":"ea","min":0,"max":6,"step":1,"defaultFormula":"counts.soccer_field_small || 0","description":"Indoor soccer goal pairs"},
  {"key":"training_turf_zone","label":"Training Turf Zones","unit":"ea","min":0,"max":4,"step":1,"defaultFormula":"counts.training_turf_zone || 0","description":"Designated training areas with turf"},
  {"key":"turf_area_sf","label":"Indoor Turf (area)","unit":"sf","min":0,"maxFormula":"facility_plan.total_sqft || 0","step":100,"defaultFormula":"Math.round((facility_plan.total_sqft||0)*0.35/100)*100","description":"Approximate coverage area; refine later per court count"},
  {"key":"hardwood_floor_area_sf","label":"Hardwood Flooring (area)","unit":"sf","min":0,"maxFormula":"facility_plan.total_sqft || 0","step":100,"defaultFormula":"(counts.basketball_courts_full||0)>0 ? Math.round((facility_plan.total_sqft||0)*0.30/100)*100 : 0","description":"Professional sport court flooring"},
  {"key":"rubber_floor_area_sf","label":"Rubber Flooring (area)","unit":"sf","min":0,"maxFormula":"facility_plan.total_sqft || 0","step":100,"defaultFormula":"(counts.volleyball_courts||0)+(counts.pickleball_courts||0)>0 ? Math.round((facility_plan.total_sqft||0)*0.25/100)*100 : 0","description":"Safety and fitness rubber flooring"}
];

// Sport to products mapping
const SPORT_PRODUCT_MAP = {
  "baseball_softball": ["batting_cages","pitching_machines","l_screens","ball_carts","divider_curtains","turf_area_sf"],
  "basketball": ["basketball_hoops","scoreboards","hardwood_floor_area_sf","divider_curtains"],
  "volleyball": ["volleyball_systems","ref_stands","scoreboards","rubber_floor_area_sf","divider_curtains"],
  "pickleball": ["pickleball_nets","paddle_starter_sets","rubber_floor_area_sf","divider_curtains"],
  "soccer_indoor_small_sided": ["soccer_goals_pair","turf_area_sf","divider_curtains","training_turf_zone"],
  "multi_sport": ["divider_curtains","turf_area_sf","rubber_floor_area_sf","scoreboards"]
};

// Helper tooltips for UX
const PRODUCT_HELPERS = {
  "batting_cages": "1 per tunnel is typical.",
  "basketball_hoops": "Full court = 2 hoops; half court = 1.",
  "volleyball_systems": "1 per court.",
  "pickleball_nets": "1 per court. Starter sets optional.",
  "divider_curtains": "Use to separate courts/zones.",
  "turf_area_sf": "Area estimate; refine by zone later.",
  "rubber_floor_area_sf": "Area estimate; refine by zone later.",
  "hardwood_floor_area_sf": "Area estimate; refine by zone later."
};

// Helper function max that treats missing values as 0
const max = (...args: number[]) => Math.max(...args.map(x => x || 0));

// Coerce array function to handle different data shapes
function coerceArray(x: any): string[] {
  if (Array.isArray(x)) return x;
  if (typeof x === "string") {
    try {
      const v = JSON.parse(x);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Custom hook for product defaults with controlled state
function useProductDefaults({
  selectedSports,
  facilitySqft,
  countsFromLayout,
  persistedSelected,
  persistedQuantities
}: {
  selectedSports: string[];
  facilitySqft: number;
  countsFromLayout: Record<string, number>;
  persistedSelected?: string[] | null;
  persistedQuantities?: Record<string, number> | null;
}) {
  // Derive default set from sports
  const defaultSet = useMemo(() => {
    const set = new Set<string>();
    selectedSports.forEach(s => (SPORT_PRODUCT_MAP[s as keyof typeof SPORT_PRODUCT_MAP] || []).forEach(k => set.add(k)));
    return set;
  }, [selectedSports]);

  // Local state driving the controlled checkboxes & sliders
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [qty, setQty] = useState<Record<string, number>>({});

  // Guard to run init only once on first mount
  const inited = useRef(false);

  // Key assertion to catch mismatches
  const CATALOG_KEYS = useMemo(() => new Set(PRODUCT_CATALOG.map(p => p.key)), []);
  
  useEffect(() => {
    const bad = Array.from(selected).filter(k => !CATALOG_KEYS.has(k));
    if (bad.length) console.warn("Unknown product keys in selected_products:", bad);
  }, [selected, CATALOG_KEYS]);

  useLayoutEffect(() => {
    if (inited.current) return;
    inited.current = true;

    console.log('Equipment initialization:', {
      selectedSports,
      defaultSet: Array.from(defaultSet),
      persistedSelected,
      persistedQuantities
    });

    // Prefer persisted set; else derive from sports
    const persistedSel = coerceArray(persistedSelected);
    const initialSelected = new Set(persistedSel.length ? persistedSel : Array.from(defaultSet));

    console.log('Initial selected products:', Array.from(initialSelected));

    // Seed quantities (clamp area to gross SF)
    const initialQty: Record<string, number> = { ...(persistedQuantities || {}) };
    for (const key of initialSelected) {
      if (initialQty[key] == null) initialQty[key] = defaultQtyFor(key, facilitySqft, countsFromLayout);
    }
    
    // Clamp surface areas to facility sqft
    ["turf_area_sf","rubber_floor_area_sf","hardwood_floor_area_sf"].forEach(k => {
      if (initialQty[k] != null) initialQty[k] = Math.min(Math.max(0, initialQty[k]), facilitySqft);
    });

    setSelected(initialSelected);
    setQty(initialQty);
  }, [defaultSet, facilitySqft, countsFromLayout, persistedSelected, persistedQuantities]);

  // Toggle & quantity setters
  function toggle(key: string) {
    const qtyVal = qty[key] ?? 0;
    const isChecked = selected.has(key) || qtyVal > 0;
    
    if (isChecked) {
      // turning OFF → remove from set and zero the qty
      setSelected(prev => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
      setQty(q => ({ ...q, [key]: 0 }));
    } else {
      // turning ON → add to set and seed a default quantity if empty
      setSelected(prev => {
        const n = new Set(prev);
        n.add(key);
        return n;
      });
      setQty(q => ({ ...q, [key]: q[key] ?? defaultQtyFor(key, facilitySqft, countsFromLayout) }));
    }
  }
  function setQuantity(key: string, val: number) {
    setQty(q => ({ ...q, [key]: val }));
  }

  return { selected, qty, toggle, setQuantity };
}

// Default quantity formulas
function defaultQtyFor(key: string, totalSf: number, c: Record<string, number>) {
  switch (key) {
    case "batting_cages": return c.baseball_tunnels || 2;
    case "pitching_machines": return Math.ceil((c.baseball_tunnels || 0) / 2);
    case "l_screens": return c.baseball_tunnels || 2;
    case "ball_carts": return Math.ceil((c.baseball_tunnels || 0) / 2);
    case "volleyball_systems": return c.volleyball_courts || 0;
    case "ref_stands": return c.volleyball_courts || 0;
    case "basketball_hoops": return (c.basketball_courts_full || 0) * 2 + (c.basketball_courts_half || 0);
    case "scoreboards": return Math.max(c.basketball_courts_full || 0, (c.volleyball_courts || 0) > 0 ? 1 : 0);
    case "pickleball_nets": return c.pickleball_courts || 0;
    case "paddle_starter_sets": return (c.pickleball_courts || 0) * 2;
    case "soccer_goals_pair": return c.soccer_field_small || 0;
    case "training_turf_zone": return c.training_turf_zone || 0;
    case "turf_area_sf": return Math.round(totalSf * 0.35 / 100) * 100;
    case "rubber_floor_area_sf": return Math.round(totalSf * 0.25 / 100) * 100;
    case "hardwood_floor_area_sf": return (c.basketball_courts_full || 0) > 0 ? Math.round(totalSf * 0.30 / 100) * 100 : 0;
    case "divider_curtains": {
      const spans = (c.volleyball_courts || 0) + (c.pickleball_courts || 0) + (c.basketball_courts_full || 0) + (c.training_turf_zone || 0);
      return Math.max(0, spans - 1);
    }
    default: return 0;
  }
}

const Equipment = ({ data, onUpdate, onNext, onPrevious, allData }: EquipmentProps) => {
  const selectedSports = allData[1]?.selectedSports || [];
  const facilityPlan = allData[3] || {};
  
  // Extract counts from facility plan
  const counts = {
    baseball_tunnels: Number(facilityPlan.numberOfCages) || 0,
    volleyball_courts: Number(facilityPlan.numberOfCourts) || 0,
    basketball_courts_full: Number(facilityPlan.numberOfCourts) || 0,
    basketball_courts_half: 0,
    pickleball_courts: Number(facilityPlan.numberOfCourts) || 0,
    soccer_field_small: Number(facilityPlan.numberOfFields) || 0,
    training_turf_zone: 1
  };
  
  const facilitySqft = Number(facilityPlan.totalSquareFootage) || 0;

  // Use the controlled hook instead of local state
  const { selected, qty, toggle, setQuantity } = useProductDefaults({
    selectedSports,
    facilitySqft,
    countsFromLayout: counts,
    persistedSelected: data?.selectedProducts,
    persistedQuantities: data?.quantities
  });

  // Build allowed products set based on selected sports
  const getAllowedProducts = () => {
    const allowed = new Set<string>();
    
    // Add products for selected sports
    selectedSports.forEach((sport: string) => {
      const products = SPORT_PRODUCT_MAP[sport as keyof typeof SPORT_PRODUCT_MAP] || [];
      products.forEach(product => allowed.add(product));
    });
    
    return allowed;
  };
  
  // Get filtered catalog based on selected sports
  const getFilteredCatalog = () => {
    const allowed = getAllowedProducts();
    return PRODUCT_CATALOG.filter(item => allowed.has(item.key));
  };

  // Calculate total estimated cost using mid-tier pricing (reactive to qty changes)
  const totalEstimatedCost = useMemo(() => {
    let total = 0;
    
    Array.from(selected).forEach(productKey => {
      const quantity = qty[productKey] || 0;
      if (quantity <= 0) return;
      
      // Map product keys to cost library items
      const costItemMapping: Record<string, string> = {
        'batting_cages': 'baseball_batting_cage',
        'pitching_machines': 'baseball_pitching_machine',
        'l_screens': 'baseball_l_screen',
        'ball_carts': 'baseball_ball_cart',
        'volleyball_systems': 'volleyball_net_system',
        'ref_stands': 'volleyball_referee_stand',
        'basketball_hoops': 'basketball_hoop',
        'scoreboards': 'basketball_scoreboard',
        'pickleball_nets': 'pickleball_net',
        'paddle_starter_sets': 'pickleball_paddle_set',
        'soccer_goals_pair': 'soccer_goals',
        'divider_curtains': 'divider_curtains',
        'turf_area_sf': 'indoor_turf',
        'rubber_floor_area_sf': 'rubber_flooring',
        'hardwood_floor_area_sf': 'hardwood_flooring'
      };
      
      const costItemId = costItemMapping[productKey];
      if (!costItemId) return;
      
      const costItem = COST_LIBRARY[costItemId];
      if (!costItem) return;
      
      try {
        const itemTotal = calculateItemTotal(costItem, quantity, 'mid');
        total += itemTotal;
      } catch (error) {
        console.warn(`Error calculating cost for ${productKey}:`, error);
      }
    });
    
    return total;
  }, [selected, qty]);

  // Persist on every change
  useEffect(() => {
    const baseEquipmentCost = totalEstimatedCost;
    const installationEstimate = Math.round(baseEquipmentCost * 0.3);
    const equipmentTotal = baseEquipmentCost + installationEstimate;
    
    onUpdate({
      selectedProducts: Array.from(selected),
      quantities: qty,
      equipmentCost: baseEquipmentCost,
      installationEstimate,
      equipmentTotal
    });
  }, [selected, qty, onUpdate, totalEstimatedCost]);

  const handleQuantityChange = (key: string, newQuantity: number[]) => {
    setQuantity(key, newQuantity[0]);
  };

  const handleInputChange = (key: string, value: string) => {
    const numValue = Math.max(0, Number(value) || 0);
    setQuantity(key, numValue);
  };

  const resetToTypical = (key: string) => {
    const defaultValue = defaultQtyFor(key, facilitySqft, counts);
    setQuantity(key, defaultValue);
  };

  const filteredCatalog = getFilteredCatalog();

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Select Products & Set Quantities</h2>
        <p className="text-muted-foreground">
          We've pre-selected typical items for your chosen sports. Select/deselect products and adjust quantities as needed.
        </p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <Badge variant="outline" className="text-sm">
            {selectedSports.join(", ")} 
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {selected.size} products selected
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {filteredCatalog.map((item) => {
            const qtyVal = qty[item.key] ?? 0;
            // derive checked from either set OR qty - single source of truth
            const isSelected = selected.has(item.key) || qtyVal > 0;
            const currentValue = qtyVal;
            
            // Calculate max bound
            let maxBound = item.max;
            if (item.maxFormula) {
              try {
                const maxFunc = new Function('counts', 'facility_plan', 'Math', 'max', `return ${item.maxFormula}`);
                maxBound = maxFunc(counts, { total_sqft: facilitySqft }, Math, max);
              } catch {
                maxBound = item.max;
              }
            }

            return (
              <Card 
                key={item.key}
                className={`transition-all duration-200 ${
                  isSelected 
                    ? 'border-primary shadow-custom-sm bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Product Selection Header */}
                    <div className="flex items-start justify-between">
                    <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => toggle(item.key)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggle(item.key)}
                            className="mt-1"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{item.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Unit: {item.unit}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {PRODUCT_HELPERS[item.key as keyof typeof PRODUCT_HELPERS]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetToTypical(item.key)}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Typical
                        </Button>
                      )}
                    </div>

                    {/* Quantity Controls - only show if selected */}
                    {isSelected && (
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-4">
                          <Label className="text-sm font-medium min-w-16">
                            Quantity:
                          </Label>
                          <div className="flex-1">
                            <Slider
                              value={[currentValue]}
                              onValueChange={(value) => handleQuantityChange(item.key, value)}
                              min={item.min}
                              max={maxBound}
                              step={item.step}
                              className="flex-1"
                            />
                          </div>
                          <Input
                            type="number"
                            value={currentValue}
                            onChange={(e) => handleInputChange(item.key, e.target.value)}
                            min={item.min}
                            max={maxBound}
                            step={item.step}
                            className="w-20 text-center"
                          />
                          <span className="text-sm text-muted-foreground min-w-8">
                            {item.unit}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Min: {item.min}</span>
                          <span>Current: {currentValue.toLocaleString()} {item.unit}</span>
                          <span>Max: {maxBound.toLocaleString()}</span>
                        </div>
                        
                        {item.unit === "sf" && (
                          <p className="text-xs text-muted-foreground">
                            💡 Capped at building gross SF. Area estimates can be refined later.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredCatalog.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
                <p className="text-muted-foreground">
                  Please select sports in the Project Basics step to see relevant products.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Equipment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Selected Sports:</span>
                    <span>{selectedSports.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product Types:</span>
                    <span>{filteredCatalog.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>
                      {Object.values(qty).reduce((sum: number, qty: any) => sum + (Number(qty) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Equipment Subtotal:</span>
                    <span className="font-medium">{formatCurrency(totalEstimatedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installation estimate (30%):</span>
                    <span className="font-medium">{formatCurrency(Math.round(totalEstimatedCost * 0.3))}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total (equipment + installation):</span>
                    <span className="text-primary">{formatCurrency(totalEstimatedCost + Math.round(totalEstimatedCost * 0.3))}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on mid-tier quality pricing for {selected.size} selected products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="hero" onClick={onNext}>
          Continue to Financials
        </Button>
      </div>
    </div>
  );
};

export default Equipment;