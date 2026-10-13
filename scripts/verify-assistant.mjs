import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
const origin = new URL(process.env.PUBLIC_TEST_URL || "http://localhost:3000");
assert(["localhost", "127.0.0.1"].includes(origin.hostname), "Local server only.");
assert(!process.env.GEMINI_API_KEY && !process.env.RESEND_API_KEY, "Run this offline fixture check only without provider keys, to avoid external transmissions.");
assert(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD, "Local owner credentials required.");
let checks = 0, ownerCookie = "", visitorCookie = "", leadID;
const marker = "Vertix fictional assistant QA " + randomUUID();
const passed = label => { checks++; console.log("PASS " + label); };
async function request(path, method = "GET", data, cookie = "") {
  return fetch(new URL(path, origin), { method, headers: { ...(cookie ? { cookie } : {}), ...(data ? { "content-type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}), redirect: "manual", signal: AbortSignal.timeout(30000) });
}
const cookies = response => response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
try {
  const login = await request("/api/users/login", "POST", { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  assert.equal(login.status, 200, "Owner login failed; do not repeatedly retry."); ownerCookie = cookies(login);
  const bootstrap = await request("/api/assistant"); assert.equal(bootstrap.status, 200); visitorCookie = cookies(bootstrap);
  const initial = await bootstrap.json(); assert(initial.config.enabled && initial.config.allowLeadCapture, "Enable the assistant and lead capture before testing.");
  assert.equal(initial.stored, false); assert(!JSON.stringify(initial).includes("instructions"));
  passed("public assistant configuration excludes private instructions and defaults to no storage");
  const handoff = await request("/api/chat", "POST", { message: marker, action: "handoff", storeConversation: true, locale: "de" }, visitorCookie);
  assert.equal(handoff.status, 200); assert.equal((await handoff.json()).stored, true);
  const own = await request("/api/assistant", "GET", undefined, visitorCookie); const stored = await own.json();
  assert.equal(stored.stored, true); assert(stored.messages.some(item => item.content.includes("Vertix fictional assistant QA")));
  const other = await (await request("/api/assistant")).json(); assert.equal(other.stored, false); assert.equal(other.messages.length, 0);
  passed("consented chat stored with cookie ownership isolation");
  const conversations = await (await request("/api/conversations?limit=100", "GET", undefined, ownerCookie)).json();
  const conversation = conversations.docs.find(doc => doc.messages?.some(item => item.content.includes("Vertix fictional assistant QA") && item.content.includes(marker.slice(-12))));
  assert(conversation && conversation.storageConsent, "Own QA conversation not found.");
  assert(Date.parse(conversation.retentionExpiresAt) > Date.now());
  const reply = "Fictional QA staff reply. No business availability is implied.";
  const save = await request("/api/conversations/" + conversation.id, "PATCH", { replyToVisitor: reply, storageConsent: false, sessionId: "forged" }, ownerCookie);
  assert.equal(save.status, 200, "Staff reply failed.");
  const polled = await (await request("/api/assistant", "GET", undefined, visitorCookie)).json();
  assert.equal(polled.mode, "human"); assert(polled.messages.some(item => item.role === "human" && item.content === reply));
  passed("staff reply delivery and immutable consent/reference protection");
  const paused = await request("/api/chat", "POST", { message: "QA follow-up", storeConversation: false }, visitorCookie);
  assert.equal((await paused.json()).reason, "human_mode"); passed("human ownership pauses AI even without future storage consent");
  assert.equal((await request("/api/assistant", "DELETE", undefined, visitorCookie)).status, 200); visitorCookie = "";
  assert.equal((await request("/api/conversations/" + conversation.id, "GET", undefined, ownerCookie)).status, 404);
  passed("visitor deletes only their own stored conversation");

  const page = await (await request("/")).text();
  const service = page.match(/href="\/services\/([^"?#]+)"/)?.[1]; assert(service, "No published service available.");
  const body = { name: "Vertix Local QA Test", email: "vertix-local-qa@example.invalid", whatsapp: "+1 202 555 0100", country: "Germany", service, requirements: marker, source: "assistant", consent: true, idempotencyKey: randomUUID() };
  const lead = await request("/api/leads", "POST", body); assert.equal(lead.status, 200, "Inquiry failed; a local rate bucket may need to expire."); leadID = (await lead.json()).id;
  const duplicate = await request("/api/leads", "POST", body); assert.equal(duplicate.status, 200); assert.equal((await duplicate.json()).id, leadID);
  passed("assistant lead capture is consented and retry-idempotent");
  const persisted = await (await request("/api/leads/" + leadID, "GET", undefined, ownerCookie)).json();
  assert.equal(persisted.source, "assistant"); assert.equal(persisted.consent, true); assert.equal(persisted.notificationStatus, "not-configured");
  assert(Date.parse(persisted.retentionExpiresAt) > Date.now());
  assert([403, 404].includes((await request("/api/leads/" + leadID)).status));
  assert.equal((await request("/api/leads/" + leadID, "PATCH", { leadStatus: "qualified", consent: false, source: "website" }, ownerCookie)).status, 200);
  const qualified = await (await request("/api/leads/" + leadID, "GET", undefined, ownerCookie)).json();
  assert.equal(qualified.consent, true); assert.equal(qualified.source, "assistant");
  passed("lead privacy, retention, delivery status and qualification save");
  const retry = await request("/api/admin/notifications", "POST", { id: leadID }, ownerCookie);
  assert.equal(retry.status, 200); assert.equal((await retry.json()).status, "not-configured");
  assert.equal((await request("/api/admin/notifications", "POST", { id: leadID })).status, 403);
  passed("authenticated notification retry and anonymous rejection");
  assert.equal((await request("/api/users/forgot-password", "POST", { email: "qa@example.invalid" })).status, 503);
  passed("unconfigured password recovery fails honestly without generating a token");
  assert.equal((await request("/api/maintenance/retention")).status, 401);
  passed("retention maintenance rejects unauthenticated callers");
  console.log("Assistant integration checks passed: " + checks);
} catch (error) { console.error(error instanceof Error ? error.message : "Assistant verification failed."); process.exitCode = 1; }
finally {
  if (visitorCookie) {
    try { assert.equal((await request("/api/assistant", "DELETE", undefined, visitorCookie)).status, 200); }
    catch { console.error("QA conversation cleanup failed."); process.exitCode = 1; }
  }
  if (leadID) {
    try {
      const lead = await (await request("/api/leads/" + leadID, "GET", undefined, ownerCookie)).json();
      assert.equal(lead.email, "vertix-local-qa@example.invalid"); assert.equal(lead.requirements, marker);
      assert.equal((await request("/api/leads/" + leadID, "DELETE", undefined, ownerCookie)).status, 200);
      console.log("PASS removed only the identified fictional QA inquiry");
    } catch { console.error("QA inquiry cleanup failed."); process.exitCode = 1; }
  }
}
