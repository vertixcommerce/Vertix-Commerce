import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ allow: vi.fn(), retrieve: vi.fn(), complete: vi.fn(), save: vi.fn(), settings: vi.fn(), find: vi.fn(), monthly: vi.fn(), conversation: vi.fn(), append: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ allowRequest: mocks.allow, reserveMonthlyTokens: mocks.monthly }));
vi.mock("@/lib/runtime-settings", () => ({ getRuntimeSettings: mocks.settings }));
vi.mock("@/lib/conversations", async importOriginal => ({ ...await importOriginal<typeof import("@/lib/conversations")>(), findConversation: mocks.conversation, appendConversation: mocks.append }));
vi.mock("@/lib/knowledge-repository", () => ({ retrieveApprovedKnowledge: mocks.retrieve }));
vi.mock("@/lib/leads", () => ({ saveLead: mocks.save }));
vi.mock("@/lib/gemini", async importOriginal => ({ ...await importOriginal<typeof import("@/lib/gemini")>(), generateApprovedPassages: mocks.complete }));
import { POST as chat } from "@/app/api/chat/route";
import { POST as lead } from "@/app/api/leads/route";
import { POST as forgot } from "@/app/api/users/forgot-password/route";

const request = (body: unknown) => new NextRequest("http://localhost:3000/api/qa", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const validLead = { name: "Local QA", email: "qa@example.invalid", whatsapp: "+1 202 555 0100", country: "Germany", service: "eBay Account Management", requirements: "Local automated test only.", consent: true };
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("GEMINI_API_KEY", "local-test-placeholder-not-a-key");
  vi.stubEnv("DATABASE_URL", "file:local-test-placeholder.db");
  mocks.allow.mockReturnValue(true);
  mocks.monthly.mockResolvedValue(true);
  mocks.settings.mockResolvedValue({ publicAssistant: { enabled: true, allowLeadCapture: true, humanHandoffEnabled: true, offlineMessage: "The team is not immediately available.", offlineMessageDE: "Das Team ist nicht sofort verfügbar.", conversationRetentionDays: 90 }, assistant: { monthlyTokenBudget: 0 }, website: {}, payload: { find: mocks.find } });
  mocks.find.mockResolvedValue({ docs: [{ id: 1, name: "eBay Account Management", slug: "ebay-account-management", status: "published", _status: "published" }] });
  mocks.conversation.mockResolvedValue(undefined);
  mocks.append.mockResolvedValue({ id: 1 });
  mocks.retrieve.mockResolvedValue([{ id: "qa", title: "Approved test article", body: "Test service scope", tags: [], locale: "en", approved: true }]);
});

describe("password recovery boundaries", () => {
  it("does not generate a token when delivery is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", ""); vi.stubEnv("RESEND_FROM_EMAIL_ADDRESS", "");
    mocks.settings.mockClear();
    expect((await forgot(request({ email: "qa@example.invalid" }))).status).toBe(503);
    expect(mocks.settings).not.toHaveBeenCalled();
  });
  it("never returns the reset token or account existence", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-placeholder"); vi.stubEnv("RESEND_FROM_EMAIL_ADDRESS", "sender@example.invalid");
    const token = "mock-secret-reset-token";
    const recover = vi.fn().mockResolvedValue(token);
    mocks.settings.mockResolvedValue({ payload: { forgotPassword: recover } });
    const response = await forgot(request({ email: "qa@example.invalid" }));
    expect(response.status).toBe(200); expect(JSON.stringify(await response.json())).not.toContain(token);
    recover.mockResolvedValue(null);
    expect((await forgot(request({ email: "unknown@example.invalid" }))).status).toBe(200);
  });
  it("handles provider failure without disclosing details", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-placeholder"); vi.stubEnv("RESEND_FROM_EMAIL_ADDRESS", "sender@example.invalid");
    mocks.settings.mockResolvedValue({ payload: { forgotPassword: vi.fn().mockRejectedValue(new Error("Private mail error")) } });
    const response = await forgot(request({ email: "qa@example.invalid" }));
    expect(response.status).toBe(503); expect(JSON.stringify(await response.json())).not.toContain("Private mail error");
  });
});
afterEach(() => vi.unstubAllEnvs());

describe("chat route failure handling", () => {
  it("does not send visitor identities, history or internal notes to Gemini", async () => {
    const settings = await mocks.settings(); settings.assistant.instructions = "Private team note";
    mocks.complete.mockResolvedValue(JSON.stringify({ passages: [] }));
    await chat(request({ message: "I am Zafir, reach me at zafir@example.invalid about service scope", history: [{ role: "user", content: "My name is Zafir" }] }));
    expect(mocks.complete).toHaveBeenCalledOnce();
    const upstream = JSON.stringify(mocks.complete.mock.calls[0][0]);
    expect(upstream).not.toContain("Zafir"); expect(upstream).not.toContain("example.invalid"); expect(upstream).not.toContain("Private team note");
  });
  it("returns safe fallback for the free-tier provider quota", async () => {
    const { GeminiError } = await import("@/lib/gemini");
    mocks.complete.mockRejectedValue(new GeminiError(429));
    expect((await (await chat(request({ message: "Service scope" }))).json()).reason).toBe("provider_quota");
  });
  it("uses only owner-approved public instructions and strips contact fields from approved sources", async () => {
    const settings = await mocks.settings(); settings.assistant.publicInstructionsApproved = true; settings.assistant.instructions = "Prefer listing scope passages";
    mocks.retrieve.mockResolvedValue([{ id: "qa", title: "Public service", body: "Test service scope. Contact qa@example.invalid", tags: [], locale: "en", approved: true }]);
    mocks.complete.mockResolvedValue(JSON.stringify({ passages: [{ id: "qa", quote: "Test service scope." }] }));
    await chat(request({ message: "Service scope" }));
    const upstream = mocks.complete.mock.calls[0][0];
    expect(upstream.publicInstructions).toBe("Prefer listing scope passages");
    expect(JSON.stringify(upstream)).not.toContain("qa@example.invalid");
  });
  it("returns a safe fallback when the provider fails", async () => {
    mocks.complete.mockRejectedValue(new Error("Provider test failure"));
    const response = await chat(request({ message: "Tell me about service scope" }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reason).toBe("provider_failure");
    expect(data.escalate).toBe(true);
    expect(data.message).toContain("approved information");
    expect(JSON.stringify(data)).not.toContain("Provider test failure");
  });
  it("does not call a provider without approved retrieval results", async () => {
    mocks.retrieve.mockResolvedValue([]);
    const response = await chat(request({ message: "Unapproved question" }));
    expect((await response.json()).escalate).toBe(true);
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("handles missing configuration without calling a provider", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const response = await chat(request({ message: "Tell me about services" }));
    expect((await response.json()).reason).toBe("assistant_unconfigured");
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("falls back on an empty provider answer", async () => {
    mocks.complete.mockResolvedValue(" ");
    expect((await (await chat(request({ message: "Tell me about services" }))).json()).escalate).toBe(true);
  });
  it("rejects excessive history instead of sending it upstream", async () => {
    const response = await chat(request({ message: "Hello", history: Array.from({ length: 9 }, () => ({ role: "user", content: "Hello" })) }));
    expect(response.status).toBe(400);
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("returns 429 when throttled", async () => {
    mocks.allow.mockReturnValue(false);
    expect((await chat(request({ message: "Hello" }))).status).toBe(429);
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });
  it("does not save a conversation without explicit storage consent", async () => {
    mocks.retrieve.mockResolvedValue([]);
    await chat(request({ message: "Service scope" }));
    expect(mocks.append).not.toHaveBeenCalled();
  });
  it("stores consented fallback chats and reports storage failure honestly", async () => {
    mocks.retrieve.mockResolvedValue([]); mocks.append.mockRejectedValue(new Error("Private storage error"));
    const data = await (await chat(request({ message: "Service scope", storeConversation: true }))).json();
    expect(mocks.append).toHaveBeenCalled(); expect(data.storageError).toBe(true); expect(data.stored).toBe(false);
    expect(JSON.stringify(data)).not.toContain("Private storage error");
  });
  it("does not store or send sensitive input upstream", async () => {
    await chat(request({ message: "My password is private123", storeConversation: true }));
    expect(mocks.append).not.toHaveBeenCalled(); expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("enforces disabled assistant settings server-side", async () => {
    const settings = await mocks.settings(); settings.publicAssistant.enabled = false;
    expect((await chat(request({ message: "Service scope" }))).status).toBe(503);
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("keeps human mode paused even when future storage is unchecked", async () => {
    mocks.conversation.mockResolvedValue({ mode: "human" });
    expect((await (await chat(request({ message: "Service scope", storeConversation: false }))).json()).reason).toBe("human_mode");
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("returns only verified source passages without sending raw visitor text or history", async () => {
    mocks.complete.mockResolvedValue(JSON.stringify({ passages: [{ id: "qa", quote: "Test service scope" }] }));
    const data = await (await chat(request({ message: "Service scope" }))).json();
    expect(data.message).toContain("Test service scope"); expect(data.escalate).toBe(false);
    expect(mocks.complete.mock.calls[0][0].topics).toEqual(["service", "scope"]);
  });
  it("rejects invented provider claims", async () => {
    mocks.complete.mockResolvedValue({ choices: [{ message: { content: '{"passages":[{"id":"qa","quote":"Our price is 100 dollars."}]}' } }] });
    const data = await (await chat(request({ message: "Price" }))).json();
    expect(data.escalate).toBe(true); expect(data.message).not.toContain("100 dollars");
  });
  it("enforces the shared token cap before requesting completion", async () => {
    mocks.monthly.mockResolvedValue(false);
    expect((await (await chat(request({ message: "Service scope" }))).json()).reason).toBe("usage_limit");
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("fails closed when protection storage fails", async () => {
    mocks.allow.mockRejectedValue(new Error("Private rate store error"));
    expect((await chat(request({ message: "Hello" }))).status).toBe(503);
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it("rejects cross-site requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", { method: "POST", headers: { origin: "https://evil.example", "content-type": "application/json" }, body: '{"message":"Hello"}' });
    expect((await chat(req)).status).toBe(403); expect(mocks.complete).not.toHaveBeenCalled();
  });
});

describe("lead route failure handling", () => {
  it("accepts consented production inquiries without the removed legal-page approval gate", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.save.mockResolvedValue({id:43});
    const response=await lead(request(validLead));
    expect(response.status).toBe(200);
    expect((await response.json()).accepted).toBe(true);
    expect(mocks.save).toHaveBeenCalledOnce();
  });
  it("handles storage failure without exposing internal details", async () => {
    mocks.save.mockRejectedValue(new Error("Private storage diagnostic"));
    const response = await lead(request(validLead));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("Private storage diagnostic");
  });
  it("rejects missing consent before saving", async () => {
    expect((await lead(request({ ...validLead, consent: false }))).status).toBe(400);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("returns 503 when storage is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    expect((await lead(request(validLead))).status).toBe(503);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("returns 429 before attempting storage", async () => {
    mocks.allow.mockReturnValue(false);
    expect((await lead(request(validLead))).status).toBe(429);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("rejects removed or draft service selections", async () => {
    mocks.find.mockResolvedValue({ docs: [] });
    expect((await lead(request(validLead))).status).toBe(400); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("enforces assistant lead capture settings", async () => {
    const settings = await mocks.settings(); settings.publicAssistant.allowLeadCapture = false;
    expect((await lead(request({ ...validLead, source: "assistant" }))).status).toBe(403); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("accepts a consented lead using the current published service", async () => {
    mocks.save.mockResolvedValue({ id: 42 });
    const response = await lead(request({ ...validLead, service: "ebay-account-management" }));
    expect(response.status).toBe(200); expect(mocks.save.mock.calls[0][0].service).toBe("eBay Account Management");
    expect(JSON.stringify(await response.json())).not.toContain(validLead.email);
  });
});
