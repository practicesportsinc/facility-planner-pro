

## Fix: Maintenance Leads Not Syncing to Google Sheets

### Problem
The `MaintenanceDashboard.tsx` sends emails and inserts into the `leads` table directly, but never calls the `sync-lead-to-sheets` edge function. Other tools (quick estimate, calculator, etc.) use `dispatchLead()` from `leadDispatch.ts` which handles the Google Sheets sync. The maintenance wizard bypasses this entirely.

### Solution
After the `leads` table insert succeeds, add a call to `supabase.functions.invoke('sync-lead-to-sheets', ...)` with the lead data, matching the payload format used by `dispatchLead`.

### Changes (single file: `src/components/maintenance/MaintenanceDashboard.tsx`)

After line 113 (the `supabase.from('leads').insert(...)` call), add:

```typescript
// Sync lead to Google Sheets
await supabase.functions.invoke('sync-lead-to-sheets', {
  body: {
    name: state.name || 'Facility Owner',
    email: state.email,
    city: state.locationCity || '',
    state: state.locationState || '',
    facilityType: 'Maintenance Plan',
    sports: state.sports?.join(', ') || '',
    source: 'maintenance-plan',
    userAgent: navigator.userAgent,
    referrer: document.referrer || 'direct',
  },
});
```

This is a non-blocking addition -- if the sync fails, the email and DB insert have already succeeded. The error is caught by the existing try/catch block.

