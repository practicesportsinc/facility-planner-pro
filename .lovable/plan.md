

## Add Auto Reminders for Maintenance Schedule

### What It Does
Adds a "Reminder Settings" section to the Maintenance Plan Dashboard where users can opt in to recurring email reminders for their maintenance tasks. Users pick which cadences to receive reminders for, choose a preferred day/time, and add additional email recipients. A new Edge Function handles sending the reminder emails on schedule via pg_cron.

---

### User Experience

On the Dashboard (Step 5), a new card appears below the Contractor Guidance section:

- Toggle: "Enable email reminders for this plan"
- When enabled, shows:
  - Checkboxes for which cadences to receive (Weekly, Monthly, Quarterly, Annual -- daily is opt-in only)
  - Preferred day of week (for weekly) and time
  - Additional recipient emails (comma-separated)
  - A "Save Reminder Preferences" button
- Success toast confirms preferences saved
- A note: "You can manage or cancel reminders anytime via the link in each reminder email"

---

### Technical Changes

**1. Update types (`src/types/maintenance.ts`)**
- Add a `ReminderPreferences` interface with `enabled`, `cadences` (array of Cadence), `preferredDay`, `preferredTime`, `additionalRecipients` (string array)
- Add `reminderPreferences` to `MaintenanceWizardState`

**2. Create `src/components/maintenance/ReminderSettings.tsx`**
- A card component with:
  - Master on/off switch
  - Cadence checkboxes (monthly/quarterly/annual default ON, weekly optional)
  - Day-of-week select and time select
  - Additional recipients input
  - Save button that writes to `maintenance_plans` table and creates/updates `maintenance_reminders` rows

**3. Update `MaintenanceDashboard.tsx`**
- Import and render `ReminderSettings` below Contractor Guidance
- Pass wizard state and plan data so it can save to the database

**4. Create Edge Function `supabase/functions/send-maintenance-reminders/index.ts`**
- Queries `maintenance_reminders` where `next_send_at <= now()` and `is_active = true`
- Joins `maintenance_plans` to get plan data and filter tasks for the relevant cadence
- Sends email via Resend with a task checklist for that period
- Updates `next_send_at` to the next occurrence and sets `last_sent_at`
- Includes an unsubscribe/manage link in the email footer

**5. Update `supabase/config.toml`**
- Add `[functions.send-maintenance-reminders]` with `verify_jwt = false`

**6. Deploy and set up pg_cron**
- Deploy the new edge function
- Provide a SQL snippet (run manually) to create a pg_cron job that calls the function hourly

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/maintenance/ReminderSettings.tsx` | UI for toggling reminders, selecting cadences, day/time, recipients |
| `supabase/functions/send-maintenance-reminders/index.ts` | Edge function that sends due reminders via Resend |

### Files to Modify

| File | Change |
|------|--------|
| `src/types/maintenance.ts` | Add `ReminderPreferences` interface |
| `src/components/maintenance/MaintenanceDashboard.tsx` | Add ReminderSettings section |
| `src/pages/maintenance/MaintenanceWizard.tsx` | Initialize `reminderPreferences` in state |
| `supabase/config.toml` | Register new edge function |

### Database

The `maintenance_plans` and `maintenance_reminders` tables already exist with the correct schema (including `reminder_preferences` jsonb, `reminders_active` boolean, and the reminders table with `cadence`, `next_send_at`, `recipients`, `is_active`). No migration needed.

### pg_cron Setup (manual step after deploy)

A SQL snippet will be provided to run in the Supabase Dashboard to schedule the edge function hourly:
```text
cron.schedule('maintenance-reminders', '0 * * * *', ...)
```
This calls `send-maintenance-reminders` every hour to check for due reminders.

