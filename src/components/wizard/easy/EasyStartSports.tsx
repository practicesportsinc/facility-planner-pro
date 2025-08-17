import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  Zap, 
  Volleyball, 
  Trophy, 
  Target, 
  Grid3X3 
} from "lucide-react";

interface SportOption {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface EasyStartSportsProps {
  title: string;
  subtitle: string;
  multi: boolean;
  options: SportOption[];
  primaryCta: {
    label: string;
    route: string;
  };
}

const iconMap = {
  bat: Activity,
  basketball: Zap,
  volleyball: Volleyball,
  tennis: Target,
  soccer: Trophy,
  grid: Grid3X3,
};

export const EasyStartSports = ({
  title,
  subtitle,
  multi,
  options,
  primaryCta,
}: EasyStartSportsProps) => {
  const navigate = useNavigate();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const handleSportToggle = (sportKey: string) => {
    if (multi) {
      setSelectedSports(prev => 
        prev.includes(sportKey) 
          ? prev.filter(s => s !== sportKey)
          : [...prev, sportKey]
      );
    } else {
      setSelectedSports([sportKey]);
    }
  };

  const handleContinue = () => {
    // Save selected sports to localStorage
    localStorage.setItem('wizard-selected-sports', JSON.stringify(selectedSports));
    navigate(primaryCta.route);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ps-text mb-4">{title}</h1>
          <p className="text-lg muted">{subtitle}</p>
        </div>

        <div className="grid-auto mb-12">
          {options.map((option) => {
            const Icon = iconMap[option.icon as keyof typeof iconMap] || Grid3X3;
            const isSelected = selectedSports.includes(option.key);
            
            return (
              <Card
                key={option.key}
                className={`ps-tile ${isSelected ? 'on' : ''} h-40 flex-col justify-center items-center text-center cursor-pointer hover:scale-105 transition-smooth`}
                onClick={() => handleSportToggle(option.key)}
              >
                <Icon 
                  size={48} 
                  style={{ color: option.color }}
                  className="mb-4"
                />
                <h3 className="text-lg font-semibold text-ps-text">
                  {option.label}
                </h3>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={selectedSports.length === 0}
            className="ps-btn primary text-lg px-8 py-4 min-w-64"
          >
            {primaryCta.label}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EasyStartSports;