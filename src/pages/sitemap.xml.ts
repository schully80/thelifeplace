import type { APIRoute } from "astro";

const FALLBACK_SITE = "https://thelifeplace.org";

function routeFromFilePath(filePath: string): string | null {
  // filePath examples: "./visit/index.astro", "./about.astro"
  if (filePath.includes("[")) return null; // skip dynamic routes
  if (filePath.startsWith("./api/")) return null;

  let route = filePath.replace(/^\.\//, "").replace(/\.(astro|md|mdx)$/, "");
  route = route.replace(/\/index$/, ""); // /visit/index -> /visit

  // Skip the sitemap endpoints themselves
  if (route === "sitemap" || route === "sitemap-index") return null;

  // Root
  if (route === "index") return "/";

  return `/${route}`;
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || FALLBACK_SITE).replace(/\/$/, "");

  const pages = import.meta.glob("./**/*.{astro,md,mdx}");
  const routes = Object.keys(pages)
    .map(routeFromFilePath)
    .filter(Boolean) as string[];

  // Ensure home is included
  if (!routes.includes("/")) routes.unshift("/");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((path) => {
    const loc = path === "/" ? `${base}/` : `${base}${path}/`.replace(/\/+$/, "/");
    return `  <url><loc>${loc}</loc></url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
