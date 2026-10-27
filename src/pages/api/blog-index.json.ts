import type { APIRoute } from "astro";

export const prerender = false;

const FEED_URL = "https://schulteretyang.substack.com/feed";
const ARCHIVE_URL = (year: number) => `https://schulteretyang.substack.com/archive?year=${year}`;
const ARCHIVE_PAGE_URL = (year: number, page: number) => `https://schulteretyang.substack.com/archive?year=${year}&page=${page}`;
const TIMEOUT_MS = 8000;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

type PostItem = {
  title: string;
  link: string;
  date?: string;
  year?: number;
  month?: number;
  excerpt?: string;
  categories?: string[];
};

let cache: { items: PostItem[]; fetchedAt: number } | null = null;

function cleanCdata(str: string) {
  return (str || "").replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}
function decodeHtmlEntities(str: string) {
  if (!str) return "";
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
function isValidDate(d: Date) { return d instanceof Date && !isNaN(d.getTime()); }

function withTimeout(url: string, options: RequestInit & { signal?: AbortSignal } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const merged: RequestInit = { ...options, signal: controller.signal };
  return fetch(url, merged).finally(() => clearTimeout(id));
}

async function fetchRSSItems(): Promise<PostItem[]> {
  const res = await withTimeout(FEED_URL, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "thelifeplace-blog-index"
    }
  });
  if (!res.ok) throw new Error(`Feed fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  const chunks = xml.split("<item>").slice(1);
  const items = chunks.map((chunk) => {
    const title = decodeHtmlEntities((chunk.match(/<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/s)?.[1] ?? chunk.match(/<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/s)?.[2] ?? "").trim());
    const link = (chunk.match(/<link>(.*?)<\/link>/s)?.[1] ?? "").trim();
    const date = (chunk.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] ?? "").trim();
    const dateObj = new Date(date);
    const description = decodeHtmlEntities((chunk.match(/<description>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/description>/s)?.[1] ?? chunk.match(/<description>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/description>/s)?.[2] ?? "").trim());
    const catMatches = Array.from(chunk.matchAll(/<category>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/category>/g));
    const categories = catMatches.map((m) => decodeHtmlEntities(cleanCdata(m[1] || m[2] || ""))).filter(Boolean);
    return {
      title,
      link,
      date,
      year: isValidDate(dateObj) ? dateObj.getFullYear() : undefined,
      month: isValidDate(dateObj) ? (dateObj.getMonth() + 1) : undefined,
      excerpt: description,
      categories
    } as PostItem;
  });
  return items;
}

function parseArchiveHTML(html: string): PostItem[] {
  const results: PostItem[] = [];
  const liRe = /<li[\s\S]*?<a[^>]*href=\"https:\/\/schulteretyang\.substack\.com\/p\/[^"]+\"[^>]*>(.*?)<\/a>[\s\S]*?<time[^>]*datetime=\"([^"]+)\"[\s\S]*?<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = liRe.exec(html)) !== null) {
    const title = decodeHtmlEntities(cleanCdata(m[1] || ""));
    const time = m[2];
    const linkMatch = m[0].match(/href=\"(https:\/\/schulteretyang\.substack\.com\/p\/[^"]+)\"/);
    const link = linkMatch ? linkMatch[1] : "";
    const dateObj = time ? new Date(time) : null;
    results.push({ title, link, date: time, year: dateObj && isValidDate(dateObj) ? dateObj.getFullYear() : undefined, month: dateObj && isValidDate(dateObj) ? (dateObj.getMonth() + 1) : undefined, excerpt: "", categories: [] });
  }
  if (results.length === 0) {
    const aRe = /<a[^>]*href=\"(https:\/\/schulteretyang\.substack\.com\/p\/[^"]+)\"[^>]*>(.*?)<\/a>/gi;
    let am: RegExpExecArray | null;
    while ((am = aRe.exec(html)) !== null) {
      const link = am[1];
      const title = decodeHtmlEntities(cleanCdata(am[2] || ""));
      const tail = html.slice(aRe.lastIndex, aRe.lastIndex + 200);
      const dateTextMatch = tail.match(/([A-Za-z]{3,} \d{1,2}, \d{4})/);
      const dateText = dateTextMatch ? dateTextMatch[1] : "";
      const dateObj = dateText ? new Date(dateText) : null;
      results.push({ title, link, date: dateText, year: dateObj && isValidDate(dateObj) ? dateObj.getFullYear() : undefined, month: dateObj && isValidDate(dateObj) ? (dateObj.getMonth() + 1) : undefined, excerpt: "", categories: [] });
    }
  }
  return results;
}

async function fetchArchiveYear(year: number): Promise<PostItem[]> {
  const res = await withTimeout(ARCHIVE_URL(year), {
    headers: {
      Accept: "text/html",
      "User-Agent": "thelifeplace-blog-index-year"
    }
  });
  if (!res.ok) throw new Error(`Archive fetch failed: HTTP ${res.status}`);
  const html = await res.text();
  return parseArchiveHTML(html);
}

// Fetch all pages of an archive year by iterating ?page=2,3,... until no results
async function fetchArchiveYearPaged(year: number, maxPages: number = 20): Promise<PostItem[]> {
  const all: PostItem[] = [];
  // Page 1: base URL (no page param) first
  try {
    const first = await fetchArchiveYear(year);
    all.push(...first);
  } catch (e) {
    // If the base page fails, attempt page=1 explicitly
    const res1 = await withTimeout(ARCHIVE_PAGE_URL(year, 1), {
      headers: { Accept: "text/html", "User-Agent": "thelifeplace-blog-index-year-page" }
    });
    if (res1.ok) {
      const html1 = await res1.text();
      all.push(...parseArchiveHTML(html1));
    }
  }
  for (let page = 2; page <= maxPages; page++) {
    const res = await withTimeout(ARCHIVE_PAGE_URL(year, page), {
      headers: { Accept: "text/html", "User-Agent": "thelifeplace-blog-index-year-page" }
    });
    if (!res.ok) break;
    const html = await res.text();
    const items = parseArchiveHTML(html);
    if (!items || items.length === 0) break;
    all.push(...items);
  }
  return all;
}

export const GET: APIRoute = async ({ request }) => {
  const now = Date.now();
  const url = new URL(request.url);
  const refresh = url.searchParams.get('refresh') === '1';
  if (!refresh && cache && (now - cache.fetchedAt) < TTL_MS) {
    return new Response(JSON.stringify({ items: cache.items }), { headers: { "Content-Type": "application/json" } });
  }

  try {
    const rssItems = await fetchRSSItems();
    const linkSet = new Set<string>(rssItems.map(it => it.link));

    // Restrict aggregation to current year down to 2020 (inclusive)
    const currentYear = new Date().getFullYear();
    const minYear = 2020;
    const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => currentYear - i);

    const allItems: PostItem[] = [...rssItems];
    for (const y of years) {
      const yearItems = await fetchArchiveYearPaged(y);
      for (const it of yearItems) {
        if (it.link && !linkSet.has(it.link)) {
          allItems.push(it);
          linkSet.add(it.link);
        }
      }
    }

    // Filter to allowed years only (in case RSS includes out-of-range items)
    const allowedYearSet = new Set<number>(years);
    const filtered = allItems.filter((it) => typeof it.year === 'number' && allowedYearSet.has(it.year as number));

    // Sort recent first
    filtered.sort((a, b) => {
      const at = a.year && a.month ? new Date(a.year, a.month - 1, 1).getTime() : 0;
      const bt = b.year && b.month ? new Date(b.year, b.month - 1, 1).getTime() : 0;
      return bt - at;
    });

    cache = { items: filtered, fetchedAt: Date.now() };
    return new Response(JSON.stringify({ items: filtered }), { headers: { "Content-Type": "application/json", "Cache-Control": refresh ? "no-store" : "public, max-age=0" } });
  } catch (e: any) {
    const msg = e && typeof e === 'object' && e.name === 'AbortError' ? 'Request timed out' : (e?.message ?? String(e));
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
