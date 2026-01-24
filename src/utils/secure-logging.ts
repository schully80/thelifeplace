/**
 * 🔒 Secure Logging Utility
 * Logs events while excluding sensitive payment & personal data
 */

export interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error";
  event: string;
  details?: Record<string, any>;
  ip?: string;
  path?: string;
}

// ✅ Sanitize sensitive fields
export function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    "password",
    "csrf_token",
    "token",
    "credit_card",
    "cvv",
    "card_number",
    "bank_account",
    "ssn",
    "pin",
    "secret",
    "apiKey",
    "api_key",
    "authorization",
    "auth_token",
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  // Redact email if it appears in certain contexts
  if (sanitized.email && sanitized.action !== "form_submission") {
    sanitized.email = sanitized.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
  }

  return sanitized;
}

// ✅ Log to console with timestamp
export function logSecure(level: "info" | "warning" | "error", event: string, details?: Record<string, any>, ip?: string, path?: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    details: details ? sanitizeForLogging(details) : undefined,
    ip: ip ? hashIP(ip) : undefined,
    path,
  };

  const message = `[${entry.timestamp}] ${level.toUpperCase()}: ${event}`;
  const logData = {
    ...entry,
    details: entry.details,
  };

  if (level === "error") {
    console.error(message, logData);
  } else if (level === "warning") {
    console.warn(message, logData);
  } else {
    console.info(message, logData);
  }
}

// ✅ Hash IP for privacy (keep it anonymized)
export function hashIP(ip: string): string {
  if (ip === "unknown") return "unknown";
  // Simple hash: return first 2 octets + hash suffix
  const parts = ip.split(".");
  return `${parts[0]}.${parts[1]}.***`;
}

// ✅ Log form submission (exclude payment data)
export function logFormSubmission(formName: string, data: Record<string, any>, ip?: string): void {
  const fieldNames = Object.keys(data).filter(k => !k.includes("payment") && !k.includes("card") && !k.includes("bank"));
  logSecure("info", `Form submitted: ${formName}`, { fields_count: fieldNames.length }, ip, `/form/${formName}`);
}

// ✅ Log API request
export function logAPIRequest(method: string, endpoint: string, statusCode: number, ip?: string): void {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info";
  logSecure(level, `API ${method} ${endpoint}`, { status_code: statusCode }, ip, endpoint);
}

// ✅ Log security event
export function logSecurityEvent(event: string, severity: "low" | "medium" | "high", details?: Record<string, any>, ip?: string): void {
  const level = severity === "high" ? "error" : severity === "medium" ? "warning" : "info";
  logSecure(level, `SECURITY: ${event}`, { severity, ...details }, ip);
}

// ✅ Log rate limit exceeded
export function logRateLimit(endpoint: string, ip?: string): void {
  logSecurityEvent(`Rate limit exceeded on ${endpoint}`, "medium", { endpoint }, ip);
}

// ✅ Log CSRF token validation failure
export function logCSRFFailure(endpoint: string, ip?: string): void {
  logSecurityEvent(`CSRF token validation failed on ${endpoint}`, "high", { endpoint }, ip);
}

// ✅ Log suspicious activity
export function logSuspiciousActivity(activity: string, ip?: string): void {
  logSecurityEvent(`Suspicious activity: ${activity}`, "medium", { activity }, ip);
}
