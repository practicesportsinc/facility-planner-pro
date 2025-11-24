import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ProductItem {
  key: string;
  label: string;
  unit: string;
  min: number;
  max?: number;
}

interface ProductQuantitiesProps {
  title: string;
  subtitle: string;
  catalog: ProductItem[];
  primaryCta: {
    label: string;
    route: string;
  };
}

export const ProductQuantities = ({
  title,
  subtitle,
  catalog,
  primaryCta,
}: ProductQuantitiesProps) => {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Initialize products and quantities based on selected sports and facility data
  useEffect(() => {
    const sports: string[] = JSON.parse(localStorage.getItem('wizard-selected-sports') || '[]');
    const facilityData = JSON.parse(localStorage.getItem('wizard-facility-size') || '{}');
    
    const sportProductMap: Record<string, string[]> = {
      baseball_softball: ["batting_cages", "pitching_machines", "l_screens", "ball_carts", "divider_curtains", "turf_area_sf"],
      basketball: ["basketball_hoops", "scoreboards", "hardwood_floor_area_sf", "divider_curtains"],
      volleyball: ["volleyball_systems", "ref_stands", "scoreboards", "rubber_floor_area_sf", "divider_curtains"],
      pickleball: ["pickleball_nets", "paddle_starter_sets", "rubber_floor_area_sf", "divider_curtains"],
      soccer_indoor_small_sided: ["soccer_goals_pair", "turf_area_sf", "divider_curtains", "training_turf_zone"],
      multi_sport: ["divider_curtains", "turf_area_sf", "rubber_floor_area_sf", "scoreboards"]
    };

    // Get products for selected sports
    const defaultProducts = Array.from(new Set(
      sports.flatMap(sport => sportProductMap[sport] || [])
    ));

    const totalSf = facilityData.total_sqft || 0;
    const counts = facilityData.court_or_cage_counts || {};

    // Calculate default quantities
    const defaultQuantities: Record<string, number> = {};
    
    const getDefaultQuantity = (key: string): number => {
      switch (key) {
        case "batting_cages": return counts.baseball_tunnels || 2;
        case "pitching_machines": return Math.ceil((counts.baseball_tunnels || 0) / 2);
        case "l_screens": return counts.baseball_tunnels || 2;
        case "ball_carts": return Math.ceil((counts.baseball_tunnels || 0) / 2);
        case "volleyball_systems": return counts.volleyball_courts || 0;
        case "ref_stands": return counts.volleyball_courts || 0;
        case "basketball_hoops": return (counts.basketball_courts_full || 0) * 2 + (counts.basketball_courts_half || 0);
        case "scoreboards": return Math.max((counts.basketball_courts_full || 0), (counts.volleyball_courts || 0) > 0 ? 1 : 0);
        case "pickleball_nets": return counts.pickleball_courts || 0;
        case "paddle_starter_sets": return (counts.pickleball_courts || 0) * 2;
        case "soccer_goals_pair": return counts.soccer_field_small || 0;
        case "training_turf_zone": return counts.training_turf_zone || 0;
        case "turf_area_sf": return Math.round(totalSf * 0.35 / 100) * 100;
        case "rubber_floor_area_sf": return Math.round(totalSf * 0.25 / 100) * 100;
        case "hardwood_floor_area_sf": return (counts.basketball_courts_full || 0) > 0 ? Math.round(totalSf * 0.30 / 100) * 100 : 0;
        case "divider_curtains": return Math.max(0, (counts.volleyball_courts || 0) + (counts.pickleball_courts || 0) + (counts.basketball_courts_full || 0) + (counts.training_turf_zone || 0) - 1);
        default: return 0;
      }
    };

    defaultProducts.forEach(key => {
      defaultQuantities[key] = getDefaultQuantity(key);
    });

    // Clamp SF quantities to total_sqft
    ["turf_area_sf", "rubber_floor_area_sf", "hardwood_floor_area_sf"].forEach(key => {
      if (defaultQuantities[key] > totalSf) defaultQuantities[key] = totalSf;
      if (defaultQuantities[key] < 0) defaultQuantities[key] = 0;
    });

    setSelectedProducts(defaultProducts);
    setQuantities(defaultQuantities);

    // Fire analytics event
    console.log("Products autoselected:", { defaultProducts, defaultQuantities });
  }, []);

  const handleProductToggle = (productKey: string, checked: boolean) => {
    const newSelected = checked 
      ? [...selectedProducts, productKey]
      : selectedProducts.filter(p => p !== productKey);
    
    setSelectedProducts(newSelected);
    
    if (checked && !quantities[productKey]) {
      // Set default quantity when first selected
      setQuantities(prev => ({ ...prev, [productKey]: 1 }));
    } else if (!checked) {
      // Set quantity to 0 when deselected
      setQuantities(prev => ({ ...prev, [productKey]: 0 }));
    }
  };

  const handleQuantityChange = (productKey: string, value: number[]) => {
    setQuantities(prev => ({ ...prev, [productKey]: value[0] }));
  };

  const handleContinue = () => {
    // Save product data to localStorage
    localStorage.setItem('wizard-products', JSON.stringify({
      selected_products: selectedProducts,
      quantities: quantities
    }));
    navigate(primaryCta.route);
  };

  const facilityData = localStorage.getItem('wizard-facility-size');
  const totalSqft = facilityData ? JSON.parse(facilityData).total_sqft || 0 : 0;

  const getMaxQuantity = (item: ProductItem): number => {
    if (["turf_area_sf", "rubber_floor_area_sf", "hardwood_floor_area_sf"].includes(item.key)) {
      return totalSqft;
    }
    return item.max || 50;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ps-text mb-4">{title}</h1>
          <p className="text-lg muted">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {catalog.map((item) => {
            const isSelected = selectedProducts.includes(item.key) || (quantities[item.key] || 0) > 0;
            const quantity = quantities[item.key] || 0;
            const maxQuantity = getMaxQuantity(item);
            
            return (
              <Card key={item.key} className="ps-card p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    id={item.key}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleProductToggle(item.key, checked as boolean)}
                  />
                  
                  <div className="flex-1">
                    <Label htmlFor={item.key} className="text-base font-semibold text-ps-text cursor-pointer">
                      {item.label}
                    </Label>
                    
                    {isSelected && (
                      <div className="mt-4">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm muted">Quantity:</span>
                          <span className="font-semibold">{quantity} {item.unit}</span>
                        </div>
                        
                        <Slider
                          value={[quantity]}
                          onValueChange={(value) => handleQuantityChange(item.key, value)}
                          max={maxQuantity}
                          min={item.min}
                          step={item.unit === 'sf' ? 100 : 1}
                          className="w-full"
                        />
                        
                        <div className="flex justify-between text-xs muted mt-1">
                          <span>{item.min}</span>
                          <span>{maxQuantity.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            className="ps-btn primary text-lg px-8 py-4 min-w-64"
          >
            {primaryCta.label}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductQuantities;