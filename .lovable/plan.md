

## Tease "Top Sports by Demand" with Gradual Blur

### Approach
Move the SportDemandList out of the fully-blurred gated zone and instead apply a per-row progressive blur when locked. The heading and first sport row are fully visible, subsequent rows get increasingly blurred, creating a teaser effect that entices the user to unlock.

### Changes

**1. `src/components/market/SportDemandList.tsx`** — Add an optional `blurRows` prop

- Accept `blurRows?: boolean` prop
- When `blurRows` is true, apply increasing `blur` and decreasing `opacity` via inline styles on each sport row based on its index:
  - Row 0: no blur (fully visible)
  - Row 1: `blur(1px)`, opacity 0.8
  - Row 2: `blur(3px)`, opacity 0.6
  - Row 3: `blur(5px)`, opacity 0.4
  - Row 4: `blur(7px)`, opacity 0.3
- Also add `pointer-events-none select-none` to blurred rows

**2. `src/components/market/FlashMarketAnalysis.tsx`** — Pull SportDemandList above the gated zone

- Move the `<SportDemandList>` call out of the blurred `div` (line 299-301) and place it between the stats grid (line 292) and the gated zone (line 294)
- Pass `blurRows={!isUnlocked}` so the progressive blur only applies when locked
- The remaining gated content (Competitive Landscape, What's Next) stays fully blurred as before

### Result
Users see the "Top Sports by Demand" heading clearly, the #1 sport fully visible, and a tantalizing fade into blur for the rest — a strong incentive to fill in the lead form to see the full rankings.

