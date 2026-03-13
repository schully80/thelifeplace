import type { APIRoute } from "astro";
import { onRequestPost as workerPost, onRequestGet as workerGet } from "../../../functions/register";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    return await workerPost({ request, env: process.env } as any);
  } catch (err: any) {
    console.error("/api/register POST error", err);
    return new Response(
      JSON.stringify({ success: false, reason: "server_error", detail: String(err && err.message ? err.message : err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    return await workerGet({ request } as any);
  } catch (err: any) {
    console.error("/api/register GET error", err);
    return new Response("Not found", { status: 404 });
  }
};
