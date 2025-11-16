export async function POST({ request }) {
  try {
    const body = await request.json();
    const token = body?.turnstileToken;
    if (!token) return new Response(JSON.stringify({ success: false, error: 'missing_token' }), { status: 400 });

    const secret = process.env.TURNSTILE_SECRET;
    if (!secret) return new Response(JSON.stringify({ success: false, error: 'missing_secret' }), { status: 500 });

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token })
    });

    const json = await res.json();
    return new Response(JSON.stringify(json), { status: json.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'exception', message: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}