

## Plan: Fix Flash Market Analysis Email Sending

### Issue Identified
The "Download Full Report" button on the Flash Market Analysis page syncs leads to Google Sheets but **does not send confirmation emails** to the customer or company notification emails.

### Root Cause
The `handleDownloadReport` function in `FlashMarketAnalysis.tsx` (lines 130-148) only calls `sync-lead-to-sheets`:

```typescript
const handleDownloadReport = async (leadData: any) => {
  try {
    await supabase.functions.invoke('sync-lead-to-sheets', {
      body: { /* lead data */ },
    });
    // ❌ Missing: send-lead-emails call
    toast.success("Report downloaded successfully!");
  } catch (error) { ... }
};
```

### Fix Required

**File: `src/components/market/FlashMarketAnalysis.tsx`**

Update the `handleDownloadReport` function to also call `send-lead-emails` with the market analysis data, following the pattern used in other lead capture flows.

**Updated function:**
```typescript
const handleDownloadReport = async (leadData: any) => {
  try {
    // Sync to Google Sheets
    await supabase.functions.invoke('sync-lead-to-sheets', {
      body: {
        ...leadData,
        source: 'flash-market-analysis',
        source_detail: `report-download-${zipCode}`,
      },
    });

    // Send confirmation emails to customer and company
    await supabase.functions.invoke('send-lead-emails', {
      body: {
        customerEmail: leadData.email,
        customerName: leadData.name,
        leadData: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          city: leadData.city || marketData?.location.city,
          state: leadData.state || marketData?.location.state,
        },
        facilityDetails: {
          location: `${marketData?.location.city}, ${marketData?.location.state} ${zipCode}`,
        },
        source: 'flash-market-analysis',
      },
    });
    
    toast.success("Report sent to your email!");
    setShowLeadGate(false);
  } catch (error) {
    console.error('Error processing lead:', error);
    toast.success("Report downloaded successfully!");
    setShowLeadGate(false);
  }
};
```

---

### What This Enables

| Recipient | Before | After |
|-----------|--------|-------|
| Customer | ❌ No email | ✅ Confirmation email with market location |
| Company (chad@sportsfacility.ai) | ❌ No email | ✅ Lead notification email |
| Company (info@practicesports.com) | ❌ No email | ✅ Lead notification email |
| Google Sheets | ✅ Synced | ✅ Synced |

---

### File to Modify
1. `src/components/market/FlashMarketAnalysis.tsx` - Lines 130-148: Add `send-lead-emails` call

