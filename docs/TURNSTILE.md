# Cloudflare Turnstile — Integration Guide

Overview

This project integrates Cloudflare Turnstile to protect public forms while keeping UX accessible and resilient.

Key files

- `src/components/ui/Turnstile.astro` — accessible, compact widget component. Renders the Turnstile container and a hidden input `cf-turnstile-response`.
- `src/pages/api/turnstile-verify.ts` — lightweight verification endpoint (POST token -> Cloudflare siteverify).
- `functions/register.ts` — registration handler that verifies Turnstile (or falls back when configured).
- Pages/components updated to use Turnstile: `FormCard.astro`, `RegisterForm.astro`, `prayer.astro`.

Environment variables

Set these in your environment (do NOT commit secrets):

- `PUBLIC_ENABLE_TURNSTILE`=true|false — render widget client-side when true.
- `PUBLIC_TURNSTILE_SITEKEY` — public site key from Cloudflare.
- `TURNSTILE_SECRET` — server secret for verification (required to validate tokens).
- `ALLOW_TURNSTILE_FALLBACK`=true|false — when true, server may accept manual-review fallbacks (see below).

Local testing

1. Add your keys to `.env` in the project root and restart the dev server:

```text
PUBLIC_ENABLE_TURNSTILE=true
PUBLIC_TURNSTILE_SITEKEY=0xYOUR_SITEKEY
# TURNSTILE_SECRET and ALLOW_TURNSTILE_FALLBACK are server-side; set them in your functions/deployment env
```

2. In Cloudflare Turnstile settings add your dev origin (including port), e.g. `http://localhost:4322`.
3. Disable ad/privacy extensions during testing.
4. Start dev and open a form that uses `FormCard` / `RegisterForm` or `/prayer/`.

What to look for in the form HTML

- `div.cf-turnstile` — the widget container
- `input[name="cf-turnstile-response"]` — hidden input populated with the token
- A small status text below the widget updating to "Verified" on success

Server-side verification

- `src/pages/api/turnstile-verify.ts` forwards the token to Cloudflare's `siteverify` endpoint and returns the verification JSON.
- `functions/register.ts` validates incoming tokens server-side before forwarding to Formspree. If `TURNSTILE_SECRET` is set, Turnstile validation is required unless a manual-review fallback is explicitly allowed and requested (see next section).

Graceful fallback (manual review)

Some networks or privacy tools may block Cloudflare resources. To avoid losing legitimate submissions, a conservative fallback was implemented:

- Client: after ~5s if no token is present the UI exposes a small input that asks the user to type `human`. Submitting this sets `tlp_manual_review=1` on the form.
- Server: when `TURNSTILE_SECRET` is present, the server will only accept fallback submissions if `ALLOW_TURNSTILE_FALLBACK=true` is set in the deployment environment. Accepted fallback submissions are tagged with `manual_review=true` and `manual_review_reason=turnstile_missing` and logged for human review.

Security considerations

- The fallback is opt-in server-side to limit abuse. Do not enable it in high-risk environments without monitoring.
- Keep `TURNSTILE_SECRET` private.
- The server still enforces CSRF, honeypot, and input validation for all submissions.

Troubleshooting

- Error 110200 / "origin not allowed": add the exact origin (including port) to Turnstile allowed origins in Cloudflare.
- Frame/CSP/sandbox errors: ensure deployed CSP allows `https://challenges.cloudflare.com` and the Turnstile script URL.
- If verification fails, check `TURNSTILE_SECRET` is set correctly and cloudflare response JSON for `error-codes`.

Accessibility & UX

- The `Turnstile.astro` component includes an sr-only label, a live status message (aria-live), and keyboard focus styles.
- Submit buttons remain disabled until verification or explicit fallback input is provided. Buttons use `aria-disabled` and `aria-busy` during verification.

Next steps

- Manual-test forms across browsers and devices.
- Optionally enable `ALLOW_TURNSTILE_FALLBACK=true` in staging to observe manual-review traffic.
- Update any remaining form handlers that should perform server-side verification.

If you want, I can add a short PR description and example `.env.example` to the repo.
