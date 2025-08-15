import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Package, RefreshCw } from "lucide-react";

interface EquipmentProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  allData: any;
}

// Product catalog as specified in requirements
const PRODUCT_CATALOG = [
  {"key":"batting_cages","label":"Batting Cages (70' x 15')","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"counts.baseball_tunnels || 0"},
  {"key":"pitching_machines","label":"Pitching Machines","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"Math.ceil((counts.baseball_tunnels||0)/2)"},
  {"key":"l_screens","label":"L-Screens / Protective Screens","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"counts.baseball_tunnels || 0"},
  {"key":"ball_carts","label":"Ball Carts / Buckets","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"Math.ceil((counts.baseball_tunnels||0)/2)"},
  {"key":"divider_curtains","label":"Divider Curtains/Nets","unit":"ea","min":0,"max":16,"step":1,"defaultFormula":"Math.max( (counts.volleyball_courts||0)-(1), (counts.pickleball_courts||0)-(1), (counts.basketball_courts_full||0)-(1), (counts.training_turf_zone||0)-(1) )"},
  {"key":"volleyball_systems","label":"Volleyball Systems (standards+net)","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"counts.volleyball_courts || 0"},
  {"key":"ref_stands","label":"Referee Stands","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"counts.volleyball_courts || 0"},
  {"key":"basketball_hoops","label":"Basketball Hoops/Goals","unit":"ea","min":0,"max":12,"step":1,"defaultFormula":"(counts.basketball_courts_full||0)*2 + (counts.basketball_courts_half||0)*1"},
  {"key":"scoreboards","label":"Scoreboards/Shot Clocks (set)","unit":"ea","min":0,"max":8,"step":1,"defaultFormula":"Math.max((counts.basketball_courts_full||0), (counts.volleyball_courts||0)>0?1:0)"},
  {"key":"pickleball_nets","label":"Pickleball Nets (portable/permanent)","unit":"ea","min":0,"max":16,"step":1,"defaultFormula":"counts.pickleball_courts || 0"},
  {"key":"paddle_starter_sets","label":"Pickleball Paddle Starter Sets (4 paddles + balls)","unit":"ea","min":0,"max":24,"step":1,"defaultFormula":"(counts.pickleball_courts||0) * 2"},
  {"key":"soccer_goals_pair","label":"Indoor Soccer Goals (pair)","unit":"ea","min":0,"max":6,"step":1,"defaultFormula":"counts.soccer_field_small || 0"},
  {"key":"training_turf_zone","label":"Training Turf Zones","unit":"ea","min":0,"max":4,"step":1,"defaultFormula":"counts.training_turf_zone || 0"},
  {"key":"turf_area_sf","label":"Indoor Turf (area)","unit":"sf","min":0,"maxFormula":"facility_plan.total_sqft || 0","step":100,"defaultFormula":"Math.round((facility_plan.total_sqft||0)*0.35/100)*100"},
  {"key":"hardwood_floor_area_sf","label":"Hardwood Flooring (area)","unit":"sf","min":0,"maxFormula":"facility_plan.total_sqft || 0","step":100,"defaultFormula":"(counts.basketball_courts_full||0)>0 ? Math.round((facility_plan.total_sqft||0)*0.30/100)*100 : 0"},
  {"key":"rubber_floor_area_sf","label":"Rubber Flooring (area)","unit":"sf","min":0,"maxFormula":"facility_plan.total_sqft || 0","step":100,"defaultFormula":"(counts.volleyball_courts||0)+(counts.pickleball_courts||0)>0 ? Math.round((facility_plan.total_sqft||0)*0.25/100)*100 : 0"}
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
  
  // Initialize quantities based on formulas
  const initializeQuantities = () => {
    const catalog = getFilteredCatalog();
    const quantities: any = {};
    
    catalog.forEach(item => {
      quantities[item.key] = calculateDefaultQuantity(item);
    });
    
    return quantities;
  };

  // Initialize form data with quantities
  const [formData, setFormData] = useState(() => {
    const initialQuantities = data.quantities || initializeQuantities();
    return {
      quantities: initialQuantities,
      ...data
    };
  });

  // Update quantities when dependencies change
  useEffect(() => {
    if (!data.quantities) {
      const newQuantities = initializeQuantities();
      const newData = { ...formData, quantities: newQuantities };
      setFormData(newData);
      onUpdate(newData);
    }
  }, [selectedSports, facilityPlan]);

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
        <h2 className="text-3xl font-bold mb-2">Product Quantities</h2>
        <p className="text-muted-foreground">
          We've loaded typical items for your chosen sports. Adjust quantities; you can refine costs later.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {filteredCatalog.map((item) => {
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
              <Card key={item.key}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {PRODUCT_HELPERS[item.key as keyof typeof PRODUCT_HELPERS]}
                        </p>
                        {item.unit === "sf" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Capped at building gross SF.
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetToTypical(item.key)}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Typical
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium min-w-12">
                          {item.unit}:
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
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: {item.min}</span>
                        <span>Current: {currentValue.toLocaleString()} {item.unit}</span>
                        <span>Max: {maxBound.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredCatalog.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Equipment Selected</h3>
                <p className="text-muted-foreground">
                  Please select sports in the Project Basics step to see relevant equipment.
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