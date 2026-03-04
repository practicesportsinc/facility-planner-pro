

## Add Revenue Potential & Nearby Facility Names to Flash Market Analysis

### Two Features

**1. Revenue Potential Estimates (calculated client-side)**

Add a "Revenue Potential" card to the free zone (visible without unlocking) showing estimated annual revenue ranges based on the demographics we already have. This is a compelling hook that makes the lead gate even more enticing.

Calculation logic (in FlashMarketAnalysis.tsx):
- Base revenue per sport derived from: `population15Min × (sportDemand/100) × participationRate × avgSpendPerPerson`
- Use industry benchmarks: avg $500-1,500/year per active participant across lessons, leagues, memberships, rentals
- Show a total estimated market revenue range (low/high) for the area
- Show per-sport revenue potential breakdown (gated behind blur)

The top-level "Revenue Potential" card goes in the free stats grid with a headline number like "$2.4M - $4.1M estimated annual market". The per-sport breakdown goes in the gated zone.

**2. Nearby Competitive Facilities (via Google Places API)**

To show actual facility names, we need to call the Google Places API (Nearby Search) from the edge function. This requires:

- A `GOOGLE_PLACES_API_KEY` secret
- Extending the `analyze-location` edge function to call Google Places Nearby Search for sports-related facility types (e.g., `gym`, `stadium`, `sports_complex`) within a radius of the ZIP's lat/lng
- Returning a list of facilities with name, type, address, and rating
- Displaying them in a new "Nearby Facilities" card in the CompetitiveLandscape component (gated zone)

### Changes

**Edge function: `supabase/functions/analyze-location/index.ts`**
- After resolving ZIP to lat/lng (already available from zippopotam.us), call Google Places Nearby Search API
- Search for keywords: `"sports facility"`, `"indoor sports"`, `"batting cage"`, `"basketball gym"`, `"volleyball court"`, `"pickleball court"`
- Return top 10-15 results with: `name`, `vicinity` (address), `rating`, `types`
- Add results to response as `nearbyFacilities` array
- If API key missing or call fails, return empty array (graceful degradation)

**Frontend: `src/components/market/FlashMarketAnalysis.tsx`**
- Add revenue potential calculation function using demographics + sport demand
- Add a "Revenue Potential" Card to the free stats grid (3rd row or replacing the grid to be 2×2)
- Pass `nearbyFacilities` to CompetitiveLandscape component

**Frontend: `src/components/market/CompetitiveLandscape.tsx`**
- Add a new "Nearby Facilities" card showing actual facility names, addresses, and ratings from Google Places
- Displayed inside the gated/blurred zone

**Frontend: `src/components/market/FlashMarketAnalysis.tsx` (gated zone)**
- Add a per-sport revenue breakdown card inside the gated zone

### Revenue Calculation Model

```text
Per sport:
  participants = population15Min × (demandScore / 100) × 0.08
  revenueLow  = participants × $500
  revenueHigh = participants × $1,200

Total market:
  sum of top 3 sports' revenue ranges
  Display as "$X.XM – $X.XM estimated annual revenue potential"
```

### Secret Required
- `GOOGLE_PLACES_API_KEY` — needed for the Places Nearby Search API call in the edge function

### Summary of Files
1. `supabase/functions/analyze-location/index.ts` — add Google Places Nearby Search call
2. `src/components/market/FlashMarketAnalysis.tsx` — add Revenue Potential card (free zone) + per-sport revenue breakdown (gated zone) + pass nearby facilities data
3. `src/components/market/CompetitiveLandscape.tsx` — add Nearby Facilities card with real names/addresses

