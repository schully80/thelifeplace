import seedMessages from "../data/messages.json";

type KVLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

export type MessageRecord = {
  id: string;
  title: string;
  preacher: string;
  preacherSlug: string;
  series: string;
  seriesSlug: string;
  date: string;
  videoSource?: "youtube" | "local";
  youtubeId?: string;
  videoUrl?: string;
  audioUrl?: string | null;
  thumbnail: string;
  description?: string;
  scriptures?: string[];
  tags?: string[];
  featured?: boolean;
};

const MESSAGES_KV_KEY = "messages";
const DEFAULT_ADMIN_KEY = "ComeSeeJesus2025";

function cloneSeedMessages(): MessageRecord[] {
  return JSON.parse(JSON.stringify(seedMessages));
}

function resolveEnv(runtimeEnv?: Record<string, unknown>) {
  return runtimeEnv || {};
}

export function getMessagesKV(runtimeEnv?: Record<string, unknown>): KVLike | undefined {
  const env = resolveEnv(runtimeEnv);
  return (env.MESSAGES_DATA || env.MESSAGES_STORE) as KVLike | undefined;
}

export function getMessagesAdminKey(runtimeEnv?: Record<string, unknown>): string {
  const env = resolveEnv(runtimeEnv) as Record<string, string | undefined>;
  return env.MESSAGES_ADMIN_KEY || import.meta.env.MESSAGES_ADMIN_KEY || DEFAULT_ADMIN_KEY;
}

export function getMessagesStorageMode(runtimeEnv?: Record<string, unknown>): "kv" | "file" | "readonly" {
  if (getMessagesKV(runtimeEnv)) return "kv";
  if (typeof process !== "undefined" && process.versions?.node) return "file";
  return "readonly";
}

async function readLocalMessagesFile(): Promise<MessageRecord[] | null> {
  if (!(typeof process !== "undefined" && process.versions?.node)) return null;

  try {
    const [{ readFile }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const dataFile = path.resolve(process.cwd(), "src/data/messages.json");
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw) as MessageRecord[];
  } catch {
    return null;
  }
}

export async function loadMessages(runtimeEnv?: Record<string, unknown>): Promise<MessageRecord[]> {
  const kv = getMessagesKV(runtimeEnv);
  if (kv) {
    try {
      const stored = await kv.get(MESSAGES_KV_KEY);
      if (stored) return JSON.parse(stored) as MessageRecord[];
    } catch {
      // Fall through to file/seed fallback.
    }
  }

  const local = await readLocalMessagesFile();
  return local || cloneSeedMessages();
}

export async function saveMessages(
  messages: MessageRecord[],
  runtimeEnv?: Record<string, unknown>
): Promise<"kv" | "file"> {
  const kv = getMessagesKV(runtimeEnv);
  if (kv) {
    await kv.put(MESSAGES_KV_KEY, JSON.stringify(messages, null, 2));
    return "kv";
  }

  if (typeof process !== "undefined" && process.versions?.node) {
    const [{ writeFile }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const dataFile = path.resolve(process.cwd(), "src/data/messages.json");
    await writeFile(dataFile, JSON.stringify(messages, null, 2) + "\n", "utf8");
    return "file";
  }

  throw new Error("Messages storage is read-only. Configure a MESSAGES_DATA KV binding to enable saves.");
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => cleanString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function normalizeMessages(input: unknown): MessageRecord[] {
  if (!Array.isArray(input)) {
    throw new Error("Messages payload must be an array.");
  }

  const seenIds = new Set<string>();
  const normalized = input.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new Error(`Message ${index + 1} is not an object.`);
    }

    const record = raw as Record<string, unknown>;
    const title = cleanString(record.title);
    if (!title) throw new Error(`Message ${index + 1} is missing a title.`);

    const preacher = cleanString(record.preacher || record.speaker);
    if (!preacher) throw new Error(`Message "${title}" is missing a preacher.`);

    const series = cleanString(record.series) || "General";
    const date = cleanString(record.date);
    if (!isValidDate(date)) throw new Error(`Message "${title}" has an invalid date.`);

    const videoSource = cleanString(record.videoSource) === "local" ? "local" : "youtube";
    const youtubeId = cleanString(record.youtubeId);
    const videoUrl = cleanString(record.videoUrl);
    if (videoSource === "youtube" && !youtubeId) {
      throw new Error(`Message "${title}" is missing a YouTube ID.`);
    }
    if (videoSource === "local" && !videoUrl) {
      throw new Error(`Message "${title}" is missing a local video URL.`);
    }

    const id = cleanString(record.id) || slugify(title) || `message-${index + 1}`;
    if (seenIds.has(id)) throw new Error(`Duplicate message id "${id}".`);
    seenIds.add(id);

    const normalizedRecord: MessageRecord = {
      id,
      title,
      preacher,
      preacherSlug: cleanString(record.preacherSlug) || slugify(preacher),
      series,
      seriesSlug: cleanString(record.seriesSlug) || slugify(series),
      date,
      videoSource,
      thumbnail: cleanString(record.thumbnail) || "/fallback-message2.png",
      description: cleanString(record.description),
      scriptures: cleanStringArray(record.scriptures),
      tags: cleanStringArray(record.tags),
      featured: Boolean(record.featured),
    };

    if (videoSource === "youtube") {
      normalizedRecord.youtubeId = youtubeId;
      if (videoUrl) normalizedRecord.videoUrl = videoUrl;
    } else {
      normalizedRecord.videoUrl = videoUrl;
      if (youtubeId) normalizedRecord.youtubeId = youtubeId;
    }

    const audioUrl = cleanString(record.audioUrl);
    normalizedRecord.audioUrl = audioUrl || null;

    return normalizedRecord;
  });

  normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return normalized;
}
