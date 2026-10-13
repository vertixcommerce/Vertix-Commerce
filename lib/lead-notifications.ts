import { Resend } from "resend";
import type { Lead } from "@/payload-types";
import type { Payload, PayloadRequest } from "payload";
export async function notifyLead(payload: Payload, lead: Lead, req?: PayloadRequest) {
  const settings = await payload.findGlobal({ slug: "website-settings", req });
  const recipient = settings.leadNotificationEmail || process.env.BUSINESS_NOTIFICATION_EMAIL;
  let status: "sent" | "failed" | "not-configured" = "not-configured";
  if (recipient && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL_ADDRESS) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const result = await resend.emails.send({ from: `Vertix Commerce <${process.env.RESEND_FROM_EMAIL_ADDRESS}>`, to: recipient, subject: "New Vertix Commerce inquiry", text: `A consented inquiry is ready for review.\n\nReference: ${lead.id}\nCountry: ${lead.country}\nService: ${lead.service}\n\nReview contact details and requirements securely at ${origin}/admin/collections/leads/${lead.id}\n\nNo chat transcript or personal contact details are included in this notification.` }, { idempotencyKey: "vertix-lead-" + lead.id });
      status = result.error ? "failed" : "sent";
    } catch { status = "failed"; }
  }
  await payload.update({ collection: "leads", id: lead.id, req, context: { notificationUpdate: true }, data: { notificationStatus: status } });
  return status;
}
