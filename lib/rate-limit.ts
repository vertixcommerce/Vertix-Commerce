import { createHash } from "node:crypto";
type Entry = { count: number; reset: number };
const buckets = new Map<string, Entry>();
let lastSweep = 0;
let lastFallbackWarning = 0;
const incrementScript = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n";
const reserveScript = "local n=tonumber(redis.call('GET',KEYS[1]) or '0'); local amount=tonumber(ARGV[1]); if n+amount>tonumber(ARGV[2]) then return 0 end; redis.call('INCRBY',KEYS[1],amount); redis.call('PEXPIRE',KEYS[1],ARGV[3]); return 1";
async function redis(command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || new URL(url).protocol !== "https:") throw new Error("Shared protection is not configured");
  const response = await fetch(url, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(command), signal: AbortSignal.timeout(3000), cache: "no-store" });
  if (!response.ok) throw new Error("Shared protection failed");
  const data = await response.json(); if (data.error || typeof data.result !== "number") throw new Error("Invalid protection response");
  return data.result as number;
}
function allowLocalRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (now - lastSweep > 60000) { for (const [stored, item] of buckets) if (item.reset <= now) buckets.delete(stored); lastSweep = now; }
  const item = buckets.get(key);
  if (!item || item.reset <= now) { if (buckets.size >= 10000 && !item) return false; buckets.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (item.count >= limit) return false; item.count++; return true;
}
export async function allowRequest(key: string, limit = 12, windowMs = 60000, options: { localFallback?: boolean } = {}) {
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await redis(["EVAL", incrementScript, 1, "vx:rate:" + createHash("sha256").update(key).digest("hex"), windowMs]) <= limit;
    } catch (error) {
      if (!options.localFallback) throw error;
      const now = Date.now();
      if (now - lastFallbackWarning > 300000) {
        // Never include request keys, credentials, or customer data in this operational warning.
        console.warn("Upstash rate limiting unavailable; using bounded per-instance fallback for inquiry submissions.");
        lastFallbackWarning = now;
      }
    }
  } else if (process.env.NODE_ENV === "production" && !options.localFallback) {
    throw new Error("Shared protection required in production");
  } else if (process.env.NODE_ENV === "production" && options.localFallback) {
    const now = Date.now();
    if (now - lastFallbackWarning > 300000) {
      console.warn("Upstash rate limiting is not configured; using bounded per-instance fallback for inquiry submissions.");
      lastFallbackWarning = now;
    }
  }
  return allowLocalRequest(key, limit, windowMs);
}
export async function reserveMonthlyTokens(budget: number, amount = 4096) {
  if (!budget) return true;
  const now = new Date(); const period = now.toISOString().slice(0, 7);
  const expires = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - now.getTime();
  return await redis(["EVAL", reserveScript, 1, "vx:ai-budget:" + period, amount, budget, expires]) === 1;
}
