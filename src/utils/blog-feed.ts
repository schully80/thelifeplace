export type BlogFeedItem = {
  title: string;
  link: string;
  date: string;
  dateObj: Date;
  description: string;
  imageUrl: string;
  categories: string[];
};

export type PaginationItem =
  | { type: "page"; page: number; current: boolean }
  | { type: "ellipsis" };

export type MonthGroup = {
  label: string;
  items: BlogFeedItem[];
};

export function cleanCdata(str: string): string {
  return (str || "").replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

export function pick(chunk: string, re: RegExp): string {
  const m = chunk.match(re);
  if (!m) return "";
  return cleanCdata(m[1] || m[2] || "");
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&#(\d+);/g, (_: string, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

export function formatDate(d: Date, fallback = ""): string {
  return isValidDate(d)
    ? d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : fallback;
}

export function monthKey(d: Date): string {
  if (!isValidDate(d)) return "unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(d: Date): string {
  return isValidDate(d)
    ? `${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`
    : "Unknown";
}

export function monthLabelFromParts(y: number | string, m: number | string): string {
  const yNum = Number(y);
  const mNum = Number(m);
  if (!y || Number.isNaN(yNum) || !m || Number.isNaN(mNum) || mNum < 1 || mNum > 12) {
    return "Unknown";
  }
  const d = new Date(yNum, mNum - 1, 1);
  return `${d.toLocaleString("en-US", { month: "long" })} ${yNum}`;
}

export function imageObjectPosition(item: Pick<BlogFeedItem, "title" | "link">): string {
  const hay = `${item.title || ""} ${item.link || ""}`.toLowerCase();
  return /hard\s*-?\s*working\s+people/.test(hay) ? "center 20%" : "center";
}

export function getPaginationItems(total: number, current: number, sibling = 1): PaginationItem[] {
  const items: PaginationItem[] = [];
  if (total <= 1) return items;

  const first = 1;
  const last = total;
  const startPage = Math.max(current - sibling, 2);
  const endPage = Math.min(current + sibling, total - 1);

  items.push({ type: "page", page: first, current: current === first });
  if (startPage > 2) items.push({ type: "ellipsis" });
  for (let p = startPage; p <= endPage; p++) {
    items.push({ type: "page", page: p, current: p === current });
  }
  if (endPage < total - 1) items.push({ type: "ellipsis" });
  if (total > 1) items.push({ type: "page", page: last, current: current === last });
  return items;
}

export function parseBlogFeed(xml: string): BlogFeedItem[] {
  const chunks = xml.split("<item>").slice(1);
  return chunks.map((chunk) => {
    const title = decodeHtmlEntities(pick(chunk, /<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/s));
    const link = pick(chunk, /<link>(.*?)<\/link>/s);
    const date = pick(chunk, /<pubDate>(.*?)<\/pubDate>/s);
    const dateObj = new Date(date);
    const description = decodeHtmlEntities(pick(chunk, /<description>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/description>/s));
    const enclosureMatch = chunk.match(/<enclosure[^>]*url="(.*?)"[^>]*>/s);
    const imageUrl = enclosureMatch ? enclosureMatch[1] : "";
    const catMatches = Array.from(chunk.matchAll(/<category>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/category>/g));
    const categories = catMatches
      .map((m) => decodeHtmlEntities(cleanCdata(m[1] || m[2] || "")))
      .filter(Boolean);

    return { title, link, date, dateObj, description, imageUrl, categories };
  });
}

export function parseArchiveHtml(html: string): BlogFeedItem[] {
  const results: BlogFeedItem[] = [];
  const liRe = /<li[\s\S]*?<a[^>]*href="https:\/\/schulteretyang\.substack\.com\/p\/[^\"]+"[^>]*>(.*?)<\/a>[\s\S]*?<time[^>]*datetime="([^"]+)"[\s\S]*?<\/li>/gi;
  let match: RegExpExecArray | null;

  while ((match = liRe.exec(html)) !== null) {
    const title = decodeHtmlEntities(cleanCdata(match[1] || ""));
    const time = match[2] || "";
    const linkMatch = match[0].match(/href="(https:\/\/schulteretyang\.substack\.com\/p\/[^\"]+)"/);
    const link = linkMatch ? linkMatch[1] : "";
    if (link && title) {
      results.push({
        title,
        link,
        date: time,
        dateObj: time ? new Date(time) : new Date(0),
        description: "",
        imageUrl: "",
        categories: [],
      });
    }
  }

  if (results.length > 0) return results;

  const aRe = /<a[^>]*href="(https:\/\/schulteretyang\.substack\.com\/p\/[^\"]+)"[^>]*>(.*?)<\/a>/gi;
  while ((match = aRe.exec(html)) !== null) {
    const link = match[1] || "";
    const title = decodeHtmlEntities(cleanCdata(match[2] || ""));
    const tail = html.slice(aRe.lastIndex, aRe.lastIndex + 200);
    const dateTextMatch = tail.match(/([A-Za-z]{3,} \d{1,2}, \d{4})/);
    const dateText = dateTextMatch ? dateTextMatch[1] : "";
    if (link && title) {
      results.push({
        title,
        link,
        date: dateText,
        dateObj: dateText ? new Date(dateText) : new Date(0),
        description: "",
        imageUrl: "",
        categories: [],
      });
    }
  }

  return results;
}
