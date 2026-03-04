
Goal
- Make Flash Market Analysis require contact info again for each new analysis run.

What I found
- The unlock state is held in `isUnlocked` inside `src/components/market/FlashMarketAnalysis.tsx`.
- `handleUnlock()` sets `isUnlocked` to `true`.
- `handleReset()` currently clears `marketData` and `zipCode`, but does not reset `isUnlocked`.
- Result: after one successful unlock, a “New Analysis” can still show ungated content because unlock state carries over in the same component session.

Implementation plan
1. Reset unlock state on “New Analysis”
- Update `handleReset()` to also call `setIsUnlocked(false)`.

2. Add defensive reset on each analysis start
- In `analyzeZip(zip)`, set `setIsUnlocked(false)` before invoking the edge function so every fresh analysis starts locked (covers any alternate trigger paths too).

3. Keep existing lead-capture flow unchanged
- Do not change `LeadGate`, submission handlers, or edge functions.
- Keep current unlock copy and overlay behavior exactly as-is.

Validation plan
1. Run analysis for ZIP A (e.g., 68138) → confirm lead gate appears.
2. Submit contact info → confirm gated sections unlock.
3. Click “New Analysis,” run ZIP B (e.g., 68046) → confirm lead gate appears again before deep sections.
4. Repeat with same ZIP again to verify it still re-gates per new run.
5. Confirm no regressions: top free cards still visible, unlock still triggers existing lead sync/email calls.

Technical details
- File to update: `src/components/market/FlashMarketAnalysis.tsx`
- Functions touched:
  - `handleReset()`: add `setIsUnlocked(false)`
  - `analyzeZip(zip: string)`: add `setIsUnlocked(false)` at start of valid analysis flow
- No schema, RLS, or Supabase function changes required.
