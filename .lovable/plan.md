

## Plan: Include Equipment Pricing & Specs in Lead Emails

### Problem Identified
When a user submits an inquiry via the "Finalize Best Pricing" button on the Equipment Quote page, the confirmation emails sent to both the customer and your team do not include the equipment pricing and specifications. The emails only contain basic contact information.

### Root Cause
The `PricingDisclaimer` component (which contains the "Finalize Best Pricing" button) does not receive the equipment quote data from its parent component. When it calls the `send-lead-emails` Edge Function, it only sends:
- Customer name/email/phone
- City/state
- Source: "finalize-pricing"

The Edge Function and email templates **already support** equipment data (`equipmentItems`, `equipmentTotals`, `facilityDetails`) - they're just not receiving it.

### Solution Overview
Update the `PricingDisclaimer` component to accept optional equipment quote data as props and pass it through to the email function. Then update the `EquipmentQuoteDisplay` component to pass the quote data to `PricingDisclaimer`.

---

### Changes Required

#### 1. Update PricingDisclaimer Component

**File: `src/components/ui/pricing-disclaimer.tsx`**

Add new optional props to accept equipment data:

```typescript
interface EquipmentCategory {
  category: string;
  items: { name: string; quantity: number; unitCost: number; totalCost: number }[];
  subtotal: number;
}

interface EquipmentTotals {
  equipment: number;
  flooring: number;
  installation: number;
  grandTotal: number;
}

interface PricingDisclaimerProps {
  className?: string;
  showButton?: boolean;
  buttonLabel?: string;
  // New props for equipment data
  equipmentItems?: EquipmentCategory[];
  equipmentTotals?: EquipmentTotals;
  facilityDetails?: {
    sport?: string;
    size?: string;
  };
}
```

Update `handleLeadSubmit` to include equipment data in both the database insert and email payload:

```typescript
// Save to database with equipment summary
const { error: dbError } = await supabase.from('leads').insert({
  name: data.name,
  email: data.email,
  phone: data.phone || null,
  city: data.city || null,
  state: data.state || null,
  source: 'finalize-pricing',
  facility_type: facilityDetails?.sport || null,
  facility_size: facilityDetails?.size || null,
  estimated_budget: equipmentTotals?.grandTotal || null,
});

// Sync to Google Sheets with equipment details
await supabase.functions.invoke('sync-lead-to-sheets', {
  body: {
    name: data.name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    state: data.state,
    source: 'finalize-pricing',
    facilityType: facilityDetails?.sport,
    facilitySize: facilityDetails?.size,
    estimatedBudget: equipmentTotals?.grandTotal,
    equipmentItems: equipmentItems,
    equipmentTotals: equipmentTotals,
  }
});

// Send emails WITH equipment data
await supabase.functions.invoke('send-lead-emails', {
  body: {
    customerEmail: data.email,
    customerName: data.name,
    leadData: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
    },
    facilityDetails: facilityDetails,
    equipmentItems: equipmentItems,
    equipmentTotals: equipmentTotals,
    source: 'finalize-pricing',
  }
});
```

---

#### 2. Update EquipmentQuoteDisplay Component

**File: `src/components/equipment/EquipmentQuote.tsx`**

Pass the quote data to `PricingDisclaimer`:

```tsx
<PricingDisclaimer 
  className="mt-6"
  equipmentItems={quote.lineItems}
  equipmentTotals={quote.totals}
  facilityDetails={{
    sport: SPORT_LABELS[quote.sport],
    size: `${quote.inputs.units} ${quote.inputs.units === 1 ? 'court' : 'courts'} (${quote.inputs.spaceSize})`,
  }}
/>
```

---

### Expected Result

After this change, when a user submits the "Finalize Best Pricing" form:

**Customer Email Will Include:**
- Facility summary (sport, size)
- Complete equipment quote with line items
- Category breakdowns (Core Equipment, Flooring & Surfaces, Safety & Lighting)
- Equipment totals (equipment, flooring, installation, grand total)

**Company Email Will Include:**
- All contact information
- Facility details (sport, size)
- Complete itemized equipment quote
- All pricing totals

---

### Files to Modify
1. `src/components/ui/pricing-disclaimer.tsx` - Add equipment data props and pass to API calls
2. `src/components/equipment/EquipmentQuote.tsx` - Pass quote data to PricingDisclaimer

