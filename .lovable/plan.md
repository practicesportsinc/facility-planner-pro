

## Plan: Implement PDF Email Delivery for "Email Me This Plan" Button

### Problem Identified
The "Email me this plan" button in the Easy Wizard Results page captures lead information and sends a confirmation email with facility estimates, but **does NOT generate or attach a PDF**. The code explicitly has a `// TODO: Implement actual PDF generation` comment.

When users click "Email me this plan", they expect to receive a PDF business plan in their inbox, but they only receive a text-based confirmation email.

### Solution
Generate a PDF report using the existing `wizardReportPdf.ts` utility and attach it to the confirmation email sent to the user.

### Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                   Current Flow (Broken)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User clicks "Email me this plan"                                   │
│           ↓                                                         │
│  LeadGate collects email                                            │
│           ↓                                                         │
│  send-lead-emails sends confirmation (NO PDF)                       │
│           ↓                                                         │
│  User receives email → No PDF attached! ❌                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   Fixed Flow (Proposed)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User clicks "Email me this plan"                                   │
│           ↓                                                         │
│  LeadGate collects email                                            │
│           ↓                                                         │
│  Generate PDF using wizardReportPdf utility                         │
│           ↓                                                         │
│  Convert PDF to base64                                              │
│           ↓                                                         │
│  send-lead-emails sends confirmation WITH PDF attached ✅           │
│           ↓                                                         │
│  User receives email → PDF attached!                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### File: `src/components/wizard/easy/EasyResults.tsx`

**Changes to `handleLeadSubmit` function (around line 234-404):**

1. Before calling `send-lead-emails`, generate the PDF report:

```typescript
import { generateWizardReportPdf } from '@/utils/wizardReportPdf';

// Inside handleLeadSubmit, before the send-lead-emails call:
// Generate PDF for email attachment
let pdfBase64: string | undefined;
try {
  const pdfBlob = await generateWizardReportPdf({
    leadData,
    facilityDetails: {
      sports: sportsData || project.selectedSports || [],
      size: sf ? `${sf} sq ft` : project.facilitySize,
      projectType: `${sportsData?.join(', ') || 'Multi-Sport'} Facility`,
    },
    kpis: {
      capex: kpis.capex_total,
      monthlyRevenue: kpis.monthly_revenue,
      monthlyOpex: kpis.monthly_opex,
      monthlyEbitda: kpis.monthly_ebitda,
      breakEvenMonths: kpis.break_even_months,
      grossSf: kpis.gross_sf,
    },
  });
  
  // Convert blob to base64
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  pdfBase64 = btoa(binary);
} catch (error) {
  console.error('Error generating PDF:', error);
  // Continue without PDF if generation fails
}
```

2. Include the PDF attachment in the `send-lead-emails` call:

```typescript
await supabase.functions.invoke('send-lead-emails', {
  body: {
    // ... existing fields ...
    pdfAttachment: pdfBase64 ? {
      filename: `${leadData.name.replace(/\s+/g, '_')}_FacilityPlan.pdf`,
      content: pdfBase64,
    } : undefined,
    source: 'easy-wizard',
  },
});
```

#### File: `src/utils/wizardReportPdf.ts`

**Check if function needs updates:**
- Review the existing `generateWizardReportPdf` function to ensure it can accept the necessary parameters
- Ensure it returns a Blob or can be converted to base64 format

### Files to Modify

| File | Change |
|------|--------|
| `src/components/wizard/easy/EasyResults.tsx` | Add PDF generation before email, include as attachment |
| `src/utils/wizardReportPdf.ts` | Verify/update function signature to support required parameters |

### Technical Considerations

1. **PDF Size**: The generated PDF must be reasonable size (under 10MB for email attachment limits)
2. **Error Handling**: If PDF generation fails, the email should still send (just without attachment)
3. **Loading State**: Consider adding a loading indicator during PDF generation as it may take a moment

### Expected Result
After implementation, users who click "Email me this plan" will receive an email with:
- Confirmation message with facility estimates (existing)
- **Attached PDF report** with their complete facility plan (new)

