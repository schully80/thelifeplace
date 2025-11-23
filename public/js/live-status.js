// Checks YouTube API for live stream
async function checkLiveStatus() {
  const apiKey = window.PUBLIC_YOUTUBE_API_KEY;
  const channelId = window.PUBLIC_YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) return { live: false };

  const qs = new URLSearchParams({
    part: "snippet",
    eventType: "live",
    type: "video",
    key: apiKey,
    channelId,
  });

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${qs}`);
    const data = await res.json();
    return { live: Boolean(data.items?.length) };
  } catch {
    return { live: false };
  }
}
