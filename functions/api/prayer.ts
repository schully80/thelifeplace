import type { PagesFunction } from "@cloudflare/workers-types";
import { getClientIP, apiErrorResponse, secureAPIResponse } from "../../src/utils/api-auth";
import { logSecurityEvent } from "../../src/utils/secure-logging";

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;
  const envStage = (env?.STAGE || env?.NODE_ENV || "production").toString();
  const isDev = envStage === "development" || request.url.includes("localhost") || request.url.includes("127.0.0.1");
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
    env.PRAYER_TURNSTILE_DISABLED === "true" ||
    (isDev && env.PRAYER_TURNSTILE_DISABLE_DEV === "true");

  if (!token && !turnstileDisabled) {
    logSecurityEvent("Missing Turnstile token on prayer form", "medium", { endpoint: "/api/prayer" }, ip);
    return apiErrorResponse("Missing Turnstile token", 400, "missing_token");
  }

  const secret =
    env.TURNSTILE_SECRET_KEY ||
    (isDev ? "1x0000000000000000000000000000000AA" : undefined);

  if (!secret && !turnstileDisabled) {
    logSecurityEvent("Missing TURNSTILE_SECRET_KEY", "high", { endpoint: "/api/prayer" }, ip);
    return apiErrorResponse("Server misconfigured", 500, "server_misconfigured");
  }

  // Verify token with Cloudflare
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

    const verifyJson = await verifyRes.json();

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

  // Prepare email via MailChannels (Cloudflare-supported)
  const fromEmail = (env.MAIL_FROM as string) || "mystory@thelifeplace.org";
  const toEmail = (env.MAIL_TO as string) || fromEmail;
  const name = (formData.get("name") as string) || "Unknown";
  const userEmail = (formData.get("email") as string) || "";
  const requestText = ((formData.get("request") as string) || "").toString().trim();
  const consent = formData.get("consent") ? "yes" : "no";

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
    env.PRAYER_EMAIL_DISABLED === "true" ||
    (isDev && env.PRAYER_EMAIL_DISABLE_DEV === "true");

  if (!emailDisabled) {
    try {
      const mailRes = await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mailPayload),
      });

      if (!mailRes.ok) {
        const detail = await mailRes.text().catch(() => "");
        logSecurityEvent("MailChannels send failed", "medium", { status: mailRes.status, detail }, ip);
        return secureAPIResponse(
          { success: true, email_error: true, status: mailRes.status, detail },
          200
        );
      }
    } catch (err) {
      logSecurityEvent("MailChannels send exception", "medium", { error: String(err) }, ip);
      return secureAPIResponse(
        { success: true, email_error: true, detail: String(err) },
        200
      );
    }
  }

  const redirect = formData.get("_redirect");
  if (redirect) {
    try {
      const target = new URL(redirect.toString(), request.url);
      return Response.redirect(target.toString(), 303);
    } catch (err) {
      logSecurityEvent("Invalid redirect URL", "medium", { redirect, error: String(err) }, ip);
    }
  }

  return secureAPIResponse({ success: true });
};
