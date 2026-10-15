vi.mock("next/cache", () => ({ unstable_cache: (load: () => Promise<unknown>) => load, revalidateTag: vi.fn() }));
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("payload", () => ({ getPayload: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));
import { getPayload } from "payload";
import { articlePageNumber, getAboutPage, getArticle, getArticles } from "@/lib/editorial-content";
const cms = { find: vi.fn(), findGlobal: vi.fn() };
beforeEach(() => { vi.stubEnv("DATABASE_URL", "file:test.db"); vi.mocked(getPayload).mockResolvedValue(cms as never); });
afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });
describe("CMS editorial retrieval", () => {
  it("loads About hero and company content with populated image relationships", async () => {
    cms.findGlobal.mockResolvedValue({ heroTitle: "My About heading", cardHeading: "My story" });
    expect((await getAboutPage()).heroTitle).toBe("My About heading");
    expect(cms.findGlobal).toHaveBeenCalledWith({ slug: "about-page", depth: 1 });
  });
  it("uses bounded pagination rather than a fixed article catalogue", async () => {
    cms.find.mockResolvedValue({ docs: [{ id: 12, title: "New article" }], totalDocs: 13, totalPages: 2 });
    expect((await getArticles(2)).totalDocs).toBe(13);
    expect(cms.find).toHaveBeenCalledWith(expect.objectContaining({ collection: "articles", page: 2, limit: 12, draft: false, sort: "-publishedAt", where: { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] } }));
  });
  it("does not expose a draft article or fabricate a missing one", async () => {
    cms.find.mockResolvedValue({ docs: [{ status: "draft", _status: "draft", title: "Private draft" }] });
    expect(await getArticle("private-draft")).toBeUndefined();
    cms.find.mockResolvedValue({ docs: [] });
    expect(await getArticle("missing")).toBeUndefined();
  });
  it("returns a published article by its saved slug", async () => {
    cms.find.mockResolvedValue({ docs: [{ title: "Published article", status: "published", _status: "published" }] });
    expect((await getArticle("published-article"))?.title).toBe("Published article");
  });
  it("fails closed and reports temporary article failure distinctly from an empty library", async () => {
    cms.find.mockRejectedValue(new Error("Private database diagnostic"));
    expect((await getArticles()).unavailable).toBe(true);
    expect(await getArticle("anything")).toBeUndefined();
    vi.stubEnv("DATABASE_URL", ""); expect((await getArticles()).docs).toEqual([]);
  });
  it.each([undefined, "-1", "0", "1.5", "1e2", "9999999", ["2"]])("safely normalizes invalid page %s", value => {
    expect(articlePageNumber(value)).toBe(1);
  });
  it("accepts valid page numbers", () => { expect(articlePageNumber("2")).toBe(2); });
});
