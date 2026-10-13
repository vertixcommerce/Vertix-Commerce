import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
const origin = new URL(process.env.ADMIN_TEST_URL || "http://localhost:3000");
assert(["localhost", "127.0.0.1"].includes(origin.hostname), "Editorial checks are local-only.");
assert(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD, "Local admin credentials are required.");
let cookie = "", fixtureID, checks = 0;
const slug = `editorial-qa-${randomBytes(6).toString("hex")}`;
const title = `Fictional editorial QA ${slug}`;
const body = "Fictional QA article body, not business content.";
const content = { root: { type: "root", version: 1, format: "", indent: 0, direction: null, children: [{ type: "paragraph", version: 1, format: "", indent: 0, direction: null, children: [{ type: "text", text: body, version: 1, detail: 0, format: 0, mode: "normal", style: "" }] }] } };
async function request(path, { anonymous = false, method = "GET", data } = {}) {
  return fetch(new URL(path, origin), { method, redirect: "manual", signal: AbortSignal.timeout(60000), headers: { ...(!anonymous && cookie ? { Cookie: cookie } : {}), ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
}
function passed(label) { checks++; console.log(`PASS ${label}`); }
async function publicPage(path, status, expected) {
  const response = await request(path, { anonymous: true });
  assert.equal(response.status, status, `Unexpected status for ${path}`);
  if (expected) assert((await response.text()).includes(expected), `Missing public content: ${path}`);
}
try {
  const login = await request("/api/users/login", { method: "POST", data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
  assert.equal(login.status, 200, "Login failed; check credentials without repeated retries.");
  cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  assert(cookie.includes("payload-token="));
  passed("local authenticated setup");
  await publicPage("/about", 200, "Who we are");
  passed("public About hero and introduction card");
  const create = await request("/api/articles", { method: "POST", data: { title, slug, excerpt: "Fictional QA summary.", content, status: "draft", _status: "draft" } });
  assert.equal(create.status, 201);
  fixtureID = (await create.json()).doc.id;
  await publicPage(`/blogs/${slug}`, 404);
  const privateDraft = await request(`/api/articles/${fixtureID}`, { anonymous: true });
  assert([403, 404].includes(privateDraft.status));
  passed("draft is hidden from public page and anonymous API");
  const publish = await request(`/api/articles/${fixtureID}`, { method: "PATCH", data: { status: "published", _status: "published" } });
  assert.equal(publish.status, 200);
  assert((await publish.json()).doc.publishedAt, "First publication must set its date.");
  await publicPage("/blogs", 200, title);
  await publicPage(`/blogs/${slug}`, 200, body);
  passed("published article appears in grid and full article route");
  const editedTitle = `${title} edited`;
  const edit = await request(`/api/articles/${fixtureID}`, { method: "PATCH", data: { title: editedTitle } });
  assert.equal(edit.status, 200);
  await publicPage(`/blogs/${slug}`, 200, editedTitle);
  passed("admin article edits appear without rebuilding");
  const blocked = await request(`/api/articles/${fixtureID}`, { anonymous: true, method: "PATCH", data: { title: "Unauthorized edit" } });
  assert([401, 403].includes(blocked.status));
  passed("anonymous article mutation rejected");
  await publicPage("/blogs/no-such-editorial-qa-article", 404);
  await publicPage("/blogs?page=999999", 404);
  passed("unknown article and out-of-range pagination return 404");
  console.log(`Editorial HTTP checks passed: ${checks}`);
} finally {
  if (fixtureID !== undefined) {
    // Exact ID created by this local run only; existing articles are never deleted.
    const cleanup = await request(`/api/articles/${fixtureID}`, { method: "DELETE" });
    assert.equal(cleanup.status, 200, `Remove temporary QA article ${fixtureID} manually; cleanup failed.`);
    console.log("Removed the temporary fictional QA article.");
  }
}
