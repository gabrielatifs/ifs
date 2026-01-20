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

const getAuthToken = (req: Request) => {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
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
    const {
      eventId,
      guestName,
      guestEmail,
      registrationNotes,
      zoomJoinUrl,
    } = body ?? {};

    if (!eventId || typeof eventId !== "string") {
      return jsonResponse({ error: "eventId is required" }, 400);
    }

    const token = getAuthToken(req);
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        userId = data.user.id;
        userEmail = data.user.email || null;
        userName =
          (data.user.user_metadata?.full_name as string) ||
          (data.user.user_metadata?.name as string) ||
          null;
      }
    }

    if (!userEmail) {
      if (!guestEmail || !guestName) {
        return jsonResponse({ error: "guestName and guestEmail are required" }, 400);
      }
      userEmail = String(guestEmail).trim();
      userName = String(guestName).trim();
    }

    const { data: event, error: eventError } = await supabase
      .from("community_events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError || !event) {
      return jsonResponse({ error: "Event not found" }, 404);
    }

    const signupQuery = supabase
      .from("community_event_signups")
      .select("*")
      .eq("event_id", eventId);

    if (userId) {
      signupQuery.eq("user_id", userId);
    } else {
      signupQuery.eq("user_email", userEmail);
    }

    const { data: existingSignup } = await signupQuery.maybeSingle();
    if (existingSignup) {
      return jsonResponse({ signup: existingSignup, event });
    }

    const signupPayload = {
      id: crypto.randomUUID(),
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      event_id: eventId,
      event_title: event.title,
      event_date: event.date,
      event_type: event.type,
      notes: registrationNotes || null,
      created_by_id: userId,
      created_by_email: userEmail,
    };

    const { data: createdSignup, error: signupError } = await supabase
      .from("community_event_signups")
      .insert(signupPayload)
      .select("*")
      .single();

    if (signupError) {
      return jsonResponse({ error: "Failed to create signup", details: signupError }, 500);
    }

    let updatedEvent = event;
    const currentParticipants = Number(event.current_participants || 0);
    const nextCount = Number.isFinite(currentParticipants) ? currentParticipants + 1 : 1;

    const { data: updated, error: updateError } = await supabase
      .from("community_events")
      .update({ current_participants: String(nextCount), meeting_url: zoomJoinUrl || event.meeting_url })
      .eq("id", eventId)
      .select("*")
      .single();

    if (!updateError && updated) {
      updatedEvent = updated;
    }

    return jsonResponse({ signup: createdSignup, event: updatedEvent });
  } catch (error) {
    return jsonResponse({ error: error?.message || "Unexpected error" }, 500);
  }
});
