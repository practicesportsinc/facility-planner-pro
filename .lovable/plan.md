

## Fix: Flash Market Analysis Returns Hardcoded Omaha Data

### Problem
The `analyze-location` edge function (lines 140-175) returns hardcoded test data for Omaha, NE regardless of the ZIP code entered. The demographics, city/state, sport demand scores, and competitive analysis are all static values.

### Solution
Update the edge function to use real data sources:

1. **ZIP-to-location lookup** — Use the existing `ZIP_PREFIX_TO_STATE` mapping (mentioned in memory) plus a free ZIP code API (e.g., `api.zippopotam.us`) to resolve the ZIP to a real city/state
2. **US Census Bureau API** — Use the ACS 5-Year API (free, no key required for basic queries) to fetch real demographics (population, median income, age distribution) for the ZIP's county/state
3. **Regional adjustments** — Vary sport demand scores and facility ratios by region instead of using flat values

### Technical Changes

**File: `supabase/functions/analyze-location/index.ts`**

| Change | Detail |
|--------|--------|
| Add ZIP lookup | Call `api.zippopotam.us/us/{zip}` to get city, state, latitude, longitude |
| Add Census API call | Query `api.census.gov/data/{year}/acs/acs5` for population (`B01003_001E`), median income (`B19013_001E`), age brackets (`B09001_001E` for under-18), household types (`B11003_001E`) at the county level |
| Remove hardcoded data | Replace the static `demographics`, `sportDemandScores`, and `location` objects with values derived from API responses |
| Add fallback | If Census API fails, use state-level averages with the existing regional adjustment factors (keep current logic as fallback) |
| Vary sport demand by region | Apply regional weighting to sport demand scores (e.g., baseball higher in Midwest/Southeast, pickleball higher in Southwest/West) |

The response shape stays identical so no frontend changes are needed.

### Fallback Strategy
- If ZIP lookup fails → return error asking for valid ZIP
- If Census API fails → use state-average estimates with a `dataSource.source: 'estimated'` flag (the frontend already handles this distinction)

