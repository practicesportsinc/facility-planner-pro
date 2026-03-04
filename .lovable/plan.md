

## Diagnosis: LeadGate Unlock Not Working

After reviewing the code structure, the issue is a **layering/interaction problem** in the gated zone (lines 354-463 of `FlashMarketAnalysis.tsx`).

The overlay structure is:
```text
<div class="relative">                              ← gated zone container
  <div class="blur-md pointer-events-none ...">      ← tall blurred content
    Revenue Breakdown, Competitive Landscape, Next Steps...
  </div>
  <div class="absolute inset-0 ...">                 ← overlay (no z-index!)
    <div class="absolute inset-0 gradient pointer-events-none" />
    <div class="relative z-10">                      ← form
      <LeadGate />
    </div>
  </div>
</div>
```

**Problem**: The overlay div (`absolute inset-0`) has no explicit z-index. In some rendering contexts, it can end up behind other stacking contexts on the page. The gradient also covers the form area. Additionally, the relative container has no `overflow-hidden`, so the tall blurred content pushes the overall page height, making it look like interactive content below.

### Fix (single file: `src/components/market/FlashMarketAnalysis.tsx`)

1. **Add `overflow-hidden` and `z-10` to the relative gated zone container** (line 355) — clips the blurred content and establishes a proper stacking context.

2. **Add `z-20` to the overlay container** (line 442) — ensures the overlay and its form sit definitively above the blurred content.

3. **Add `pointer-events-auto` to the form container** (line 447) — explicitly ensures the form receives interaction events even if a parent absorbs them.

These are small class additions to 3 existing elements. No structural changes.

