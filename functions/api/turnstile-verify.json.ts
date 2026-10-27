import type { PagesFunction } from "@cloudflare/workers-types";
import { getClientIP, parseJSONRequest, secureAPIResponse, apiErrorResponse } from '../../src/utils/api-auth';
import { logSecurityEvent } from '../../src/utils/secure-logging';

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;
  const ip = getClientIP(request.headers);

  const bodyResult = await parseJSONRequest(request);
  if (!bodyResult.valid) {
    return apiErrorResponse(bodyResult.error || 'Invalid request body', 400);
  }

  const data = bodyResult.data || {};

  const token =
    (data.token as string) ||
    (data['turnstile-token'] as string) ||
    (data['cf-turnstile-response'] as string) ||
    (data.response as string);

  if (!token) {
    logSecurityEvent('Missing Turnstile token in verification request', 'medium', { endpoint: '/api/turnstile-verify' }, ip);
    return apiErrorResponse('Missing Turnstile token', 400, 'missing_token');
  }

  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('Missing TURNSTILE_SECRET_KEY in environment');
    logSecurityEvent('Missing Turnstile secret key', 'high', { endpoint: '/api/turnstile-verify' }, ip);
    return apiErrorResponse('Server misconfigured', 500, 'server_misconfigured');
  }

  try {
    // include an idempotency key to help with retries and duplicate requests
    const idempotency = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `id-${Date.now()}-${Math.floor(Math.random()*100000)}`;

    const verifyBody = new URLSearchParams({
      secret: secret.toString(),
      response: token,
      remoteip: ip,
      idempotency_key: idempotency,
    });

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyBody,
    });

    const verifyJson = await verifyRes.json();

    if (!verifyJson.success) {
      // Log details and map known error codes to friendly responses
      const errors = verifyJson['error-codes'] || [];
      logSecurityEvent('Turnstile verification failed', 'medium', { errors, endpoint: '/api/turnstile-verify' }, ip);

      const codeMap: Record<string, { status: number; code: string; message: string }> = {
        'missing-input-secret': { status: 500, code: 'missing_input_secret', message: 'Server misconfigured (missing secret)' },
        'invalid-input-secret': { status: 500, code: 'invalid_input_secret', message: 'Invalid Turnstile secret key' },
        'missing-input-response': { status: 400, code: 'missing_input_response', message: 'Missing Turnstile token' },
        'invalid-input-response': { status: 400, code: 'invalid_input_response', message: 'Invalid or expired Turnstile token' },
        'timeout-or-duplicate': { status: 400, code: 'timeout_or_duplicate', message: 'Turnstile token expired or already used' },
        'internal-error': { status: 500, code: 'internal_error', message: 'Turnstile internal error' },
      };

      // Choose the first known error to return a clearer response
      for (const e of errors) {
        if (codeMap[e]) {
          return secureAPIResponse({ success: false, error: codeMap[e].code, detail: codeMap[e].message, raw: verifyJson }, codeMap[e].status);
        }
      }

      // Unknown error: return the raw response with 400
      return secureAPIResponse({ success: false, detail: verifyJson }, 400);
    }

    return secureAPIResponse({ success: true, detail: verifyJson });
  } catch (err) {
    console.error('Error verifying Turnstile token', err);
    logSecurityEvent('Error during Turnstile verification', 'high', { error: String(err) }, ip);
    return apiErrorResponse('Verification failed', 500, 'verification_error');
  }
};
