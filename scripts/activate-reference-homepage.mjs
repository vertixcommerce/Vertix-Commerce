import assert from "node:assert/strict";
import { config } from "dotenv";
import { referenceDefaults } from "../lib/reference-homepage.ts";

// Explicit local implementation step, not an automatic seed or production deploy.
config({path:".env.local",quiet:true});
const origin = new URL(process.env.ADMIN_TEST_URL || "http://localhost:3000");
assert(["localhost","127.0.0.1"].includes(origin.hostname), "Activation is local-only.");
assert(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD, "Local admin credentials required.");
const login = await fetch(new URL("/api/users/login",origin), {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD})});
assert.equal(login.status,200,"Login failed; do not retry a locked account.");
const cookie = login.headers.getSetCookie().map(value=>value.split(";")[0]).join("; ");
assert(cookie.includes("payload-token="));
async function read() {
  const response = await fetch(new URL("/api/globals/website-settings?depth=0",origin), {headers:{Cookie:cookie},signal:AbortSignal.timeout(60000)});
  assert.equal(response.status,200); return response.json();
}
const before = await read();
const current = before.referenceHomepage || {};
const initialize = process.argv.includes("--initialize-empty-sections");
const arrays = Object.fromEntries(Object.entries(referenceDefaults).map(([key,value])=>[key,initialize && !current[key]?.length ? value : current[key] ?? value]));
const response = await fetch(new URL("/api/globals/website-settings",origin), {method:"POST",signal:AbortSignal.timeout(60000),headers:{Cookie:cookie,"Content-Type":"application/json"},body:JSON.stringify({homepageLayoutMode:"reference",referenceHomepage:{...current,...arrays}})});
assert.equal(response.status,200,"Could not save reference layout.");
const after = await read();
assert.equal(after.homepageLayoutMode,"reference");
for (const key of ["homepageSections","heroMedia","heroButtons","socialLinks","contactEmail","whatsappNumber","bookingURL","privacyText","privacyApproved","leadNotificationEmail"]) assert.deepEqual(after[key],before[key],`Unrelated setting changed: ${key}`);
console.log(`Screenshot-style homepage activated. Previous layout: ${before.homepageLayoutMode}. Existing custom sections, images, contact, social and privacy settings preserved.`);
