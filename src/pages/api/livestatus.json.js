// src/pages/api/live-status.json.js
export const prerender = false;

import "dotenv/config";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

export async function GET() {
  if (!API_KEY || !CHANNEL_ID) {
    return new Response(JSON.stringify({ error: "Missing YouTube API credentials" }), {
      status: 500
    });
  }

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet` +
    `&channelId=${CHANNEL_ID}&type=video&eventType=live&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const isLive = data.items && data.items.length > 0;

    return new Response(
      JSON.stringify({
        live: isLive,
        title: isLive ? data.items[0].snippet.title : null
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
