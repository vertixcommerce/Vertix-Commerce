import { Resend } from "resend";
import type { Lead } from "@/payload-types";
import type { Payload, PayloadRequest } from "payload";

function safeProviderError(error: { name?: string; message?: string }) {
  const name = (error.name || "ResendError").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60);
  const message = (error.message || "Provider rejected the message")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/re_[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .slice(0, 240);
  return `${name}: ${message}`;
}

export async function notifyLead(payload: Payload, lead: Lead, req?: PayloadRequest) {
  const settings = await payload.findGlobal({ slug: "website-settings", req });
  const recipient = settings.leadNotificationEmail;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL_ADDRESS;
  let status: "sent" | "failed" | "not-configured" = "not-configured";
  if (!recipient || !apiKey || !fromEmail) {
    const missing = [!recipient && "Admin > Website Settings > Inquiry notification inbox", !apiKey && "RESEND_API_KEY", !fromEmail && "RESEND_FROM_EMAIL_ADDRESS"].filter(Boolean);
    payload.logger.error(`Inquiry ${lead.id} was saved, but its email notification is not configured. Missing: ${missing.join(", ")}.`);
  } else {
    try {
      const resend = new Resend(apiKey);
      const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const result = await resend.emails.send({
        from: `Vertix Commerce <${fromEmail}>`,
        to: recipient,
        replyTo: lead.email,
        subject: "New Vertix Commerce inquiry",
        text: `A consented inquiry is ready for review.\n\nReference: ${lead.id}\nName: ${lead.name}\nEmail: ${lead.email}\nWhatsApp: ${lead.whatsapp || "Not provided"}\nCountry: ${lead.country}\nInterested service: ${lead.service}\n\nProject requirements:\n${lead.requirements || "Not provided"}\n\nReview this inquiry securely in the admin panel: ${origin}/control-room-6f3a9d82c17e/collections/leads/${lead.id}`,
      }, { idempotencyKey: "vertix-lead-" + lead.id });
      if (result.error) {
        status = "failed";
        payload.logger.error(`Resend rejected the notification for inquiry ${lead.id}: ${safeProviderError(result.error)}.`);
      } else {
        status = "sent";
        payload.logger.info(`Resend accepted the notification for inquiry ${lead.id}.`);
      }
    } catch (error) {
      status = "failed";
      payload.logger.error(`Resend request failed for inquiry ${lead.id}: ${safeProviderError(error instanceof Error ? error : {})}.`);
    }
  }
  await payload.update({ collection: "leads", id: lead.id, req, context: { notificationUpdate: true }, data: { notificationStatus: status } });
  return status;
}
