import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { config } from "dotenv";

// Local HTTP smoke checks: no provider calls, emails, or customer records created.
config({ path: ".env.local", quiet: true });
const origin = new URL(process.env.PUBLIC_TEST_URL || "http://localhost:3000");
assert(["localhost", "127.0.0.1"].includes(origin.hostname), "Local server only.");
let checks = 0;
const passed = label => { checks++; console.log(`PASS ${label}`); };
async function request(path, { method = "GET", body, cookie, client = "public-qa" } = {}) {
  return fetch(new URL(path, origin), {
    method, redirect: "manual", signal: AbortSignal.timeout(30000),
    headers: { "x-forwarded-for": client, ...(body !== undefined ? { "content-type": "application/json" } : {}), ...(cookie ? { cookie } : {}) },
    ...(body !== undefined ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
  });
}

try {
  let homepage = "";
  for (const [path, text] of [["/", "Services built around your business"], ["/contact", "Send inquiry"], ["/contact?intent=meeting", "Send inquiry"]]) {
    const response = await request(path);
    assert.equal(response.status, 200, `Page failed: ${path}`);
    const html = await response.text();
    assert(html.includes(text), `Page content missing: ${path}`);
    if (path === "/") homepage = html;
    passed(path);
  }
  const servicePaths = [...new Set([...homepage.matchAll(/href="(\/services\/[^"?#]+)"/g)].map(match => match[1]))];
  assert(servicePaths.length, "No published service links were available to check.");
  for (const path of servicePaths) {
    const response = await request(path);
    assert.equal(response.status, 200, `Published service failed: ${path}`);
    assert((await response.text()).includes("Discuss this service"));
    passed(path);
  }
  assert.equal((await request("/services/vertix-qa-definitely-missing-service")).status, 404);
  passed("unknown service returns 404");

  const suffix = randomBytes(8).toString("hex");
  for (const route of ["chat", "leads"]) {
    const client = `local-qa-${route}-${suffix}`;
    assert.equal((await request(`/api/${route}`, { method: "POST", body: "{", client })).status, 400);
    assert.equal((await request(`/api/${route}`, { method: "POST", body: {}, client })).status, 400);
    passed(`${route} rejects malformed JSON and invalid input`);
    // Bursting a shared local bucket would also throttle the user's browser.
    // Default runs are non-disruptive; deterministic limits are unit-tested.
    if (process.env.PUBLIC_TEST_RATE_LIMITS === "1") {
      const budget = route === "chat" ? 12 : 4;
      for (let index = 2; index < budget; index++) {
        assert.equal((await request(`/api/${route}`, { method: "POST", body: {}, client })).status, 400);
      }
      assert.equal((await request(`/api/${route}`, { method: "POST", body: {}, client })).status, 429);
      passed(`${route} rate limit returns 429`);
    }
  }
  for (const locale of ["en", "de"]) {
    const response = await request("/api/chat", { method: "POST", client: `safe-qa-${suffix}`, body: { message: locale === "de" ? "Mein eBay-Passwort" : "Should I share my eBay password?", locale, history: [] } });
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.escalate, true);
    assert(data.message.includes(locale === "de" ? "keine Passwörter" : "do not send passwords"));
    passed(`${locale} credential safety response`);
  }
  // An optional fixture ID comes only from an inquiry just submitted in browser QA.
  // Check identity before deletion; never touch any other lead.
  const fixtureID = process.env.PUBLIC_QA_LEAD_ID;
  if (fixtureID) {
    assert(/^\d+$/.test(fixtureID));
    assert(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD, "Local admin credentials required.");
    const login = await request("/api/users/login", { method: "POST", body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
    assert.equal(login.status, 200, "Local admin login failed; do not repeatedly retry.");
    const cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    const path = `/api/leads/${fixtureID}`;
    const response = await request(path, { cookie });
    assert.equal(response.status, 200);
    const lead = await response.json();
    assert.equal(lead.name, "Vertix Local QA Test", "Refusing to remove a non-QA record.");
    assert.equal(lead.email, "vertix-local-qa@example.invalid", "Refusing to remove a non-QA record.");
    try {
      assert.equal(lead.consent, true);
      assert(Number.isFinite(Date.parse(lead.consentedAt)));
      assert(Date.parse(lead.retentionExpiresAt) > Date.now());
      assert.equal(lead.notificationStatus, "not-configured");
      const anonymous = await request(path);
      assert([403, 404].includes(anonymous.status), "Anonymous lead details were exposed.");
      passed("browser inquiry persisted with consent, retention, delivery status, and private access");
    } finally {
      assert.equal((await request(path, { method: "DELETE", cookie })).status, 200, "QA inquiry cleanup failed.");
      passed("removed only the identified fictional QA inquiry");
    }
  }
  console.log(`Public integration checks passed: ${checks}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Public verification failed.");
  process.exitCode = 1;
}
