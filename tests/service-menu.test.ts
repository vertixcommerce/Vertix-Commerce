vi.mock("next/cache", () => ({ unstable_cache: (load: () => Promise<unknown>) => load, revalidateTag: vi.fn() }));
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("payload", () => ({ getPayload: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));
import { getPayload } from "payload";
import { connection } from "next/server";
import { getPublicService, getSiteChrome } from "@/lib/site-content";

const category = { id: 1, slug: "custom-services", name: "My services", enabled: true };
const service = { id: 1, slug: "my-service", name: "My service", shortDescription: "CMS introduction", category, navigationVisible: true, featured: true, status: "published", _status: "published" };
const cms = { findGlobal: vi.fn(), find: vi.fn() };
beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "file:test.db");
  vi.mocked(getPayload).mockResolvedValue(cms as never);
  cms.findGlobal.mockResolvedValue({ servicesMenuLabel: "Our expertise", socialLinks: [] });
  cms.find.mockImplementation(async ({ collection }) => ({ docs: collection === "service-categories" ? [category] : [service] }));
});
afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });

describe("CMS-controlled services menu", () => {
  it("uses saved category names, service names, and the menu heading", async () => {
    const result = await getSiteChrome();
    expect(result.servicesLabel).toBe("Our expertise");
    expect(result.groups[0].name).toBe("My services");
    expect(result.groups[0].services[0].title).toBe("My service");
    expect(connection).not.toHaveBeenCalled();
  });
  it("does not restore hard-coded links when the library is empty", async () => {
    cms.find.mockResolvedValue({ docs: [] });
    const result = await getSiteChrome();
    expect(result.groups).toEqual([]);
    expect(result.featuredServices).toEqual([]);
  });
  it("hides a menu item without hiding its homepage card or published page", async () => {
    cms.find.mockImplementation(async ({ collection }) => ({ docs: collection === "service-categories" ? [category] : [{ ...service, navigationVisible: false }] }));
    const result = await getSiteChrome();
    expect(result.groups).toEqual([]);
    expect(result.featuredServices[0].slug).toBe("my-service");
    expect((await getPublicService("my-service"))?.title).toBe("My service");
  });
  it("omits disabled and empty category groups rather than restoring defaults", async () => {
    cms.find.mockImplementation(async ({ collection }) => ({ docs: collection === "service-categories" ? [] : [service] }));
    expect((await getSiteChrome()).groups).toEqual([]);
    expect(cms.find).toHaveBeenCalledWith(expect.objectContaining({ collection: "service-categories", where: { enabled: { equals: true } }, sort: "displayOrder" }));
  });
  it("selects only published content in admin-defined order without a fixed menu cap", async () => {
    await getSiteChrome();
    expect(cms.find).toHaveBeenCalledWith(expect.objectContaining({ collection: "services", draft: false, sort: "displayOrder", pagination: false, where: { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] } }));
  });
  it("does not resurrect deleted built-in service pages", async () => {
    cms.find.mockResolvedValue({ docs: [] });
    expect(await getPublicService("ebay-account-management")).toBeUndefined();
  });
  it("refuses an unpublished service page", async () => {
    cms.find.mockResolvedValue({ docs: [{ ...service, status: "draft", _status: "draft" }] });
    expect(await getPublicService("my-service")).toBeUndefined();
  });
  it("does not restore links when storage fails or is not configured", async () => {
    vi.mocked(getPayload).mockRejectedValue(new Error("Storage unavailable"));
    expect((await getSiteChrome()).groups).toEqual([]);
    expect(await getPublicService("ebay-account-management")).toBeUndefined();
    vi.stubEnv("DATABASE_URL", "");
    expect((await getSiteChrome()).groups).toEqual([]);
  });
});
