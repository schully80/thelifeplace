import type { APIRoute } from "astro";
import { onRequestPost as workerPost, onRequestGet as workerGet } from "../../../functions/register";
import { env as cloudflareEnv } from "cloudflare:workers";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const ctx = (context.locals as { cfContext?: unknown }).cfContext;
    const env = cloudflareEnv || process.env;
    return await workerPost({ request: context.request, env, ctx } as any) as unknown as Response;
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
    return await workerGet({ request: context.request } as any) as unknown as Response;
  } catch (err: any) {
    console.error("/api/register GET error", err);
    return new Response("Not found", { status: 404 });
  }
};
