import type { APIRoute } from "astro";
import { loadSharedEvents } from "../../utils/shared-content-contracts.js";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await loadSharedEvents(fetch)), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
