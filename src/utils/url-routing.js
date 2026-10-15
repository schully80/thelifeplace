const trailingSlashRoutes = new Set(["/live", "/give", "/visit"]);

/**
 * Remove trailing slashes while preserving the root path.
 * @param {string} pathname
 */
export function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Return the single public URL form used for a route.
 * Cloudflare already sends the three primary action pages to their slash form.
 * @param {string} pathname
 */
export function getCanonicalPathname(pathname) {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/") return "/";

  return trailingSlashRoutes.has(normalizedPath)
    ? `${normalizedPath}/`
    : normalizedPath;
}
