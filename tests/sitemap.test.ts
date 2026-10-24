import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ find: vi.fn(), global: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: async () => ({ find: mocks.find, findGlobal: mocks.global }) }));
vi.mock("@/lib/public-content-cache", () => ({ readPublicContent: (_keys: string[], load: () => Promise<unknown>) => load() }));
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vertix-commerce.vercel.app"); vi.stubEnv("DATABASE_URL", "file:test-only.db"); mocks.global.mockImplementation(async ({ slug }) => slug === "website-settings" ? { privacyApproved: true, privacyText: "Approved notice", termsApproved: true, termsText: "  " } : { seo: {} }); mocks.find.mockResolvedValue({ docs: [] }); });
afterEach(() => vi.unstubAllEnvs());
describe("published canonical sitemap", () => {
  it("lists only published, indexable, canonical records and approved non-empty policies", async () => {
    mocks.find.mockImplementation(async ({ collection }) => ({ docs: collection === "articles" ? [] : [
      { slug: "published", status: "published", _status: "published", updatedAt: "2026-10-25T00:00:00.000Z" },
      { slug: "draft", status: "published", _status: "draft" },
      { slug: "unpublished", status: "draft", _status: "published" },
      { slug: "hidden", status: "published", _status: "published", seo: { noIndex: true } },
      { slug: "syndicated", status: "published", _status: "published", seo: { canonicalURL: "https://publisher.example/elsewhere" } },
      { slug: "migrated", status: "published", _status: "published", seo: { canonicalURL: "https://vertix-commerce.vercel.app/services/migrated" } },
    ] }));
    const result = await sitemap(), urls = result.map(x => x.url);
    expect(urls).toContain("https://vertixcommerce.com/services/published"); expect(urls).toContain("https://vertixcommerce.com/services/migrated"); expect(urls).toContain("https://vertixcommerce.com/privacy");
    expect(urls).not.toContain("https://vertixcommerce.com/terms"); expect(urls.some(url => /draft|unpublished|hidden|syndicated/.test(url))).toBe(false);
    expect(urls.every(url => new URL(url).origin === "https://vertixcommerce.com")).toBe(true);
    expect(mocks.find).toHaveBeenCalledWith(expect.objectContaining({ draft: false, where: { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] } }));
  });
  it("excludes an About page hidden from indexing", async () => {
    mocks.global.mockResolvedValue({ seo: { noIndex: true } });
    expect((await sitemap()).some(x => x.url.endsWith("/about"))).toBe(false);
  });
  it("points robots to the same canonical sitemap without disclosing admin routes", () => {
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: ["/", "/api/media/file/"], disallow: ["/api/"] }, sitemap: "https://vertixcommerce.com/sitemap.xml" });
  });
});
