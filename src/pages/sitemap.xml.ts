import type { APIRoute } from "astro";

function toRoute(filePath: string): string | null {
  if (filePath.includes("[")) return null;         // skip dynamic routes
  if (filePath.startsWith("./api/")) return null;  // skip API routes

  let route = filePath.replace(/^\.\//, "").replace(/\.(astro|md|mdx)$/, "");
  route = route.replace(/\/index$/, "");

  if (route === "index") return "/";
  if (route === "sitemap" || route === "sitemap-index") return null;

  return `/${route}`;
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() || "https://thelifeplace.org").replace(/\/$/, "");

  const pages = import.meta.glob<{ default?: unknown }>("./**/*.{astro,md,mdx}", { eager: true });
  const routes = Object.keys(pages).map(toRoute).filter(Boolean) as string[];

  if (!routes.includes("/")) routes.unshift("/");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((p) => {
    const loc = p === "/" ? `${base}/` : `${base}${p}/`.replace(/\/+$/, "/");
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