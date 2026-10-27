import type { APIRoute } from "astro";
import { loadMessages } from "../../utils/message-store";

export const GET: APIRoute = async ({ locals }) => {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, unknown> } } | undefined)?.runtime?.env;
  const messages = await loadMessages(runtimeEnv);

  return new Response(JSON.stringify(messages), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
