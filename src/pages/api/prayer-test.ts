/// <reference types="astro/client" />
import type { APIRoute } from "astro";
import { secureAPIResponse, apiErrorResponse } from "../../utils/api-auth";

export const GET: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = locals?.runtime?.env as Record<string, string | undefined> | undefined;
  const envValue = (key: string) => runtimeEnv?.[key] ?? import.meta.env[key];
  const fromEmail = envValue("MAIL_FROM") || "prayer@thelifeplace.org";
  const toEmail = envValue("MAIL_TO") || "mystory@thelifeplace.org";
  const textBody = "This is a test email sent from /api/prayer-test.";

  const resendKey = envValue("RESEND_API_KEY");
  const resendFrom =
    envValue("RESEND_FROM") ||
    envValue("RESEND_FROM_DEV") ||
    fromEmail;

  // Prefer Resend if configured
  if (resendKey) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [toEmail],
          subject: "Test mail from prayer-test endpoint",
          text: textBody,
          reply_to: fromEmail,
        }),
      });

      if (!resendRes.ok) {
        const detail = await resendRes.text().catch(() => "");
        return apiErrorResponse(
          `Resend failed (status ${resendRes.status})`,
          502,
          detail || "email_error"
        );
      }

      return secureAPIResponse({ success: true, provider: "resend", sent_to: toEmail });
    } catch (err) {
      return apiErrorResponse("Resend send failed", 500, String(err));
    }
  }

  // Fallback to MailChannels
  const mailPayload = {
    personalizations: [
      {
        to: [{ email: toEmail }],
        reply_to: { email: fromEmail, name: "Prayer Team" },
      },
    ],
    from: { email: fromEmail, name: "Prayer Requests (test)" },
    subject: "Test mail from prayer-test endpoint",
    content: [{ type: "text/plain", value: textBody }],
  };

  try {
    const mailRes = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mailPayload),
    });

    if (!mailRes.ok) {
      const detail = await mailRes.text().catch(() => "");
      return apiErrorResponse(
        `MailChannels failed (status ${mailRes.status})`,
        502,
        detail || "email_error"
      );
    }

    return secureAPIResponse({ success: true, provider: "mailchannels", sent_to: toEmail });
  } catch (err) {
    return apiErrorResponse("MailChannels send failed", 500, String(err));
  }
};
