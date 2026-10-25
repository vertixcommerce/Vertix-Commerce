import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ values: new Map<string, unknown>(), pending: [] as (() => void)[], cms: { find: vi.fn(), findGlobal: vi.fn() } }));
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((load: () => Promise<unknown>, keys: string[]) => async () => {
    const key = JSON.stringify(keys);
    if (state.values.has(key)) return state.values.get(key);
    const result = await load(); state.values.set(key, result); return result;
  }),
  revalidateTag: vi.fn(() => state.values.clear()),
  revalidatePath: vi.fn(),
}));
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}), after: vi.fn((callback: () => void) => state.pending.push(callback)) }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => state.cms) }));
vi.mock("@payload-config", () => ({ default: {} }));
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { readPublicContent, PUBLIC_CONTENT_TAG } from "@/lib/public-content-cache";
import { withPublicCollectionCache, withPublicGlobalCache } from "@/payload/public-content-hooks";
import { getArticle, getArticles } from "@/lib/editorial-content";

beforeEach(() => {
  vi.clearAllMocks(); state.values.clear(); state.pending.length = 0;
  state.cms.find.mockReset(); state.cms.findGlobal.mockReset();
  vi.stubEnv("DATABASE_URL", "file:test.db");
});
const args = () => ({ req: { payload: { logger: { warn: vi.fn() } } } }) as never;
const article = (title: string) => ({ slug: "guide", title, status: "published", _status: "published" });

it("shares public reads with a bounded lifetime and an invalidation tag", async () => {
  const load = vi.fn(async () => ({ title: "Public content" }));
  await readPublicContent(["example"], load); await readPublicContent(["example"], load);
  expect(load).toHaveBeenCalledTimes(1);
  expect(unstable_cache).toHaveBeenCalledWith(load, [PUBLIC_CONTENT_TAG, "example"], { tags: [PUBLIC_CONTENT_TAG], revalidate: 3600 });
});
it("keeps different article slugs and listing pages separate", async () => {
  state.cms.find.mockImplementation(async (query) => query.collection === "articles" && query.page
    ? { docs: [], totalDocs: query.page, totalPages: 2 }
    : { docs: [article(query.where.and[0].slug.equals)] });
  expect((await getArticle("one"))?.title).toBe("one");
  expect((await getArticle("two"))?.title).toBe("two");
  expect((await getArticles(1)).totalDocs).toBe(1);
  expect((await getArticles(2)).totalDocs).toBe(2);
});
it.each(["afterChange", "afterDelete"] as const)("refreshes published content after %s and the response completes", async (event) => {
  state.cms.find.mockResolvedValue({ docs: [article("Before")] });
  expect((await getArticle("guide"))?.title).toBe("Before");
  const collection = withPublicCollectionCache({ slug: "articles", fields: [] });
  collection.hooks![event]!.at(-1)!(args());
  expect(revalidateTag).not.toHaveBeenCalled();
  state.cms.find.mockResolvedValue({ docs: event === "afterDelete" ? [] : [article("After")] });
  state.pending.forEach(callback => callback());
  expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_CONTENT_TAG, { expire: 0 });
  expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
  expect((await getArticle("guide"))?.title).toBe(event === "afterDelete" ? undefined : "After");
});
it("preserves existing CMS hooks when adding global invalidation", () => {
  const previous = vi.fn();
  const global = withPublicGlobalCache({ slug: "website-settings", fields: [], hooks: { afterChange: [previous] } });
  expect(global.hooks!.afterChange![0]).toBe(previous);
  global.hooks!.afterChange!.at(-1)!(args()); state.pending.forEach(callback => callback());
  expect(revalidateTag).toHaveBeenCalledTimes(1);
});
it("does not persist a temporary database failure as missing content", async () => {
  state.cms.find.mockRejectedValueOnce(new Error("Temporary database outage"));
  expect(await getArticle("guide")).toBeUndefined();
  state.cms.find.mockResolvedValue({ docs: [article("Recovered")] });
  expect((await getArticle("guide"))?.title).toBe("Recovered");
});
it("does not expose drafts after the cache is cleared", async () => {
  state.cms.find.mockResolvedValue({ docs: [{ ...article("Private"), _status: "draft" }] });
  expect(await getArticle("guide")).toBeUndefined();
});
