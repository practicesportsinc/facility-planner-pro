import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopViewLayout } from "@/components/layout/TopViewLayout";
import { Ruler } from "lucide-react";

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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customLength, setCustomLength] = useState<string>("");

  const handleSizeSelect = (sizeKey: string) => {
    setSelectedSize(sizeKey);
    
    // Save size data to localStorage
    const selectedOption = sizeOptions.find(opt => opt.key === sizeKey);
    if (selectedOption) {
      const facilityData = {
        key: sizeKey,
        ...selectedOption.preload
      };
      localStorage.setItem('wizard-facility-size', JSON.stringify(facilityData));
      
      // Fire analytics event
      console.log("Size card selected:", facilityData);
    }
  };

  const handleContinue = () => {
    if (selectedSize === 'custom' && customWidth && customLength) {
      const width = parseInt(customWidth);
      const length = parseInt(customLength);
      const totalSqft = width * length;
      
      const facilityData = {
        key: 'custom',
        shell_dims_ft: [width, length] as [number, number],
        total_sqft: totalSqft,
        court_or_cage_counts: {}
      };
      localStorage.setItem('wizard-facility-size', JSON.stringify(facilityData));
      console.log("Custom size selected:", facilityData);
    }
    navigate(primaryCta.route);
  };

  const handleImageError = (optionKey: string) => {
    setImageErrors(prev => new Set(prev).add(optionKey));
  };

  // Convert court counts to TopViewLayout units
  const convertToUnits = (counts: Record<string, number>) => {
    const units = [];
    
    if (counts.basketball_courts_full) {
      for (let i = 0; i < counts.basketball_courts_full; i++) {
        units.push({ kind: "basketball_court_full" as const, count: 1, rotation: 0 });
      }
    }
    if (counts.volleyball_courts) {
      for (let i = 0; i < counts.volleyball_courts; i++) {
        units.push({ kind: "volleyball_court" as const, count: 1, rotation: 0 });
      }
    }
    if (counts.baseball_tunnels) {
      for (let i = 0; i < counts.baseball_tunnels; i++) {
        units.push({ kind: "baseball_tunnel" as const, count: 1, rotation: 0 });
      }
    }
    if (counts.pickleball_courts) {
      for (let i = 0; i < counts.pickleball_courts; i++) {
        units.push({ kind: "pickleball_court" as const, count: 1, rotation: 0 });
      }
    }
    
    return units;
  };

  return (
    <div className="container mx-auto p-6">
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
                <div className="relative bg-gray-50 h-48 overflow-hidden">
                  {imageErrors.has(option.key) ? (
                    // Render TopViewLayout as fallback
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="transform scale-[0.6] origin-center">
                        <TopViewLayout
                          grossSf={option.preload.total_sqft}
                          aspectRatio={option.preload.shell_dims_ft[0] / option.preload.shell_dims_ft[1]}
                          units={convertToUnits(option.preload.court_or_cage_counts)}
                          viewWidthPx={280}
                          showLegend={false}
                          algo="rows"
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={option.img}
                      alt={`${option.name} layout`}
                      className="w-full h-48 object-cover"
                      onError={() => handleImageError(option.key)}
                    />
                  )}
                  
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
          {/* Custom Size Card */}
          <Card
            className={`ps-card ${selectedSize === 'custom' ? 'ring-2 ring-ps-blue' : ''} cursor-pointer overflow-hidden hover:scale-105 transition-smooth`}
            onClick={() => setSelectedSize('custom')}
          >
            <div className="relative bg-muted">
              {selectedSize === 'custom' ? (
                <div className="w-full h-48 p-4 flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Width (ft)</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        min={20}
                        max={500}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Length (ft)</Label>
                      <Input
                        type="number"
                        placeholder="150"
                        value={customLength}
                        onChange={(e) => setCustomLength(e.target.value)}
                        min={20}
                        max={500}
                        className="h-9"
                      />
                    </div>
                  </div>
                  
                  {customWidth && customLength && parseInt(customWidth) > 0 && parseInt(customLength) > 0 && (
                    <div className="bg-background rounded-lg p-2 text-center border">
                      <span className="text-xl font-bold text-primary">
                        {(parseInt(customWidth) * parseInt(customLength)).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">sq ft</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center">
                    <Ruler className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <span className="text-muted-foreground">Enter your own dimensions</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-ps-text">Custom Size</h3>
                <Badge variant="outline" className="text-sm">
                  Any size
                </Badge>
              </div>
              
              <p className="text-sm muted mb-3">Your dimensions</p>
              <p className="text-sm text-ps-text">Know your exact facility size? Enter width × length.</p>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedSize || (selectedSize === 'custom' && (!customWidth || !customLength || parseInt(customWidth) < 20 || parseInt(customLength) < 20))}
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