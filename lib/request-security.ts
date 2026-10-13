import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { allowRequest } from "./rate-limit";
export function clientKey(request: Request) {
  const forwarded = process.env.TRUST_PROXY_HEADERS === "true" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : "";
  return createHash("sha256").update(forwarded && isIP(forwarded) ? forwarded : "untrusted-proxy-global").digest("hex");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try { return new URL(origin).origin === new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin; } catch { return false; }
}
export async function publicGuard(request: Request, scope: string, limit = 12, windowMs = 60000) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
  try {
    if (!await allowRequest(scope + ":" + clientKey(request), limit, windowMs)) return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } });
  } catch { return NextResponse.json({ error: "Protection service is temporarily unavailable. Please try again later." }, { status: 503 }); }
  return null;
}
export async function boundedJSON(request: Request, maxBytes = 20000): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("Expected JSON");
  if (Number(request.headers.get("content-length") || 0) > maxBytes || !request.body) throw new Error("Invalid body");
  const reader = request.body.getReader(); let length = 0; const chunks: Uint8Array[] = [];
  try { while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > maxBytes) { await reader.cancel(); throw new Error("Body too large"); } chunks.push(value); } }
  finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
