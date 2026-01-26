

## Plan: Fix Turf Pricing Not Appearing in Baseball Equipment Quote

### Problem Identified
When a user selects baseball in the Equipment Only path and checks "Include turf installation", no turf pricing appears in the quote.

### Root Cause
In `src/utils/equipmentCalculator.ts`, the code references a non-existent cost library key:

```typescript
const turfItem = COST_LIBRARY['turf-field'];  // ❌ This key doesn't exist
```

The actual key in `costLibrary.ts` is `turf_installed`, not `turf-field`. Since the lookup returns `undefined`, the `if (turfItem)` check fails silently and no turf line item is added.

---

### Changes Required

**File: `src/utils/equipmentCalculator.ts`**

Update the cost library key references from `'turf-field'` to `turf_installed`:

**Line 213** (baseball turf):
```typescript
// Before
const turfItem = COST_LIBRARY['turf-field'];

// After
const turfItem = COST_LIBRARY.turf_installed;
```

**Line 287** (multi-sport turf):
```typescript
// Before
const turfItem = COST_LIBRARY['turf-field'];

// After  
const turfItem = COST_LIBRARY.turf_installed;
```

---

### Impact

After this fix, selecting "Include turf installation" for baseball will add a line item:

| Item | Calculation | Example (4 cages, medium) |
|------|-------------|---------------------------|
| Artificial Turf Installation | units × 1,200 SF × $8/SF | 4 × 1,200 × $8 = **$38,400** |

This will also fix multi-sport turf pricing (soccer, football) which uses the same lookup.

---

### Files to Modify
1. `src/utils/equipmentCalculator.ts` - Fix cost library key in 2 locations (lines 213 and 287)

