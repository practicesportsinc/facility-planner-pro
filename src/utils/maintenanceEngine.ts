import { MAINTENANCE_ASSETS, TAXONOMY_VERSION } from '@/data/maintenanceAssets';
import type {
  AssetSelection,
  Cadence,
  MaintenancePlan,
  ScheduledTask,
} from '@/types/maintenance';

const CADENCE_ORDER: Cadence[] = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];

function shiftCadenceUp(cadence: Cadence): Cadence {
  const idx = CADENCE_ORDER.indexOf(cadence);
  return idx > 0 ? CADENCE_ORDER[idx - 1] : cadence;
}

export function generateMaintenancePlan(selections: AssetSelection[]): MaintenancePlan {
  const allTasks: ScheduledTask[] = [];
  const allRedFlags: MaintenancePlan['redFlags'] = [];
  const contractorMap = new Map<string, Set<string>>();

  for (const sel of selections) {
    const asset = MAINTENANCE_ASSETS.find((a) => a.id === sel.assetId);
    if (!asset) continue;

    // Collect red flags
    if (asset.redFlags.length > 0) {
      allRedFlags.push({ assetId: asset.id, assetName: asset.name, flags: asset.redFlags });
    }

    // Collect contractor needs
    for (const cat of asset.contractorCategories) {
      if (!contractorMap.has(cat)) contractorMap.set(cat, new Set());
      asset.tasks
        .filter((t) => !t.staffCanDo)
        .forEach((t) => contractorMap.get(cat)!.add(`${asset.name}: ${t.description}`));
    }

    // Generate tasks with cadence modifiers
    for (const task of asset.tasks) {
      let cadence = task.cadence;
      let isModified = false;

      // Age 8-12 + Class A/B: quarterly → monthly
      if (
        (sel.ageBucket === '8-12') &&
        (asset.assetClass === 'A' || asset.assetClass === 'B') &&
        cadence === 'quarterly'
      ) {
        cadence = 'monthly';
        isModified = true;
      }

      // Age 13+: quarterly → monthly for A/B, plus add structural inspection
      if (
        sel.ageBucket === '13+' &&
        (asset.assetClass === 'A' || asset.assetClass === 'B') &&
        cadence === 'quarterly'
      ) {
        cadence = 'monthly';
        isModified = true;
      }

      // Heavy usage: shift all cadences one step more frequent
      if (sel.usageIntensity === 'heavy') {
        const shifted = shiftCadenceUp(cadence);
        if (shifted !== cadence) {
          cadence = shifted;
          isModified = true;
        }
      }

      allTasks.push({
        assetId: asset.id,
        assetName: asset.name,
        assetClass: asset.assetClass,
        cadence,
        description: task.description,
        staffCanDo: task.staffCanDo,
        docRequired: task.docRequired,
        quantity: sel.quantity,
        isModified,
      });
    }

    // Age 13+: add structural inspection if not already present
    if (sel.ageBucket === '13+' && (asset.assetClass === 'A' || asset.assetClass === 'B')) {
      const hasStructural = asset.tasks.some(
        (t) => t.cadence === 'annual' && t.description.toLowerCase().includes('structural')
      );
      if (!hasStructural) {
        allTasks.push({
          assetId: asset.id,
          assetName: asset.name,
          assetClass: asset.assetClass,
          cadence: 'annual',
          description: 'Additional structural inspection required for equipment aged 13+ years',
          staffCanDo: false,
          docRequired: true,
          quantity: sel.quantity,
          isModified: true,
        });
      }
    }
  }

  // Group tasks by cadence
  const grouped: MaintenancePlan['tasks'] = {
    daily: [],
    weekly: [],
    monthly: [],
    quarterly: [],
    annual: [],
  };
  for (const task of allTasks) {
    grouped[task.cadence].push(task);
  }

  // Sort each group by asset class then name
  for (const cadence of CADENCE_ORDER) {
    grouped[cadence].sort((a, b) => a.assetClass.localeCompare(b.assetClass) || a.assetName.localeCompare(b.assetName));
  }

  const contractorNeeds = Array.from(contractorMap.entries()).map(([category, tasks]) => ({
    category,
    tasks: Array.from(tasks),
  }));

  return {
    version: TAXONOMY_VERSION,
    generatedAt: new Date().toISOString(),
    tasks: grouped,
    redFlags: allRedFlags,
    contractorNeeds,
  };
}
