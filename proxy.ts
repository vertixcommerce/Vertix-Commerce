import { NextRequest, NextResponse } from "next/server";

// Vercel's launcher can misroute an encoded backslash into a missing Pages
// module. Reject that invalid path before rendering, consistently for all UAs.
export function proxy(request: NextRequest) {
  if (/%5c/i.test(request.nextUrl.pathname)) return new NextResponse("Page not found", {
    status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-store" },
  });
  return NextResponse.next();
}

// This does not run on ordinary pages, static assets or private API requests.
export const config = { matcher: ["/(.*%5[cC].*)"] };
