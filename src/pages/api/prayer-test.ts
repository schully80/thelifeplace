/// <reference types="astro/client" />
import type { APIRoute } from "astro";
import { secureAPIResponse, apiErrorResponse } from "../../utils/api-auth";

export const GET: APIRoute = async ({ request }) => {
  const fromEmail = import.meta.env.MAIL_FROM || "mystory@thelifeplace.org";
  const toEmail = import.meta.env.MAIL_TO || fromEmail;

  const mailPayload = {
    personalizations: [
      {
        to: [{ email: toEmail }],
        reply_to: { email: fromEmail, name: "Prayer Team" },
      },
    ],
    from: { email: fromEmail, name: "Prayer Requests (test)" },
    subject: "Test mail from prayer-test endpoint",
    content: [{ type: "text/plain", value: "This is a test email sent via MailChannels from /api/prayer-test." }],
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
        `Send failed (status ${mailRes.status})`,
        502,
        detail || "email_error"
      );
    }

    return secureAPIResponse({ success: true, sent_to: toEmail });
  } catch (err) {
    return apiErrorResponse("Send failed", 500, String(err));
  }
};
