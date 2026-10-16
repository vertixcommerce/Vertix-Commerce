import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ settings: vi.fn(), expire: vi.fn() }));
vi.mock("@/lib/runtime-settings", () => ({ getRuntimeSettings: mocks.settings }));
vi.mock("@/lib/retention", () => ({ expirePrivateRecords: mocks.expire }));
import { GET as preview } from "@/app/api/maintenance/retention/route";
import { GET as scheduled } from "@/app/api/maintenance/retention/scheduled/route";
const secret = "test-only-cron-secret-12345678901234567890";
const request = (token?: string) => new NextRequest("https://example.invalid/api/maintenance/retention/scheduled", { headers: token ? { authorization: "Bearer " + token } : {} });
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("CRON_SECRET", secret); mocks.settings.mockResolvedValue({ payload: {}, website: { retentionCleanupEnabled: true } }); mocks.expire.mockResolvedValue({ leads: 2, conversations: 1 }); });
afterEach(() => vi.unstubAllEnvs());
describe("scheduled retention boundaries", () => {
  it.each([undefined, "invalid"])("rejects an unauthenticated cron request", async token => { expect((await scheduled(request(token))).status).toBe(401); expect(mocks.settings).not.toHaveBeenCalled(); expect(mocks.expire).not.toHaveBeenCalled(); });
  it("requires owner approval before deletion", async () => { mocks.settings.mockResolvedValue({ payload: {}, website: { retentionCleanupEnabled: false } }); expect((await scheduled(request(secret))).status).toBe(409); expect(mocks.expire).not.toHaveBeenCalled(); });
  it("runs expiry cleanup only with both approval and authentication", async () => { const response = await scheduled(request(secret)); expect(response.status).toBe(200); expect(await response.json()).toEqual({ dryRun: false, expired: { leads: 2, conversations: 1 } }); expect(mocks.expire).toHaveBeenCalledWith({}, false); expect(response.headers.get("cache-control")).toBe("no-store"); });
  it("keeps the existing preview endpoint non-destructive", async () => { expect((await preview(request(secret))).status).toBe(200); expect(mocks.expire).toHaveBeenCalledWith({}, true); });
});
