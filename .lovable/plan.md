

## Add Value Framing to Maintenance Wizard Sport Selection Step

### What
Add persuasive content to the first step of the Maintenance Wizard (`SportSelectionStep.tsx`) highlighting the tool's benefits — similar to the CRO improvements we made to Flash Market Analysis.

### Changes (single file: `src/components/maintenance/SportSelectionStep.tsx`)

**1. Value proposition banner above the sport grid**
Replace the plain subtitle with a more compelling headline and add a benefits section below it:
- "Build Your Free Maintenance Plan" as a supporting tagline
- 4 benefit items in a compact grid: "Prevent costly breakdowns", "Custom schedules by equipment age & usage", "Contractor vetting checklist", "Downloadable PDF + email reminders"
- Each with a relevant lucide icon (Shield, Calendar, Wrench, Download)

**2. Trust line below the sport grid**
- "Free — no signup required" with shield icon
- "Takes under 2 minutes" to set expectations

### Layout
```text
"What sports does your facility offer?"
"Build a custom maintenance plan — free in under 2 minutes"

┌─────────────────┐  ┌─────────────────┐
│ 🛡 Prevent      │  │ 📅 Custom       │
│ costly breakdowns│  │ schedules       │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│ 🔧 Contractor   │  │ 📥 PDF report   │
│ vetting guide   │  │ + email reminders│
└─────────────────┘  └─────────────────┘

[Sport selection grid - unchanged]

Free — no signup required
[Continue button]
```

