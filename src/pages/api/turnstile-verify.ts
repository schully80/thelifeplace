/// <reference types="astro/client" />
import type { APIRoute } from "astro";
import { getClientIP, parseJSONRequest, apiErrorResponse, secureAPIResponse } from "../../utils/api-auth";
import { logSecurityEvent } from "../../utils/secure-logging";

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIP(request.headers);

  const bodyResult = await parseJSONRequest(request);
  if (!bodyResult.valid) {
    return apiErrorResponse(bodyResult.error || "Invalid request body", 400);
  }

  const data = bodyResult.data || {};

  const token =
    (data.token as string) ||
    (data["turnstile-token"] as string) ||
    (data["cf-turnstile-response"] as string) ||
    (data.response as string);

  if (!token) {
    logSecurityEvent("Missing Turnstile token in verification request", "medium", { endpoint: "/api/turnstile-verify" }, ip);
    return apiErrorResponse("Missing Turnstile token", 400, "missing_token");
  }

  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("Missing TURNSTILE_SECRET_KEY in environment");
    logSecurityEvent("Missing Turnstile secret key", "high", { endpoint: "/api/turnstile-verify" }, ip);
    return apiErrorResponse("Server misconfigured", 500, "server_misconfigured");
  }

  try {
    const idempotency =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const verifyBody = new URLSearchParams({
      secret: secret.toString(),
      response: token,
      remoteip: ip,
      idempotency_key: idempotency,
    });

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: verifyBody,
    });

    const verifyJson: any = await verifyRes.json();

    if (!verifyJson.success) {
      const errors = verifyJson["error-codes"] || [];
      logSecurityEvent("Turnstile verification failed", "medium", { errors, endpoint: "/api/turnstile-verify" }, ip);

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
          return secureAPIResponse(
            { success: false, error: codeMap[e].code, detail: codeMap[e].message, raw: verifyJson },
            codeMap[e].status
          );
        }
      }

      return secureAPIResponse({ success: false, detail: verifyJson }, 400);
    }

    return secureAPIResponse({ success: true, detail: verifyJson });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error verifying Turnstile token", message);
    logSecurityEvent("Error during Turnstile verification", "high", { error: message }, ip);
    return apiErrorResponse("Verification failed", 500, "verification_error");
  }
};
