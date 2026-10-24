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
  try {
    const submitted = new URL(origin).origin;
    // Explicit configuration only: never trust Origin or forwarded Host to define the allowlist.
    const configured = [process.env.NEXT_PUBLIC_SITE_URL, process.env.RENDER_EXTERNAL_URL, ...(process.env.TRUSTED_ORIGINS || "").split(",")].filter((value): value is string => Boolean(value?.trim()));
    return (configured.length ? configured : [request.url]).some(value => {
      try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.origin === submitted; } catch { return false; }
    });
  } catch { return false; }
}
export async function publicGuard(request: Request, scope: string, limit = 12, windowMs = 60000) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
  try {
    if (!await allowRequest(scope + ":" + clientKey(request), limit, windowMs)) return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } });
  } catch { return NextResponse.json({ error: "Protection service is temporarily unavailable. Please try again later." }, { status: 503 }); }
  return null;
}
async function boundedText(request: Request, maxBytes = 20000): Promise<string> {
  if (Number(request.headers.get("content-length") || 0) > maxBytes || !request.body) throw new Error("Invalid body");
  const reader = request.body.getReader(); let length = 0; const chunks: Uint8Array[] = [];
  try { while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > maxBytes) { await reader.cancel(); throw new Error("Body too large"); } chunks.push(value); } }
  finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}

export async function boundedJSON(request: Request, maxBytes = 20000): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("Expected JSON");
  return JSON.parse(await boundedText(request, maxBytes));
}
// Payload's admin auth forms submit JSON inside a multipart `_payload` field.
// Read through the same streaming byte cap before asking the runtime parser to decode it.
export async function boundedPayloadJSON(request: Request, maxBytes = 2000): Promise<unknown> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.toLowerCase().startsWith("application/json")) return boundedJSON(request, maxBytes);
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) throw new Error("Expected JSON or Payload form data");
  const raw = await boundedText(request, maxBytes);
  const form = await new Request(request.url, { method: "POST", headers: { "content-type": contentType }, body: raw }).formData();
  const payload = form.get("_payload");
  if (typeof payload !== "string") throw new Error("Missing Payload form data");
  return JSON.parse(payload);
}
export async function boundedInquiryForm(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/x-www-form-urlencoded")) throw new Error("Expected form");
  const values = new URLSearchParams(await boundedText(request));
  return { ...Object.fromEntries(values), consent: values.get("consent") === "on" };
}
