const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  }
  return false;
}

export function countWords(value) {
  const normalized = cleanString(value);
  if (!normalized) return 0;
  return normalized.split(/\s+/).filter(Boolean).length;
}

export function normalizePrayerSubmission(input = {}) {
  const name = cleanString(input.name);
  const email = cleanString(input.email).toLowerCase();
  const request = cleanString(input.request);
  const source = cleanString(input.source) || "tlp-site/prayer";
  const client = source.startsWith("tlp-app/") ? "app" : "site";
  const consent = toBoolean(input.consent);
  const wordsUsed = countWords(request);

  return {
    name,
    email,
    request,
    consent,
    source,
    client,
    wordsUsed,
  };
}

export function validatePrayerSubmission(input) {
  const normalized = normalizePrayerSubmission(input);
  const fieldErrors = {};

  if (normalized.name.length < 2) {
    fieldErrors.name = "Please provide your name.";
  }

  if (!EMAIL_RE.test(normalized.email)) {
    fieldErrors.email = "Please provide a valid email address.";
  }

  if (!normalized.request) {
    fieldErrors.request = "Please tell us how we can pray with you.";
  } else if (normalized.wordsUsed > 75) {
    fieldErrors.request = "Please keep your prayer request within 75 words.";
  }

  if (!normalized.consent) {
    fieldErrors.consent = "Consent is required before sending a prayer request.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    submission: normalized,
  };
}
