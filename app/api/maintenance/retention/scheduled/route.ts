import type { NextRequest } from "next/server";
import { POST } from "../route";
// Vercel Cron invokes GET with CRON_SECRET in Authorization. Reuse the same
// constant-time auth, owner opt-in, expiry predicates and bounded deletion.
export const dynamic = "force-dynamic";
export const GET = (request: NextRequest) => POST(request);
