import type { MiddlewareHandler } from "astro/dist/types/public/common.js";

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

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  const normalizedPath = normalizePathname(url.pathname);

  const redirectTarget = redirectRoutes.get(normalizedPath);
  if (redirectTarget) {
    return context.redirect(redirectTarget, 301);
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

  const response = await next();

  if (isInternalNoIndexPath(normalizedPath)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
};
