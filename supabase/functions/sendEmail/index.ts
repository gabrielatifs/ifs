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

const normalizeRecipients = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = getEnv("RESEND_API_KEY");

    const body = await req.json().catch(() => ({}));
    const {
      to,
      subject,
      html,
      body: htmlBody,
      text,
      from: fromOverride,
      cc,
      bcc,
      replyTo,
    } = body ?? {};

    const recipients = normalizeRecipients(to);
    const from =
      (typeof fromOverride === "string" && fromOverride.trim()) ||
      Deno.env.get("RESEND_FROM") ||
      Deno.env.get("RESEND_DEFAULT_FROM");
    const resolvedHtml = typeof html === "string" ? html : htmlBody;

    if (!from) {
      return new Response(
        JSON.stringify({ error: "Missing from address (RESEND_FROM or payload.from)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!recipients.length || !subject || (!resolvedHtml && !text)) {
      return new Response(
        JSON.stringify({ error: "to, subject, and html or text are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html: resolvedHtml,
        text,
        cc,
        bcc,
        reply_to: replyTo,
      }),
    });

    const resendData = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({
          error: resendData?.message || "Failed to send email",
          details: resendData,
        }),
        { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: resendData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
