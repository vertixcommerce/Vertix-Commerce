import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { Payload, PayloadRequest } from "payload";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ send: vi.fn(), get: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send: mocks.send }; } }));
vi.mock("payload", () => ({ getPayload: mocks.get }));
vi.mock("@payload-config", () => ({ default: {} }));
import { appendConversation, visitorSession } from "@/lib/conversations";
import { notifyLead } from "@/lib/lead-notifications";
import { saveLead } from "@/lib/leads";
import { expirePrivateRecords } from "@/lib/retention";
import { Conversations } from "@/payload/collections/Conversations";
import type { Lead } from "@/payload-types";
const lead = { id: 42, name: "Fictional customer", email: "private@example.invalid", whatsapp: "+1 202 555 0100", requirements: "Private requirements", country: "Germany", service: "QA scope", consent: true } as Lead;
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("RESEND_API_KEY", "test-placeholder"); vi.stubEnv("RESEND_FROM_EMAIL_ADDRESS", "sender@example.invalid"); });
afterEach(() => vi.unstubAllEnvs());
describe("private inquiry storage and notifications", () => {
  it("reuses an idempotency key rather than creating duplicate inquiries", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 42 }] }), create = vi.fn();
    mocks.get.mockResolvedValue({ findGlobal: vi.fn().mockResolvedValue({}), find, create });
    expect(await saveLead({ name: lead.name, email: lead.email, whatsapp: lead.whatsapp, requirements: lead.requirements, service: lead.service, country: "Germany", consent: true, source: "website", locale: "en", website: "", idempotencyKey: "a3eaab5e-598c-4419-85c8-0214d20fd441" })).toEqual({ id: 42 });
    expect(create).not.toHaveBeenCalled();
  });
  it("handles email API errors and reuses the hook transaction", async () => {
    const findGlobal = vi.fn().mockResolvedValue({ leadNotificationEmail: "inbox@example.invalid" }), update = vi.fn();
    mocks.send.mockResolvedValue({ error: { message: "Provider unavailable" } });
    const req = { transactionID: "test-transaction" } as PayloadRequest;
    const logger = { error: vi.fn(), info: vi.fn() };
    const status = await notifyLead({ findGlobal, update, logger } as unknown as Payload, lead, req);
    expect(status).toBe("failed"); expect(update.mock.calls[0][0].req).toBe(req);
    const [message, options] = mocks.send.mock.calls[0];
    expect(message).toMatchObject({ to: "inbox@example.invalid", replyTo: lead.email });
    for (const detail of [lead.name, lead.email, lead.whatsapp, lead.country, lead.service, lead.requirements]) expect(message.text).toContain(detail);
    expect(message.text).toContain("Reference: 42");
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Provider unavailable"));
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(lead.email);
    expect(options).toEqual({ idempotencyKey: "vertix-lead-42" });
  });
  it("does not attempt email when the provider is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const payload = { findGlobal: vi.fn().mockResolvedValue({}), update: vi.fn(), logger: { error: vi.fn(), info: vi.fn() } };
    expect(await notifyLead(payload as unknown as Payload, lead)).toBe("not-configured"); expect(mocks.send).not.toHaveBeenCalled();
    expect(payload.logger.error).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY"));
  });
});
describe("consented conversations", () => {
  it("uses an unguessable cookie and stores only its hash", () => {
    const session = visitorSession(new NextRequest("http://localhost:3000/api/assistant"));
    expect(session.token).toMatch(/^[a-f0-9]{64}$/); expect(session.id).not.toBe(session.token);
    const same = visitorSession(new NextRequest("http://localhost:3000/api/assistant", { headers: { cookie: "vx-assistant-session=" + session.token } }));
    expect(same.id).toBe(session.id);
  });
  it("redacts contact details and records storage consent and retention", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 }), find = vi.fn().mockResolvedValue({ docs: [] });
    await appendConversation({ create, find } as unknown as Payload, "session-hash", "de", 30, "Contact me at private@example.invalid", "Use the form.", true);
    const data = create.mock.calls[0][0].data;
    expect(data.storageConsent).toBe(true); expect(data.locale).toBe("de"); expect(data.followUpRequired).toBe(true);
    expect(JSON.stringify(data.messages)).not.toContain("private@example.invalid"); expect(Date.parse(data.retentionExpiresAt)).toBeGreaterThan(Date.now());
  });
  it("prevents staff from forging consent or replacing messages", async () => {
    const hook = Conversations.hooks!.beforeChange![0];
    const result = await hook({ data: { storageConsent: true, sessionId: "forged", messages: [{ role: "user", content: "forged" }], mode: "closed" }, req: { user: { id: 1 } } } as never);
    expect(result).toEqual({ mode: "closed" });
  });
  it("delivers a staff reply only to an active consented conversation", async () => {
    const hook = Conversations.hooks!.beforeChange![0];
    const result = await hook({ data: { replyToVisitor: "Fictional QA team response." }, req: { user: { id: 1 } }, originalDoc: { storageConsent: true, retentionExpiresAt: new Date(Date.now() + 86400000).toISOString(), messages: [] } } as never);
    expect(result).toMatchObject({ mode: "human", followUpRequired: false, replyToVisitor: "", messages: [{ role: "human", content: "Fictional QA team response." }] });
    await expect(async () => hook({ data: { replyToVisitor: "Hello" }, req: { user: { id: 1 } }, originalDoc: { storageConsent: false } } as never)).rejects.toThrow("consent");
  });
});
describe("retention cleanup", () => {
  it("defaults to a non-destructive expiry preview", async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 2 }), remove = vi.fn();
    expect(await expirePrivateRecords({ count, delete: remove } as unknown as Payload)).toEqual({ leads: 2, conversations: 2 }); expect(remove).not.toHaveBeenCalled();
  });
  it("deletes only bounded expired batches with a delete-time expiry guard", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 1 }] }), remove = vi.fn().mockResolvedValue({ docs: [{ id: 1 }] });
    await expirePrivateRecords({ find, delete: remove } as unknown as Payload, false);
    expect(find.mock.calls[0][0].limit).toBe(100);
    expect(remove.mock.calls[0][0].where.and[0]).toHaveProperty("retentionExpiresAt.less_than_equal");
    expect(remove.mock.calls[0][0].where.and[1]).toEqual({ id: { in: [1] } });
  });
});
