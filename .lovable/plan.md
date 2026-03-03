

## Fix: Market Path Not Resetting When Clicking Logo/Home

### Problem
The `market-select` flow step is set via internal state (`handlePathSelect('market')`) without changing the URL -- the URL stays as `/` with no `mode` param. When the user clicks the logo or Home button (both link to `/`), React Router sees the URL hasn't changed, so `searchParams` doesn't update, and the `useEffect` that resets state never re-fires. The user stays stuck on the market-select view.

This same issue would affect any future internal flow step that doesn't use a URL `mode` parameter.

### Root Cause
The `useEffect` on line 55 depends on `[searchParams]`. When navigating from `/` to `/` (same URL), the `searchParams` reference doesn't change, so the effect doesn't run.

### Fix
Add `useLocation()` and include `location.key` as a dependency in the reset `useEffect`. Every React Router navigation generates a unique `location.key`, even when navigating to the same path. This ensures the effect fires on every navigation, catching the market-select case.

### Technical Changes

**File: `src/pages/Home.tsx`**

1. Import `useLocation` from `react-router-dom` (line 2)
2. Add `const location = useLocation();` in the component
3. Add `location.key` to the `useEffect` dependency array (line 66)

This is a 3-line change. No other files need modification.

