# thelifeplace

## Development

Start the dev server with:

```bash
npm run dev
```

## CAPTCHA

This project previously used a third-party CAPTCHA provider. CAPTCHA integration has been removed from the codebase; no CAPTCHA env vars are required by default.

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
