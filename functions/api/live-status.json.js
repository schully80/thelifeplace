/**
 * Live Status API Endpoint
 * Checks if the church is currently live streaming on YouTube
 * 
 * Response: { "live": boolean, "timestamp": ISO string }
 */

const YOUTUBE_API_KEY = process.env.PUBLIC_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UC2f4d_FFU4HiTT_DiPhZwvw";

export default {
  async fetch(request) {
    try {
      // Query YouTube API for active live streams on this channel
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      // If we have items, we're live
      const isLive = data.items && data.items.length > 0;

      return new Response(JSON.stringify({
        live: isLive,
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
