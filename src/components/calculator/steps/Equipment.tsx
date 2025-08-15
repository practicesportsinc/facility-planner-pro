import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Package, RefreshCw, Check } from "lucide-react";

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
  
  // Map total_sqft from facility plan
  const facility_plan = {
    total_sqft: Number(facilityPlan.totalSquareFootage) || 0
  };
  
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
  
  // Calculate default quantity using formula
  const calculateDefaultQuantity = (item: any) => {
    try {
      // Use Function constructor for safe evaluation
      const formula = item.defaultFormula;
      const func = new Function('counts', 'facility_plan', 'Math', 'max', `return ${formula}`);
      const result = func(counts, facility_plan, Math, max);
      
      // Calculate max bound
      let maxBound = item.max;
      if (item.maxFormula) {
        const maxFunc = new Function('counts', 'facility_plan', 'Math', 'max', `return ${item.maxFormula}`);
        maxBound = maxFunc(counts, facility_plan, Math, max);
      }
      
      // Clamp result between min and max
      return Math.max(item.min, Math.min(result || 0, maxBound));
    } catch (error) {
      console.error('Error calculating default for', item.key, error);
      return item.min;
    }
  };
  
  // Initialize quantities and selection based on formulas
  const initializeData = () => {
    const catalog = getFilteredCatalog();
    const quantities: any = {};
    const selectedProducts = new Set<string>();
    
    catalog.forEach(item => {
      const defaultQty = calculateDefaultQuantity(item);
      quantities[item.key] = defaultQty;
      // Auto-select all products by default
      selectedProducts.add(item.key);
    });
    
    return {
      quantities,
      selectedProducts: Array.from(selectedProducts)
    };
  };

  // Initialize form data with quantities and selection
  const [formData, setFormData] = useState(() => {
    const initialData = data.selectedProducts && data.quantities ? 
      { selectedProducts: data.selectedProducts || [], quantities: data.quantities || {} } :
      initializeData();
    
    return {
      selectedProducts: initialData.selectedProducts,
      quantities: initialData.quantities,
      ...data
    };
  });

  // Update data when dependencies change
  useEffect(() => {
    if (!data.quantities || !data.selectedProducts) {
      const newData = initializeData();
      const updatedData = { ...formData, ...newData };
      setFormData(updatedData);
      onUpdate(updatedData);
    }
  }, [selectedSports, facilityPlan]);

  const handleProductToggle = (productKey: string) => {
    const isSelected = formData.selectedProducts.includes(productKey);
    const updatedSelection = isSelected 
      ? formData.selectedProducts.filter(key => key !== productKey)
      : [...formData.selectedProducts, productKey];
    
    // If deselecting, set quantity to 0
    const updatedQuantities = { ...formData.quantities };
    if (isSelected) {
      updatedQuantities[productKey] = 0;
    } else {
      // If selecting, set to default quantity
      const item = PRODUCT_CATALOG.find(p => p.key === productKey);
      if (item) {
        updatedQuantities[productKey] = calculateDefaultQuantity(item);
      }
    }
    
    const newData = { 
      ...formData, 
      selectedProducts: updatedSelection,
      quantities: updatedQuantities
    };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleQuantityChange = (key: string, newQuantity: number[]) => {
    const updatedQuantities = { 
      ...formData.quantities, 
      [key]: newQuantity[0] 
    };
    
    const newData = { ...formData, quantities: updatedQuantities };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleInputChange = (key: string, value: string) => {
    const numValue = Math.max(0, Number(value) || 0);
    const updatedQuantities = { 
      ...formData.quantities, 
      [key]: numValue 
    };
    
    const newData = { ...formData, quantities: updatedQuantities };
    setFormData(newData);
    onUpdate(newData);
  };

  const resetToTypical = (key: string) => {
    const item = PRODUCT_CATALOG.find(p => p.key === key);
    if (item) {
      const defaultValue = calculateDefaultQuantity(item);
      const updatedQuantities = { 
        ...formData.quantities, 
        [key]: defaultValue 
      };
      
      const newData = { ...formData, quantities: updatedQuantities };
      setFormData(newData);
      onUpdate(newData);
    }
  };

  const filteredCatalog = getFilteredCatalog();

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
            {formData.selectedProducts?.length || 0} products selected
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {filteredCatalog.map((item) => {
            const isSelected = formData.selectedProducts?.includes(item.key) || false;
            const currentValue = formData.quantities[item.key] || 0;
            
            // Calculate max bound
            let maxBound = item.max;
            if (item.maxFormula) {
              try {
                const maxFunc = new Function('counts', 'facility_plan', 'Math', 'max', `return ${item.maxFormula}`);
                maxBound = maxFunc(counts, facility_plan, Math, max);
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
                        onClick={() => handleProductToggle(item.key)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-primary border-primary text-primary-foreground' 
                              : 'border-muted-foreground/30 hover:border-primary'
                          }`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
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
                      {Object.values(formData.quantities).reduce((sum: number, qty: any) => sum + (Number(qty) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  💡 Quantities are based on your facility layout. You'll set specific costs in the next step.
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