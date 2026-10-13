import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { config } from "dotenv";

// Explicit, local-only integration check. Credentials and cookies are never logged.
config({ path: ".env.local", quiet: true });
const origin = new URL(process.env.ADMIN_TEST_URL || "http://localhost:3000");
assert(["localhost", "127.0.0.1"].includes(origin.hostname), "Run this check against a local development server only.");
assert(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD, "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.");
let checks = 0;
let ownerCookie = "";
const fixtures = [];
async function request(path, { cookie = ownerCookie, method = "GET", data } = {}) {
  return fetch(new URL(path, origin), {
    method, redirect: "manual", signal: AbortSignal.timeout(60000),
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(data ? { "Content-Type": "application/json" } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
}
async function login(email, password) {
  const response = await request("/api/users/login", { cookie: "", method: "POST", data: { email, password } });
  assert.equal(response.status, 200, "Login failed. Check local credentials; do not repeatedly retry a locked account.");
  const cookie = response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  assert(cookie.includes("payload-token="), "Login did not issue the authentication cookie.");
  const { user } = await response.json();
  return { cookie, user };
}
function passed(label) { checks++; console.log(`PASS ${label}`); }
async function page(path, expected) {
  const response = await request(path);
  assert.equal(response.status, 200, `Screen failed: ${path}`);
  const html = await response.text();
  assert(html.includes(expected), `Expected screen content missing: ${path}`);
  assert(!html.includes("NEXT_HTTP_ERROR_FALLBACK;500") && !html.includes("PayloadComponent not found"), `Server-rendering error: ${path}`);
  passed(path);
  return html;
}
async function create(collection, data) {
  const response = await request(`/api/${collection}`, { method: "POST", data });
  assert.equal(response.status, 201, `Could not create temporary ${collection} fixture.`);
  const { doc } = await response.json();
  fixtures.unshift({ collection, id: doc.id });
  return doc;
}

try {
  const loginResult = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  ownerCookie = loginResult.cookie;
  assert(loginResult.user.roles.includes("owner"), "This integration check requires a local owner account.");
  passed("cookie-based owner login");
  const dashboardHTML = await page("/admin", "Manage your workspace");
  assert(dashboardHTML.includes("vx-sidebar-links") && dashboardHTML.includes("vx-sidebar-group"), "Custom graphical navigation was not rendered.");
  const stylesheetPaths = [...dashboardHTML.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => /\brel="stylesheet"/.test(tag) ? tag.match(/\bhref="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&") : undefined)
    .filter(Boolean);
  assert(stylesheetPaths.length, "Admin did not deliver any stylesheet links.");
  const stylesheets = await Promise.all(stylesheetPaths.map(async path => {
    const url = new URL(path, origin);
    assert.equal(url.origin, origin.origin, "Admin stylesheet must be served locally.");
    const response = await request(url.href);
    assert.equal(response.status, 200, "Admin stylesheet request failed.");
    return response.text();
  }));
  const styles = stylesheets.join("\n");
  assert(styles.includes(".template-default") && styles.includes(".nav__scroll"), "Payload base admin styles are missing.");
  assert(styles.includes(".vx-sidebar-group") && styles.includes(".vx-sidebar-link"), "Custom sidebar styles are missing.");
  passed("base admin CSS and graphical sidebar delivered");
  for (const [slug, title, canCreate] of [
    ["articles", "Blog articles", true],
    ["media", "Media library", true],
    ["services", "Services", true], ["service-categories", "Service menu categories", true],
    ["countries", "Countries", true], ["faqs", "Frequently asked questions", true],
    ["knowledge", "Knowledge base", true], ["leads", "Customer inquiries", false],
    ["conversations", "Conversations", false], ["users", "Team members", true],
  ]) {
    await page(`/admin/collections/${slug}`, title);
    if (canCreate) await page(`/admin/collections/${slug}/create`, "field-type");
  }
  await page("/admin/globals/website-settings", "Brand &amp; homepage");
  await page("/admin/globals/about-page", "Hero &amp; meeting");
  await page("/admin/globals/assistant-settings", "Availability");
  await page("/admin/account", "Full name");
  for (const [path, expected] of [["/admin/login", "Sign in"], ["/admin/forgot", "Forgot"], ["/admin/reset/invalid-test-token", "password"]]) {
    const response = await request(path, { cookie: "" });
    const html = await response.text();
    assert.equal(response.status, 200, `Authentication screen failed: ${path}`);
    assert(html.toLowerCase().includes(expected.toLowerCase()), `Missing authentication screen: ${path}`);
    passed(path);
  }
  const protectedResponse = await request("/admin", { cookie: "" });
  if ([302, 303, 307].includes(protectedResponse.status)) {
    assert(protectedResponse.headers.get("location")?.includes("/admin/login"), "Anonymous dashboard access should require login.");
  } else {
    // Next streams a redirect as HTTP 200 when rendering has already started.
    const html = await protectedResponse.text();
    assert.equal(protectedResponse.status, 200);
    assert(html.includes("/admin/login") && html.includes("NEXT_REDIRECT"), "Anonymous dashboard access should redirect to login.");
    assert(!html.includes("Manage your workspace"), "Anonymous dashboard exposed private content.");
  }
  passed("anonymous dashboard protection");

  const suffix = randomBytes(6).toString("hex");
  const category = await create("service-categories", { name: "Admin QA temporary category", slug: `admin-qa-${suffix}`, enabled: false, displayOrder: 9999 });
  const service = await create("services", { name: "Admin QA temporary service", slug: `admin-qa-service-${suffix}`, category: category.id, shortDescription: "Temporary unpublished fixture used only to verify admin editing.", status: "draft", _status: "draft", navigationVisible: false, featured: false });
  await page(`/admin/collections/services/${service.id}`, "Page content");
  const save = await request(`/api/services/${service.id}`, { method: "PATCH", data: { name: "Admin QA updated service", shortDescription: "The update round trip succeeded.", _status: "draft" } });
  assert.equal(save.status, 200, "Service update failed.");
  const saved = await request(`/api/services/${service.id}?draft=true`);
  assert.equal((await saved.json()).name, "Admin QA updated service", "Service update did not persist.");
  passed("service create, edit, and persisted draft round trip");
  assert([403, 404].includes((await request(`/api/services/${service.id}?draft=true`, { cookie: "" })).status), "Anonymous draft service leaked.");
  assert.equal((await request("/api/knowledge", { cookie: "" })).status, 403, "Anonymous knowledge library leaked.");
  passed("draft service and full knowledge library private API access");

  async function updateFixture(collection, id, data) {
    assert.equal((await request(`/api/${collection}/${id}`, { method: "PATCH", data })).status, 200, `Could not update menu QA ${collection}.`);
  }
  async function publicMenuIncludes(expected) {
    const response = await request("/", { cookie: "" });
    assert.equal(response.status, 200);
    return (await response.text()).includes(expected);
  }
  const menuHref = `href="/services/${service.slug}"`;
  await updateFixture("service-categories", category.id, { enabled: true, name: "Admin QA renamed heading" });
  await updateFixture("services", service.id, { navigationVisible: true, status: "published", _status: "published" });
  await updateFixture("services", service.id, { benefits: [{ text: "QA service benefit fixture" }], processSteps: [{ title: "QA process fixture", description: "Fictional QA process details." }], fullDescription: { root: { type: "root", version: 1, format: "", indent: 0, direction: null, children: [{ type: "paragraph", version: 1, format: "", indent: 0, direction: null, children: [{ type: "text", version: 1, detail: 0, format: 0, mode: "normal", style: "", text: "QA detailed service content fixture" }] }] } }, _status: "published" });
  const serviceHTML = await (await request(`/services/${service.slug}`, { cookie: "" })).text();
  for (const text of ["QA service benefit fixture", "QA process fixture", "QA detailed service content fixture"]) assert(serviceHTML.includes(text), "CMS service detail field was not rendered.");
  const faq = await create("faqs", { question: "Admin QA fictional FAQ fixture", answer: "Fictional QA answer, not business policy.", locale: "en", status: "published", assistantApproved: false });
  const country = await create("countries", { name: "Admin QA fictional market", slug: `qa-market-${suffix}`, locale: "en", introduction: "Fictional QA market content.", status: "published", _status: "published", services: [service.id], ctaURL: "javascript:alert(1)" });
  const dynamicHome = await (await request("/", { cookie: "" })).text();
  const homepageSettings = await (await request("/api/globals/website-settings?depth=0")).json();
  assert(dynamicHome.includes(faq.question), "Published CMS FAQ was not reflected publicly.");
  if (homepageSettings.homepageLayoutMode === "reference") {
    // Reference market cards are explicitly selected in the homepage editor.
    assert(!dynamicHome.includes(country.name), "An unselected QA country was automatically added to the reference homepage.");
    if (homepageSettings.referenceHomepage?.marketsEnabled !== false) for (const market of homepageSettings.referenceHomepage?.markets || []) assert(dynamicHome.includes(market.title), "Saved reference market was not rendered.");
  } else assert(dynamicHome.includes(country.name), "Published CMS country was not reflected in the standard homepage.");
  const countryResponse = await request(`/countries/${country.slug}`, { cookie: "" }); assert.equal(countryResponse.status, 200);
  const countryHTML = await countryResponse.text(); assert(countryHTML.includes(country.introduction)); assert(!countryHTML.includes('href="javascript:'));
  assert(countryHTML.includes(`/services/${service.slug}`));
  passed("CMS detailed service, benefits, process, FAQ and country rendering with safe links");
  assert(await publicMenuIncludes(menuHref), "Published QA service did not appear in the menu.");
  assert(await publicMenuIncludes("Admin QA renamed heading"), "Renamed category heading did not appear.");
  await updateFixture("services", service.id, { name: "Admin QA renamed menu service", _status: "published" });
  assert(await publicMenuIncludes("Admin QA renamed menu service"), "Renamed service did not appear.");
  await updateFixture("services", service.id, { navigationVisible: false, _status: "published" });
  assert(!(await publicMenuIncludes(menuHref)), "Hidden QA service remained in the menu.");
  assert.equal((await request(`/services/${service.slug}`, { cookie: "" })).status, 200, "Hiding a menu item also removed its page.");
  await updateFixture("services", service.id, { navigationVisible: true, _status: "published" });
  await updateFixture("service-categories", category.id, { enabled: false });
  assert(!(await publicMenuIncludes(menuHref)), "Disabled category remained in the menu.");
  passed("published menu edits, category/service renaming, hide link, and disable category without rebuilding");

  const viewer = await create("users", { email: `admin-qa-${suffix}@example.invalid`, password: randomBytes(24).toString("hex"), displayName: "Admin QA viewer", roles: ["viewer"] });
  // Assign a random password known only in memory so the fixture can exercise ACLs.
  const viewerPassword = randomBytes(24).toString("hex");
  assert.equal((await request(`/api/users/${viewer.id}`, { method: "PATCH", data: { password: viewerPassword } })).status, 200);
  const viewerLogin = await login(viewer.email, viewerPassword);
  for (const slug of ["leads", "conversations"]) {
    const response = await request(`/api/${slug}`, { cookie: viewerLogin.cookie });
    // /api/leads is the public submission-only route and rejects GET with 405.
    assert([403, 405].includes(response.status), `Viewer accessed ${slug}.`);
  }
  const viewerDashboard = await request("/admin", { cookie: viewerLogin.cookie });
  assert.equal(viewerDashboard.status, 200);
  const viewerHTML = await viewerDashboard.text();
  assert(!viewerHTML.includes('href="/admin/collections/leads"') && !viewerHTML.includes('href="/admin/collections/conversations"'), "Dashboard showed restricted customer links.");
  const other = await request(`/api/users/${loginResult.user.id}`, { cookie: viewerLogin.cookie });
  assert([403, 404].includes(other.status), "Viewer accessed another team account.");
  const promote = await request(`/api/users/${viewer.id}`, { cookie: viewerLogin.cookie, method: "PATCH", data: { roles: ["owner"] } });
  assert([200, 403].includes(promote.status), "Unexpected role update response.");
  const me = await request("/api/users/me", { cookie: viewerLogin.cookie });
  assert.deepEqual((await me.json()).user.roles, ["viewer"], "Viewer could promote themselves.");
  const ownSave = await request(`/api/users/${viewer.id}`, { cookie: viewerLogin.cookie, method: "PATCH", data: { displayName: "Admin QA viewer updated" } });
  assert.equal(ownSave.status, 200, "Viewer could not update their own account.");
  const blockedSave = await request(`/api/services/${service.id}`, { cookie: viewerLogin.cookie, method: "PATCH", data: { name: "Should not save" } });
  assert.equal(blockedSave.status, 403, "Viewer could edit website content.");
  passed("viewer account editing, no privilege escalation, and restricted customer/content access");
  console.log(`Admin integration checks passed: ${checks}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Admin verification failed.");
  process.exitCode = 1;
} finally {
  // Remove only records created by this script, never existing user data.
  for (const fixture of fixtures) {
    try {
      const response = await request(`/api/${fixture.collection}/${fixture.id}`, { method: "DELETE" });
      assert.equal(response.status, 200);
    } catch { console.error(`Temporary QA cleanup failed for ${fixture.collection} ID ${fixture.id}.`); process.exitCode = 1; }
  }
}
