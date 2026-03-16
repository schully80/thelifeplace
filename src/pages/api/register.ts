import type { APIRoute } from "astro";
import { onRequestPost as workerPost, onRequestGet as workerGet } from "../../../functions/register";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const runtime = (context.locals as any)?.runtime;
    const env = runtime?.env || process.env;
    const ctx = runtime?.ctx;
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
