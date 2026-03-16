/// <reference types="astro/client" />
import type { APIRoute } from "astro";
import { getClientIP, apiErrorResponse, secureAPIResponse } from "../../utils/api-auth";
import { logFormSubmission, logSecurityEvent } from "../../utils/secure-logging";
import { teamHtml, confirmHtml, confirmText } from "../../utils/prayer-email-templates";

export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = locals?.runtime?.env as Record<string, string | undefined> | undefined;
  const envValue = (key: string) => runtimeEnv?.[key] ?? import.meta.env[key];
  const isDev = (import.meta.env.DEV || import.meta.env.MODE === "development" || runtimeEnv?.STAGE === "development") ?? false;
  const ip = getClientIP(request.headers);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    logSecurityEvent("Prayer API form parse failed", "medium", { error: String(err) }, ip);
    return apiErrorResponse("Invalid form submission", 400, "invalid_form");
  }

  const token =
    (formData.get("cf-turnstile-response") as string | null) ||
    (formData.get("turnstile-token") as string | null) ||
    (formData.get("token") as string | null);

  const turnstileDisabled =
    envValue("PRAYER_TURNSTILE_DISABLED") === "true" ||
    (isDev && envValue("PRAYER_TURNSTILE_DISABLE_DEV") === "true");

  if (!token && !turnstileDisabled) {
    logSecurityEvent("Missing Turnstile token on prayer form", "medium", { endpoint: "/api/prayer" }, ip);
    return apiErrorResponse("Missing Turnstile token", 400, "missing_token");
  }

  const secret =
    envValue("TURNSTILE_SECRET_KEY") ||
    (isDev ? "1x0000000000000000000000000000000AA" : undefined);

  if (!secret && !turnstileDisabled) {
    logSecurityEvent("Missing TURNSTILE_SECRET_KEY", "high", { endpoint: "/api/prayer" }, ip);
    return apiErrorResponse("Server misconfigured", 500, "server_misconfigured");
  }

  if (!turnstileDisabled) {
    const verifyBody = new URLSearchParams({
      secret: secret!.toString(),
      response: token!,
      remoteip: ip,
    });

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: verifyBody,
    });

    const verifyJson: any = await verifyRes.json();

    if (!verifyJson.success) {
      const errors = verifyJson["error-codes"] || [];
      logSecurityEvent("Prayer Turnstile verification failed", "medium", { errors, endpoint: "/api/prayer" }, ip);

      const codeMap: Record<string, { status: number; code: string; message: string }> = {
        "missing-input-secret": { status: 500, code: "missing_input_secret", message: "Server misconfigured (missing secret)" },
        "invalid-input-secret": { status: 500, code: "invalid_input_secret", message: "Invalid Turnstile secret key" },
        "missing-input-response": { status: 400, code: "missing_input_response", message: "Missing Turnstile token" },
        "invalid-input-response": { status: 400, code: "invalid_input_response", message: "Invalid or expired Turnstile token" },
        "timeout-or-duplicate": { status: 400, code: "timeout_or_duplicate", message: "Turnstile token expired or already used" },
        "internal-error": { status: 500, code: "internal_error", message: "Turnstile internal error" },
      };

      for (const e of errors) {
        if (codeMap[e]) {
          return secureAPIResponse({ success: false, error: codeMap[e].code, detail: codeMap[e].message, raw: verifyJson }, codeMap[e].status);
        }
      }

      return secureAPIResponse({ success: false, detail: verifyJson }, 400);
    }
  }

  // Prepare email via MailChannels-compatible HTTP send
  const fromEmail = envValue("MAIL_FROM") || "prayer@thelifeplace.org";
  const toEmail = envValue("MAIL_TO") || "mystory@thelifeplace.org";
  const name = (formData.get("name") as string) || "Unknown";
  const userEmail = ((formData.get("email") as string) || "").toString().trim().toLowerCase();
  const requestText = ((formData.get("request") as string) || "").toString().trim();
  const consent = formData.get("consent") ? "yes" : "no";

  // 🚦 One active prayer request per user (email-based) for 7 days
  const prayerKv =
    (((locals?.runtime as any)?.env?.PRAYER_SUBMISSIONS ||
      (locals?.runtime as any)?.env?.VISIT_SUBMISSIONS) as KVNamespace | undefined);
  const prayerLimitEnabled = envValue("PRAYER_LIMIT_ENABLED") !== "false";
  if (prayerKv && prayerLimitEnabled && userEmail) {
    try {
      const key = `prayer:${userEmail}`;
      const existing = await prayerKv.get(key);
      if (existing) {
        logFormSubmission("prayer", { status: "limit_reached", email: userEmail }, ip);
        return secureAPIResponse({ success: false, reason: "limit_reached" }, 429);
      }
      await prayerKv.put(key, "1", { expirationTtl: 60 * 60 * 24 * 7 });
    } catch (err) {
      logSecurityEvent("Prayer KV error", "medium", { error: String(err), endpoint: "/api/prayer" }, ip);
      // fail open: continue without blocking submission
    }
  }

  const textBody = [
    `New prayer request`,
    `Name: ${name}`,
    `Email: ${userEmail || "not provided"}`,
    `Consent: ${consent}`,
    ``,
    `Request:`,
    requestText || "(empty)"
  ].join("\n");

  const mailPayload = {
    personalizations: [
      {
        to: [{ email: toEmail }],
        reply_to: userEmail ? { email: userEmail, name } : { email: fromEmail, name: "Prayer Team" },
      },
    ],
    from: { email: fromEmail, name: "Prayer Requests" },
    subject: "New prayer request from the site",
    content: [{ type: "text/plain", value: textBody }],
  };

  const emailDisabled =
    envValue("PRAYER_EMAIL_DISABLED") === "true" ||
    (isDev && envValue("PRAYER_EMAIL_DISABLE_DEV") === "true");

  if (!emailDisabled) {
    const resendKey = envValue("RESEND_API_KEY");
    const resendFrom =
      (isDev ? envValue("RESEND_FROM_DEV") : envValue("RESEND_FROM")) ||
      envValue("MAIL_FROM") ||
      (isDev ? "onboarding@resend.dev" : "prayer@thelifeplace.org");

    if (!resendKey) {
      logSecurityEvent("Resend API key missing", "high", { endpoint: "/api/prayer" }, ip);
      return secureAPIResponse({ success: true, email_error: true, provider: "resend", detail: "missing RESEND_API_KEY" }, 200);
    }

    // Send to team
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
          subject: "New prayer request from the site",
          text: textBody,
          html: teamHtml({ name, userEmail, requestText, consent }),
          reply_to: userEmail || undefined,
        }),
      });

      if (!resendRes.ok) {
        const detail = await resendRes.text().catch(() => "");
        logSecurityEvent("Resend send failed", "medium", { status: resendRes.status, detail }, ip);
        return secureAPIResponse(
          { success: true, email_error: true, provider: "resend", status: resendRes.status, detail },
          200
        );
      }
    } catch (err) {
      logSecurityEvent("Resend send exception", "medium", { error: String(err) }, ip);
      return secureAPIResponse(
        { success: true, email_error: true, provider: "resend", detail: String(err) },
        200
      );
    }

    // Confirmation to submitter
    if (userEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: resendFrom,
            to: [userEmail],
            subject: "We received your prayer request",
            text: confirmText({ name, requestText }),
            html: confirmHtml({ name, requestText }),
          }),
        });
      } catch (err) {
        logSecurityEvent("Resend confirmation failed", "low", { error: String(err) }, ip);
      }
    }
  }

  const redirect = formData.get("_redirect");
  if (redirect) {
    try {
      const target = new URL(redirect.toString(), request.url);
      return Response.redirect(target.toString(), 303);
    } catch (err) {
      logSecurityEvent("Invalid redirect URL", "medium", { redirect, error: String(err) }, ip);
      // fall through to JSON success if redirect is malformed
    }
  }

  return secureAPIResponse({ success: true });
};
