

## Fix: Eliminate Double-Click to Reach Flash Analysis

### Problem
The Home page's "Flash Analysis" card navigates to `/market-analysis`, which shows the same chooser page again — forcing a redundant second click. The nav bar also links to this intermediate page.

### Changes

**1. `src/pages/Home.tsx` (line 243)**
Change the Flash Analysis card's `onClick` from `navigate('/market-analysis')` to `navigate('/market-analysis/flash')` so it goes directly to the Flash Analysis page.

**2. `src/components/layout/Header.tsx` (lines 164, 358)**
The nav bar "Market Analysis / Biz Plan" links currently go to `/market-analysis` (the intermediate chooser). Two options:
- Keep as-is (the chooser page is still useful when clicking from the nav bar since the user hasn't pre-chosen)
- Or change to go directly to Flash Analysis

I recommend keeping the nav bar link to `/market-analysis` since users clicking it from the nav haven't indicated a preference yet. Only the Home page card needs fixing since it's already labeled "Flash Analysis."

**3. `src/pages/MarketAnalysis.tsx`**
No changes needed — it remains as the chooser page for nav bar traffic.

This is a one-line fix in `Home.tsx`.

