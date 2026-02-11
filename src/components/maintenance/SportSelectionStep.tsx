import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SportIcon, SPORT_LABELS, type SportKey } from '@/components/home/SportIcons';
import { Check } from 'lucide-react';

const AVAILABLE_SPORTS: SportKey[] = [
  'baseball_softball',
  'basketball',
  'volleyball',
  'pickleball',
  'soccer_indoor_small_sided',
  'football',
  'multi_sport',
];

interface Props {
  selected: string[];
  onChange: (sports: string[]) => void;
  onNext: () => void;
}

export function SportSelectionStep({ selected, onChange, onNext }: Props) {
  const toggle = (sport: string) => {
    onChange(
      selected.includes(sport)
        ? selected.filter((s) => s !== sport)
        : [...selected, sport]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">What sports does your facility offer?</h2>
        <p className="text-muted-foreground mt-1">Select all that apply. This helps us identify relevant equipment.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {AVAILABLE_SPORTS.map((sport) => {
          const isSelected = selected.includes(sport);
          return (
            <Card
              key={sport}
              onClick={() => toggle(sport)}
              className={`relative cursor-pointer p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md ${
                isSelected ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'hover:border-primary/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <SportIcon kind={sport} size={48} />
              <span className="text-sm font-medium text-center">{SPORT_LABELS[sport]}</span>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={selected.length === 0} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
