/**
 * Live Status API Endpoint
 * Returns JSON indicating if the church is currently live streaming
 * 
 * Response: { "live": boolean }
 * 
 * To enable live mode, set LIVE_STATUS=true in environment variables
 * Or modify the logic below to check actual streaming platform status
 */

export default {
  async fetch(request) {
    // Get live status from environment variable (default: false)
    const isLive = process.env.LIVE_STATUS === "true";

    // Create JSON response
    const response = {
      live: isLive,
      timestamp: new Date().toISOString(),
      // Future: Add more fields like:
      // streamingPlatform: "youtube",
      // viewerCount: 150,
      // nextServiceTime: "2026-01-26T09:00:00Z"
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache for 60 seconds
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
