# WhatsApp Confirmation Setup (Plan a Visit)

Use this guide to enable the optional WhatsApp confirmation that runs after a successful “Plan a Visit” submission. WhatsApp send is non-blocking: the form and email confirmations always succeed; WhatsApp failures are only logged.

## To‑Do Checklist
- [ ] Pick provider: Meta WhatsApp Cloud API (current integration).
- [ ] Collect credentials: long‑lived access token, WhatsApp Phone Number ID, API version (optional).
- [ ] Configure environment variables/secrets (dev and prod).
- [ ] Verify sender number can send messages (add test recipients if using sandbox).
- [ ] Test end‑to‑end in dev with opt‑in checked; confirm message received; check logs for failures.

## 1) Collect Meta WhatsApp Cloud API credentials
1. In Meta for Developers, open your WhatsApp Business app.
2. Go to *WhatsApp > API Setup*.
3. Copy:
   - **Access Token** (use a long‑lived user/system token; avoid short “temporary” tokens in prod).
   - **WhatsApp Phone Number ID**.
   - (Optional) **API Version** (defaults to `v19.0`).

## 2) Set environment variables
Tokens should be secrets; IDs can be plain vars.

### Cloudflare (prod/stage)
```bash
wrangler secret put WHATSAPP_TOKEN          # paste long-lived token
```
Add vars (non-secret) in `wrangler.toml` or via Dashboard:
```
WHATSAPP_ENABLED = "true"
WHATSAPP_PHONE_ID = "<your_phone_number_id>"
# Optional:
# WHATSAPP_API_VERSION = "v19.0"
```

### Local dev (Wrangler / Miniflare)
- Create `.dev.vars` (ignored by git) in repo root:
```
WHATSAPP_ENABLED=true
WHATSAPP_TOKEN=your_long_lived_token
WHATSAPP_PHONE_ID=your_phone_number_id
WHATSAPP_API_VERSION=v19.0
```

### Notes
- Leave `WHATSAPP_ENABLED=false` to disable the feature without code changes.
- If `WHATSAPP_TOKEN` or `WHATSAPP_PHONE_ID` is missing, the app logs “WhatsApp not configured” but still returns success to the user.

## 3) Recipient and template considerations
- The message we send is plain text (session message) triggered by user action; no template approval is required.
- If you’re in Meta sandbox/test mode, add recipient numbers under *WhatsApp > API Setup > Recipients* before testing.
- Phone normalization: user numbers are normalized to E.164 (ZA-friendly: `0xxxxxxxxx` → `+27xxxxxxxxx`).

## 4) Test the flow
1. Run `npm run dev` (or `wrangler dev`) with `.dev.vars` in place.
2. Open Plan a Visit form, check **“Send me a WhatsApp confirmation”**, submit valid data.
3. Expect: inline success message in-form; email confirmation arrives; WhatsApp message arrives on the opted-in number.
4. If WhatsApp fails, form still succeeds. Check logs for:
   - `WhatsApp not configured`
   - `WhatsApp send failed` (status/detail)
   - `WhatsApp send exception`

## 5) Troubleshooting quick list
- No message: verify token validity, phone number ID, and that recipient is allowed (sandbox).
- 401/403: regenerate long-lived token; ensure correct app permissions.
- 400: check phone format; ensure E.164 and recipient is verified in sandbox.
- Rate limits: Meta applies per-number and per-business limits; retry later.

## 6) Security & hygiene
- Never commit tokens. Use `wrangler secret` for prod and `.dev.vars` (gitignored) for local.
- Rotate tokens periodically; update both prod and dev when rotated.
