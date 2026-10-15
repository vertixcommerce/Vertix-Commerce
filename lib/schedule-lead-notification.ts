import { after } from "next/server";
import type { Payload, PayloadRequest } from "payload";
import type { Lead } from "@/payload-types";
import { notifyLead } from "./lead-notifications";

export async function scheduleLeadNotification(payload: Payload, lead: Lead, req: PayloadRequest): Promise<void> {
  try {
    after(async () => {
      // The original transaction is committed before this runs. Never reuse it.
      try { await notifyLead(payload, lead); }
      catch { payload.logger.error("Inquiry saved, but its inbox notification failed. Review pending notifications in admin."); }
    });
  } catch {
    // Standalone CMS scripts have no Next.js response lifecycle.
    await notifyLead(payload, lead, req);
  }
}
