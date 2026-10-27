import type { APIRoute } from "astro";
import { buildBootstrapPayload } from "../../../utils/shared-content-contracts.js";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(buildBootstrapPayload()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
