

## Lead-Gate the Flash Market Analysis Results

### Concept
Show the top section of results freely (Market Score + Population + Income cards), then blur everything below with a gradient overlay and an inline lead capture form. Once the user submits contact info, the blur lifts and they see the full report. This replaces the current "Download Report" CTA banner approach with a more compelling content-gating pattern.

### What's Free (visible)
- Header with city/state and "New Analysis" button
- Market Score card
- Population Reach card
- Income & Growth card

### What's Gated (blurred until contact info submitted)
- Sport Demand rankings
- CTA banner (removed — replaced by inline gate)
- Competitive Landscape section
- "What's Next?" navigation cards
- Sticky bottom bar (removed — no longer needed)

### Changes

**Single file: `src/components/market/FlashMarketAnalysis.tsx`**

1. **Add `isUnlocked` state** (default `false`). Set to `true` after lead form submission.

2. **Restructure the results JSX** into two zones:
   - **Free zone** (lines ~260-306): Market Score + Population + Income/Growth cards — rendered normally.
   - **Gated zone** (lines ~308 onward): Wrapped in a container with `relative overflow-hidden`. When `!isUnlocked`:
     - Content renders but with `blur-md pointer-events-none select-none` classes
     - A gradient overlay div (`absolute inset-0`) fades from transparent at top to background color
     - An inline `LeadGate` component (mode='inline') sits centered on top of the overlay

3. **On lead submit**: Call the existing `handleDownloadReport` logic, then set `isUnlocked = true`. The blur and overlay disappear, revealing full content.

4. **Remove the sticky bottom bar** and the inline CTA banner — the blur gate replaces both as the primary conversion mechanism.

5. **Remove `showStickyBar` state** and the `IntersectionObserver` effect — no longer needed.

### Layout (gated state)

```text
┌──────────────────────────────────┐
│ City, State          [New Analysis] │  ← free
│                                      │
│ ┌─────────┐ ┌──────────┐ ┌────────┐ │
│ │ Market  │ │Population│ │Income  │ │  ← free
│ │ Score   │ │ Reach    │ │& Growth│ │
│ └─────────┘ └──────────┘ └────────┘ │
│                                      │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← blurred
│ ▓ Sport Demand (blurred)          ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 🔓 Unlock Full Report       │    │  ← LeadGate inline
│  │ [Name] [Email] [Phone]      │    │
│  │ [Submit]                    │    │
│  └──────────────────────────────┘    │
│                                      │
│ ▓▓▓ Competitive Landscape (blur) ▓▓ │
│ ▓▓▓ What's Next (blur)          ▓▓ │
└──────────────────────────────────────┘
```

### After unlock
All content renders normally with no blur, overlay, or gate. The "What's Next" cards and Competitive Landscape are fully visible.

