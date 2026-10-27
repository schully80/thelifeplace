/**
 * Live Status API Endpoint
 * Checks if the church is currently live streaming on YouTube
 * 
 * Response: { "live": boolean, "timestamp": ISO string }
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UC2f4d_FFU4HiTT_DiPhZwvw";
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;
const CHANNEL_LIVE_URL = `${CHANNEL_URL}/live`;
const FALLBACK_EMBED_URL = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}`;

export default {
  async fetch(request) {
    if (!YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({
        live: false,
        configured: false,
        videoId: null,
        channelId: CHANNEL_ID,
        channelUrl: CHANNEL_URL,
        watchUrl: CHANNEL_LIVE_URL,
        embedUrl: FALLBACK_EMBED_URL,
        timestamp: new Date().toISOString(),
        itemCount: 0,
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      // Query YouTube API for active live streams on this channel
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`YouTube API returned ${response.status}`);
      }
      const data = await response.json();

      // If we have items, we're live
      const liveItem = Array.isArray(data.items) ? data.items[0] : null;
      const videoId = liveItem?.id?.videoId || null;
      const isLive = Boolean(videoId);
      const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : CHANNEL_LIVE_URL;
      const embedUrl = videoId
        ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
        : FALLBACK_EMBED_URL;

      return new Response(JSON.stringify({
        live: isLive,
        configured: true,
        videoId,
        channelId: CHANNEL_ID,
        channelUrl: CHANNEL_URL,
        watchUrl,
        embedUrl,
        title: liveItem?.snippet?.title || null,
        thumbnailUrl: liveItem?.snippet?.thumbnails?.high?.url || liveItem?.snippet?.thumbnails?.default?.url || null,
        timestamp: new Date().toISOString(),
        itemCount: data.items?.length || 0
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60", // Cache for 60 seconds
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      // If API fails, default to offline
      return new Response(JSON.stringify({
        live: false,
        configured: true,
        videoId: null,
        channelId: CHANNEL_ID,
        channelUrl: CHANNEL_URL,
        watchUrl: CHANNEL_LIVE_URL,
        embedUrl: FALLBACK_EMBED_URL,
        timestamp: new Date().toISOString(),
        error: error.message
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
