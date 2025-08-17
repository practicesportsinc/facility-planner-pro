import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SizeOption {
  key: string;
  name: string;
  dimensions: string;
  sqft: number;
  img: string;
  description: string;
  preload: {
    shell_dims_ft: [number, number];
    total_sqft: number;
    court_or_cage_counts: Record<string, number>;
  };
  hotspots?: Array<{
    id: string;
    rectPct: { x: number; y: number; w: number; h: number };
    label: string;
    tooltip: string;
  }>;
}

interface FacilitySizeSelectorProps {
  title: string;
  subtitle: string;
  sizeOptions: SizeOption[];
  primaryCta: {
    label: string;
    route: string;
  };
}

export const FacilitySizeSelector = ({
  title,
  subtitle,
  sizeOptions,
  primaryCta,
}: FacilitySizeSelectorProps) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  const handleSizeSelect = (sizeKey: string) => {
    setSelectedSize(sizeKey);
    
    // Save size data to localStorage
    const selectedOption = sizeOptions.find(opt => opt.key === sizeKey);
    if (selectedOption) {
      localStorage.setItem('wizard-facility-size', JSON.stringify({
        key: sizeKey,
        ...selectedOption.preload
      }));
    }
  };

  const handleContinue = () => {
    navigate(primaryCta.route);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ps-text mb-4">{title}</h1>
          <p className="text-lg muted">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {sizeOptions.map((option) => {
            const isSelected = selectedSize === option.key;
            
            return (
              <Card
                key={option.key}
                className={`ps-card ${isSelected ? 'ring-2 ring-ps-blue' : ''} cursor-pointer overflow-hidden hover:scale-105 transition-smooth`}
                onClick={() => handleSizeSelect(option.key)}
              >
                <div className="relative">
                  <img
                    src={option.img}
                    alt={`${option.name} layout`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't exist
                      e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlmYTJhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxheW91dCBJbWFnZTwvdGV4dD48L3N2Zz4=";
                    }}
                  />
                  
                  {/* Hotspots */}
                  {option.hotspots?.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="absolute border-2 border-ps-blue bg-ps-blue/20 cursor-help"
                      style={{
                        left: `${hotspot.rectPct.x}%`,
                        top: `${hotspot.rectPct.y}%`,
                        width: `${hotspot.rectPct.w}%`,
                        height: `${hotspot.rectPct.h}%`,
                      }}
                      onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      title={hotspot.tooltip}
                    >
                      {hoveredHotspot === hotspot.id && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                          {hotspot.tooltip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-ps-text">{option.name}</h3>
                    <Badge variant="secondary" className="text-sm">
                      {option.sqft.toLocaleString()} sq ft
                    </Badge>
                  </div>
                  
                  <p className="text-sm muted mb-3">{option.dimensions}</p>
                  <p className="text-sm text-ps-text">{option.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedSize}
            className="ps-btn primary text-lg px-8 py-4 min-w-64"
          >
            {primaryCta.label}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FacilitySizeSelector;