import type { APIRoute } from "astro";
import { env as cfEnv, executionContext as cfCtx } from "cloudflare:workers";
import { onRequestPost as workerPost, onRequestGet as workerGet } from "../../../functions/register";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    // Prefer Cloudflare-provided env/ctx; fall back to process.env for local dev.
    const env = cfEnv ?? process.env;
    const ctx = cfCtx ?? (context as any)?.locals?.cloudflare?.ctx;
    return await workerPost({ request: context.request, env, ctx } as any);
  } catch (err: any) {
    console.error("/api/register POST error", err);
    return new Response(
      JSON.stringify({ success: false, reason: "server_error", detail: String(err && err.message ? err.message : err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const GET: APIRoute = async (context) => {
  try {
    return await workerGet({ request: context.request } as any);
  } catch (err: any) {
    console.error("/api/register GET error", err);
    return new Response("Not found", { status: 404 });
  }
};
