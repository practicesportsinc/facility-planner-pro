import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      email,
      name,
      locationCity,
      locationState,
      locationZip,
      selectedAssets,
      planData,
      planVersion,
      reminderPreferences,
      remindersActive,
    } = body;

    // Validate required fields
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!planData || !selectedAssets) {
      return new Response(
        JSON.stringify({ error: "Plan data and selected assets are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Upsert the maintenance plan
    const { data: planRow, error: planError } = await supabase
      .from("maintenance_plans")
      .upsert(
        {
          email,
          name: name || null,
          location_city: locationCity || null,
          location_state: locationState || null,
          location_zip: locationZip || null,
          selected_assets: selectedAssets,
          plan_data: planData,
          plan_version: planVersion || null,
          reminder_preferences: reminderPreferences || null,
          reminders_active: !!remindersActive,
        },
        { onConflict: "email" }
      )
      .select("id")
      .single();

    if (planError) {
      console.error("Plan upsert error:", planError);
      return new Response(
        JSON.stringify({ error: "Failed to save plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planId = planRow.id;

    // Deactivate existing reminders for this plan
    await supabase
      .from("maintenance_reminders")
      .update({ is_active: false })
      .eq("plan_id", planId);

    // Create new reminders if enabled
    if (remindersActive && reminderPreferences?.cadences?.length > 0) {
      const allRecipients = [
        email,
        ...(reminderPreferences.additionalRecipients || []),
      ];

      const reminders = reminderPreferences.cadences.map((cadence: string) => ({
        plan_id: planId,
        cadence,
        next_send_at: getNextSendAt(
          cadence,
          reminderPreferences.preferredDay || "monday",
          reminderPreferences.preferredTime || "09:00"
        ),
        recipients: allRecipients,
        is_active: true,
      }));

      const { error: remError } = await supabase
        .from("maintenance_reminders")
        .insert(reminders);

      if (remError) {
        console.error("Reminder insert error:", remError);
        return new Response(
          JSON.stringify({ error: "Plan saved but failed to create reminders" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, planId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("save-maintenance-plan error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getNextSendAt(cadence: string, preferredDay: string, preferredTime: string): string {
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const now = new Date();
  const [hours, minutes] = preferredTime.split(":").map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  switch (cadence) {
    case "daily":
      if (target <= now) target.setDate(target.getDate() + 1);
      break;
    case "weekly": {
      const dayIndex = DAYS.indexOf(preferredDay);
      const currentDay = (target.getDay() + 6) % 7;
      let diff = dayIndex - currentDay;
      if (diff < 0 || (diff === 0 && target <= now)) diff += 7;
      target.setDate(target.getDate() + diff);
      break;
    }
    case "monthly":
      target.setDate(1);
      if (target <= now) target.setMonth(target.getMonth() + 1);
      break;
    case "quarterly":
      target.setDate(1);
      target.setMonth(Math.ceil((now.getMonth() + 1) / 3) * 3);
      if (target <= now) target.setMonth(target.getMonth() + 3);
      break;
    case "annual":
      target.setMonth(0, 1);
      if (target <= now) target.setFullYear(target.getFullYear() + 1);
      break;
  }
  return target.toISOString();
}
