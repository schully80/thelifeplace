# thelifeplace

## Development

Start the dev server with:

```bash
npm run dev
```

PayPal sandbox checkouts may require HTTPS even in local development. If you see iframe/protocol mismatch errors,
use `https://localhost:4322` (accept the self-signed certificate warning once).


## Cloudflare Turnstile (Human Verification)

This project uses [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) for human verification on all user-facing forms.

### Environment Variables

- `PUBLIC_TURNSTILE_SITEKEY` — Your Turnstile sitekey (required for all environments)
- `TURNSTILE_SECRET_KEY` — Your Turnstile secret key (for server-side verification, if needed)
- `PUBLIC_PAYPAL_CLIENT_ID` — Your PayPal app client id (required to render PayPal Smart Buttons on `/give`)

You can use a single sitekey for both development and production. If you want to use separate keys, add logic in your `.env` and component to select the correct key based on environment.

**Example `.env` setup:**

```env
PUBLIC_TURNSTILE_SITEKEY=your-sitekey-here
TURNSTILE_SECRET_KEY=your-secret-key-here
PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id-here
```

### Fallback Logic

The Turnstile component will use the `sitekey` prop if provided, or fall back to `PUBLIC_TURNSTILE_SITEKEY` from your environment. If neither is set, it safely falls back to an empty string (no breakage).

### Dev vs Production Behavior

- In development, Cloudflare may auto-verify (showing “success” instantly) if using a production sitekey. This is normal and only affects local/dev environments.
- In production, real users must complete the challenge; no auto-success.

### Customization

Spacing and typography for the Turnstile widget are set globally in the component. You can further adjust spacing for specific forms by wrapping the component or using custom classes.

## PostCSS warning (dev)

If you see this warning when running the dev server:

```
A PostCSS plugin did not pass the `from` option to `postcss.parse`.
```

It's commonly triggered by the `postcss-import` plugin in some Vite/Astro setups. Recommended actions:

- If you don't use CSS `@import` in PostCSS, remove `postcss-import` from `postcss.config.cjs` (this project removes it by default).
- Avoid using Tailwind arbitrary utilities inside `@apply` — use plain CSS properties (e.g., set `transition-duration: 1200ms;`) because Tailwind's arbitrary utilities can't be resolved by `@apply`.
- If you rely on `postcss-import`, update the plugin or file an issue with the plugin author so it passes the `from` option to PostCSS.

If you want me to attempt an automated fix or add a CI lint check to detect problematic `@apply` usage, say so and I'll add it.
