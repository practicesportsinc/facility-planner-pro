

## CRO Optimization: Flash Market Analysis Report Download

### Current Problems
1. The "Download Full Report" button is buried at the very bottom, below 4 navigation cards, styled as a low-priority `variant="outline"` button
2. Users see data and immediately have exit paths (Equipment, Building, Calculator, Business Plan) before ever encountering the lead-capture CTA
3. No urgency, social proof, or value framing around the download

### Proposed Changes (single file: `FlashMarketAnalysis.tsx`)

**1. Add a prominent CTA banner immediately after the stats grid (before Competitive Landscape)**
- Full-width gradient card with Download icon, headline ("Get the Full Report"), bullet points of what's included (competitive gaps, revenue potential, recommended sports mix), and a large primary button
- This places the CTA at the moment of peak engagement — right after the user sees their market score and data

**2. Add a sticky bottom bar CTA**
- A fixed-position bar at the bottom of the viewport with the report download button, visible as users scroll through results
- Disappears once they click it (or after lead gate closes)

**3. Reposition the "What's Next?" section**
- Move the 4 navigation cards below the primary CTA banner, not above it
- Change "Download Full Report" at the bottom from `variant="outline"` to a secondary mention or remove it (the sticky bar and inline banner handle it)

**4. Add value framing to the CTA**
- Include bullet points: "Includes: Competitive gap analysis, Top 3 recommended sports, Revenue potential estimate, Demographic deep-dive"
- Add a subtle "Free — no credit card required" note to reduce friction

### Layout Order (after changes)
```text
Header (City, State + New Analysis)
├── Stats Grid (Market Score, Population, Income, Sport Demand)
├── ★ DOWNLOAD CTA BANNER (new — prominent gradient card)
├── Competitive Landscape
├── What's Next? (4 navigation cards)
└── Sticky Bottom Bar (visible on scroll)
```

### Technical Details
- The inline CTA banner is a new `Card` with `bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30` styling and a `bg-gradient-primary text-white` button
- The sticky bar uses `fixed bottom-0 left-0 right-0 z-40` with a backdrop blur, containing a compact version of the CTA
- A `useEffect` with `IntersectionObserver` on the inline CTA hides the sticky bar when the inline CTA is visible (avoids redundancy)
- All buttons trigger the existing `setShowLeadGate(true)` — no new lead flow needed

