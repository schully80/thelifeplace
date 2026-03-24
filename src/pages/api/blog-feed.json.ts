import type { APIRoute } from "astro";
import { parseBlogFeed } from "../../utils/blog-feed";

const FEED_URL = "https://schulteretyang.substack.com/feed";
const TIMEOUT_MS = 8000;
const TTL_MS = 5 * 60 * 1000;

let cache: { items: Array<{ title: string; link: string; date: string; excerpt: string; categories: string[] }>; fetchedAt: number } | null = null;

function withTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

export const GET: APIRoute = async ({ request }) => {
  const now = Date.now();
  const url = new URL(request.url);
  const refresh = url.searchParams.get("refresh") === "1";

  if (!refresh && cache && now - cache.fetchedAt < TTL_MS) {
    return new Response(JSON.stringify({ items: cache.items }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  try {
    const response = await withTimeout(FEED_URL, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "thelifeplace-blog-feed",
      },
    });

    if (!response.ok) {
      throw new Error(`Feed fetch failed: HTTP ${response.status}`);
    }

    const xml = await response.text();
    const items = parseBlogFeed(xml)
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map((item) => ({
        title: item.title,
        link: item.link,
        date: item.date,
        excerpt: item.description,
        categories: item.categories,
      }));

    cache = { items, fetchedAt: Date.now() };

    return new Response(JSON.stringify({ items }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": refresh ? "no-store" : "public, max-age=300",
      },
    });
  } catch (error: any) {
    const message =
      error && typeof error === "object" && error.name === "AbortError"
        ? "Feed request timed out"
        : error?.message || String(error);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }
};
