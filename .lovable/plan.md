

## Facility Maintenance Plan Builder

A new multi-step wizard at `/maintenance` that helps facility owners identify their equipment, generates customized maintenance schedules, and delivers downloadable/emailable plans with optional recurring reminders.

---

### User Flow

```text
Step 1: Sports        --> Pick sports offered at your facility
Step 2: Equipment     --> Select equipment/assets present (filtered by sports)
Step 3: Details       --> Quantity, age, motorized, usage intensity per asset
Step 4: Location      --> City/state/zip for contractor guidance + timezone
Step 5: Dashboard     --> View generated plan, download PDF, email, set reminders
```

Each step has a progress bar (reusing the WizardStepNav pattern), "Not sure" help tips as info tooltips, and skip buttons on optional fields.

---

### Data Architecture

**Asset Taxonomy (client-side JSON data file: `src/data/maintenanceAssets.ts`)**

Each asset type lives in a structured taxonomy with risk classes and maintenance tasks:

```text
Asset Classes:
  A - Overhead Suspended (high risk): ceiling-hung basketball goals, overhead netting
  B - Motorized Systems: motorized divider curtains, retractable batting cages, powered bleachers
  C - Anchored/Fixed: wall-mounted goals, volleyball sleeves/standards, anchored soccer goals
  D - Impact/Wear: flooring (hardwood, sport tile, turf, rubber)
  E - Structural Sport Infrastructure: batting cage track/roller systems, netting systems
  F - Portable Equipment: portable goals, L-screens, ball carts, pitching machines
```

Each asset entry contains:
- `id`, `name`, `description`, `icon` (lucide icon name)
- `class` (A-F), `sports` (which sports use it)
- `motorizedOption` (boolean -- can this be motorized?)
- `tasks[]` -- array of maintenance tasks, each with:
  - `cadence`: daily | weekly | monthly | quarterly | annual
  - `description`: what to do
  - `staffCanDo`: boolean (vs. requires certified contractor)
  - `docRequired`: boolean (photo/log entry needed)
- `redFlags[]` -- immediate stop/remove-from-service conditions
- `contractorCategories[]` -- vendor types needed for professional service
- `cadenceModifiers` -- rules for increasing frequency based on age/usage:
  - age 8-12: increase quarterly to monthly for Class A/B
  - age 13+: add annual structural inspection
  - heavy usage: increase all cadences by one step

**Database Tables (2 new tables via migration)**

1. `maintenance_plans` -- stores generated plans
   - `id` (uuid, PK)
   - `created_at`, `updated_at`
   - `email` (text, not null)
   - `name` (text)
   - `location_city`, `location_state`, `location_zip`
   - `selected_assets` (jsonb -- array of asset selections with quantities/age/usage)
   - `plan_data` (jsonb -- the generated schedule)
   - `plan_version` (text -- taxonomy version stamp)
   - `resume_token` (text, unique -- for save/resume via URL)
   - `reminder_preferences` (jsonb -- cadences, day/time, recipients)
   - `reminders_active` (boolean, default false)

2. `maintenance_reminders` -- individual scheduled reminder records
   - `id` (uuid, PK)
   - `plan_id` (uuid, FK to maintenance_plans)
   - `cadence` (text -- daily/weekly/monthly/quarterly/annual)
   - `next_send_at` (timestamptz)
   - `recipients` (text[] -- email addresses)
   - `is_active` (boolean, default true)
   - `last_sent_at` (timestamptz, nullable)

RLS: Both tables use permissive INSERT for anon (no auth required to create a plan), and SELECT/UPDATE restricted by `resume_token` match or service_role for edge functions.

---

### Frontend Components

All new files under `src/components/maintenance/` and `src/pages/maintenance/`:

| File | Purpose |
|------|---------|
| `src/pages/maintenance/MaintenanceWizard.tsx` | Route wrapper with sub-routes (like EasyWizard) |
| `src/components/maintenance/SportSelectionStep.tsx` | Step 1: multi-select sports (reuse SportIcons pattern) |
| `src/components/maintenance/AssetSelectionStep.tsx` | Step 2: show assets filtered by chosen sports, toggle on/off |
| `src/components/maintenance/AssetDetailsStep.tsx` | Step 3: per-asset quantity, age bucket, motorized toggle, usage intensity |
| `src/components/maintenance/LocationStep.tsx` | Step 4: city/state/zip, optional facility name |
| `src/components/maintenance/MaintenanceDashboard.tsx` | Step 5: generated plan dashboard |
| `src/components/maintenance/ScheduleCalendar.tsx` | Tab view: Daily/Weekly/Monthly/Quarterly/Annual task lists |
| `src/components/maintenance/ContractorGuidance.tsx` | "What needs a pro" section + vetting checklist |
| `src/components/maintenance/ReminderSettings.tsx` | Opt-in to email reminders, choose cadence/day/recipients |
| `src/data/maintenanceAssets.ts` | Full asset taxonomy with tasks, red flags, contractor categories |
| `src/utils/maintenanceEngine.ts` | Rules engine: takes selections, returns schedule with cadence modifiers |
| `src/utils/maintenancePlanPdf.ts` | PDF generator using pdfBranding.ts (branded header/footer) |

**Navigation update**: Add `/maintenance` route in `App.tsx` and add a link in Header and the home page.

---

### Rules Engine (`src/utils/maintenanceEngine.ts`)

Pure function: `generateMaintenancePlan(selections) => MaintenancePlan`

Logic:
1. For each selected asset, look up base tasks from taxonomy
2. Apply cadence modifiers based on age bucket and usage intensity:
   - Age 8-12 + Class A/B: quarterly becomes monthly
   - Age 13+: adds annual structural inspection task
   - Heavy usage: all cadences shift one step more frequent (annual to quarterly, quarterly to monthly, etc.)
3. Group output by cadence (daily/weekly/monthly/quarterly/annual)
4. Flag red flags prominently at top of plan
5. Separate tasks into "staff can do" vs "requires contractor"
6. Stamp with taxonomy version number

---

### PDF Generation (`src/utils/maintenancePlanPdf.ts`)

Uses existing `pdfBranding.ts` for header/footer. Sections:
1. Cover page with facility summary and asset inventory
2. Schedule pages grouped by cadence with checklist-style formatting
3. Red Flags page -- immediate action items
4. Contractor Guidance page -- what needs a pro, vetting checklist, suggested vendor categories
5. Blank inspection log template pages (optional add-on)

---

### Email Delivery

Reuse the existing `send-lead-emails` edge function pattern. Add a new template type `maintenance-plan` that:
- Sends the PDF as an attachment (base64, same pattern as Easy Wizard)
- Includes a summary of the plan in the email body
- Sends company notification to chad@sportsfacility.ai and info@practicesports.com
- Captures the lead in the `leads` table with source `maintenance-plan`

---

### Reminder System

**Edge Function: `supabase/functions/send-maintenance-reminders/index.ts`**
- Queries `maintenance_reminders` where `next_send_at <= now()` and `is_active = true`
- Joins to `maintenance_plans` to get the plan data and recipients
- Sends email with relevant tasks for that cadence period
- Updates `next_send_at` to next occurrence and `last_sent_at`
- Triggered via pg_cron (every hour check)

**ICS Calendar Export**: Generate `.ics` file download for quarterly/annual reminders using a simple string template (no library needed for basic VEVENT entries).

---

### Save/Resume

Same pattern as Business Plan Builder:
- Generate a `resume_token` on first save
- Store wizard state in `maintenance_plans` table
- URL parameter `?resume=TOKEN` hydrates state on return
- Optional: email the resume link to the user

---

### Analytics Events

| Event | When |
|-------|------|
| `maintenance_wizard_start` | User lands on step 1 |
| `maintenance_assets_selected` | Step 2 completed with asset count |
| `maintenance_plan_generated` | Dashboard rendered |
| `maintenance_pdf_download` | PDF downloaded |
| `maintenance_email_sent` | Plan emailed |
| `maintenance_reminder_optin` | Reminder preferences saved |
| `maintenance_ics_export` | Calendar file downloaded |

---

### Implementation Sequence

1. **Data layer first**: Create `maintenanceAssets.ts` taxonomy and `maintenanceEngine.ts` rules engine
2. **Database migration**: Create `maintenance_plans` and `maintenance_reminders` tables with RLS
3. **Wizard steps**: Build steps 1-4 (sport selection, asset selection, details, location)
4. **Dashboard**: Build step 5 with schedule calendar view and contractor guidance
5. **PDF generation**: Create `maintenancePlanPdf.ts` using branded template
6. **Email integration**: Add maintenance-plan template to `send-lead-emails` edge function
7. **Reminders**: Build reminder settings UI, edge function, and pg_cron job
8. **Routing + navigation**: Wire up routes in App.tsx, add nav links
9. **ICS export**: Add calendar download button
10. **Analytics**: Wire up tracking events

---

### Technical Details

**New files to create:**
- `src/data/maintenanceAssets.ts` -- ~400 lines, full asset taxonomy
- `src/utils/maintenanceEngine.ts` -- ~150 lines, rules engine
- `src/utils/maintenancePlanPdf.ts` -- ~300 lines, PDF generator
- `src/pages/maintenance/MaintenanceWizard.tsx` -- ~60 lines, route wrapper
- `src/components/maintenance/SportSelectionStep.tsx` -- ~80 lines
- `src/components/maintenance/AssetSelectionStep.tsx` -- ~120 lines
- `src/components/maintenance/AssetDetailsStep.tsx` -- ~150 lines
- `src/components/maintenance/LocationStep.tsx` -- ~80 lines
- `src/components/maintenance/MaintenanceDashboard.tsx` -- ~200 lines
- `src/components/maintenance/ScheduleCalendar.tsx` -- ~120 lines
- `src/components/maintenance/ContractorGuidance.tsx` -- ~100 lines
- `src/components/maintenance/ReminderSettings.tsx` -- ~120 lines
- `supabase/functions/send-maintenance-reminders/index.ts` -- ~100 lines

**Files to modify:**
- `src/App.tsx` -- add `/maintenance/*` route
- `src/components/layout/Header.tsx` -- add nav link
- `src/components/navigation/WizardStepNav.tsx` -- add maintenance wizard steps
- `supabase/functions/send-lead-emails/index.ts` -- add maintenance-plan template
- `supabase/config.toml` -- add new edge function config
- Database migration for 2 new tables

**No new dependencies required** -- everything uses existing jsPDF, Radix UI, Lucide icons, and Supabase client.

