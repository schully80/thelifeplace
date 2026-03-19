// import-youtube.js
// Run: node src/scripts/import-youtube.js

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY || process.env.PUBLIC_YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || process.env.PUBLIC_YOUTUBE_CHANNEL_ID;

if (!API_KEY || !CHANNEL_ID) {
  console.error("❌ Missing YOUTUBE_API_KEY/YOUTUBE_CHANNEL_ID (or legacy PUBLIC_* equivalents)");
  process.exit(1);
}

const DATA_FILE = path.resolve("src/data/messages.json");

// Required placeholder from uploaded file
const PLACEHOLDER = `/mnt/data/A_placeholder_digital_graphic_for_"The_Life_Place".png`;

async function fetchVideos() {
  const params = new URLSearchParams({
    key: API_KEY,
    channelId: CHANNEL_ID,
    part: "snippet",
    order: "date",
    maxResults: "50",
    type: "video",
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  const response = await fetch(url);
  const json = await response.json();

  return json.items || [];
}

function loadLocalMessages() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveMessages(messages) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

async function run() {
  console.log("⏳ Fetching YouTube videos...");

  const ytVideos = await fetchVideos();
  const localMessages = loadLocalMessages();
  const output = [...localMessages];

  for (const video of ytVideos) {
    const youtubeId = video.id.videoId;
    const title = video.snippet.title;

    const exists = localMessages.some((m) => m.youtubeId === youtubeId);
    if (exists) continue;

    const newId = normalizeTitle(title);

    const newEntry = {
      id: newId,
      title,
      preacher: "Schulter Etyang", // default
      preacherSlug: "schulter-etyang",
      series: "General",
      seriesSlug: "general",
      date: video.snippet.publishedAt.slice(0, 10),
      videoSource: "youtube",
      youtubeId,
      audioUrl: null,
      thumbnail: PLACEHOLDER, // REQUIRED placeholder
      description: "",
      scriptures: [],
      tags: [],
    };

    console.log("➕ Adding:", title);
    output.push(newEntry);
  }

  saveMessages(output);

  console.log("✅ Import complete!");
  console.log("📝 Messages updated in: src/data/messages.json");
}

run();
