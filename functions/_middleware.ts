export const onRequest: PagesFunction = async ({ next }) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const res = await next();

  // Only modify HTML
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("text/html")) return res;

  let html = await res.text();

  // Add nonce to <script> and <style> tags you control
  html = html
    .replaceAll("<script", `<script nonce="${nonce}"`)
    .replaceAll("<style", `<style nonce="${nonce}"`);

  // Rebuild response with strict CSP using the same nonce
  const strict = new Response(html, res);
  strict.headers.set(
    "Content-Security-Policy",
    [
      `default-src 'self'`,
      `base-uri 'self'`,
      `object-src 'none'`,
      `frame-ancestors 'none'`,
      `img-src 'self' data: https:`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
      `script-src 'self' 'nonce-${nonce}' https://static.cloudflareinsights.com`,
      `connect-src 'self' https:`,
      `frame-src https://www.youtube.com https://www.youtube-nocookie.com`,
      `media-src 'self' https:`,
    ].join("; ")
  );
  return strict;
};
