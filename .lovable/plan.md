
## Plan: Remove "Installation" from Equipment-Only Material Names

### Issue
On the Equipment-Only path, flooring/surface items should only represent materials. The "Multi-Sport Turf Installation" label incorrectly implies installation is included in that line item, when installation is actually calculated separately as a 50% labor cost displayed below.

---

### Change Required

**File: `src/utils/equipmentCalculator.ts`**

Update line 290 in the `calculateFlooring` function:

```typescript
// Before (line 290)
name: 'Multi-Sport Turf Installation',

// After
name: 'Multi-Sport Turf',
```

---

### Verification
After this change:
- The quote will show **"Multi-Sport Turf"** under Flooring & Surfaces
- The separate **"Installation (est.)"** line will continue to show below the totals
- This matches the existing pattern used for baseball ("Artificial Turf") and other sports

---

### File to Modify
1. `src/utils/equipmentCalculator.ts` - Line 290: Remove "Installation" from turf item name
