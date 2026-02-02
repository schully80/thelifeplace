/**
 * Substack RSS → JSON endpoint
 * Fetches https://schulteretyang.substack.com/feed and returns parsed items
 * Fields: title, link, date, description, imageUrl
 * Caches at the edge for ~10 minutes.
 */

const FEED_URL = "https://schulteretyang.substack.com/feed";

function cleanCdata(str) {
  return (str || "").replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

function pick(chunk, re) {
  const m = chunk.match(re);
  if (!m) return "";
  return cleanCdata(m[1] || m[2] || "");
}

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cache = globalThis.caches && globalThis.caches.default ? globalThis.caches.default : null;
    const cacheKey = new Request(new URL(request.url), { method: "GET" });

    try {
      if (cache) {
        const cached = await cache.match(cacheKey);
        if (cached) return cached;
      }

      const res = await fetch(FEED_URL, {
        headers: {
          Accept: "application/rss+xml, application/xml, text/xml",
          "User-Agent": "thelifeplace-substack-json",
        },
      });

      if (!res.ok) throw new Error(`Feed fetch failed: HTTP ${res.status}`);

      const xml = await res.text();
      const chunks = xml.split("<item>").slice(1);
      const items = chunks.map((chunk) => {
        const title = pick(chunk, /<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/s);
        const link = pick(chunk, /<link>(.*?)<\/link>/s);
        const date = pick(chunk, /<pubDate>(.*?)<\/pubDate>/s);
        const description = pick(chunk, /<description>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/description>/s);
        const enclosureMatch = chunk.match(/<enclosure[^>]*url="(.*?)"[^>]*>/s);
        const imageUrl = enclosureMatch ? enclosureMatch[1] : "";
        return { title, link, date, description, imageUrl };
      });

      const body = JSON.stringify({
        items,
        count: items.length,
        updatedAt: new Date().toISOString(),
        source: FEED_URL,
      });

      const response = new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600, s-maxage=600", // ~10 minutes
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (cache) await cache.put(cacheKey, response.clone());
      return response;
    } catch (error) {
      const response = new Response(
        JSON.stringify({
          items: [],
          error: error && error.message ? error.message : String(error),
          updatedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=120",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response;
    }
  },
};
