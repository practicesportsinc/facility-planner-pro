

## Plan: Fix Soccer/Football Turf Calculation

### Issues Identified
1. **Missing units multiplier**: The turf square footage calculation doesn't multiply by the number of fields
2. **Wrong pricing tier**: Soccer and football should use high-tier turf pricing ($10/SF) instead of mid-tier ($5/SF)

---

### Current Calculation (Incorrect)

```
Fields: 4
Square Footage: 20,000 × 1.0 = 20,000 SF (ignores field count)
Unit Cost: $5/SF (mid tier)
Total: $100,000
```

### Expected Calculation (Corrected)

```
Fields: 4
Square Footage: 4 × 20,000 × 1.0 = 80,000 SF
Unit Cost: $10/SF (high tier)
Total: $800,000
```

---

### Change Required

**File: `src/utils/equipmentCalculator.ts`**

Update lines 283-296 in the `calculateFlooring` function:

**Before:**
```typescript
case 'soccer_indoor_small_sided':
case 'football':
case 'multi_sport':
  sqft = 20000 * spaceMultiplier;
  const turfItem = COST_LIBRARY.turf_installed;
  if (turfItem) {
    items.push({
      name: 'Multi-Sport Turf',
      quantity: sqft,
      unitCost: turfItem.costTiers.mid,
      totalCost: sqft * turfItem.costTiers.mid,
    });
  }
  break;
```

**After:**
```typescript
case 'soccer_indoor_small_sided':
case 'football':
case 'multi_sport': {
  sqft = inputs.units * 20000 * spaceMultiplier;
  const turfItem = COST_LIBRARY.turf_installed;
  if (turfItem) {
    // Soccer and football use high-tier turf for professional quality
    const usesHighTierTurf = inputs.sport === 'soccer_indoor_small_sided' || inputs.sport === 'football';
    const turfCost = usesHighTierTurf ? turfItem.costTiers.high : turfItem.costTiers.mid;
    items.push({
      name: 'Multi-Sport Turf',
      quantity: sqft,
      unitCost: turfCost,
      totalCost: sqft * turfCost,
    });
  }
  break;
}
```

---

### Impact Example (4 Indoor Soccer Fields, Medium Size)

| Metric | Before | After |
|--------|--------|-------|
| Total SF | 20,000 | 80,000 |
| Unit Cost | $5/SF | $10/SF |
| Turf Total | $100,000 | $800,000 |

---

### File to Modify
1. `src/utils/equipmentCalculator.ts` - Lines 283-296: Add units multiplier and use high-tier turf pricing for soccer/football

