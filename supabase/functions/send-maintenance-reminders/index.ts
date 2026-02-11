import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://apdxtdarwacdcuhvtaag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getNextOccurrence(cadence: string, current: string): string {
  const d = new Date(current);
  switch (cadence) {
    case "daily": d.setDate(d.getDate() + 1); break;
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "annual": d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find due reminders
    const { data: dueReminders, error: fetchErr } = await supabase
      .from("maintenance_reminders")
      .select("*, maintenance_plans(*)")
      .eq("is_active", true)
      .lte("next_send_at", new Date().toISOString());

    if (fetchErr) throw fetchErr;
    if (!dueReminders || dueReminders.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let sentCount = 0;

    for (const reminder of dueReminders) {
      const plan = reminder.maintenance_plans;
      if (!plan) continue;

      const planData = plan.plan_data as any;
      const cadence = reminder.cadence;
      const tasks = planData?.tasks?.[cadence] || [];

      if (tasks.length === 0) continue;

      const taskListHtml = tasks
        .map((t: any) => `<li><strong>${t.assetName}</strong>: ${t.description} ${t.staffCanDo ? "✓ Staff" : "⚠ Contractor"}</li>`)
        .join("");

      const cadenceLabel = cadence.charAt(0).toUpperCase() + cadence.slice(1);
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">🔧 ${cadenceLabel} Maintenance Reminder</h2>
          <p>Hi ${plan.name || "there"},</p>
          <p>Here are your <strong>${cadenceLabel.toLowerCase()}</strong> maintenance tasks:</p>
          <ul>${taskListHtml}</ul>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            ${tasks.length} task${tasks.length > 1 ? "s" : ""} due this period.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            This reminder was sent by SportsFacility.ai Maintenance Plan Builder.<br/>
            To manage or cancel reminders, update your preferences in your maintenance plan dashboard.
          </p>
        </div>
      `;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "SportsFacility.ai <reminders@sportsfacility.ai>",
            to: reminder.recipients,
            subject: `${cadenceLabel} Maintenance Reminder — ${plan.name || "Your Facility"}`,
            html,
          }),
        });
        await emailRes.text();

        // Update next_send_at and last_sent_at
        await supabase
          .from("maintenance_reminders")
          .update({
            next_send_at: getNextOccurrence(cadence, reminder.next_send_at),
            last_sent_at: new Date().toISOString(),
          })
          .eq("id", reminder.id);

        sentCount++;
      } catch (emailErr) {
        console.error(`Failed to send reminder ${reminder.id}:`, emailErr);
      }
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Reminder function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
