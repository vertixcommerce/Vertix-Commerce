import { NextRequest, NextResponse } from "next/server";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { findConversation, sessionCookie, visitorSession, withSession } from "@/lib/conversations";
import { publicGuard } from "@/lib/request-security";
export async function GET(request: NextRequest) {
  const rejected = await publicGuard(request, "assistant-read", 120); if (rejected) return rejected;
  try {
    const settings = await getRuntimeSettings(); const session = visitorSession(request);
    const conversation = settings.publicAssistant.enabled ? await findConversation(settings.payload, session.id) : undefined;
    return withSession(NextResponse.json({ config: settings.publicAssistant, contact: settings.publicContact, messages: conversation?.storageConsent ? conversation.messages?.slice(-100) || [] : [], stored: conversation?.storageConsent === true, mode: conversation?.mode || "ai" }), session.token);
  } catch { return NextResponse.json({ error: "The assistant is temporarily unavailable." }, { status: 503 }); }
}
export async function DELETE(request: NextRequest) {
  const rejected = await publicGuard(request, "assistant-delete", 4, 600000); if (rejected) return rejected;
  try {
    const { payload } = await getRuntimeSettings(); const session = visitorSession(request);
    // Only the unguessable HttpOnly cookie grants access to this one conversation.
    const result = await payload.find({ collection: "conversations", where: { sessionId: { equals: session.id } }, limit: 1, depth: 0 });
    if (result.docs[0]) await payload.delete({ collection: "conversations", id: result.docs[0].id });
    const response = NextResponse.json({ deleted: true });
    response.cookies.set(sessionCookie, "", { path: "/api", maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    response.headers.set("Cache-Control", "no-store"); return response;
  } catch { return NextResponse.json({ error: "Stored chat could not be deleted. Please contact the team." }, { status: 503 }); }
}
