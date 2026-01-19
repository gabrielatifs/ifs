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
      template_id: templateIdRaw,
      templateId,
      template_data: templateDataRaw,
      templateData,
    } = body ?? {};

    const recipients = normalizeRecipients(to);
    const from =
      (typeof fromOverride === "string" && fromOverride.trim()) ||
      Deno.env.get("RESEND_FROM") ||
      Deno.env.get("RESEND_DEFAULT_FROM");
    const resolvedHtml = typeof html === "string" ? html : htmlBody;
    const templateId =
      (typeof templateIdRaw === "string" && templateIdRaw.trim()) ||
      (typeof templateId === "string" && templateId.trim()) ||
      null;
    const resolvedTemplateData =
      (templateDataRaw && typeof templateDataRaw === "object" && !Array.isArray(templateDataRaw))
        ? templateDataRaw
        : (templateData && typeof templateData === "object" && !Array.isArray(templateData))
          ? templateData
          : undefined;

    if (!from) {
      return new Response(
        JSON.stringify({ error: "Missing from address (RESEND_FROM or payload.from)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!recipients.length || (!templateId && !subject) || (!templateId && !resolvedHtml && !text)) {
      return new Response(
        JSON.stringify({ error: "to, subject, and html or text are required (unless template_id is provided)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendPayload: Record<string, unknown> = {
      from,
      to: recipients,
      cc,
      bcc,
      reply_to: replyTo,
    };

    if (templateId) {
      resendPayload.template_id = templateId;
      if (resolvedTemplateData) {
        resendPayload.template_data = resolvedTemplateData;
      }
    } else {
      resendPayload.subject = subject;
      resendPayload.html = resolvedHtml;
      resendPayload.text = text;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
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
