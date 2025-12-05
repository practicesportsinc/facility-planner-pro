import { Card } from "@/components/ui/card";
import { Wrench, Building2, HardHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAnalytics from "@/hooks/useAnalytics";

interface PathSelectorProps {
  onSelectPath: (path: 'equipment' | 'facility' | 'building') => void;
}

export const PathSelector = ({ onSelectPath }: PathSelectorProps) => {
  const { track } = useAnalytics();
  const navigate = useNavigate();

  const handlePathSelect = (path: 'equipment' | 'facility' | 'building') => {
    track('path_selected', { path });
    if (path === 'building') {
      navigate('/building-config');
    } else {
      onSelectPath(path);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">What do you need pricing for?</h2>
        <p className="text-muted-foreground text-lg">Choose the path that fits your needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card 
          className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
          onClick={() => handlePathSelect('equipment')}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Wrench className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Equipment Only</h3>
            <p className="text-muted-foreground mb-4">
              Already have space? Get instant equipment pricing for your specific sport.
            </p>
            <ul className="text-sm text-left space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Fast, sport-specific quotes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Equipment & installation costs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Results in under 60 seconds
              </li>
            </ul>
          </div>
        </Card>

        <Card 
          className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-amber-500 group"
          onClick={() => handlePathSelect('building')}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <HardHat className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Building Only</h3>
            <p className="text-muted-foreground mb-4">
              Need a metal building estimate? Get detailed construction costs and specs.
            </p>
            <ul className="text-sm text-left space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pre-engineered metal buildings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Itemized construction costs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Doors, finish levels & site work
              </li>
            </ul>
          </div>
        </Card>

        <Card 
          className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
          onClick={() => handlePathSelect('facility')}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Building2 className="w-10 h-10 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Full Facility</h3>
            <p className="text-muted-foreground mb-4">
              Complete planning including building, equipment, and financial projections.
            </p>
            <ul className="text-sm text-left space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                AI-powered facility design
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Complete financial analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Revenue & operating projections
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
