# Prayer Form + Turnstile + Email

Source files: `src/pages/prayer.astro`, `src/components/ui/Turnstile.astro`, `src/pages/api/prayer.ts` (worker build), `functions/api/prayer.ts` (Pages Functions backup).

## Env vars
- `PUBLIC_TURNSTILE_SITEKEY` – Cloudflare Turnstile site key for prod domain(s).
- `TURNSTILE_SECRET_KEY` – matching Turnstile secret.
- `PRAYER_TURNSTILE_DISABLED` – `"true"` to skip verification (rare; leave false in prod).
- `PRAYER_TURNSTILE_DISABLE_DEV` – `"true"` to skip in dev only.
- `PRAYER_MAIL_FROM` – prayer sender address (use `prayer@thelifeplace.org`).
- `PRAYER_MAIL_TO` – prayer recipient mailbox (use `mystory@thelifeplace.org`).
- `PRAYER_RESEND_FROM` – Resend sender for prayer submissions.
- `PRAYER_RESEND_FROM_DEV` – dev-only Resend sender override for prayer submissions.
- `PRAYER_EMAIL_DISABLED` – `"true"` to skip sending (prod fallback).
- `PRAYER_EMAIL_DISABLE_DEV` – `"true"` to skip sending in dev.

Dev defaults: if no Turnstile keys are set, the form uses Cloudflare test keys and the API verifies with the test secret. Email errors fail-open in dev but still log.
Backward compatibility: if the `PRAYER_*` mail vars are unset, the code still falls back to the older shared `MAIL_FROM`, `MAIL_TO`, `RESEND_FROM`, and `RESEND_FROM_DEV` values.

## Local dev
1) `npm run dev`.
2) Submit the form; Turnstile uses the built-in test widget and should immediately verify. Expect the in-form success message even if MailChannels is unreachable; check the dev console/logs for email errors.
3) Set `PRAYER_EMAIL_DISABLE_DEV=true` if you want to avoid hitting MailChannels entirely.

## Production (Cloudflare Worker)
1) In Cloudflare: set `PUBLIC_TURNSTILE_SITEKEY`, `TURNSTILE_SECRET_KEY`, `PRAYER_MAIL_FROM=prayer@thelifeplace.org`, `PRAYER_MAIL_TO=mystory@thelifeplace.org`, and `PRAYER_RESEND_FROM=prayer@thelifeplace.org`. Keep `PRAYER_TURNSTILE_DISABLED=false`.
2) Turnstile: allow `thelifeplace.org` (and any subdomains) in the widget domain list.
3) DNS: keep MX pointed to GoDaddy so inbound mail for `mystory@thelifeplace.org` lands in that mailbox. Cloudflare stays DNS/Turnstile only. SPF should authorize MailChannels sending, e.g. `v=spf1 include:relay.mailchannels.net include:secureserver.net ~all` (adjust per GoDaddy guidance); keep DKIM/DMARC per GoDaddy.
4) (Optional) If you ever switch to Cloudflare Email Routing, update MX to Cloudflare, add routing rule, and change SPF to include `_spf.mx.cloudflare.net` plus MailChannels.
5) Deploy via `astro build` + Wrangler as usual.

## Testing
- Dev smoke: submit the form and confirm the inline success message renders without a page redirect.
- Real flow: submit the form, confirm the inline success message renders, and check the GoDaddy mailbox.

## Troubleshooting
- Turnstile missing: ensure `PUBLIC_TURNSTILE_SITEKEY` is set in prod; dev uses the test key automatically.
- Turnstile still blocks dev: set `PRAYER_TURNSTILE_DISABLE_DEV=true`.
- No email arrives: verify `PRAYER_MAIL_FROM/PRAYER_MAIL_TO/PRAYER_RESEND_FROM`, check Cloudflare worker logs for `email_error`; for dev, errors are tolerated but logged.
