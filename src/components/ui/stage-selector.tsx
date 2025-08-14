import { useState, useEffect } from "react";

interface StageSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export const StageSelector = ({ value, onChange }: StageSelectorProps) => {
  const opts = ["R&D", "Site Selection", "Capital Raise", "Permitting", "Build-out"];
  
  const help: Record<string, string> = {
    "R&D": "Great place to start—use defaults and refine later.",
    "Site Selection": "Focus on land/building, TI, and ceiling heights.",
    "Capital Raise": "Downloadable pro forma and KPIs will help your deck.",
    "Permitting": "Confirm occupancy loads, fire suppression, parking counts.",
    "Build-out": "Get quotes now to lock pricing."
  };

  // Set default value if none provided
  useEffect(() => {
    if (!value) {
      onChange("R&D");
    }
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-foreground">
        Where are you in your facility journey?
      </label>
      <div className="flex flex-wrap gap-2">
        {opts.map((option) => (
          <button
            key={option}
            className={`px-4 py-2 rounded-full border transition-smooth text-sm font-medium ${
              value === option
                ? "bg-primary text-primary-foreground border-primary shadow-custom-sm"
                : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
            onClick={() => onChange(option)}
            type="button"
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {help[value || "R&D"]}
      </div>
    </div>
  );
};