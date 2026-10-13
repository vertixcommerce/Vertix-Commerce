import { getPayload } from "payload";
import config from "@payload-config";
import { defaultAssistant, type AssistantConfig, type ContactConfig } from "./public-config";
import { configuredBookingURL } from "./booking";

export async function getRuntimeSettings() {
  if (!process.env.DATABASE_URL) throw new Error("Storage not configured");
  const payload = await getPayload({ config });
  const [website, assistant] = await Promise.all([
    payload.findGlobal({ slug: "website-settings" }), payload.findGlobal({ slug: "assistant-settings" }),
  ]);
  const publicAssistant: AssistantConfig = {
    enabled: assistant.enabled === true, allowLeadCapture: assistant.allowLeadCapture === true,
    humanHandoffEnabled: assistant.humanHandoffEnabled === true,
    offlineMessage: assistant.offlineMessage || defaultAssistant.offlineMessage,
    offlineMessageDE: assistant.offlineMessageDE || defaultAssistant.offlineMessageDE,
    conversationRetentionDays: website.conversationRetentionDays || 90,
  };
  const publicContact: ContactConfig = {
    email: website.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    whatsapp: website.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    bookingURL: configuredBookingURL(website.bookingURL),
  };
  return { payload, website, assistant, publicAssistant, publicContact };
}
