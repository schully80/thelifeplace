// src/pages/api/live-status.json.js
export const prerender = false; // ensure it deploys as a function

const API_KEY = import.meta.env.YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.YOUTUBE_CHANNEL_ID;

export async function GET() {
  // Always return a valid JSON shape so the UI never breaks
  const safe = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });

  if (!API_KEY || !CHANNEL_ID) {
    // Don’t 500 your UI; report not-live instead
    return safe({ live: false, error: 'missing-config' }, 200);
  }

  const url =
    'https://www.googleapis.com/youtube/v3/search' +
    `?part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&key=${API_KEY}`;

  try {
    const res = await fetch(url, { cf: { cacheTtl: 0, cacheEverything: false } });
    if (!res.ok) return safe({ live: false, error: 'upstream-' + res.status }, 200);
    const data = await res.json();
    const isLive = Array.isArray(data.items) && data.items.length > 0;

    return safe({
      live: isLive,
      title: isLive ? data.items[0]?.snippet?.title ?? null : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return safe({ live: false, error: 'network' }, 200);
  }
}
