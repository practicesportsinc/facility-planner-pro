

## Plan: Update Volleyball Court Dimensions to 80' x 50'

### Overview
Update all volleyball court dimension references from 60' x 30' (3,000 SF) to the industry-standard 80' x 50' (4,000 SF).

---

### Dimension Calculation

| Before | After |
|--------|-------|
| 60' x 30' = 1,800 SF | 80' x 50' = 4,000 SF |
| + buffer = ~3,000 SF | (includes standard runouts/buffers) |

---

### Files to Update

#### 1. `src/components/equipment/EquipmentQuote.tsx`
Update the `getSizeInfo` function for volleyball:

```typescript
// Before (lines 62-69)
case 'volleyball': {
  const sqftPerCourt = 3000 * spaceMultiplier;
  ...
  dimensions: "60' x 30'",
}

// After
case 'volleyball': {
  const sqftPerCourt = 4000 * spaceMultiplier;
  ...
  dimensions: "80' x 50'",
}
```

---

#### 2. `src/utils/equipmentCalculator.ts`
Update the flooring calculation for volleyball:

```typescript
// Before (line 242)
sqft = inputs.units * 3000 * spaceMultiplier; // ~3000 SF per court

// After
sqft = inputs.units * 4000 * spaceMultiplier; // ~4000 SF per court (80' x 50')
```

---

#### 3. `src/data/sportPresets.ts`
Update the preset square footage:

```typescript
// Before (line 76)
perUnitSpaceSf: { volleyball_courts: 2592 }, // with runouts

// After
perUnitSpaceSf: { volleyball_courts: 4000 }, // 80' x 50' with runouts
```

---

#### 4. `src/data/wizardQuestions.ts`
Update the capacity estimation:

```typescript
// Before (line 315)
volleyball: Math.floor(suggestedSize / 3000), // ~3000 sf per court

// After
volleyball: Math.floor(suggestedSize / 4000), // ~4000 sf per court (80' x 50')
```

---

#### 5. `src/components/calculator/steps/KpiResults.tsx`
Update the per-unit SF for KPI calculations:

```typescript
// Before (line 59)
volleyball_courts: 2592,

// After
volleyball_courts: 4000,
```

---

#### 6. `src/components/calculator/steps/FacilityPlan.tsx`
Update recommended base size:

```typescript
// Before (line 78)
volleyball: 3000,

// After
volleyball: 4000,
```

---

#### 7. `src/components/layout/TopViewLayout.tsx`
Update the dimension comment and visual layout:

```typescript
// Before (line 5)
* - Volleyball: 72' x 36' = 2,592 sf

// After
* - Volleyball: 80' x 50' = 4,000 sf
```

---

#### 8. `supabase/functions/facility-chat/index.ts`
Update AI chat knowledge:

```typescript
// Before (line 172)
- Court: ~4,500 SF per court (60' x 30' + buffer)

// After
- Court: ~4,000 SF per court (80' x 50')
```

---

### Impact Summary

For a 4-court volleyball facility:

| Metric | Before | After |
|--------|--------|-------|
| Court Dimensions | 60' x 30' | 80' x 50' |
| SF per Court | 3,000 | 4,000 |
| Total SF (4 courts) | 12,000 | 16,000 |
| Flooring Cost (@ $8/SF) | $96,000 | $128,000 |

---

### Files to Modify
1. `src/components/equipment/EquipmentQuote.tsx` - Update getSizeInfo dimensions
2. `src/utils/equipmentCalculator.ts` - Update flooring calculation
3. `src/data/sportPresets.ts` - Update perUnitSpaceSf
4. `src/data/wizardQuestions.ts` - Update capacity estimation
5. `src/components/calculator/steps/KpiResults.tsx` - Update perUnitSF
6. `src/components/calculator/steps/FacilityPlan.tsx` - Update base size
7. `src/components/layout/TopViewLayout.tsx` - Update comment and visual dimensions
8. `supabase/functions/facility-chat/index.ts` - Update AI knowledge base

