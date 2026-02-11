import { Card } from '@/components/ui/card';
import { Wrench, UserCheck, CheckCircle2 } from 'lucide-react';

const VETTING_CHECKLIST = [
  'Verify they carry proper liability insurance ($1M+ general liability)',
  'Ask for 3+ references from similar indoor sports facilities',
  'Confirm they are factory-authorized for your specific equipment brands',
  'Request written scope of work and itemized pricing before committing',
  'Verify workers\' compensation coverage for on-site crews',
  'Ask about their emergency/after-hours availability',
  'Request copies of relevant certifications and licenses',
];

interface Props {
  contractorNeeds: Array<{ category: string; tasks: string[] }>;
}

export function ContractorGuidance({ contractorNeeds }: Props) {
  if (contractorNeeds.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Contractor Guidance</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contractorNeeds.map((cn) => (
          <Card key={cn.category} className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-sm">{cn.category}</h4>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {cn.tasks.map((t, i) => (
                <li key={i}>• {t}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-muted/30">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          How to Vet Contractors
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          {VETTING_CHECKLIST.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary font-bold shrink-0">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
