
## Plan: Fix Business Plan Validation Inconsistencies

### Problem Identified
During testing with the following inputs:
- **ProjectTest** - Facility Name
- **Omaha** - City  
- **JourneyConcept** - Journey/Concept stage
- **Target18 months** - Target timeline
- **SizeNo** - Unclear input
- **Baseball** - Sport

The user was unable to email or download their project because validation was blocking them, but the error messages weren't clear about what was missing.

### Root Cause Analysis

After reviewing the code, I found **two key issues**:

#### Issue 1: Missing State Selection
The Project Overview step requires a **state** to be selected from a dropdown (`ProjectOverviewStep.tsx` line 82). The user entered "Omaha" as the city but likely never selected a state from the dropdown. The validation at `ReviewGenerateStep.tsx` line 97 requires all three:
```typescript
complete: !!data.projectOverview.facilityName && !!data.projectOverview.city && !!data.projectOverview.state
```

#### Issue 2: Validation Mismatch Between Components
There's an inconsistency between validation checks:

| Step | ReviewGenerateStep.tsx | BusinessPlanContext.isStepComplete |
|------|------------------------|-------------------------------------|
| Timeline (Step 8) | `phases.length > 0` | `targetOpeningDate` exists |

This means:
- A user could complete the Timeline step via one validation path
- But fail the Review page validation via a different check
- The Timeline phases are **auto-generated** when `targetOpeningDate` is set, but if the user never set a target date, no phases exist

### Solution

#### 1. Align Timeline Validation
Update `ReviewGenerateStep.tsx` to match the intended validation - check for `targetOpeningDate` instead of phases count (or both):

```typescript
{ 
  name: 'Timeline', 
  complete: !!data.timeline.targetOpeningDate && data.timeline.phases.length > 0, 
  step: 8,
  missing: [
    !data.timeline.targetOpeningDate && 'Target Opening Date',
    data.timeline.phases.length === 0 && 'At least one phase',
  ].filter(Boolean) as string[]
},
```

#### 2. Add Required Indicator to State Field
Update `ProjectOverviewStep.tsx` to make the state field more visually required (already has "(required)" label based on earlier changes).

#### 3. Initialize Default Phases Without Requiring Target Date
Update `TimelineStep.tsx` to initialize default phases even if no target date is set, using placeholder dates that can be edited later.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/business-plan/ReviewGenerateStep.tsx` | Update Timeline validation to check both `targetOpeningDate` AND `phases.length` |
| `src/components/business-plan/TimelineStep.tsx` | Initialize default phases even without target opening date |
| `src/contexts/BusinessPlanContext.tsx` | Align `isStepComplete` for Timeline step with ReviewGenerateStep validation |

### Implementation Details

#### File: `src/components/business-plan/ReviewGenerateStep.tsx`

Update lines 148-152:
```typescript
{ 
  name: 'Timeline', 
  complete: !!data.timeline.targetOpeningDate && data.timeline.phases.length > 0, 
  step: 8,
  missing: [
    !data.timeline.targetOpeningDate && 'Target Opening Date',
    data.timeline.phases.length === 0 && 'At least one phase',
  ].filter(Boolean) as string[]
},
```

#### File: `src/contexts/BusinessPlanContext.tsx`

Update line 84:
```typescript
case 8: // Timeline
  return !!(data.timeline.targetOpeningDate) && data.timeline.phases.length > 0;
```

#### File: `src/components/business-plan/TimelineStep.tsx`

Modify the useEffect (lines 44-65) to initialize phases with placeholder dates if no target opening date is provided:

```typescript
React.useEffect(() => {
  if (timeline.phases.length === 0) {
    // Use targetOpeningDate if available, otherwise default to 12 months from now
    const baseDate = projectOverview.targetOpeningDate 
      ? parseISO(`${projectOverview.targetOpeningDate}-01`)
      : addMonths(new Date(), 12);
    
    const phases: TimelinePhase[] = DEFAULT_PHASES.map((p, i) => ({
      ...p,
      startDate: format(addMonths(baseDate, -12 + i), 'yyyy-MM'),
      endDate: format(addMonths(baseDate, -11 + i), 'yyyy-MM'),
    }));
    
    updateData('timeline', { 
      phases,
      targetOpeningDate: timeline.targetOpeningDate || projectOverview.targetOpeningDate || format(baseDate, 'yyyy-MM')
    });
  }
  
  if (timeline.checklist.length === 0) {
    const checklist: ChecklistItem[] = DEFAULT_CHECKLIST.map((c) => ({
      ...c,
      dueDate: '',
    }));
    updateData('timeline', { checklist });
  }
}, []);
```

### Expected Result After Fix

1. **Clearer validation messages**: Users will see exactly which fields are missing (e.g., "State" or "Target Opening Date")
2. **Consistent validation**: The Review page and step completion checks will use the same criteria
3. **Auto-initialized phases**: Timeline phases will be created with sensible defaults even if no target date is initially set
4. **Better UX**: Users won't get stuck wondering why they can't proceed

### Technical Notes

- The "SizeNo" from the user's report is likely an artifact of how the session data was captured - the Facility Design step has a default of 15,000 SF via slider, so this wouldn't block validation
- The most likely blocker was the **missing state selection** which is a required dropdown field
- The Timeline validation mismatch could also cause issues if the user skipped setting a target opening date
