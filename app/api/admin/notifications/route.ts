import { NextRequest, NextResponse } from "next/server";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { boundedJSON, sameOrigin } from "@/lib/request-security";
import { notifyLead } from "@/lib/lead-notifications";
import { allowRequest } from "@/lib/rate-limit";
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  try {
    const { payload } = await getRuntimeSettings();
    const { user } = await payload.auth({ headers: request.headers });
    if (!user?.roles.some(role => ["owner", "administrator", "sales"].includes(role))) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    if (!await allowRequest("notification-retry:" + user.id, 5, 600000)) return NextResponse.json({ error: "Too many retry attempts. Try again later." }, { status: 429 });
    const data = await boundedJSON(request, 1000);
    if (!data || typeof data !== "object" || !("id" in data) || typeof data.id !== "number") return NextResponse.json({ error: "Invalid inquiry reference." }, { status: 400 });
    const lead = await payload.findByID({ collection: "leads", id: data.id, overrideAccess: false, user });
    if (!lead.consent || lead.notificationStatus === "sent") return NextResponse.json({ error: "This inquiry cannot be notified again." }, { status: 409 });
    return NextResponse.json({ status: await notifyLead(payload, lead) });
  } catch { return NextResponse.json({ error: "Notification could not be retried." }, { status: 503 }); }
}
