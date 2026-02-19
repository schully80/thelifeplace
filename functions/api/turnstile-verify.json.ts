import { getClientIP, parseJSONRequest, secureAPIResponse, apiErrorResponse } from '../../src/utils/api-auth';
import { logSecurityEvent } from '../../src/utils/secure-logging';

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;
  const ip = getClientIP(request.headers);

  const bodyResult = await parseJSONRequest(request);
  if (!bodyResult.valid) {
    return bodyResult.errorResponse || apiErrorResponse('Invalid request body', 400);
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
    const verifyBody = new URLSearchParams({
      secret: secret.toString(),
      response: token,
      remoteip: ip,
    });

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyBody,
    });

    const verifyJson = await verifyRes.json();

    if (!verifyJson.success) {
      logSecurityEvent('Turnstile verification failed', 'medium', { errors: verifyJson['error-codes'] || verifyJson }, ip);
      return secureAPIResponse({ success: false, detail: verifyJson }, 400);
    }

    return secureAPIResponse({ success: true, detail: verifyJson });
  } catch (err) {
    console.error('Error verifying Turnstile token', err);
    logSecurityEvent('Error during Turnstile verification', 'high', { error: String(err) }, ip);
    return apiErrorResponse('Verification failed', 500, 'verification_error');
  }
};
