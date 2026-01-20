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

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const stripeSecretKey = getEnv("STRIPE_SECRET_KEY");
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const defaultPriceId = Deno.env.get("STRIPE_DEFAULT_PRICE_ID") || "";

    const body = await req.json().catch(() => ({}));
    const {
      priceId: priceIdRaw,
      successUrl,
      cancelUrl,
      membershipTier,
      billingPeriod,
    } = body ?? {};

    const priceId = typeof priceIdRaw === "string" && priceIdRaw.trim()
      ? priceIdRaw.trim()
      : defaultPriceId;

    if (!priceId) {
      return jsonResponse({ error: "priceId is required" }, 400);
    }

    if (!successUrl || !cancelUrl) {
      return jsonResponse({ error: "successUrl and cancelUrl are required" }, 400);
    }

    const token = getAuthToken(req);
    if (!token) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const user = authData.user;
    const userId = user.id;
    const userEmail = user.email || "";
    const userName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      "";

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id,email,full_name")
      .eq("auth_id", userId)
      .maybeSingle();

    const Stripe = (await import("https://esm.sh/stripe@14.25.0?target=deno")).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    let stripeCustomerId = profile?.stripe_customer_id || null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail || profile?.email || undefined,
        name: userName || profile?.full_name || undefined,
        metadata: {
          auth_user_id: userId,
        },
      });
      stripeCustomerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("auth_id", userId);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: String(successUrl),
      cancel_url: String(cancelUrl),
      client_reference_id: userId,
      metadata: {
        auth_user_id: userId,
        membership_tier: membershipTier || "",
        billing_period: billingPeriod || "",
      },
    });

    return jsonResponse({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return jsonResponse({ error: error?.message || "Unexpected error" }, 500);
  }
});
