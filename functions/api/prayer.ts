import type { PagesFunction } from "@cloudflare/workers-types";
import { getClientIP, apiErrorResponse, secureAPIResponse } from "../../src/utils/api-auth";
import { logSecurityEvent } from "../../src/utils/secure-logging";

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;
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

  if (!token) {
    logSecurityEvent("Missing Turnstile token on prayer form", "medium", { endpoint: "/api/prayer" }, ip);
    return apiErrorResponse("Missing Turnstile token", 400, "missing_token");
  }

  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    logSecurityEvent("Missing TURNSTILE_SECRET_KEY", "high", { endpoint: "/api/prayer" }, ip);
    return apiErrorResponse("Server misconfigured", 500, "server_misconfigured");
  }

  // Verify token with Cloudflare
  const verifyBody = new URLSearchParams({
    secret: secret.toString(),
    response: token,
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

  const formspreeEndpoint = env.PUBLIC_FORMSPREE_PRAYER_ENDPOINT;
  if (!formspreeEndpoint) {
    logSecurityEvent("Missing Formspree endpoint", "high", { endpoint: "/api/prayer" }, ip);
    return apiErrorResponse("Server misconfigured", 500, "missing_upstream");
  }

  // Forward form fields to Formspree, excluding Turnstile tokens
  const outbound = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("cf-turnstile") || key === "turnstile-token" || key === "token") continue;
    outbound.append(key, String(value));
  }

  const upstream = await fetch(formspreeEndpoint.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: outbound,
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    logSecurityEvent("Formspree submission failed", "medium", { status: upstream.status, detail }, ip);
    return apiErrorResponse("Submission failed", 502, "formspree_error");
  }

  const redirect = formData.get("_redirect");
  if (redirect) {
    return Response.redirect(redirect.toString(), 303);
  }

  return secureAPIResponse({ success: true });
};
