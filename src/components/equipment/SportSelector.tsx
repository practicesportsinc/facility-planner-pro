import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SportIcon, SportKey, SPORT_LABELS } from "@/components/home/SportIcons";
import useAnalytics from "@/hooks/useAnalytics";

interface SportSelectorProps {
  onSelectSport: (sport: SportKey) => void;
  onBack: () => void;
}

const EQUIPMENT_SPORTS: SportKey[] = [
  'baseball_softball',
  'basketball',
  'volleyball',
  'pickleball',
  'soccer_indoor_small_sided',
  'multi_sport',
  'football'
];

export const SportSelector = ({ onSelectSport, onBack }: SportSelectorProps) => {
  const { track } = useAnalytics();

  const handleSportSelect = (sport: SportKey) => {
    track('equipment_sport_selected', { sport });
    onSelectSport(sport);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3">Select Your Sport</h2>
        <p className="text-muted-foreground text-lg">Get instant equipment pricing tailored to your sport</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {EQUIPMENT_SPORTS.map((sport) => (
          <Card
            key={sport}
            className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary group"
            onClick={() => handleSportSelect(sport)}
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex items-center justify-center">
                <SportIcon kind={sport} size={48} />
              </div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {SPORT_LABELS[sport]}
              </h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
