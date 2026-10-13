import { createHash, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { Payload } from "payload";
import { redactMessage } from "./chat";
export const sessionCookie = "vx-assistant-session";
export function visitorSession(request: NextRequest) {
  const existing = request.cookies.get(sessionCookie)?.value;
  const token = existing && /^[a-f0-9]{64}$/.test(existing) ? existing : randomBytes(32).toString("hex");
  return { token, id: createHash("sha256").update(token).digest("hex") };
}
export function withSession(response: NextResponse, token: string) {
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(sessionCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api", maxAge: 6 * 60 * 60 });
  return response;
}
export async function findConversation(payload: Payload, sessionId: string) {
  const result = await payload.find({ collection: "conversations", where: { and: [{ sessionId: { equals: sessionId } }, { retentionExpiresAt: { greater_than: new Date().toISOString() } }] }, limit: 1, depth: 0 });
  return result.docs[0];
}
export async function appendConversation(payload: Payload, sessionId: string, locale: "en" | "de", retentionDays: number, message: string, answer: string, handoff: boolean) {
  const existing = await findConversation(payload, sessionId);
  const sentAt = new Date().toISOString();
  const messages = [...(existing?.messages || []), { role: "user" as const, sentAt, content: redactMessage(message) }, { role: "assistant" as const, sentAt, content: redactMessage(answer) }].slice(-100);
  const data = { sessionId, locale, messages, storageConsent: true, consentedAt: existing?.consentedAt || sentAt, mode: handoff ? "waiting-for-human" as const : existing?.mode || "ai" as const, followUpRequired: handoff || existing?.followUpRequired || false, retentionExpiresAt: existing?.retentionExpiresAt || new Date(Date.now() + retentionDays * 86400000).toISOString() };
  if (existing) return payload.update({ collection: "conversations", id: existing.id, data });
  return payload.create({ collection: "conversations", data });
}
