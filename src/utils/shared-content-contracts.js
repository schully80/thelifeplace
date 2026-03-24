import { site } from "../../site.config.js";
import { getBootstrapContent, getVisitLocation } from "../content/shared-content.js";

function getTimeParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    weekday: lookup.weekday,
    hour: Number(lookup.hour || 0),
    minute: Number(lookup.minute || 0),
  };
}

function toMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getCurrentLiveState(now = new Date()) {
  const service = site.schedule.services.find((item) => item.id === site.live.scheduleId) || site.schedule.services[0];
  const parts = getTimeParts(now, service.timezone);
  const nowMinutes = parts.hour * 60 + parts.minute;
  const startMinutes = toMinutes(service.startTime);
  const endMinutes = toMinutes(service.endTime);
  const inScheduledWindow = parts.weekday === service.day && nowMinutes >= startMinutes && nowMinutes <= endMinutes;

  return {
    live: inScheduledWindow,
    status: inScheduledWindow ? "live" : "offline",
    service,
    watchUrl: inScheduledWindow ? site.live.youtubeChannelLiveUrl : site.live.youtubeChannelUrl,
    embedUrl: site.live.youtubeEmbedUrl,
    channelUrl: site.live.youtubeChannelUrl,
    youtubeChannelId: site.live.youtubeChannelId,
    checkedAt: now.toISOString(),
    timezone: service.timezone,
  };
}

export function buildBootstrapPayload() {
  return {
    generatedAt: new Date().toISOString(),
    ...getBootstrapContent(),
  };
}

export function buildLivePayload(now = new Date()) {
  const state = getCurrentLiveState(now);
  return {
    generatedAt: now.toISOString(),
    ...state,
  };
}

export function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const events = [];
  let current = null;

  const decode = (value) => value.replace(/\\n/g, "\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (current?.DTSTART && current?.SUMMARY) {
        events.push({
          start: parseICSTime(current.DTSTART),
          end: current.DTEND ? parseICSTime(current.DTEND) : undefined,
          summary: decode(current.SUMMARY || ""),
          location: decode(current.LOCATION || ""),
          description: decode(current.DESCRIPTION || ""),
        });
      }
      current = null;
      continue;
    }

    if (!current) continue;

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).split(";")[0];
    const value = line.slice(separator + 1);
    current[key] = current[key] ? `${current[key]} ${value}` : value;
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function parseICSTime(value) {
  if (/^\d{8}T\d{6}Z$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const hours = Number(value.slice(9, 11));
    const minutes = Number(value.slice(11, 13));
    const seconds = Number(value.slice(13, 15));
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
  }

  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    return new Date(year, month, day);
  }

  return new Date(value);
}

function getNextWeekdayOccurrence(baseDate, dayName) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetDay = dayNames.indexOf(dayName);
  const result = new Date(baseDate);
  const delta = (targetDay - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + delta);
  return result;
}

function buildGeneratedEvents(now = new Date()) {
  const service = site.schedule.services[0];
  const visitLocation = getVisitLocation();
  const startBase = getNextWeekdayOccurrence(now, service.day);
  const startMinutes = toMinutes(service.startTime);
  const endMinutes = toMinutes(service.endTime);

  return Array.from({ length: 8 }, (_, index) => {
    const start = new Date(startBase);
    start.setDate(start.getDate() + index * 7);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

    const end = new Date(start);
    end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    return {
      id: `generated-service-${index + 1}`,
      start: start.toISOString(),
      end: end.toISOString(),
      summary: "Sunday Service",
      location: visitLocation.fullAddress,
      description: service.description,
      source: "generated",
    };
  });
}

export async function loadSharedEvents(fetchImpl = fetch, now = new Date()) {
  const icsUrl = site.integrations.icsCalendarUrl;
  if (!icsUrl) {
    return buildGeneratedEvents(now);
  }

  try {
    const response = await fetchImpl(icsUrl);
    if (!response.ok) {
      throw new Error(`ICS request failed (${response.status})`);
    }

    const rawText = await response.text();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 1);

    const events = parseICS(rawText)
      .filter((event) => event.start >= cutoff)
      .slice(0, 12)
      .map((event, index) => ({
        id: `ics-event-${index + 1}`,
        start: event.start.toISOString(),
        end: event.end ? event.end.toISOString() : undefined,
        summary: event.summary,
        location: event.location || "",
        description: event.description || "",
        source: "ics",
      }));

    return events.length > 0 ? events : buildGeneratedEvents(now);
  } catch {
    return buildGeneratedEvents(now);
  }
}
