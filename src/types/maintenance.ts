export type AssetClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type Cadence = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type AgeBucket = '0-3' | '4-7' | '8-12' | '13+';
export type UsageIntensity = 'light' | 'moderate' | 'heavy';

export interface MaintenanceTask {
  cadence: Cadence;
  description: string;
  staffCanDo: boolean;
  docRequired: boolean;
}

export interface MaintenanceAsset {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  assetClass: AssetClass;
  sports: string[];
  motorizedOption: boolean;
  tasks: MaintenanceTask[];
  redFlags: string[];
  contractorCategories: string[];
}

export interface AssetSelection {
  assetId: string;
  quantity: number;
  motorized: boolean;
  ageBucket: AgeBucket;
  usageIntensity: UsageIntensity;
}

export interface ScheduledTask {
  assetId: string;
  assetName: string;
  assetClass: AssetClass;
  cadence: Cadence;
  description: string;
  staffCanDo: boolean;
  docRequired: boolean;
  quantity: number;
  isModified: boolean; // cadence was shifted due to age/usage
}

export interface MaintenancePlan {
  version: string;
  generatedAt: string;
  tasks: {
    daily: ScheduledTask[];
    weekly: ScheduledTask[];
    monthly: ScheduledTask[];
    quarterly: ScheduledTask[];
    annual: ScheduledTask[];
  };
  redFlags: Array<{ assetId: string; assetName: string; flags: string[] }>;
  contractorNeeds: Array<{ category: string; tasks: string[] }>;
}

export interface ReminderPreferences {
  enabled: boolean;
  cadences: Cadence[];
  preferredDay: string; // 'monday' | 'tuesday' etc.
  preferredTime: string; // '09:00' etc.
  additionalRecipients: string[];
}

export interface MaintenanceWizardState {
  sports: string[];
  selectedAssets: AssetSelection[];
  facilityName: string;
  locationCity: string;
  locationState: string;
  locationZip: string;
  email: string;
  name: string;
  reminderPreferences: ReminderPreferences;
}
