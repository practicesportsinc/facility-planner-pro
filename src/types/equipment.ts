import { SportKey } from "@/components/home/SportIcons";

export type { SportKey };

export type SpaceSize = 'small' | 'medium' | 'large';

export interface EquipmentInputs {
  sport: SportKey;
  units: number; // cages, courts, etc.
  spaceSize: SpaceSize;
  flooringType?: string;
  specialFeatures?: string[];
  clearHeight?: number;
  turfInstallation?: boolean;
  courtType?: string;
  tournamentGrade?: boolean;
  indoorOutdoor?: 'indoor' | 'outdoor';
}

export interface EquipmentLineItem {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  description?: string;
}

export interface EquipmentCategory {
  category: string;
  items: EquipmentLineItem[];
  subtotal: number;
}

export interface EquipmentQuote {
  sport: SportKey;
  inputs: EquipmentInputs;
  lineItems: EquipmentCategory[];
  totals: {
    equipment: number;
    flooring: number;
    installation: number;
    grandTotal: number;
  };
  metadata: {
    generatedAt: string;
    reliability: 'rough' | 'estimated' | 'detailed';
  };
}
