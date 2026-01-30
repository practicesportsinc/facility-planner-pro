
## Plan: Save Progress & Resume via Email Link for Business Plan Builder

### Overview
Add a "Save Progress" feature to the Business Plan Builder that allows users to:
1. Save their current progress at any point
2. Receive an email with a unique link to resume their work
3. Return later and continue where they left off

### Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        User Flow                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User clicks "Save Progress" button                              │
│           ↓                                                         │
│  2. Modal asks for email (if not already known)                     │
│           ↓                                                         │
│  3. Data saved to Supabase `business_plan_drafts` table             │
│           ↓                                                         │
│  4. Email sent with unique resume link                              │
│           ↓                                                         │
│  5. User clicks link → returns to exact step with all data intact   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Components to Create/Modify

#### 1. Database Table: `business_plan_drafts`

New table to store draft progress:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| resume_token | text | Unique token for resume URL |
| email | text | User's email (for lookup) |
| current_step | integer | Which step they're on (0-9) |
| plan_data | jsonb | Full BusinessPlanData object |
| created_at | timestamp | When draft was created |
| updated_at | timestamp | Last update time |
| expires_at | timestamp | When the link expires (30 days) |

#### 2. New Edge Function: `save-business-plan-draft`

Handles saving draft and sending resume email:
- Accepts email and plan data
- Generates unique resume token
- Saves to `business_plan_drafts` table
- Calls `send-lead-emails` with resume link

#### 3. New Email Template: `resume-business-plan.tsx`

Email with:
- Greeting with customer name
- Summary of progress (current step, facility name)
- Prominent "Resume Your Plan" button with unique link
- Expiration notice (30 days)
- Standard footer

#### 4. Frontend: Save Progress Button & Modal

**File: `src/pages/BusinessPlanBuilder.tsx`**
- Add "Save Progress" button in the navigation area
- Show modal to collect email (or confirm if already known)
- Display success message with confirmation

#### 5. Frontend: Resume Route Handler

**File: `src/pages/BusinessPlanBuilder.tsx`**
- Check URL for `?resume=TOKEN` parameter
- If present, fetch draft from database
- Hydrate BusinessPlanContext with saved data
- Navigate to the saved step

#### 6. Update BusinessPlanContext

**File: `src/contexts/BusinessPlanContext.tsx`**
- Add `loadFromDraft(data, step)` function to restore state
- Add `getDraftData()` function to get current state for saving

### Files to Create

1. **`supabase/functions/save-business-plan-draft/index.ts`** - Edge function to save draft and send email
2. **`supabase/functions/send-lead-emails/_templates/resume-business-plan.tsx`** - Email template with resume link
3. **Database migration** - Create `business_plan_drafts` table

### Files to Modify

1. **`src/pages/BusinessPlanBuilder.tsx`** - Add Save Progress button, modal, and resume token handling
2. **`src/contexts/BusinessPlanContext.tsx`** - Add `loadFromDraft` and `getDraftData` functions
3. **`supabase/functions/send-lead-emails/index.ts`** - Add handler for resume email type

### Technical Details

**Resume Token Generation:**
```typescript
const resumeToken = crypto.randomUUID().replace(/-/g, '');
// Example: 8f42b1c35d9e4a7bb2e19c3f4d5a6e7b
```

**Resume URL Format:**
```
https://facility-planner-pro.lovable.app/business-plan?resume=8f42b1c35d9e4a7bb2e19c3f4d5a6e7b
```

**Draft Expiration:** 30 days from last update

**Email Content Preview:**
```text
Subject: Continue Your Sports Facility Business Plan

Hi [Name],

Your business plan progress has been saved. Click below to continue 
where you left off:

[Resume Your Business Plan] ← button

Progress Summary:
- Facility: [Name or "Untitled"]
- Step: [X] of 10 ([Step Name])
- Last saved: [Date/Time]

This link expires in 30 days.

---
SportsFacility.ai
Practice Sports, Inc.
```

### User Experience

1. **Saving Progress:**
   - "Save Progress" button visible on all steps
   - If email unknown, modal prompts for email
   - Success toast: "Progress saved! Check your email for the resume link."

2. **Resuming Progress:**
   - User clicks email link
   - Page loads with all their data restored
   - Toast: "Welcome back! Your progress has been restored."
   - Automatically scrolls to their saved step

3. **Expiration Handling:**
   - If token expired or not found, show friendly message
   - Offer to start fresh

### Implementation Order

1. Create database migration for `business_plan_drafts` table
2. Create resume email template
3. Create save-business-plan-draft edge function
4. Update BusinessPlanContext with load/get functions
5. Update BusinessPlanBuilder page with save button and resume handling
