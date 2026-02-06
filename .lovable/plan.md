

## Plan: Add Company Branding to All PDF Downloads

### What Changes
Every downloadable PDF quote/report in the application will be updated with:
- **Header**: Company logo (SportsFacility.ai logo from `public/images/sportsfacility-logo.png`)
- **Footer**: Full company contact information on every page

### Contact Info Block (Footer)
```text
Practice Sports, Inc. | SportsFacility.ai
14706 Giles Rd, Omaha, NE 68138
800.877.6787 | 402.592.2000
info@practicesports.com | practicesports.com
```

### Affected PDF Files

| PDF File | Used For |
|----------|----------|
| `src/utils/equipmentQuotePdf.ts` | Equipment-only quotes (e.g., Volleyball, Baseball) |
| `src/utils/easyWizardPdf.ts` | Quick Start / Easy Wizard facility plans |
| `src/utils/wizardReportPdf.ts` | Full Calculator financial analysis reports |
| `src/utils/buildingEstimatePdf.ts` | Building construction estimates |
| `src/utils/businessPlanPdfGenerator.ts` | Business plan documents |
| `src/utils/researchKitGenerator.ts` | DIY Supplier Research Kit |

### Technical Approach

**Shared Logo Loader**
A shared helper function will be created to load the company logo as a base64-encoded image for embedding in PDFs (jsPDF requires base64 image data). This avoids duplicating the logo-loading logic in every file.

```text
New file: src/utils/pdfBranding.ts

Responsibilities:
- loadLogo(): Fetches logo PNG, converts to base64 via canvas
- addPdfHeader(): Adds logo + title to top of first page
- addPdfFooter(): Adds contact info block to bottom of every page
```

**Header Layout (Page 1)**
```text
┌─────────────────────────────────────────────────┐
│  [LOGO]   Equipment Quote / Report Title        │
│            Generated: Feb 6, 2026               │
├─────────────────────────────────────────────────┤
│  ... content ...                                │
```

**Footer Layout (Every Page)**
```text
│  ... content ...                                │
├─────────────────────────────────────────────────┤
│  Disclaimer text...                             │
│                                                 │
│  Practice Sports, Inc. | SportsFacility.ai      │
│  14706 Giles Rd, Omaha, NE 68138               │
│  800.877.6787 | 402.592.2000                    │
│  info@practicesports.com | practicesports.com   │
│                                    Page 1 of 3  │
└─────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Create `src/utils/pdfBranding.ts`** -- Shared helper with three functions:
   - `loadLogoBase64()` -- fetches the PNG logo from `/images/sportsfacility-logo.png` and converts it to a data URL using canvas
   - `addBrandedHeader(doc, title, subtitle?)` -- places logo on the left (~30px tall) and title text to its right
   - `addBrandedFooter(doc, includeDisclaimer?)` -- loops through all pages and adds the contact info block and page numbers at the bottom

2. **Update `equipmentQuotePdf.ts`** -- Replace the current plain text header with `addBrandedHeader()`, replace the sparse footer with `addBrandedFooter()`. Make the function async since logo loading requires a fetch.

3. **Update `easyWizardPdf.ts`** -- Replace the blue banner header with logo + title via `addBrandedHeader()`. Replace the single-line footer with `addBrandedFooter()`.

4. **Update `wizardReportPdf.ts`** -- Replace the blue banner cover page header with logo + title. Replace footer with `addBrandedFooter()` on all pages.

5. **Update `buildingEstimatePdf.ts`** -- Replace plain text header with `addBrandedHeader()`. Replace footer with `addBrandedFooter()`. Make function async.

6. **Update `businessPlanPdfGenerator.ts`** -- Replace plain text cover page with logo. Update the per-page footer loop to use `addBrandedFooter()`.

7. **Update `researchKitGenerator.ts`** -- Replace the plain text header with logo. Add `addBrandedFooter()`. Make function async.

8. **Update calling components** -- Any callers of functions that become async (e.g., `equipmentQuotePdf`, `buildingEstimatePdf`, `researchKitGenerator`) will need `await` added to their invocation.

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/utils/pdfBranding.ts` | **Create** -- shared logo loader, header, and footer helpers |
| `src/utils/equipmentQuotePdf.ts` | Modify -- use branded header/footer, make async |
| `src/utils/easyWizardPdf.ts` | Modify -- use branded header/footer |
| `src/utils/wizardReportPdf.ts` | Modify -- use branded header/footer |
| `src/utils/buildingEstimatePdf.ts` | Modify -- use branded header/footer, make async |
| `src/utils/businessPlanPdfGenerator.ts` | Modify -- use branded header/footer |
| `src/utils/researchKitGenerator.ts` | Modify -- use branded header/footer, make async |
| `src/components/equipment/EquipmentQuote.tsx` | Modify -- add await to PDF call |
| `src/components/building/steps/BuildingEstimateStep.tsx` | Modify -- add await to PDF call |
| Any other callers of research kit PDF | Modify -- add await |

