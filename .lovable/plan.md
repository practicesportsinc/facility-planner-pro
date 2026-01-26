

## Plan: Update Baseball Quote Display and Turf Naming

### Overview
Three changes to improve the baseball equipment quote display:
1. Rename "Artificial Turf Installation" to "Artificial Turf" (materials only)
2. Change "Courts" label to "Lanes" for baseball/softball
3. Add lane dimensions display similar to pickleball's pad size

---

### Changes Required

#### 1. Rename Turf Line Item

**File: `src/utils/equipmentCalculator.ts`**

Line 216 - Change the name from "Artificial Turf Installation" to "Artificial Turf":

```typescript
// Before
name: 'Artificial Turf Installation',

// After
name: 'Artificial Turf',
```

---

#### 2. Update Unit Label and Add Lane Size Display

**File: `src/components/equipment/EquipmentQuote.tsx`**

**A) Add helper function for baseball lane info (after line 39):**

```typescript
// Calculate baseball lane info for display
const getBaseballLaneInfo = () => {
  if (quote.sport !== 'baseball_softball') return null;
  
  const spaceMultiplier = quote.inputs.spaceSize === 'small' ? 0.8 
    : quote.inputs.spaceSize === 'large' ? 1.2 
    : 1;
  const sqftPerLane = 1200 * spaceMultiplier;
  const totalSqft = Math.round(quote.inputs.units * sqftPerLane);
  
  // Standard batting cage: 70' x ~15' = ~1,050 SF, with buffer ~1,200 SF
  const laneWidth = quote.inputs.spaceSize === 'small' ? "12'" 
    : quote.inputs.spaceSize === 'large' ? "18'" 
    : "15'";
  
  return {
    laneDimensions: `70' x ${laneWidth}`,
    totalSqft,
  };
};

const laneInfo = getBaseballLaneInfo();
```

**B) Update unit label based on sport (line 93):**

```typescript
// Before
<div className="text-sm text-muted-foreground mb-1">Courts</div>

// After - Dynamic label based on sport
<div className="text-sm text-muted-foreground mb-1">
  {quote.sport === 'baseball_softball' ? 'Lanes' : 'Courts'}
</div>
```

**C) Update grid column count for baseball (line 87):**

```typescript
// Before
<div className={`grid grid-cols-2 ${courtInfo ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-8`}>

// After - Account for both pickleball and baseball having 5 columns
<div className={`grid grid-cols-2 ${(courtInfo || laneInfo) ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-8`}>
```

**D) Add lane size display after the courts/lanes stat (after line 105):**

```typescript
{/* Lane Size - only for baseball */}
{laneInfo && (
  <div className="text-center p-4 bg-muted/50 rounded-lg">
    <div className="text-sm text-muted-foreground mb-1">Lane Size</div>
    <div className="font-semibold">{laneInfo.laneDimensions}</div>
    <div className="text-xs text-muted-foreground">
      {laneInfo.totalSqft.toLocaleString()} SF total
    </div>
  </div>
)}
```

**E) Update facilityDetails size string (line 168):**

```typescript
// Before
size: `${quote.inputs.units} ${quote.inputs.units === 1 ? 'court' : 'courts'} (${quote.inputs.spaceSize})`,

// After - Use correct terminology per sport
size: `${quote.inputs.units} ${
  quote.sport === 'baseball_softball' 
    ? (quote.inputs.units === 1 ? 'lane' : 'lanes')
    : (quote.inputs.units === 1 ? 'court' : 'courts')
} (${quote.inputs.spaceSize})`,
```

---

### Expected Result

**Before:**
| Sport | Courts | Space | Total |
|-------|--------|-------|-------|

**After (for Baseball):**
| Sport | Lanes | Lane Size | Space | Total |
|-------|-------|-----------|-------|-------|
| Baseball / Softball | 4 | 70' x 15' (4,800 SF total) | Medium | $122,400 |

---

### Files to Modify
1. `src/utils/equipmentCalculator.ts` - Rename turf item (1 line)
2. `src/components/equipment/EquipmentQuote.tsx` - Add lane info helper, update labels, add lane size display

