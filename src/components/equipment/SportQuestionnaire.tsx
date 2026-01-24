import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { SportKey, SPORT_LABELS } from "@/components/home/SportIcons";
import { EquipmentInputs, SpaceSize } from "@/types/equipment";

interface SportQuestionnaireProps {
  sport: SportKey;
  onSubmit: (inputs: EquipmentInputs) => void;
  onBack: () => void;
}

export const SportQuestionnaire = ({ sport, onSubmit, onBack }: SportQuestionnaireProps) => {
  const [units, setUnits] = useState(4);
  const [spaceSize, setSpaceSize] = useState<SpaceSize>('medium');
  const [turfInstallation, setTurfInstallation] = useState(false);
  const [courtType, setCourtType] = useState('sport-tile');
  const [flooringType, setFlooringType] = useState('wood');
  const [tournamentGrade, setTournamentGrade] = useState(false);
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor'>('indoor');
  const [clearHeight, setClearHeight] = useState(24);
  const [specialFeatures, setSpecialFeatures] = useState<string[]>([]);
  const [includeConcrete, setIncludeConcrete] = useState(false);
  const [includeLighting, setIncludeLighting] = useState(false);
  const [fenceType, setFenceType] = useState<string>('none');

  const isBaseball = sport === 'baseball_softball';
  const isBasketball = sport === 'basketball';
  const isVolleyball = sport === 'volleyball';
  const isPickleball = sport === 'pickleball';

  const handleSubmit = () => {
    // Build special features array with outdoor options for pickleball
    const allSpecialFeatures = [
      ...specialFeatures,
      ...(isPickleball && includeConcrete ? ['Concrete surface'] : []),
      ...(isPickleball && includeLighting ? ['Outdoor lighting'] : []),
      ...(isPickleball && indoorOutdoor === 'outdoor' && fenceType !== 'none' ? [`Fencing:${fenceType}`] : []),
    ];

    const inputs: EquipmentInputs = {
      sport,
      units,
      spaceSize,
      flooringType: isBasketball ? courtType : flooringType,
      turfInstallation: isBaseball ? turfInstallation : undefined,
      tournamentGrade: isVolleyball ? tournamentGrade : undefined,
      indoorOutdoor: isPickleball ? indoorOutdoor : undefined,
      clearHeight: isBasketball ? clearHeight : undefined,
      specialFeatures: allSpecialFeatures,
    };
    onSubmit(inputs);
  };

  const renderBaseballQuestions = () => (
    <>
      <div className="space-y-3">
        <Label>How many batting cages?</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[units]}
            onValueChange={(val) => setUnits(val[0])}
            min={1}
            max={12}
            step={1}
            className="flex-1"
          />
          <span className="font-semibold text-lg w-12 text-center">{units}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>What's your space size?</Label>
        <RadioGroup value={spaceSize} onValueChange={(val) => setSpaceSize(val as SpaceSize)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="small" />
            <Label htmlFor="small">Small (2,000-5,000 SF)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Medium (5,000-10,000 SF)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="large" />
            <Label htmlFor="large">Large (10,000+ SF)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="turf" 
          checked={turfInstallation}
          onCheckedChange={(checked) => setTurfInstallation(checked as boolean)}
        />
        <Label htmlFor="turf">Include turf installation</Label>
      </div>

      <div className="space-y-2">
        <Label>Special features (optional)</Label>
        <div className="space-y-2">
          {['Bullpen area', 'Hitting lab', 'Pitching mounds'].map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={specialFeatures.includes(feature)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSpecialFeatures([...specialFeatures, feature]);
                  } else {
                    setSpecialFeatures(specialFeatures.filter(f => f !== feature));
                  }
                }}
              />
              <Label htmlFor={feature}>{feature}</Label>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderBasketballQuestions = () => (
    <>
      <div className="space-y-3">
        <Label>How many courts?</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[units]}
            onValueChange={(val) => setUnits(val[0])}
            min={1}
            max={8}
            step={1}
            className="flex-1"
          />
          <span className="font-semibold text-lg w-12 text-center">{units}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Court type?</Label>
        <RadioGroup value={courtType} onValueChange={setCourtType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hardwood" id="hardwood" />
            <Label htmlFor="hardwood">Hardwood (Premium)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sport-tile" id="sport-tile" />
            <Label htmlFor="sport-tile">Sport Tile (Mid-range)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="modular" id="modular" />
            <Label htmlFor="modular">Modular (Budget)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Clear height available?</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[clearHeight]}
            onValueChange={(val) => setClearHeight(val[0])}
            min={18}
            max={35}
            step={1}
            className="flex-1"
          />
          <span className="font-semibold text-lg w-16 text-center">{clearHeight} ft</span>
        </div>
        <p className="text-sm text-muted-foreground">Recommended: 24-30ft for competitive play</p>
      </div>
    </>
  );

  const renderVolleyballQuestions = () => (
    <>
      <div className="space-y-3">
        <Label>How many courts?</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[units]}
            onValueChange={(val) => setUnits(val[0])}
            min={1}
            max={8}
            step={1}
            className="flex-1"
          />
          <span className="font-semibold text-lg w-12 text-center">{units}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Flooring type?</Label>
        <RadioGroup value={flooringType} onValueChange={setFlooringType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wood" id="wood" />
            <Label htmlFor="wood">Wood (Premium)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sport-tile" id="vb-sport-tile" />
            <Label htmlFor="vb-sport-tile">Sport Tile</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rubber" id="rubber" />
            <Label htmlFor="rubber">Rubber</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="tournament" 
          checked={tournamentGrade}
          onCheckedChange={(checked) => setTournamentGrade(checked as boolean)}
        />
        <Label htmlFor="tournament">Tournament grade equipment</Label>
      </div>
    </>
  );

  const renderPickleballQuestions = () => (
    <>
      <div className="space-y-3">
        <Label>How many courts?</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[units]}
            onValueChange={(val) => setUnits(val[0])}
            min={1}
            max={12}
            step={1}
            className="flex-1"
          />
          <span className="font-semibold text-lg w-12 text-center">{units}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Indoor or outdoor?</Label>
        <RadioGroup value={indoorOutdoor} onValueChange={(val) => setIndoorOutdoor(val as 'indoor' | 'outdoor')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="indoor" id="pb-indoor" />
            <Label htmlFor="pb-indoor">Indoor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="outdoor" id="outdoor" />
            <Label htmlFor="outdoor">Outdoor</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Space dimensions?</Label>
        <RadioGroup value={spaceSize} onValueChange={(val) => setSpaceSize(val as SpaceSize)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="pb-small" />
            <Label htmlFor="pb-small">Tight fit (minimal buffer)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="pb-medium" />
            <Label htmlFor="pb-medium">Standard (recommended)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="pb-large" />
            <Label htmlFor="pb-large">Tournament spec</Label>
          </div>
        </RadioGroup>
      </div>

      {indoorOutdoor === 'outdoor' && (
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm font-medium">Outdoor additions (optional)</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="concrete" 
              checked={includeConcrete}
              onCheckedChange={(checked) => setIncludeConcrete(checked as boolean)}
            />
            <Label htmlFor="concrete">Include concrete pad ($12/SF)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="lighting" 
              checked={includeLighting}
              onCheckedChange={(checked) => setIncludeLighting(checked as boolean)}
            />
            <Label htmlFor="lighting">Include court lighting</Label>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label className="text-sm">Perimeter fencing?</Label>
            <RadioGroup value={fenceType} onValueChange={setFenceType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="fence-none" />
                <Label htmlFor="fence-none">No fencing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chainlink" id="fence-chainlink" />
                <Label htmlFor="fence-chainlink">Chain-link ($20/LF)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vinyl" id="fence-vinyl" />
                <Label htmlFor="fence-vinyl">Vinyl ($35/LF)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}
    </>
  );

  const renderDefaultQuestions = () => (
    <>
      <div className="space-y-3">
        <Label>How many units?</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[units]}
            onValueChange={(val) => setUnits(val[0])}
            min={1}
            max={12}
            step={1}
            className="flex-1"
          />
          <span className="font-semibold text-lg w-12 text-center">{units}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Space size?</Label>
        <RadioGroup value={spaceSize} onValueChange={(val) => setSpaceSize(val as SpaceSize)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="default-small" />
            <Label htmlFor="default-small">Small</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="default-medium" />
            <Label htmlFor="default-medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="default-large" />
            <Label htmlFor="default-large">Large</Label>
          </div>
        </RadioGroup>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{SPORT_LABELS[sport]} Equipment</h2>
          <p className="text-muted-foreground">Tell us about your space and needs</p>
        </div>

        <div className="space-y-6">
          {isBaseball && renderBaseballQuestions()}
          {isBasketball && renderBasketballQuestions()}
          {isVolleyball && renderVolleyballQuestions()}
          {isPickleball && renderPickleballQuestions()}
          {!isBaseball && !isBasketball && !isVolleyball && !isPickleball && renderDefaultQuestions()}

          <Button 
            onClick={handleSubmit}
            className="w-full"
            size="lg"
          >
            Get Equipment Quote
          </Button>
        </div>
      </Card>
    </div>
  );
};
