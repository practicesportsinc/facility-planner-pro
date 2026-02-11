import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Progress } from '@/components/ui/progress';
import { SportSelectionStep } from '@/components/maintenance/SportSelectionStep';
import { AssetSelectionStep } from '@/components/maintenance/AssetSelectionStep';
import { AssetDetailsStep } from '@/components/maintenance/AssetDetailsStep';
import { LocationStep } from '@/components/maintenance/LocationStep';
import { MaintenanceDashboard } from '@/components/maintenance/MaintenanceDashboard';
import type { AssetSelection, MaintenanceWizardState } from '@/types/maintenance';

const STEPS = [
  { path: 'sports', label: 'Sports' },
  { path: 'equipment', label: 'Equipment' },
  { path: 'details', label: 'Details' },
  { path: 'location', label: 'Location' },
  { path: 'dashboard', label: 'Your Plan' },
];

export default function MaintenanceWizard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<MaintenanceWizardState>({
    sports: [],
    selectedAssets: [],
    facilityName: '',
    locationCity: '',
    locationState: '',
    locationZip: '',
    email: '',
    name: '',
  });

  const currentStep = STEPS.findIndex((s) => location.pathname.endsWith(s.path));
  const progress = currentStep >= 0 ? ((currentStep + 1) / STEPS.length) * 100 : 0;

  const goNext = () => {
    window.scrollTo(0, 0);
    if (currentStep < STEPS.length - 1) navigate(`/maintenance/${STEPS[currentStep + 1].path}`);
  };
  const goBack = () => {
    window.scrollTo(0, 0);
    if (currentStep > 0) navigate(`/maintenance/${STEPS[currentStep - 1].path}`);
  };

  const setSports = (sports: string[]) => setState((s) => ({ ...s, sports }));
  const setSelectedAssets = (selectedAssets: AssetSelection[]) => setState((s) => ({ ...s, selectedAssets }));
  const updateState = (partial: Partial<MaintenanceWizardState>) => setState((s) => ({ ...s, ...partial }));

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {currentStep >= 0 && currentStep < STEPS.length && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              {STEPS.map((s, i) => (
                <span key={s.path} className={i <= currentStep ? 'text-primary font-medium' : ''}>
                  {s.label}
                </span>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}
            </p>
          </div>
        )}

        <Routes>
          <Route index element={<Navigate to="sports" replace />} />
          <Route path="sports" element={<SportSelectionStep selected={state.sports} onChange={setSports} onNext={goNext} />} />
          <Route path="equipment" element={<AssetSelectionStep sports={state.sports} selections={state.selectedAssets} onChange={setSelectedAssets} onNext={goNext} onBack={goBack} />} />
          <Route path="details" element={<AssetDetailsStep selections={state.selectedAssets} onChange={setSelectedAssets} onNext={goNext} onBack={goBack} />} />
          <Route path="location" element={<LocationStep state={state} onChange={updateState} onNext={goNext} onBack={goBack} />} />
          <Route path="dashboard" element={<MaintenanceDashboard state={state} onBack={goBack} />} />
        </Routes>
      </div>
    </Layout>
  );
}
