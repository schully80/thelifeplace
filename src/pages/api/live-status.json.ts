import type { APIRoute } from "astro";
import { buildLivePayload } from "../../utils/shared-content-contracts.js";

export const GET: APIRoute = async () => {
  const payload = buildLivePayload();
  return new Response(
    JSON.stringify({
      live: payload.live,
      status: payload.status,
      watchUrl: payload.watchUrl,
      embedUrl: payload.embedUrl,
      checkedAt: payload.checkedAt,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    }
  );
};
