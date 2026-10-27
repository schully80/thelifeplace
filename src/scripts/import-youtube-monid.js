import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { site } from "../../site.config.js";

const PROVIDER = "tikhub";
const ENDPOINT = "/api/v1/youtube/web_v2/get_channel_videos";
const DATA_FILE = path.resolve("src/data/messages.json");
const DEFAULT_LIMIT = 10;
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 120_000;

function parseArguments(argv) {
  const options = {
    write: false,
    limit: DEFAULT_LIMIT,
    channelId: site.live.youtubeChannelId,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--write") {
      options.write = true;
      continue;
    }

    if (argument === "--limit" || argument === "--channel-id") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a value.`);
      index += 1;

      if (argument === "--limit") {
        options.limit = Number.parseInt(value, 10);
      } else {
        options.channelId = value;
      }
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 50) {
    throw new Error("--limit must be an integer between 1 and 50.");
  }

  return options;
}

function runMonid(args) {
  const output = execFileSync("monid", [...args, "--json"], {
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    maxBuffer: 20 * 1024 * 1024,
  });

  return JSON.parse(output);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchChannelVideos(channelId) {
  const started = runMonid([
    "run",
    "--provider",
    PROVIDER,
    "--endpoint",
    ENDPOINT,
    "--query",
    JSON.stringify({
      channel_id: channelId,
      language_code: "en-US",
      country_code: "ZA",
      need_format: true,
    }),
  ]);

  if (!started.runId) throw new Error("Monid did not return a run ID.");

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let run = started;

  while (["READY", "RUNNING"].includes(run.status)) {
    if (Date.now() >= deadline) {
      throw new Error(`Monid run ${started.runId} did not finish within 120 seconds.`);
    }

    await sleep(POLL_INTERVAL_MS);
    run = runMonid(["runs", "get", "--run-id", started.runId]);
  }

  if (run.status === "BLOCKED") {
    throw new Error(
      "Monid blocked the run because of a workspace control. Review budget and run-cap controls in the Monid dashboard.",
    );
  }

  if (run.status !== "COMPLETED") {
    throw new Error(`Monid run ${started.runId} ended with status ${run.status}.`);
  }

  if (run.providerResponse?.httpStatus >= 400) {
    throw new Error(`Monid provider request failed with HTTP ${run.providerResponse.httpStatus}.`);
  }

  return {
    videos: Array.isArray(run.output?.videos) ? run.output.videos : [],
    cost: run.cost,
    runId: run.runId,
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function publishedDate(video, now = new Date()) {
  const exactDate = video.published_at || video.publishedAt || video.publish_date;
  if (exactDate && !Number.isNaN(Date.parse(exactDate))) {
    return new Date(exactDate).toISOString().slice(0, 10);
  }

  const match = String(video.published_time || "").match(
    /(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i,
  );
  if (!match) return now.toISOString().slice(0, 10);

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const date = new Date(now);

  if (unit === "minute") date.setUTCMinutes(date.getUTCMinutes() - amount);
  if (unit === "hour") date.setUTCHours(date.getUTCHours() - amount);
  if (unit === "day") date.setUTCDate(date.getUTCDate() - amount);
  if (unit === "week") date.setUTCDate(date.getUTCDate() - amount * 7);
  if (unit === "month") date.setUTCMonth(date.getUTCMonth() - amount);
  if (unit === "year") date.setUTCFullYear(date.getUTCFullYear() - amount);

  return date.toISOString().slice(0, 10);
}

export function toMessage(video, now = new Date()) {
  const youtubeId = String(video.video_id || video.videoId || "").trim();
  const title = String(video.title || "").trim();

  if (!youtubeId || !title) return null;

  return {
    id: slugify(title) || `youtube-${youtubeId}`,
    title,
    preacher: "Schulter Etyang",
    preacherSlug: "schulter-etyang",
    series: "General",
    seriesSlug: "general",
    date: publishedDate(video, now),
    videoSource: "youtube",
    youtubeId,
    audioUrl: null,
    thumbnail: String(video.thumbnail || "").trim() || "/fallback-message2.png",
    description: String(video.description || "").trim(),
    scriptures: [],
    tags: [],
  };
}

export function mergeMessages(existingMessages, videos, options = {}) {
  const now = options.now || new Date();
  const limit = options.limit || DEFAULT_LIMIT;
  const existingVideoIds = new Set(
    existingMessages.map((message) => message.youtubeId).filter(Boolean),
  );
  const existingIds = new Set(existingMessages.map((message) => message.id).filter(Boolean));
  const additions = [];

  for (const video of videos) {
    if (additions.length >= limit) break;

    const message = toMessage(video, now);
    if (!message || existingVideoIds.has(message.youtubeId)) continue;

    let uniqueId = message.id;
    let suffix = 2;
    while (existingIds.has(uniqueId)) {
      uniqueId = `${message.id}-${suffix}`;
      suffix += 1;
    }

    message.id = uniqueId;
    additions.push(message);
    existingVideoIds.add(message.youtubeId);
    existingIds.add(message.id);
  }

  return {
    additions,
    messages: [...existingMessages, ...additions],
  };
}

function loadMessages() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeMessages(messages) {
  const temporaryFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(messages, null, 2)}\n`);
  fs.renameSync(temporaryFile, DATA_FILE);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const existingMessages = loadMessages();

  console.log(`Fetching YouTube videos through Monid for ${options.channelId}...`);
  const result = await fetchChannelVideos(options.channelId);
  const merged = mergeMessages(existingMessages, result.videos, options);

  console.log(`Monid run: ${result.runId}`);
  if (result.cost) console.log(`Cost: ${result.cost.value} ${result.cost.currency}`);
  console.log(`Videos returned: ${result.videos.length}`);
  console.log(`New messages: ${merged.additions.length}`);

  for (const message of merged.additions) {
    console.log(`- ${message.date} — ${message.title}`);
  }

  if (!options.write) {
    console.log("Preview only. Re-run with --write to update src/data/messages.json.");
    return;
  }

  if (merged.additions.length === 0) {
    console.log("No changes written.");
    return;
  }

  writeMessages(merged.messages);
  console.log("Updated src/data/messages.json.");
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(`Monid import failed: ${error.message}`);
    process.exitCode = 1;
  });
}
