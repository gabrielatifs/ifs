const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const getEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

const toIsoString = (timestamp: number | null | undefined) => {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
};

const resolveMembershipStatus = (status: string, cancelAtPeriodEnd: boolean) => {
  if (cancelAtPeriodEnd && status === "active") return "active";
  if (status === "canceled") return "canceled";
  if (status === "unpaid" || status === "incomplete_expired") return "inactive";
  return "active";
};

const resolveStripeStatus = (status: string, cancelAtPeriodEnd: boolean) => {
  if (cancelAtPeriodEnd && status === "active") return "canceling";
  return status;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const stripeSecretKey = getEnv("STRIPE_SECRET_KEY");
    const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      return jsonResponse({ error: "Missing Stripe signature" }, 400);
    }

    const Stripe = (await import("https://esm.sh/stripe@14.25.0?target=deno")).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const payload = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
    );

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode !== "subscription" || !session.subscription) {
        return jsonResponse({ received: true });
      }

      const subscriptionId = String(session.subscription);
      const customerId = session.customer ? String(session.customer) : null;
      const authUserId =
        (session.client_reference_id as string) ||
        (session.metadata?.auth_user_id as string) ||
        null;
      const customerEmail =
        session.customer_details?.email ||
        session.customer_email ||
        null;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const updatePayload = {
        membership_type: "Full",
        membership_status: resolveMembershipStatus(subscription.status, subscription.cancel_at_period_end),
        stripe_subscription_status: resolveStripeStatus(subscription.status, subscription.cancel_at_period_end),
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        subscription_status: subscription.status,
        subscription_start_date: toIsoString(subscription.current_period_start),
        subscription_end_date: toIsoString(subscription.current_period_end),
        subscription_current_period_end: toIsoString(subscription.current_period_end),
        subscription_trial_end: toIsoString(subscription.trial_end),
      };

      if (authUserId) {
        await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("auth_id", authUserId);
      } else if (customerEmail) {
        await supabase
          .from("profiles")
          .update(updatePayload)
          .ilike("email", customerEmail);
      }

      return jsonResponse({ received: true });
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer ? String(subscription.customer) : null;

      const updatePayload = {
        membership_status: resolveMembershipStatus(subscription.status, subscription.cancel_at_period_end),
        stripe_subscription_status: resolveStripeStatus(subscription.status, subscription.cancel_at_period_end),
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        subscription_status: subscription.status,
        subscription_start_date: toIsoString(subscription.current_period_start),
        subscription_end_date: toIsoString(subscription.current_period_end),
        subscription_current_period_end: toIsoString(subscription.current_period_end),
        subscription_trial_end: toIsoString(subscription.trial_end),
      };

      await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("stripe_subscription_id", subscription.id);

      return jsonResponse({ received: true });
    }

    return jsonResponse({ received: true });
  } catch (error) {
    return jsonResponse({ error: error?.message || "Unexpected error" }, 500);
  }
});
