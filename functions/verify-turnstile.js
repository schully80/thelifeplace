import { logSecurityEvent, logAPIRequest } from '../src/utils/secure-logging.ts';
import { getClientIP, validateOrigin, apiErrorResponse } from '../src/utils/api-auth.ts';

export async function POST({ request }) {
  const ip = getClientIP(request.headers);

  try {
    // ✅ Validate origin
    if (!validateOrigin(request.headers)) {
      logSecurityEvent("Invalid origin for Turnstile verification", "medium", { origin: request.headers.get("origin") }, ip);
      return apiErrorResponse("Invalid origin", 403);
    }

    const body = await request.json();
    const token = body?.turnstileToken;

    if (!token) {
      logAPIRequest("POST", "/functions/verify-turnstile", 400, ip);
      return apiErrorResponse("missing_token", 400);
    }

    const secret = process.env.TURNSTILE_SECRET;
    if (!secret) {
      logSecurityEvent("Missing Turnstile secret in environment", "high");
      logAPIRequest("POST", "/functions/verify-turnstile", 500, ip);
      return apiErrorResponse("missing_secret", 500);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token })
    });

    const json = await res.json();
    
    if (json.success) {
      logAPIRequest("POST", "/functions/verify-turnstile", 200, ip);
    } else {
      logSecurityEvent("Turnstile verification failed", "medium", { error_codes: json["error-codes"] }, ip);
      logAPIRequest("POST", "/functions/verify-turnstile", 400, ip);
    }

    const statusCode = json.success ? 200 : 400;
    return new Response(JSON.stringify(json), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, no-cache'
      }
    });
  } catch (err) {
    logSecurityEvent("Exception in Turnstile verification", "high", { error: String(err) }, ip);
    logAPIRequest("POST", "/functions/verify-turnstile", 500, ip);
    return apiErrorResponse("exception", 500);
  }
}