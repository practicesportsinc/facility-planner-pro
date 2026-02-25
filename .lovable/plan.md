

## Fix: Home Button / Logo Not Returning to Homepage on Equipment Path

### Problem
When the user is on the equipment flow (URL: `/?mode=equipment`), clicking the Home button or logo in the header navigates to `/`. Since both URLs share the same route (`/` → `Home` component), React doesn't unmount/remount the component. The `useState` for `flowStep` retains its current value (`'sport'`), and the `useEffect` that reads `searchParams` only sets `flowStep` forward (to `'sport'` or `'facility'`) — it never resets it back to `'path'` when the mode param is absent.

### Root Cause
In `src/pages/Home.tsx`, lines 55-62:
```js
useEffect(() => {
  const mode = searchParams.get('mode');
  if (mode === 'equipment') {
    setFlowStep('sport');
  } else if (mode === 'facility') {
    setFlowStep('facility');
  }
}, [searchParams]);
```
There is no `else` branch to reset `flowStep` back to `'path'` when `mode` is `null`.

### Fix
Add an `else` clause that resets `flowStep` to `'path'` and clears the selected sport/quote state when no `mode` query param is present.

### File to Modify

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Add `else` branch in the `searchParams` useEffect to reset `flowStep` to `'path'`, clear `selectedSport` and `quote` |

This is a one-line addition to the existing `useEffect`.

