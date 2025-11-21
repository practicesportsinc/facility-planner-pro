import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FACILITY_PRESETS, PRESET_CATEGORIES } from "@/data/facilityPresets";
import { PresetReportModal } from "@/components/reports/PresetReportModal";
import { ArrowRight, Building2, DollarSign, Maximize2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { FacilityPreset } from "@/data/facilityPresets";

export function FacilityPresetGallery() {
  const [selectedPreset, setSelectedPreset] = useState<FacilityPreset | null>(null);

  const handlePresetClick = (preset: FacilityPreset) => {
    setSelectedPreset(preset);
  };

  const handleCloseModal = () => {
    setSelectedPreset(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FACILITY_PRESETS.map((preset) => (
          <div key={preset.id}>
            <h3 className="text-2xl font-bold mb-3">{preset.name}</h3>
            <Card
              className="group cursor-pointer hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden"
              onClick={() => handlePresetClick(preset)}
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={preset.image}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{preset.name}</h3>
                    <p className="text-sm text-white/90 mb-4">{preset.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {preset.configuration.grossSF.toLocaleString()} SF
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {formatCurrency(preset.financials.estimatedCapEx)}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-primary text-white border-0 shadow-glow hover:opacity-90"
                      size="sm"
                    >
                      View Breakdown
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Mobile-friendly static info */}
              <div className="p-4 md:hidden">
                <h3 className="text-lg font-bold mb-1">{preset.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{preset.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{preset.configuration.grossSF.toLocaleString()} SF</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(preset.financials.estimatedCapEx)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {selectedPreset && (
        <PresetReportModal
          preset={selectedPreset}
          open={!!selectedPreset}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
