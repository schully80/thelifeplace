export async function post({ request }: { request: Request }) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let token: string | null = null;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      token = json?.token || json?.['cf-turnstile-response'] || null;
    } else {
      const form = await request.formData();
      token = (form.get('token') as string) || (form.get('cf-turnstile-response') as string) || null;
    }

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'no_token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const secret = process.env.TURNSTILE_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ success: false, error: 'missing_secret' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params
    });

    const verifyJson = await verifyRes.json();
    return new Response(JSON.stringify(verifyJson), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
