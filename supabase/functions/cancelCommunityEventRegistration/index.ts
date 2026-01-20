const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const { signupId } = body ?? {};
    if (!signupId || typeof signupId !== "string") {
      return jsonResponse({ error: "signupId is required" }, 400);
    }

    const { data: signup, error: signupError } = await supabase
      .from("community_event_signups")
      .select("*")
      .eq("id", signupId)
      .maybeSingle();

    if (signupError || !signup) {
      return jsonResponse({ error: "Signup not found" }, 404);
    }

    const { error: deleteError } = await supabase
      .from("community_event_signups")
      .delete()
      .eq("id", signupId);

    if (deleteError) {
      return jsonResponse({ error: "Failed to remove registration", details: deleteError }, 500);
    }

    let updatedEvent = null;
    if (signup.event_id) {
      const { data: event } = await supabase
        .from("community_events")
        .select("*")
        .eq("id", signup.event_id)
        .maybeSingle();

      if (event) {
        const currentParticipants = Number(event.current_participants || 0);
        const nextCount = Math.max(0, (Number.isFinite(currentParticipants) ? currentParticipants : 0) - 1);
        const { data: updated } = await supabase
          .from("community_events")
          .update({ current_participants: String(nextCount) })
          .eq("id", signup.event_id)
          .select("*")
          .single();
        if (updated) {
          updatedEvent = updated;
        }
      }
    }

    return jsonResponse({ event: updatedEvent });
  } catch (error) {
    return jsonResponse({ error: error?.message || "Unexpected error" }, 500);
  }
});
