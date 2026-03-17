// /functions/_middleware.ts
import type { PagesFunction } from "@cloudflare/workers-types";

// ✅ In-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const redirectRoutes = new Map<string, string>([
  ["/about-us/our-values", "/about-us/"],
  ["/prayer/success", "/prayer/"],
  ["/what-to-expect", "/visit/"],
]);
const goneRoutes = new Set<string>([
  "/search",
  "/design-system",
  "/test-accordion",
  "/test-beliefs",
  "/test-feed",
  "/test-footer",
  "/test-home",
  "/test-leadership",
  "/test-ministries",
  "/test-turnstile",
  "/test-values",
  "/test-visit",
  "/dev/splash-test",
]);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function isInternalNoIndexPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dev") ||
    pathname.includes("-preview")
  );
}

function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

function checkRateLimit(ip: string, endpoint: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const key = getRateLimitKey(ip, endpoint);
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}

// ✅ Generate cryptographically secure CSRF token
function generateCSRFToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// ✅ Additional security headers
export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csrfToken = generateCSRFToken();
  
  // Extract IP for rate limiting
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  const url = new URL(request.url);
  const pathname = url.pathname;
  const normalizedPath = normalizePathname(pathname);

  const redirectTarget = redirectRoutes.get(normalizedPath);
  if (redirectTarget) {
    return Response.redirect(new URL(redirectTarget, url).toString(), 301);
  }

  if (goneRoutes.has(normalizedPath)) {
    return new Response("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // Rate limit API endpoints
  const isApiEndpoint = pathname.startsWith("/api") || pathname.startsWith("/functions");
  if (isApiEndpoint && request.method !== "GET") {
    const isAllowed = checkRateLimit(ip, pathname, 15, 60000); // 15 requests per minute
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // Rate limit form submissions more strictly
  if (request.method === "POST" && pathname.includes("register|verify")) {
    const isAllowed = checkRateLimit(ip, `form:${pathname}`, 5, 300000); // 5 requests per 5 minutes
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  const res = await next();

  // Only modify HTML responses
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.includes("text/html")) return res;

  let html = await res.text();

  // Add nonce to <script> and <style> tags that you control
  html = html
    .replaceAll("<script", `<script nonce="${nonce}"`)
    .replaceAll("<style", `<style nonce="${nonce}"`);

  // Inject CSRF token into hidden form field
  html = html.replace(
    /<form[^>]*>/g,
    (match: string) => match + `\n<input type="hidden" name="csrf_token" value="${csrfToken}" />`
  );

  // Rebuild response with strict CSP using the same nonce
  const strict = new Response(html, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
  
  strict.headers.set(
    "Content-Security-Policy",
    [
      // basic / global
      // Allow data: URIs by default to accommodate inline fonts and data-URI assets
      `default-src 'self' data:`,
      `base-uri 'self'`,
      `object-src 'none'`,
      `frame-ancestors 'none'`,

      // images & fonts
      `img-src 'self' data: https:`,
      `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:`,

      // styles (Astro inline + Google Fonts + Font Awesome CSS)
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://cdnjs.cloudflare.com`,

      // scripts (Astro inline + Cloudflare analytics + reCAPTCHA)
      `script-src 'self' 'nonce-${nonce}' https://static.cloudflareinsights.com https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com`,

      // XHR / fetch
      `connect-src 'self' https:`,

      // iframes (YouTube + reCAPTCHA)
      `frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://challenges.cloudflare.com`,

      // workers
      `worker-src 'self' blob:`,

      // audio / video
      `media-src 'self' https:`,
    ].join("; ")
  );

  // ✅ Additional security headers
  strict.headers.set("X-Content-Type-Options", "nosniff"); // Prevent MIME type sniffing
  strict.headers.set("X-Frame-Options", "DENY"); // Prevent clickjacking
  strict.headers.set("X-XSS-Protection", "1; mode=block"); // Enable XSS filtering
  strict.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"); // Control referrer info
  strict.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()"); // Disable unnecessary APIs
  strict.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"); // HSTS
  strict.headers.set("Content-Security-Policy-Report-Only", `report-uri /api/csp-report; report-to csp-endpoint`);

  if (isInternalNoIndexPath(normalizedPath)) {
    strict.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  
  // ✅ Cookie security headers
  strict.headers.append("Set-Cookie", "Path=/; HttpOnly; Secure; SameSite=Strict");

  return strict;
};
