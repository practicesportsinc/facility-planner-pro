

## Add Value Framing to the Flash Market Analysis Input Screen

### What
Add persuasive content to the initial ZIP code entry view (the `return` block at the bottom of `FlashMarketAnalysis.tsx`) so users understand what they'll get before typing their ZIP.

### Changes (single file: `src/components/market/FlashMarketAnalysis.tsx`)

Below the ZIP input and "Results in under 30 seconds" text, add a value-proposition card showing what the analysis includes:

1. **"What You'll Get" section** — a grid of 4 mini feature cards with icons:
   - Market viability score
   - Population & income data
   - Sport demand rankings
   - Competitive landscape

2. **Trust line** — "Free — no signup required" with a subtle lock/shield icon

3. **Social proof line** — e.g. "Used by 500+ facility planners nationwide"

All additions go inside the existing `max-w-xl mx-auto text-center` wrapper, after the input row. Styling uses existing Card, muted-foreground, and primary color tokens.

