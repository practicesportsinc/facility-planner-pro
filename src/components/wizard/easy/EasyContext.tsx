import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChipOption {
  key: string;
  label: string;
}

interface ContextField {
  key: string;
  label: string;
  type: "text" | "chips";
  default?: string;
  options?: (string | ChipOption)[];
}

interface EasyContextProps {
  title: string;
  subtitle: string;
  fields: ContextField[];
  primaryCta: {
    label: string;
    route: string;
  };
}

export const EasyContext = ({
  title,
  subtitle,
  fields,
  primaryCta,
}: EasyContextProps) => {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach(field => {
      if (field.default) {
        initial[field.key] = field.default;
      }
    });
    return initial;
  });

  const handleInputChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleChipSelect = (key: string, option: string) => {
    setValues(prev => ({ ...prev, [key]: option }));
  };

  const handleContinue = () => {
    // Save context data to localStorage in expected format
    const locationData = {
      city: values.city || "Omaha",
      state: values.state || "NE", 
      country: values.country || "United States"
    };
    const wizardData = {
      stage_code: values.stage_code
    };
    const signalsData = {
      target_open_bucket: values.timeline
    };
    
    localStorage.setItem('wizard-location', JSON.stringify(locationData));
    localStorage.setItem('wizard-data', JSON.stringify(wizardData));
    localStorage.setItem('wizard-signals', JSON.stringify(signalsData));
    navigate(primaryCta.route);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ps-text mb-4">{title}</h1>
          <p className="text-lg muted">{subtitle}</p>
        </div>

        <Card className="ps-card p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fields.map((field) => (
              <div key={field.key} className="space-y-4">
                <Label htmlFor={field.key} className="text-base font-semibold text-ps-text">
                  {field.label}
                </Label>
                
                {field.type === "text" && (
                  <Input
                    id={field.key}
                    value={values[field.key] || ""}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full"
                  />
                )}
                
                {field.type === "chips" && field.options && (
                  <div className="flex flex-wrap gap-2">
                    {field.options.map((option) => {
                      const optionKey = typeof option === 'string' ? option : option.key;
                      const optionLabel = typeof option === 'string' ? option : option.label;
                      
                      return (
                        <button
                          key={optionKey}
                          onClick={() => handleChipSelect(field.key, optionKey)}
                          className={`ps-chip ${values[field.key] === optionKey ? 'on' : ''}`}
                        >
                          {optionLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

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

export default EasyContext;