import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { boundedJSON, clientKey, sameOrigin } from "@/lib/request-security";
let limiter: typeof import("@/lib/rate-limit");
beforeEach(async () => { vi.resetModules(); vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("UPSTASH_REDIS_REST_URL", ""); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", ""); vi.stubEnv("TRUST_PROXY_HEADERS", "false"); vi.stubEnv("TRUSTED_ORIGINS", ""); limiter = await import("@/lib/rate-limit"); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
describe("rate and cost protection", () => {
  it("enforces and resets a local rate window", async () => {
    vi.useFakeTimers();
    expect(await limiter.allowRequest("qa", 2, 1000)).toBe(true);
    expect(await limiter.allowRequest("qa", 2, 1000)).toBe(true);
    expect(await limiter.allowRequest("qa", 2, 1000)).toBe(false);
    vi.advanceTimersByTime(1001); expect(await limiter.allowRequest("qa", 2, 1000)).toBe(true);
  });
  it("bounds development memory instead of accepting unlimited new buckets", async () => {
    for (let i = 0; i < 10000; i++) await limiter.allowRequest("test-" + i);
    expect(await limiter.allowRequest("over-capacity")).toBe(false);
  });
  it("requires shared protection in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(limiter.allowRequest("qa")).rejects.toThrow("Shared protection required");
  });
  it("uses atomic shared rate counting without raw user identifiers", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.invalid"); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-placeholder");
    const fetch = vi.fn().mockResolvedValue(Response.json({ result: 3 })); vi.stubGlobal("fetch", fetch);
    expect(await limiter.allowRequest("private-client-identifier", 2)).toBe(false);
    const body = fetch.mock.calls[0][1].body;
    expect(body).toContain("EVAL"); expect(body).not.toContain("private-client-identifier");
  });
  it("fails closed on Redis errors and enforces the monthly reservation", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.invalid"); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-placeholder");
    const fetch = vi.fn().mockResolvedValue(Response.json({ error: "Invalid token" })); vi.stubGlobal("fetch", fetch);
    await expect(limiter.allowRequest("qa")).rejects.toThrow("Invalid protection response");
    fetch.mockResolvedValue(Response.json({ result: 0 })); expect(await limiter.reserveMonthlyTokens(100, 40)).toBe(false);
    fetch.mockResolvedValue(Response.json({ result: 1 })); expect(await limiter.reserveMonthlyTokens(100, 40)).toBe(true);
    expect(await limiter.reserveMonthlyTokens(0)).toBe(true);
  });
});
describe("public request boundaries", () => {
  it("ignores forged forwarded headers unless a trusted proxy is configured", () => {
    const request = (ip: string) => new Request("http://localhost:3000/api/chat", { headers: { "x-forwarded-for": ip } });
    expect(clientKey(request("1.2.3.4"))).toBe(clientKey(request("5.6.7.8")));
    vi.stubEnv("TRUST_PROXY_HEADERS", "true");
    expect(clientKey(request("1.2.3.4"))).not.toBe(clientKey(request("5.6.7.8")));
    expect(clientKey(request("forged-random-label"))).toBe(clientKey(request("invalid-ip")));
  });
  it("rejects cross-site origin and Fetch Metadata", () => {
    const request = (headers: Record<string, string>) => new Request("http://localhost:3000/api/chat", { headers });
    expect(sameOrigin(request({ origin: "https://evil.example" }))).toBe(false);
    expect(sameOrigin(request({ "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(sameOrigin(request({ origin: "http://localhost:3000" }))).toBe(true);
  });
  it("accepts the assigned Render origin behind its internal proxy, while rejecting other sites", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("RENDER_EXTERNAL_URL", "https://vertix-commerce.onrender.com");
    const request = (origin: string) => new Request("http://localhost:10000/api/leads", {headers:{origin}});
    expect(sameOrigin(request("https://vertix-commerce.onrender.com"))).toBe(true);
    expect(sameOrigin(request("https://evil.example"))).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vertixcommerce.example");
    expect(sameOrigin(request("https://vertixcommerce.example"))).toBe(true);
    expect(sameOrigin(request("https://vertix-commerce.onrender.com"))).toBe(true);
  });
  it("trusts only the configured custom-domain origins behind the production proxy", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vertixcommerce.com");
    vi.stubEnv("RENDER_EXTERNAL_URL", "");
    vi.stubEnv("TRUSTED_ORIGINS", " https://www.vertixcommerce.com, ");
    const request = (origin: string) => new Request("http://localhost:3000/api/leads", { headers: { origin, host: "localhost:3000", "x-forwarded-host": "untrusted.example" } });
    expect(sameOrigin(request("https://vertixcommerce.com"))).toBe(true);
    expect(sameOrigin(request("https://www.vertixcommerce.com"))).toBe(true);
    for (const origin of ["https://untrusted.example", "https://vertixcommerce.com.untrusted.example", "https://other.vertixcommerce.com", "http://vertixcommerce.com", "https://vertixcommerce.com:8443", "https://vertix-commerce.vercel.app", "null"]) {
      expect(sameOrigin(request(origin))).toBe(false);
    }
  });
  it("does not interpret wildcards or credentialed config entries as trusted origins", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vertixcommerce.com");
    vi.stubEnv("RENDER_EXTERNAL_URL", "");
    vi.stubEnv("TRUSTED_ORIGINS", "*, https://user:password@untrusted.example, javascript:alert(1)");
    expect(sameOrigin(new Request("https://vertixcommerce.com/api/leads", { headers: { origin: "https://untrusted.example" } }))).toBe(false);
  });
  it("limits actual streamed bytes even without a content-length header", async () => {
    const req = new Request("http://localhost:3000/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "x".repeat(1000) }) });
    await expect(boundedJSON(req, 100)).rejects.toThrow("Body too large");
  });
});
