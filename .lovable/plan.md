

## Plan: Add Court/Field Size Display for All Sports

### Overview
Extend the court/lane size display to all sports in the equipment quote summary, similar to what's already done for pickleball and baseball/softball.

---

### Sport Dimensions Reference

| Sport | Label | Base Dimensions | SF per Unit |
|-------|-------|-----------------|-------------|
| Baseball/Softball | Lane Size | 70' x 12'/15'/18' | 1,200 |
| Pickleball | Pad Size | 60' x 30' | 1,800 |
| Basketball | Court Size | 94' x 50' | 5,000 |
| Volleyball | Court Size | 60' x 30' | 3,000 |
| Soccer | Field Size | 200' x 85' | 20,000 |
| Football | Field Size | 200' x 85' | 20,000 |
| Multi-Sport | Field Size | 200' x 85' | 20,000 |

---

### Changes Required

**File: `src/components/equipment/EquipmentQuote.tsx`**

#### 1. Replace separate helper functions with a unified `getSizeInfo` function

Replace the two separate functions (`getPickleballCourtInfo` and `getBaseballLaneInfo`) with one unified function that handles all sports:

```typescript
const getSizeInfo = () => {
  const spaceMultiplier = quote.inputs.spaceSize === 'small' ? 0.8 
    : quote.inputs.spaceSize === 'large' ? 1.2 
    : 1;

  switch (quote.sport) {
    case 'baseball_softball': {
      const sqftPerLane = 1200 * spaceMultiplier;
      const totalSqft = Math.round(quote.inputs.units * sqftPerLane);
      const laneWidth = quote.inputs.spaceSize === 'small' ? "12'" 
        : quote.inputs.spaceSize === 'large' ? "18'" : "15'";
      return {
        label: 'Lane Size',
        dimensions: `70' x ${laneWidth}`,
        totalSqft,
      };
    }
    case 'pickleball': {
      const sqftPerCourt = 1800 * spaceMultiplier;
      const totalSqft = Math.round(quote.inputs.units * sqftPerCourt);
      return {
        label: 'Pad Size',
        dimensions: "60' x 30'",
        totalSqft,
      };
    }
    case 'basketball': {
      const sqftPerCourt = 5000 * spaceMultiplier;
      const totalSqft = Math.round(quote.inputs.units * sqftPerCourt);
      return {
        label: 'Court Size',
        dimensions: "94' x 50'",
        totalSqft,
      };
    }
    case 'volleyball': {
      const sqftPerCourt = 3000 * spaceMultiplier;
      const totalSqft = Math.round(quote.inputs.units * sqftPerCourt);
      return {
        label: 'Court Size',
        dimensions: "60' x 30'",
        totalSqft,
      };
    }
    case 'soccer_indoor_small_sided':
    case 'football':
    case 'multi_sport': {
      const totalSqft = Math.round(20000 * spaceMultiplier);
      return {
        label: 'Field Size',
        dimensions: "200' x 85'",
        totalSqft,
      };
    }
    default:
      return null;
  }
};

const sizeInfo = getSizeInfo();
```

#### 2. Simplify the grid layout logic

Update the grid column check from `(courtInfo || laneInfo)` to just `sizeInfo`:

```typescript
<div className={`grid grid-cols-2 ${sizeInfo ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-8`}>
```

#### 3. Replace separate display blocks with unified size display

Replace the two conditional blocks for pickleball and baseball with one unified block:

```typescript
{/* Size Display - for all sports */}
{sizeInfo && (
  <div className="text-center p-4 bg-muted/50 rounded-lg">
    <div className="text-sm text-muted-foreground mb-1">{sizeInfo.label}</div>
    <div className="font-semibold">{sizeInfo.dimensions}</div>
    <div className="text-xs text-muted-foreground">
      {sizeInfo.totalSqft.toLocaleString()} SF total
    </div>
  </div>
)}
```

#### 4. Update unit label logic for soccer/football

Extend the Courts/Lanes/Fields label logic:

```typescript
<div className="text-sm text-muted-foreground mb-1">
  {quote.sport === 'baseball_softball' ? 'Lanes' 
    : ['soccer_indoor_small_sided', 'football', 'multi_sport'].includes(quote.sport) ? 'Fields'
    : 'Courts'}
</div>
```

#### 5. Update facilityDetails size string

Extend the terminology in the PricingDisclaimer payload:

```typescript
size: `${quote.inputs.units} ${
  quote.sport === 'baseball_softball' 
    ? (quote.inputs.units === 1 ? 'lane' : 'lanes')
    : ['soccer_indoor_small_sided', 'football', 'multi_sport'].includes(quote.sport)
      ? (quote.inputs.units === 1 ? 'field' : 'fields')
      : (quote.inputs.units === 1 ? 'court' : 'courts')
} (${quote.inputs.spaceSize})`,
```

---

### Expected Result

**Basketball Quote Summary:**
| Sport | Courts | Court Size | Space | Total |
|-------|--------|------------|-------|-------|
| Basketball | 2 | 94' x 50' (10,000 SF total) | Medium | $XX,XXX |

**Soccer Quote Summary:**
| Sport | Fields | Field Size | Space | Total |
|-------|--------|------------|-------|-------|
| Soccer | 1 | 200' x 85' (20,000 SF total) | Medium | $XX,XXX |

---

### Files to Modify
1. `src/components/equipment/EquipmentQuote.tsx` - Unify size display logic for all sports

