export interface WizardResponse {
  questionId: string;
  value: string | string[] | number;
  label?: string;
}

export interface WizardQuestion {
  id: string;
  type: 'single' | 'multiple' | 'range' | 'input';
  title: string;
  description?: string;
  options?: WizardOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  required?: boolean;
  dependsOn?: {
    questionId: string;
    values: string[];
  };
}

export interface WizardOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  recommended?: boolean;
}

export interface WizardResult {
  responses: WizardResponse[];
  recommendations: {
    facilityType: string;
    suggestedSize: number;
    layout: string;
    keyFeatures: string[];
    businessModel: string;
    estimatedCapacity: number;
  };
}