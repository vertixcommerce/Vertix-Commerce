import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiError, generateApprovedPassages, publicTopicTerms } from "@/lib/gemini";
import type { KnowledgeItem } from "@/lib/content";
const docs: KnowledgeItem[] = [{ id: "service:1", title: "Store operations", body: "Our service includes listing management.", tags: ["listings"], locale: "en", approved: true }];
const input = { docs, topics: ["listing"], locale: "en" as const };
beforeEach(() => { vi.stubEnv("GEMINI_API_KEY", "test-placeholder"); vi.stubEnv("GEMINI_MODEL", "gemini-3.5-flash-lite"); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("server-side Gemini adapter", () => {
  it("sends only approved topic vocabulary, stripping contacts and unrelated visitor details", () => {
    expect(publicTopicTerms("My name is Frederik and email is frederik@example.com. I need listing management in my private village", docs)).toEqual(["listing", "management"]);
  });
  it("uses a header secret, structured output and no-store without extra provider calls", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: '{"passages":[]}' }] } }] })); vi.stubGlobal("fetch", fetch);
    expect(await generateApprovedPassages(input)).toBe('{"passages":[]}');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).not.toContain("test-placeholder");
    const options = fetch.mock.calls[0][1];
    expect(options.headers["x-goog-api-key"]).toBe("test-placeholder");
    expect(JSON.parse(options.body).generationConfig.responseFormat.text.mimeType).toBe("APPLICATION_JSON");
    expect(JSON.parse(options.body).store).toBe(false);
  });
  it.each([429, 500, 403])("fails safely on provider status %s", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("private provider diagnostic", { status })));
    await expect(generateApprovedPassages(input)).rejects.toEqual(new GeminiError(status));
  });
  it("discards truncated, blocked or thinking-only output", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: "truncated" }] } }] })); vi.stubGlobal("fetch", fetch);
    expect(await generateApprovedPassages(input)).toBe("");
    fetch.mockResolvedValue(Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "internal thought", thought: true }] } }] }));
    expect(await generateApprovedPassages(input)).toBe("");
  });
  it("rejects malformed model configuration before network access", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch); vi.stubEnv("GEMINI_MODEL", "../../private");
    await expect(generateApprovedPassages(input)).rejects.toThrow("unavailable");
    expect(fetch).not.toHaveBeenCalled();
  });
});
