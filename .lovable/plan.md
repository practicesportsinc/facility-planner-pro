

## Plan: Improve Incomplete Section Feedback on Business Plan Review Page

### Problem
On the Review & Generate step, when the "Download Business Plan PDF" button is disabled, users only see:
- Yellow/green colored section buttons (which section is incomplete)
- A generic message: "Please complete all sections before generating your business plan"

Users have no way of knowing **which specific field** is missing within an incomplete section, leading to frustration and confusion.

### Solution
Enhance the completion status display to show:
1. **Specific missing field names** under each incomplete section
2. **Required field indicators** on the actual form fields (optional enhancement)

---

### Changes to Make

#### 1. Enhanced Section Completion Checks (`ReviewGenerateStep.tsx`)

Update the `sections` array to include detailed information about what's missing in each section:

```typescript
const sections = [
  { 
    name: 'Project Overview', 
    complete: !!data.projectOverview.facilityName && !!data.projectOverview.city && !!data.projectOverview.state,
    step: 0,
    missing: [
      !data.projectOverview.facilityName && 'Facility Name',
      !data.projectOverview.city && 'City',
      !data.projectOverview.state && 'State',
    ].filter(Boolean)
  },
  { 
    name: 'Competitive Analysis', 
    complete: !!data.competitiveAnalysis.differentiationStrategy, 
    step: 3,
    missing: [
      !data.competitiveAnalysis.differentiationStrategy && 'Differentiation Strategy',
    ].filter(Boolean)
  },
  // ... similar for all sections
];
```

#### 2. Display Missing Fields in UI

Update the completion status card to show what's missing:

```text
┌─────────────────────────────────────────────────────────┐
│  ⚠ Completion Status: 8/9 Sections                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Overview ✓] [Market ✓] [Sports ✓] [Competition ⚠]     │
│  [Facility ✓] [Operations ✓] [Financials ✓]             │
│  [Risks ✓] [Timeline ✓]                                 │
│                                                         │
│  ⚠ Missing fields:                                      │
│  • Competitive Analysis: Differentiation Strategy       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3. Add Required Field Indicators (Optional Enhancement)

Add visual "required" indicators to mandatory fields in each step component:

```typescript
<Label htmlFor="diffStrategy" className="text-base font-medium">
  Differentiation Strategy <span className="text-destructive">*</span>
</Label>
```

---

### Implementation Details

#### File: `src/components/business-plan/ReviewGenerateStep.tsx`

**Update section validation (lines 94-104):**

```typescript
const sections = [
  { 
    name: 'Project Overview', 
    complete: !!data.projectOverview.facilityName && !!data.projectOverview.city && !!data.projectOverview.state, 
    step: 0,
    missing: [
      !data.projectOverview.facilityName && 'Facility Name',
      !data.projectOverview.city && 'City',
      !data.projectOverview.state && 'State',
    ].filter(Boolean) as string[]
  },
  { 
    name: 'Market Analysis', 
    complete: data.marketAnalysis.customerSegments.length > 0, 
    step: 1,
    missing: data.marketAnalysis.customerSegments.length === 0 ? ['Customer Segments'] : []
  },
  { 
    name: 'Sport Selection', 
    complete: selectedSports.length > 0, 
    step: 2,
    missing: selectedSports.length === 0 ? ['At least one sport'] : []
  },
  { 
    name: 'Competitive Analysis', 
    complete: !!data.competitiveAnalysis.differentiationStrategy, 
    step: 3,
    missing: !data.competitiveAnalysis.differentiationStrategy ? ['Differentiation Strategy'] : []
  },
  { 
    name: 'Facility Design', 
    complete: data.facilityDesign.totalSquareFootage > 0, 
    step: 4,
    missing: data.facilityDesign.totalSquareFootage === 0 ? ['Total Square Footage'] : []
  },
  { 
    name: 'Programming', 
    complete: data.programming.rentalPricing.standardRate > 0, 
    step: 5,
    missing: data.programming.rentalPricing.standardRate === 0 ? ['Standard Rental Rate'] : []
  },
  { 
    name: 'Financials', 
    complete: data.financials.startupCosts.buildoutConstruction > 0, 
    step: 6,
    missing: data.financials.startupCosts.buildoutConstruction === 0 ? ['Buildout/Construction Cost'] : []
  },
  { 
    name: 'Risk Assessment', 
    complete: data.riskAssessment.keyRisks.length > 0, 
    step: 7,
    missing: data.riskAssessment.keyRisks.length === 0 ? ['At least one risk'] : []
  },
  { 
    name: 'Timeline', 
    complete: data.timeline.phases.length > 0, 
    step: 8,
    missing: data.timeline.phases.length === 0 ? ['At least one phase'] : []
  },
];
```

**Add missing fields summary below the section buttons (after line 140):**

```tsx
{/* Show missing fields if any */}
{!allComplete && (
  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
    <p className="text-sm font-medium text-yellow-400 mb-2">Missing required fields:</p>
    <ul className="text-sm text-muted-foreground space-y-1">
      {sections
        .filter(s => !s.complete)
        .map(section => (
          <li key={section.name} className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>
              <button 
                onClick={() => setCurrentStep(section.step)}
                className="text-yellow-400 hover:underline font-medium"
              >
                {section.name}
              </button>
              : {section.missing.join(', ')}
            </span>
          </li>
        ))
      }
    </ul>
  </div>
)}
```

#### File: `src/components/business-plan/CompetitiveAnalysisStep.tsx`

**Add required indicator to Differentiation Strategy field (line 265):**

```tsx
<Label htmlFor="diffStrategy" className="text-base font-medium">
  Differentiation Strategy <span className="text-destructive text-sm">(required)</span>
</Label>
```

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/business-plan/ReviewGenerateStep.tsx` | Add `missing` array to sections, display missing field summary |
| `src/components/business-plan/CompetitiveAnalysisStep.tsx` | Add required indicator to Differentiation Strategy label |
| `src/components/business-plan/ProjectOverviewStep.tsx` | Add required indicators to Facility Name, City, State fields |

---

### User Experience After Implementation

**Before (current):**
- User sees yellow "Competitive Analysis" button
- No indication of what's missing
- User must click through and guess

**After (improved):**
- User sees yellow "Competitive Analysis" button
- Below: "Missing required fields: • Competitive Analysis: Differentiation Strategy"
- Clicking the section name jumps to that step
- The field itself is marked as "(required)"

