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

Dedupe behavior (why widgets sometimes render twice)
-----------------------------------------------
- The Turnstile widget component (`src/components/ui/Turnstile.astro`) includes a runtime dedupe guard:
	- When a widget is rendered inside a form, the script looks for other inputs with the same `name` (e.g. `cf-turnstile-response`) and, if another exists, removes the duplicate widget wrapper to avoid multiple widgets in the same form.
	- This prevents duplicate markup or double-initialization when a page accidentally includes the component more than once (for example, in test pages or when server-side markup is duplicated).

Server-side error mapping
-------------------------
When the server posts the client token to Cloudflare's Siteverify API it will receive a JSON response. Our handler (`/api/turnstile-verify.json`) maps common Cloudflare error-codes to clearer responses and logs details for debugging. You may see responses like:

- `missing-input-secret` -> server misconfigured (missing TURNSTILE_SECRET_KEY)
- `invalid-input-secret` -> secret key invalid or expired
- `missing-input-response` -> client did not send a token (token missing)
- `invalid-input-response` -> token invalid, malformed, or expired
- `timeout-or-duplicate` -> token expired (older than 5 minutes) or already used
- `internal-error` -> Cloudflare siteverify internal error (retry later)

The API returns a JSON body with `success: false` and `error` (a short code) plus `raw` containing the full Cloudflare response for inspection. Example:

```
{
	"success": false,
	"error": "timeout_or_duplicate",
	"detail": "Turnstile token expired or already used",
	"raw": { /* raw siteverify response */ }
}
```

Debugging tips
--------------
- If you see `timeout-or-duplicate` or tokens failing intermittently, ensure the client sends the token promptly (tokens are valid for 5 minutes) and that tokens are not reused.
- For client-side errors (widget appears twice or callback collisions) check that you are including the widget component only once per logical form, or rely on the dedupe guard to remove duplicates.
- If you receive secret-related errors, confirm `TURNSTILE_SECRET_KEY` is set in your deployment environment (Cloudflare Pages / Workers env) and that you're not exposing the secret to the client.

If you want me to add example curl requests or CI checks for verifying the siteverify response, say so and I will add them to this doc.
