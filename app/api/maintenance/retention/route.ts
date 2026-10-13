import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { expirePrivateRecords } from "@/lib/retention";
function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return false;
  const expected = Buffer.from("Bearer " + secret), provided = Buffer.from(request.headers.get("authorization") || "");
  return provided.length === expected.length && timingSafeEqual(expected, provided);
}
async function run(request: NextRequest, dryRun: boolean) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const settings = await getRuntimeSettings();
    if (!dryRun && !settings.website.retentionCleanupEnabled) return NextResponse.json({ error: "Retention deletion is not enabled by the business." }, { status: 409 });
    return NextResponse.json({ dryRun, expired: await expirePrivateRecords(settings.payload, dryRun) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Retention processing failed." }, { status: 503 }); }
}
export const GET = (request: NextRequest) => run(request, true);
export const POST = (request: NextRequest) => run(request, false);
