import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { boundedPayloadJSON, publicGuard } from "@/lib/request-security";
export async function POST(request: NextRequest) {
  const rejected = await publicGuard(request, "password-recovery", 3, 600000);
  if (rejected) return rejected;
  let body: unknown;
  try { body = await boundedPayloadJSON(request, 2000); }
  catch { return NextResponse.json({ errors: [{ message: "Invalid request." }] }, { status: 400 }); }
  const parsed = z.object({ email: z.string().trim().email().max(180) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: [{ message: "Enter a valid email address." }] }, { status: 400 });
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL_ADDRESS) return NextResponse.json({ errors: [{ message: "Password recovery email is not configured. Contact your site owner for help." }] }, { status: 503 });
  try {
    const { payload } = await getRuntimeSettings();
    // Never return the reset token, or reveal whether the account exists.
    await payload.forgotPassword({ collection: "users", data: parsed.data });
    return NextResponse.json({ message: "If this account can receive recovery email, a reset link has been requested." }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ errors: [{ message: "Recovery email is temporarily unavailable. Contact your site owner or try later." }] }, { status: 503 }); }
}
