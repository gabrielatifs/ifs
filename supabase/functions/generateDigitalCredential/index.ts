import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

const buildTitle = (
  credentialType: string,
  metadata?: Record<string, unknown>,
) => {
  if (credentialType === "Masterclass Attendance") {
    const title = metadata?.masterclassTitle;
    if (typeof title === "string" && title.trim()) return title.trim();
  }
  if (credentialType === "Course Completion") {
    const title = metadata?.courseTitle;
    if (typeof title === "string" && title.trim()) return title.trim();
  }
  return credentialType;
};

const normalizeMetadata = (metadata?: Record<string, unknown>) => {
  if (!metadata) return null;
  try {
    return JSON.stringify(metadata);
  } catch {
    return null;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid JWT" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      userId,
      authId,
      userName,
      userEmail,
      credentialType,
      metadata,
    } = body ?? {};

    if (!userId || !credentialType) {
      return new Response(
        JSON.stringify({ error: "userId and credentialType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_id", authData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found for session" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isAdmin = profile.role === "admin";
    if (!isAdmin && profile.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Not authorized for requested user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const title = buildTitle(String(credentialType), metadata);
    const now = new Date().toISOString();

    const { data: existing, error: existingError } = await supabase
      .from("digital_credentials")
      .select("*")
      .eq("user_id", userId)
      .eq("credential_type", credentialType)
      .eq("status", "active")
      .order("issued_date", { ascending: false })
      .limit(1);

    if (existingError) {
      return new Response(
        JSON.stringify({ error: existingError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ credential: existing[0], reused: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const verificationCode = crypto.randomUUID().replace(/-/g, "");
    const { data: created, error } = await supabase
      .from("digital_credentials")
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        user_name: userName || null,
        credential_type: credentialType,
        title,
        description: userName ? `Issued to ${userName}` : null,
        issued_date: now,
        verification_code: verificationCode,
        metadata: normalizeMetadata(metadata),
        status: "active",
        created_by_id: authId || null,
        created_by_email: userEmail || null,
      })
      .select("*")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ credential: created }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
