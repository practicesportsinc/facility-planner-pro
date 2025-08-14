import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { STAGE_CONFIG, StageCode, StageData, FinancingMode, ExpansionMode } from "@/types/stage";

interface AdvancedStageSelectorProps {
  value?: StageData;
  onChange: (value: StageData) => void;
}

export const AdvancedStageSelector = ({ value, onChange }: AdvancedStageSelectorProps) => {
  const [selectedStage, setSelectedStage] = useState<StageCode | null>(value?.stage_code || null);
  const [financingMode, setFinancingMode] = useState<FinancingMode>("seeking");
  const [expansionMode, setExpansionMode] = useState<ExpansionMode>("onsite");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [signals, setSignals] = useState(value?.signals || {});

  useEffect(() => {
    if (selectedStage && !showFollowUp) {
      setShowFollowUp(true);
    }
  }, [selectedStage]);

  const handleStageSelect = (stage: StageCode) => {
    setSelectedStage(stage);
    
    const stageData: StageData = {
      stage_code: stage,
      stage_detail: {
        ...(stage === "financing" && { financing_mode: financingMode }),
        ...(stage === "expansion" && { expansion_mode: expansionMode })
      },
      signals: {}
    };
    
    onChange(stageData);
  };

  const handleToggleChange = (mode: string) => {
    if (selectedStage === "financing") {
      const newMode = mode.toLowerCase() as FinancingMode;
      setFinancingMode(newMode);
      updateStageData({ financing_mode: newMode });
    } else if (selectedStage === "expansion") {
      const newMode = mode.toLowerCase().replace(" ", "_") as ExpansionMode;
      setExpansionMode(newMode);
      updateStageData({ expansion_mode: newMode });
    }
  };

  const updateStageData = (detailUpdate = {}) => {
    if (!selectedStage) return;
    
    const stageData: StageData = {
      stage_code: selectedStage,
      stage_detail: {
        ...value?.stage_detail,
        ...detailUpdate
      },
      signals
    };
    
    onChange(stageData);
  };

  const handleSignalChange = (key: string, val: any) => {
    const newSignals = { ...signals, [key]: val };
    setSignals(newSignals);
    
    if (selectedStage) {
      const stageData: StageData = {
        stage_code: selectedStage,
        stage_detail: value?.stage_detail || {},
        signals: newSignals
      };
      onChange(stageData);
      toast.success("Stage saved");
    }
  };

  const renderFollowUpQuestions = () => {
    if (!selectedStage || !showFollowUp) return null;

    switch (selectedStage) {
      case "concept":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Target open date:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["<6 mo", "6–12", "12–18", ">18", "TBD"].map((option) => (
                    <Button
                      key={option}
                      variant={signals.target_open_bucket === option.replace(" mo", "").replace("–", "-") ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSignalChange("target_open_bucket", option.replace(" mo", "").replace("–", "-"))}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Know a rough size?</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant={signals.rough_sf ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleSignalChange("rough_sf", 0)}
                  >
                    No
                  </Button>
                  <Button
                    variant={signals.rough_sf ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSignalChange("rough_sf", 1)}
                  >
                    Yes
                  </Button>
                  {signals.rough_sf ? (
                    <Input
                      type="number"
                      placeholder="Square feet"
                      className="w-32"
                      onChange={(e) => handleSignalChange("rough_sf", parseInt(e.target.value) || 0)}
                    />
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "feasibility":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Rough size (sf):</Label>
                <Input
                  type="number"
                  placeholder="Square feet"
                  className="mt-2"
                  value={signals.rough_sf || ""}
                  onChange={(e) => handleSignalChange("rough_sf", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Budget confidence:</Label>
                <div className="flex gap-2 mt-2">
                  {["Low", "Medium", "High"].map((level) => (
                    <Button
                      key={level}
                      variant={signals.budget_confidence === level.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSignalChange("budget_confidence", level.toLowerCase())}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "site_search":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Status:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Browsing", "Shortlist", "LOI", "Under contract"].map((status) => (
                    <Button
                      key={status}
                      variant={signals.site_status === status.toLowerCase().replace(" ", "_") ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSignalChange("site_status", status.toLowerCase().replace(" ", "_"))}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Building type:</Label>
                <div className="flex gap-2 mt-2">
                  {["Lease/TI", "Buy/Reno", "Ground-up"].map((type) => (
                    <Button
                      key={type}
                      variant={signals.build_type === type.toLowerCase().replace("/", "_").replace("-", "_") ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSignalChange("build_type", type.toLowerCase().replace("/", "_").replace("-", "_"))}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Ceiling height known?</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant={!signals.ceiling_height_ft ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSignalChange("ceiling_height_ft", 0)}
                  >
                    No
                  </Button>
                  <Button
                    variant={signals.ceiling_height_ft ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSignalChange("ceiling_height_ft", 1)}
                  >
                    Yes
                  </Button>
                  {signals.ceiling_height_ft ? (
                    <Input
                      type="number"
                      placeholder="Feet"
                      className="w-24"
                      onChange={(e) => handleSignalChange("ceiling_height_ft", parseInt(e.target.value) || 0)}
                    />
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "financing":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {financingMode === "seeking" ? (
                <>
                  <div>
                    <Label className="text-sm font-medium">Amount target ($):</Label>
                    <Input
                      type="number"
                      placeholder="Target amount"
                      className="mt-2"
                      value={signals.capital_target_usd || ""}
                      onChange={(e) => handleSignalChange("capital_target_usd", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred type:</Label>
                    <div className="flex gap-2 mt-2">
                      {["Debt", "Equity", "Both"].map((type) => (
                        <Button
                          key={type}
                          variant={signals.capital_structure === type.toLowerCase() ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSignalChange("capital_structure", type.toLowerCase())}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <Label className="text-sm font-medium">Total capital secured ($):</Label>
                  <Input
                    type="number"
                    placeholder="Secured amount"
                    className="mt-2"
                    value={signals.capital_secured_usd || ""}
                    onChange={(e) => handleSignalChange("capital_secured_usd", parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "outfitting":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Need quotes for:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Turf", "Nets/Cages", "Hoops", "Volleyball", "Lighting", "HVAC"].map((category) => (
                    <Button
                      key={category}
                      variant={signals.quote_categories?.includes(category.toLowerCase()) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const current = signals.quote_categories || [];
                        const updated = current.includes(category.toLowerCase())
                          ? current.filter(c => c !== category.toLowerCase())
                          : [...current, category.toLowerCase()];
                        handleSignalChange("quote_categories", updated);
                      }}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Install window:</Label>
                <div className="flex gap-2 mt-2">
                  {["<3 mo", "3–6", ">6"].map((window) => (
                    <Button
                      key={window}
                      variant={signals.install_window === window.replace(" mo", "").replace("–", "-") ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSignalChange("install_window", window.replace(" mo", "").replace("–", "-"))}
                    >
                      {window}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "expansion":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Current facility sf:</Label>
                <Input
                  type="number"
                  placeholder="Current square feet"
                  className="mt-2"
                  value={signals.current_facility_sf || ""}
                  onChange={(e) => handleSignalChange("current_facility_sf", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Expansion goal:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Add courts/turf", "New program", "Capacity relief"].map((goal) => (
                    <Button
                      key={goal}
                      variant={signals.expansion_goal?.includes(goal.toLowerCase().replace("/", "_").replace(" ", "_")) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const current = signals.expansion_goal || [];
                        const goalKey = goal.toLowerCase().replace("/", "_").replace(" ", "_");
                        const updated = current.includes(goalKey)
                          ? current.filter(g => g !== goalKey)
                          : [...current, goalKey];
                        handleSignalChange("expansion_goal", updated);
                      }}
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-semibold text-foreground mb-3">
          Where are you in your facility journey?
        </Label>
        
        {/* Primary stage chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(STAGE_CONFIG).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedStage === key ? "default" : "outline"}
              size="sm"
              onClick={() => handleStageSelect(key as StageCode)}
              className="transition-smooth"
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Show sub-toggles for Financing/Expansion */}
        {selectedStage === "financing" && (
          <div className="flex gap-2 mb-2">
            {["Seeking", "Secured"].map((mode) => (
              <Button
                key={mode}
                variant={financingMode === mode.toLowerCase() ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleChange(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        )}

        {selectedStage === "expansion" && (
          <div className="flex gap-2 mb-2">
            {["Onsite", "New site"].map((mode) => (
              <Button
                key={mode}
                variant={expansionMode === mode.toLowerCase().replace(" ", "_") ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleChange(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        )}

        {/* Help text */}
        {selectedStage && (
          <p className="text-xs text-muted-foreground">
            {STAGE_CONFIG[selectedStage].help}
          </p>
        )}
      </div>

      {/* Follow-up questions */}
      {renderFollowUpQuestions()}
    </div>
  );
};