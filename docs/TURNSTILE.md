# Cloudflare Turnstile integration

This document describes the Turnstile widget integration used by the site and how to configure and test it.

Environment variables
- `PUBLIC_TURNSTILE_SITE_KEY` — sitekey to render the client widget (public). Add this to your deployment/public env config.
- `TURNSTILE_SECRET_KEY` — secret used by server-side verification. Keep this in your private environment only (do NOT commit to repo).

Local development
1. Add placeholder values to `.env` or better to `.env.example` (do not commit secrets):

```text
PUBLIC_TURNSTILE_SITE_KEY=your_public_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

2. Start the dev server and visit `/test-turnstile` to see the widget and verify tokens.

How it works
- The client widget is rendered via `src/components/ui/Turnstile.astro`.
- When the widget completes it sets a hidden token value which is posted to the server verification endpoint at `/api/turnstile-verify.json`.
- The server handler validates the token by POSTing to Cloudflare's `https://challenges.cloudflare.com/turnstile/v0/siteverify` using `TURNSTILE_SECRET_KEY`.

Security notes
- Do not store secrets in public repositories.
- Use review apps or deployment environment variables for staging/production keys.

Testing
- Use the `/test-turnstile` page to exercise the flow; the page will display the verification API response.
