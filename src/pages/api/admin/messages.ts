import type { APIRoute } from "astro";
import { getClientIP, secureAPIResponse, apiErrorResponse } from "../../../utils/api-auth";
import { logSecurityEvent } from "../../../utils/secure-logging";
import {
  getMessagesAdminKey,
  getMessagesStorageMode,
  loadMessages,
  normalizeMessages,
  saveMessages,
} from "../../../utils/message-store";
import { env as cloudflareEnv } from "cloudflare:workers";

export const prerender = false;

function isAuthorized(request: Request, expectedKey: string): boolean {
  const url = new URL(request.url);
  const queryKey = url.searchParams.get("key");
  const headerKey = request.headers.get("x-admin-key");
  return queryKey === expectedKey || headerKey === expectedKey;
}

export const GET: APIRoute = async ({ request }) => {
  const env = cloudflareEnv as Record<string, unknown>;
  const ip = getClientIP(request.headers);
  const adminKey = getMessagesAdminKey(env);

  if (!isAuthorized(request, adminKey)) {
    logSecurityEvent("Unauthorized messages admin GET", "medium", { endpoint: "/api/admin/messages" }, ip);
    return apiErrorResponse("Unauthorized", 401, "unauthorized");
  }

  const messages = await loadMessages(env);
  return secureAPIResponse({
    success: true,
    messages,
    storage: getMessagesStorageMode(env),
  });
};

export const POST: APIRoute = async ({ request }) => {
  const env = cloudflareEnv as Record<string, unknown>;
  const ip = getClientIP(request.headers);
  const adminKey = getMessagesAdminKey(env);

  if (!isAuthorized(request, adminKey)) {
    logSecurityEvent("Unauthorized messages admin POST", "high", { endpoint: "/api/admin/messages" }, ip);
    return apiErrorResponse("Unauthorized", 401, "unauthorized");
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return apiErrorResponse("Invalid JSON body", 400, "invalid_json");
  }

  try {
    const input = payload as { messages?: unknown };
    const normalized = normalizeMessages(input.messages);
    const storage = await saveMessages(normalized, env);
    return secureAPIResponse({
      success: true,
      messages: normalized,
      storage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logSecurityEvent("Messages admin save failed", "medium", { endpoint: "/api/admin/messages", error: message }, ip);
    const status = message.includes("read-only") ? 501 : 400;
    return apiErrorResponse(message, status, "save_failed");
  }
};
