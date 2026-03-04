import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SportIcon, SPORT_LABELS, type SportKey } from '@/components/home/SportIcons';
import { Check, Shield, Calendar, Wrench, Download, Clock } from 'lucide-react';

const BENEFITS = [
  { icon: Shield, title: 'Prevent costly breakdowns', desc: 'Risk-prioritized schedules catch issues before they become emergencies' },
  { icon: Calendar, title: 'Custom schedules', desc: 'Tailored by equipment age, usage intensity & environment' },
  { icon: Wrench, title: 'Contractor vetting guide', desc: 'Know what to ask and what to look for when hiring service pros' },
  { icon: Download, title: 'PDF report + reminders', desc: 'Download your plan and get email reminders on your schedule' },
];

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
        <p className="text-muted-foreground mt-1">Build a custom maintenance plan — free in under 2 minutes</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {BENEFITS.map((b) => (
          <Card key={b.title} className="p-3 flex items-start gap-3 bg-primary/5 border-primary/15">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <b.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{b.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
            </div>
          </Card>
        ))}
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Free — no signup required</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Takes under 2 minutes</span>
        </div>
        <Button onClick={onNext} disabled={selected.length === 0} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
