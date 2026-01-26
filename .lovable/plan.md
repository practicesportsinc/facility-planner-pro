

## Plan: Update Artificial Turf Pricing

### Overview
Update the artificial turf material pricing in the cost library to the specified tier values.

---

### Change Required

**File: `src/data/costLibrary.ts`**

Update the `turf_installed` cost tiers (line 16):

```typescript
// Before
costTiers: { low: 6, mid: 8, high: 11 },

// After
costTiers: { low: 3, mid: 5, high: 10 },
```

---

### Impact

For a 4-lane baseball facility (4,800 SF of turf) at mid-tier:

| Before | After |
|--------|-------|
| 4,800 × $8 = **$38,400** | 4,800 × $5 = **$24,000** |

This pricing applies everywhere turf is used (baseball, multi-sport facilities).

---

### Files to Modify
1. `src/data/costLibrary.ts` - Update turf_installed costTiers to { low: 3, mid: 5, high: 10 }

