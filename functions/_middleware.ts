// /functions/_middleware.ts

export const onRequest: PagesFunction = async ({ next }) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const res = await next();

  // Only modify HTML responses
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("text/html")) return res;

  let html = await res.text();

  // Add nonce to <script> and <style> tags that you control
  html = html
    .replaceAll("<script", `<script nonce="${nonce}"`)
    .replaceAll("<style", `<style nonce="${nonce}"`);

  // Rebuild response with CSP using the same nonce
  const strict = new Response(html, res);
  strict.headers.set(
    "Content-Security-Policy",
    [
      // basic / global
      `default-src 'self'`,
      `base-uri 'self'`,
      `object-src 'none'`,
      `frame-ancestors 'none'`,

      // images & fonts
      `img-src 'self' data: https:`,
      `font-src 'self' https://fonts.gstatic.com data:`,

      // ✅ styles: your CSS + Google Fonts + Font Awesome CDN
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://cdnjs.cloudflare.com`,

      // ✅ scripts: Astro inline + Cloudflare analytics + Google reCAPTCHA
      `script-src 'self' 'nonce-${nonce}' https://static.cloudflareinsights.com https://www.google.com https://www.gstatic.com`,

      // XHR / fetch
      `connect-src 'self' https:`,

      // ✅ iframes: YouTube + reCAPTCHA
      `frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com`,

      // workers
      `worker-src 'self' blob:`,

      // audio / video
      `media-src 'self' https:`,
    ].join("; ")
  );

  return strict;
};
