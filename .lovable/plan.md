

## Plan: Fix Demographic Field Name Mismatch

### Issue Identified
The "Market & Demographics" step shows **$0** for Median Income and **0%** for Youth Population because of a property name mismatch between the edge function response and the component's expected format.

### Root Cause Analysis

**Edge Function (`analyze-location/index.ts`) returns:**
```javascript
demographics: {
  medianIncome: 72000,        // ❌ Component expects: medianHouseholdIncome
  youthPercentage: 21,        // ❌ Component expects: youthPopulation
  // ...other fields match
}
```

**MarketAnalysisStep expects:**
```javascript
result.demographics?.medianHouseholdIncome  // Doesn't exist → returns 0
result.demographics?.youthPopulation        // Doesn't exist → returns 0
```

### Fix Required

**File: `supabase/functions/analyze-location/index.ts`**

Update the demographics object (lines 166-174) to use the field names expected by the component:

```typescript
// Before (current)
const demographics = {
  population10Min: 75000,
  population15Min: 150000,
  population20Min: 250000,
  medianIncome: 72000,           // ❌ Wrong name
  youthPercentage: 21,           // ❌ Wrong name
  familiesWithChildren: 30,
  populationGrowthRate: 0.6,
};

// After (fixed)
const demographics = {
  population10Min: 75000,
  population15Min: 150000,
  population20Min: 250000,
  medianHouseholdIncome: 72000,  // ✅ Matches component
  youthPopulation: 21,           // ✅ Matches component
  familiesWithChildren: 30,
  populationGrowthRate: 0.6,
};
```

### Impact

| Field | Before | After |
|-------|--------|-------|
| Median Income | $0 | $72,000 |
| Youth Population | 0% | 21% |
| Other demographics | Working | Working |

### File to Modify
1. `supabase/functions/analyze-location/index.ts` - Lines 170-171: Rename `medianIncome` to `medianHouseholdIncome` and `youthPercentage` to `youthPopulation`

### Note
After the fix, the Edge Function will need to be redeployed to take effect.

