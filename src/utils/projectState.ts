// Unified project state management for localStorage persistence

export interface ProjectState {
  id: string;
  mode: 'easy' | 'pro' | 'quick';
  created_at: string;
  updated_at: string;
  wizard?: {
    selected_sports?: string[];
    stage_code?: string;
  };
  facility_plan?: {
    shell_dims_ft?: [number, number];
    total_sqft?: number;
    court_or_cage_counts?: Record<string, number>;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  signals?: {
    target_open_bucket?: string;
  };
  estimate?: {
    inputs?: {
      selected_products?: string[];
      quantities?: Record<string, number>;
    };
  };
  kpis?: {
    capex_total?: number;
    monthly_revenue?: number;
    monthly_opex?: number;
    monthly_ebitda?: number;
    break_even_months?: number;
    gross_sf?: number;
  };
  lead?: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    outreach?: string;
    captured_at?: string;
  };
  [key: string]: any; // Allow for additional calculator data
}

export const generateProjectId = (mode: 'easy' | 'pro' | 'quick' = 'easy'): string => {
  return `${mode}-${Date.now()}`;
};

export const getStorageKey = (projectId: string): string => {
  return `ps:project:${projectId}`;
};

export const saveProjectState = (projectId: string, state: Partial<ProjectState>): void => {
  try {
    const key = getStorageKey(projectId);
    const existing = getProjectState(projectId);
    const updated: ProjectState = {
      ...existing,
      ...state,
      id: projectId,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save project state:', error);
  }
};

export const getProjectState = (projectId: string): ProjectState => {
  try {
    const key = getStorageKey(projectId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load project state:', error);
  }
  
  // Return default state
  return {
    id: projectId,
    mode: 'easy',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const mergeProjectState = (projectId: string, updates: Partial<ProjectState>): ProjectState => {
  const current = getProjectState(projectId);
  const merged = { ...current, ...updates };
  saveProjectState(projectId, merged);
  return merged;
};

export const upgradeToProMode = (projectId: string): ProjectState => {
  const current = getProjectState(projectId);
  return mergeProjectState(projectId, {
    mode: 'pro',
    upgraded_from: current.mode,
    upgraded_at: new Date().toISOString(),
  });
};

// Legacy compatibility functions
export const getWizardData = (projectId: string) => {
  const state = getProjectState(projectId);
  return {
    selectedSports: state.wizard?.selected_sports || [],
    facilitySize: state.facility_plan?.total_sqft || 0,
    selectedProducts: state.estimate?.inputs?.selected_products || [],
    quantities: state.estimate?.inputs?.quantities || {},
    ...state,
  };
};

/**
 * Check if project has lead data (name and email at minimum)
 */
export function hasLeadData(projectId: string): boolean {
  const state = getProjectState(projectId);
  return !!(state.lead?.name && state.lead?.email);
}