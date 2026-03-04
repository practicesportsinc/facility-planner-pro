

## Update "What You'll Get" Cards

The current cards show 4 features: Market Score, Demographics, Sport Demand, Competition. The results view now also includes **Revenue Potential** (per-sport revenue estimates) and **Nearby Facilities** (real facility names via Google Places). Update the grid to 6 cards (3x2) to reflect all deliverables.

### Changes in `src/components/market/FlashMarketAnalysis.tsx`

Update the "What You'll Get" grid (around line 310) from `grid-cols-2` with 4 cards to `grid-cols-2 md:grid-cols-3` with 6 cards:

1. **Market Score** — keep as-is (Target icon)
2. **Demographics** — keep as-is (Users icon)
3. **Sport Demand** — keep as-is (Trophy icon)
4. **Revenue Potential** — NEW (DollarSign icon, "Per-sport revenue estimates")
5. **Competition** — keep as-is (BarChart3 icon)
6. **Nearby Facilities** — NEW (MapPin icon, "Real facility names & ratings")

