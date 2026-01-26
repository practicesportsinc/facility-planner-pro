

## Plan: Update Pickleball Court Dimensions with Buffer Zone

### Overview
Update pickleball court sizing to reflect realistic dimensions including buffer zones. A standard pickleball court is 20' x 44', but with required buffer zones, the typical concrete pad is **60' x 30' (1,800 SF)**.

---

### Current vs. Corrected Dimensions

| Measurement | Current | Corrected |
|-------------|---------|-----------|
| Court only | 20' x 44' (880 SF) | 20' x 44' (880 SF) |
| **With buffer (pad size)** | 800 SF | **1,800 SF (60' x 30')** |
| Perimeter for fencing | 160 LF | **180 LF** |

---

### Changes Required

#### 1. Update Equipment Calculator - Square Footage

**File: `src/utils/equipmentCalculator.ts`**

Update the pickleball square footage calculation (line 258):

```typescript
case 'pickleball':
  // Standard pickleball pad: 60' x 30' = 1,800 SF per court (includes buffer zones)
  sqft = inputs.units * 1800 * spaceMultiplier;
```

#### 2. Update Fencing Perimeter Calculation

**Same file, line 376:**

```typescript
// Standard pickleball pad: 60' x 30' = 180LF perimeter per court
const linearFeet = inputs.units * 180;
```

#### 3. Add Court Size Display to Equipment Quote

**File: `src/components/equipment/EquipmentQuote.tsx`**

Add a helper function and display court size in the summary stats:

```typescript
// Calculate pickleball court info for display
const getPickleballCourtInfo = () => {
  if (quote.sport !== 'pickleball') return null;
  
  const spaceMultiplier = quote.inputs.spaceSize === 'small' ? 0.8 
    : quote.inputs.spaceSize === 'large' ? 1.2 
    : 1;
  const sqftPerCourt = 1800 * spaceMultiplier;
  const totalSqft = Math.round(quote.inputs.units * sqftPerCourt);
  
  return {
    padDimensions: "60' x 30'",  // Standard pad with buffer
    courtDimensions: "20' x 44'", // Playing area
    totalSqft,
  };
};
```

Update the summary stats grid to show pad size:

```tsx
{/* Court Size - only for pickleball */}
{courtInfo && (
  <div className="text-center p-4 bg-muted/50 rounded-lg">
    <div className="text-sm text-muted-foreground mb-1">Pad Size</div>
    <div className="font-semibold">{courtInfo.padDimensions}</div>
    <div className="text-xs text-muted-foreground">
      {courtInfo.totalSqft.toLocaleString()} SF total
    </div>
  </div>
)}
```

---

### Impact on Pricing

For a single outdoor pickleball court with concrete base:

| Item | Current | Updated |
|------|---------|---------|
| Concrete (at $12/SF) | 800 SF × $12 = $9,600 | 1,800 SF × $12 = **$21,600** |
| Court Tiles (at $6/SF) | 800 SF × $6 = $4,800 | 1,800 SF × $6 = **$10,800** |
| Fencing (chain-link) | 160 LF × $20 = $3,200 | 180 LF × $20 = **$3,600** |

This reflects more accurate real-world costs for outdoor pickleball court construction.

---

### Files to Modify
1. `src/utils/equipmentCalculator.ts` - Update SF (800 → 1,800) and fencing LF (160 → 180)
2. `src/components/equipment/EquipmentQuote.tsx` - Add pad size display with "60' x 30'" dimensions

