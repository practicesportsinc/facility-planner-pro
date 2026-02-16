

## Add Email Delivery for Maintenance Plans

### Problem
The maintenance plan dashboard only has a "Download PDF" button. There is no way for users to email the plan to themselves or others. The email delivery integration was planned but never implemented.

### What Changes

Add an "Email Plan" button to the Maintenance Dashboard that:
1. Generates the maintenance plan PDF (same as download)
2. Converts it to base64
3. Sends it to the user (and optionally additional recipients) via the existing `send-lead-emails` edge function
4. Also captures the lead in the `leads` database table
5. Sends a company notification to the sales team

### User Experience

On the Dashboard (Step 5), the action bar changes from:

```text
[Back]                          [Download PDF]
```

to:

```text
[Back]                   [Email Plan]  [Download PDF]
```

Clicking "Email Plan":
- Validates that an email address was entered in the Location step
- Generates the PDF in memory
- Sends it as an attachment to the user's email
- Shows a success toast: "Plan emailed to john@facility.com"
- Also notifies the company team (chad@sportsfacility.ai + info@practicesports.com)

### Technical Changes

**1. Update `src/utils/maintenancePlanPdf.ts`**
- Extract the PDF generation into a reusable function that can return the jsPDF doc object (or base64 string) without triggering a download
- Add a new export: `generateMaintenancePlanPdfBase64(state, plan)` that returns the base64-encoded PDF content

**2. Update `src/components/maintenance/MaintenanceDashboard.tsx`**
- Add an "Email Plan" button with a Mail icon next to the Download button
- On click: generate PDF as base64, call `supabase.functions.invoke('send-lead-emails', ...)` with the maintenance plan data and PDF attachment
- Also call `submitLeadToDatabase` (or insert directly) with source `maintenance-plan` to capture the lead
- Show loading state while sending, success/error toast on completion

### Files to Modify

| File | Change |
|------|--------|
| `src/utils/maintenancePlanPdf.ts` | Add `generateMaintenancePlanPdfBase64()` export that returns base64 without triggering download |
| `src/components/maintenance/MaintenanceDashboard.tsx` | Add "Email Plan" button with send logic using the existing `send-lead-emails` edge function |

No new files, no edge function changes, no database changes needed -- everything reuses the existing email infrastructure.
