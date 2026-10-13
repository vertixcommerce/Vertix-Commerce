import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ find: vi.fn(), get: vi.fn() }));
vi.mock("payload", () => ({ getPayload: mocks.get }));
vi.mock("@payload-config", () => ({ default: {} }));
import { rankApprovedKnowledge, retrieveApprovedKnowledge } from "@/lib/knowledge-repository";
const article = { id: 1, title: "Service scope", content: "Approved marketplace service details.", locale: "en", tags: [], approved: true, status: "published", _status: "published" };
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("DATABASE_URL", "file:test.db"); mocks.get.mockResolvedValue({ find: mocks.find }); mocks.find.mockImplementation(({ collection }) => Promise.resolve({ docs: collection === "knowledge" ? [article] : [] })); });
afterEach(() => vi.unstubAllEnvs());
describe("approved CMS retrieval", () => {
  it("retrieves approved, published content and requests approval filters", async () => {
    const docs = await retrieveApprovedKnowledge("marketplace", "en");
    expect(docs).toHaveLength(1); expect(docs[0].body).toBe(article.content);
    expect(JSON.stringify(mocks.find.mock.calls)).toContain('"assistantApproved":{"equals":true}');
    expect(JSON.stringify(mocks.find.mock.calls)).toContain('"_status":{"equals":"published"}');
  });
  it.each([{ approved: false }, { status: "draft" }, { _status: "draft" }, { locale: "de" }])("defensively excludes incompatible documents %j", async fields => {
    mocks.find.mockResolvedValue({ docs: [{ ...article, ...fields }] });
    expect(await retrieveApprovedKnowledge("marketplace", "en")).toEqual([]);
  });
  it("does not translate English business claims into unapproved German answers", async () => {
    expect(await retrieveApprovedKnowledge("marketplace", "de")).toEqual([]);
  });
  it("uses approved German text and Unicode terms", async () => {
    mocks.find.mockImplementation(({ collection }) => Promise.resolve({ docs: collection === "knowledge" ? [{ ...article, locale: "de", title: "Händler", content: "Freigegebene Händler-Beratung." }] : [] }));
    expect((await retrieveApprovedKnowledge("Händler", "de"))[0].locale).toBe("de");
  });
  it("returns no hardcoded or stale business claims on storage failure", async () => {
    mocks.find.mockRejectedValue(new Error("Private database diagnostic"));
    expect(await retrieveApprovedKnowledge("eBay", "en")).toEqual([]);
    vi.stubEnv("DATABASE_URL", ""); expect(await retrieveApprovedKnowledge("eBay", "en")).toEqual([]);
  });
  it("ranks only approved, relevant articles", () => {
    const base = { id: "a", title: "Scope", body: "marketplace", locale: "en" as const, tags: [], approved: true };
    expect(rankApprovedKnowledge([base, { ...base, id: "b", approved: false }, { ...base, id: "c", body: "unrelated" }], "marketplace").map(doc => doc.id)).toEqual(["a"]);
  });
});
