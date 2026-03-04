

## Plan: Rich Market Analysis Emails (Customer + Company)

### Problem
The Flash Market Analysis `handleUnlock` currently sends a bare-bones email with only the location. The customer gets a generic "facility planning request" email with no market data. The company notification also lacks the report highlights, making it hard for the sales team to see what the lead discovered.

### What the emails should include
From the `marketData` object available at unlock time:
- **Market Score** (e.g. 72/100 — "Strong Opportunity")
- **Demographics** — population (10/15/20 min), median income, youth %, growth rate
- **Top Sports by Demand** — ranked list with scores
- **Competitive Analysis** — competition score, facility saturation per sport, market gaps
- **Revenue Potential** — top 3 sport revenue ranges, total range
- **Nearby Facilities** — names and locations of competitors

### Implementation (4 files)

**1. Edge function schema — `supabase/functions/send-lead-emails/index.ts`**
- Add optional `marketAnalysis` field to `EmailPayloadSchema` with sub-fields: `location`, `marketScore`, `demographics`, `sportDemand[]`, `competitionScore`, `facilityEstimates`, `marketGaps[]`, `revenuePotential`, `nearbyFacilities[]`, `insights[]`
- Pass it through to both customer and company email template renders

**2. Customer email — `supabase/functions/send-lead-emails/_templates/customer-confirmation.tsx`**
- Accept optional `marketAnalysis` prop
- Render a "Your Market Analysis Results" section when present, including:
  - Market Score gauge (text-based: "72/100 — Strong Opportunity")
  - Demographics summary (population, income, youth %)
  - Top 5 sports ranked by demand with scores
  - Revenue potential range
  - Competition level
  - Top market gaps/opportunities
  - Nearby facility names
- This replaces the generic "facility planning request" copy for market analysis leads

**3. Company email — `supabase/functions/send-lead-emails/_templates/company-notification.tsx`**
- Accept optional `marketAnalysis` prop
- Render a "📊 Market Analysis Report" section with all the same highlights
- Gives sales team full context on what the lead saw

**4. Client payload — `src/components/market/FlashMarketAnalysis.tsx`**
- In `handleUnlock`, compute `marketScore`, `revenuePotential`, `sportDemandArray` (already calculated in render) and pass them as `marketAnalysis` in the `send-lead-emails` payload
- Include demographics, competitive analysis, nearby facilities, and market gaps from `marketData`

### No database or RLS changes needed
All changes are in the email edge function, its templates, and the client-side payload construction.

