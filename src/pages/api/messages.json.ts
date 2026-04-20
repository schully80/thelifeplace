import type { APIRoute } from "astro";
import { loadMessages } from "../../utils/message-store";
import { env as cloudflareEnv } from "cloudflare:workers";

export const GET: APIRoute = async () => {
  const messages = await loadMessages(cloudflareEnv as Record<string, unknown>);

  return new Response(JSON.stringify(messages), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
