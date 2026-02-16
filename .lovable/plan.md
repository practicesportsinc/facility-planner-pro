

## Auto-Send Email When Plan Is Generated

### Problem
The "Generate My Plan" button on the Location step only navigates to the Dashboard. Users expect it to also send them the maintenance plan via email. The "Email Plan" button exists on the Dashboard but requires a separate click.

### Solution
Automatically trigger the email send when the Dashboard first loads (i.e., when the user arrives from clicking "Generate My Plan"). This way the user gets the email without needing to find and click a second button.

### How It Works
1. When the Dashboard mounts for the first time, it checks if the user has a valid email address
2. If yes, it automatically calls the same `handleEmailPlan` logic (generate PDF as base64, invoke `send-lead-emails`, capture lead)
3. Shows a toast: "Your plan has been emailed to john@facility.com"
4. A `useRef` flag prevents re-sending on re-renders or navigation back/forth
5. The manual "Email Plan" button stays available for re-sending

### Technical Changes

**File: `src/components/maintenance/MaintenanceDashboard.tsx`**
- Add a `useEffect` with a `hasSentRef` guard that runs `handleEmailPlan` on first mount
- Extract the email-sending logic into a standalone function so both the auto-send and the button can use it
- Show a brief loading indicator or info toast ("Sending your plan...") during the auto-send

### No other files change
The Location step, edge function, and PDF generation all remain the same.

