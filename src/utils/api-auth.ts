/**
 * 🔒 API Authentication & Authorization Utility
 * Secures API endpoints and validates requests
 */

import { logSecurityEvent } from "./secure-logging";

// ✅ Validate CSRF token in request
export function validateCSRFToken(
  requestBody: Record<string, any>,
  storedToken?: string
): { valid: boolean; error?: string } {
  const token = requestBody.csrf_token;

  if (!token) {
    return { valid: false, error: "CSRF token missing" };
  }

  if (!/^[a-f0-9]{32}$/.test(token)) {
    return { valid: false, error: "Invalid CSRF token format" };
  }

  // If a stored token is provided (from session), validate it matches
  if (storedToken && token !== storedToken) {
    return { valid: false, error: "CSRF token mismatch" };
  }

  return { valid: true };
}

// ✅ Get IP from request headers
export function getClientIP(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown"
  );
}

// ✅ Validate request origin (prevent CSRF attacks)
export function validateOrigin(
  headers: Headers,
  allowedOrigins: string[] = ["https://thelifeplace.org"]
): boolean {
  const origin = headers.get("origin");
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

// ✅ Validate request method
export function validateMethod(
  method: string,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(method);
}

// ✅ Validate API key (for internal endpoints)
export function validateAPIKey(
  headers: Headers,
  expectedKey: string
): boolean {
  const providedKey = headers.get("x-api-key");
  return providedKey === expectedKey;
}

// ✅ Create secure API response
export function secureAPIResponse(
  data: any,
  statusCode: number = 200,
  headers?: Record<string, string>
) {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: { ...defaultHeaders, ...headers },
  });
}

// ✅ Create error response
export function apiErrorResponse(
  message: string,
  statusCode: number = 400,
  errorCode?: string
) {
  return secureAPIResponse(
    {
      success: false,
      error: message,
      ...(errorCode && { error_code: errorCode }),
    },
    statusCode
  );
}

// ✅ Validate request body is JSON
export async function parseJSONRequest(
  request: Request
): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return { valid: false, error: "Content-Type must be application/json" };
    }

    const data = await request.json();
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: "Invalid JSON in request body" };
  }
}

// ✅ Rate limiting check (manual call in handlers)
export function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  // This would typically use a KV store or external service
  // For now, returning structure for implementation
  return {
    allowed: true,
    remaining: maxRequests,
  };
}

// ✅ Audit API request
export function auditAPIRequest(
  method: string,
  endpoint: string,
  statusCode: number,
  ip: string,
  userId?: string
): void {
  if (statusCode >= 400) {
    logSecurityEvent(
      `API ${method} ${endpoint} returned ${statusCode}`,
      statusCode >= 500 ? "high" : "medium",
      { method, endpoint, status_code: statusCode, user_id: userId },
      ip
    );
  }
}

// ✅ Middleware for common API validations
export async function validateAPIRequest(
  request: Request,
  options: {
    method?: string[];
    requireCSRF?: boolean;
    requireOrigin?: boolean;
    requireAuth?: boolean;
  } = {}
): Promise<{
  valid: boolean;
  data?: any;
  error?: string;
  errorResponse?: Response;
}> {
  const ip = getClientIP(request.headers);

  // Validate method
  if (options.method && !validateMethod(request.method, options.method)) {
    const response = apiErrorResponse(
      `Method ${request.method} not allowed`,
      405
    );
    logSecurityEvent("Invalid request method", "low", { method: request.method }, ip);
    return { valid: false, errorResponse: response };
  }

  // Validate origin
  if (options.requireOrigin && !validateOrigin(request.headers)) {
    const response = apiErrorResponse("Invalid origin", 403);
    logSecurityEvent("Invalid request origin", "medium", { origin: request.headers.get("origin") }, ip);
    return { valid: false, errorResponse: response };
  }

  // Parse and validate body
  if (request.method !== "GET") {
    const bodyResult = await parseJSONRequest(request);
    if (!bodyResult.valid) {
      const response = apiErrorResponse(bodyResult.error || "Invalid request", 400);
      return { valid: false, errorResponse: response };
    }

    // Validate CSRF token
    if (options.requireCSRF) {
      const csrfResult = validateCSRFToken(bodyResult.data);
      if (!csrfResult.valid) {
        const response = apiErrorResponse(csrfResult.error || "CSRF validation failed", 403);
        logSecurityEvent("CSRF validation failed", "high", { endpoint: request.url }, ip);
        return { valid: false, errorResponse: response };
      }
    }

    return { valid: true, data: bodyResult.data };
  }

  return { valid: true };
}
