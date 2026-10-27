import type { APIRoute } from "astro";
import { buildLivePayload } from "../../utils/shared-content-contracts.js";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(buildLivePayload()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
