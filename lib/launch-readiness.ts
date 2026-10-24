import { safeURL, socialURL } from "./public-config";
import type { WebsiteSetting } from "@/payload-types";
import { configuredBookingURL } from "./booking";
export function launchReadiness(website: Partial<WebsiteSetting>, approvedEN: number, approvedDE: number, env: NodeJS.ProcessEnv = process.env) {
  return [
    { label: "Gemini provider key", ready: Boolean(env.GEMINI_API_KEY) },
    { label: "Approved English knowledge", ready: approvedEN > 0 },
    { label: "Approved German knowledge", ready: approvedDE > 0 },
    { label: "Email sender and notification inbox", ready: Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL_ADDRESS && website.leadNotificationEmail) },
    { label: "Meeting booking URL", ready: Boolean(configuredBookingURL(website.bookingURL, env)) },
    { label: "Real business social profiles", ready: Boolean(website.socialLinks?.some(link => socialURL(link.platform, link.url))) },
    { label: "Public contact details", ready: Boolean(website.contactEmail || website.whatsappNumber || env.NEXT_PUBLIC_CONTACT_EMAIL || env.NEXT_PUBLIC_WHATSAPP_NUMBER) },
    { label: "Business-approved privacy and terms", ready: Boolean(website.privacyApproved && website.privacyText?.trim() && website.termsApproved && website.termsText?.trim()) },
    { label: "Shared production rate limiter", ready: Boolean(safeURL(env.UPSTASH_REDIS_REST_URL) && env.UPSTASH_REDIS_REST_TOKEN && env.TRUST_PROXY_HEADERS === "true") },
    { label: "Retention job credentials and owner approval", ready: Boolean(env.CRON_SECRET && env.CRON_SECRET.length >= 32 && website.retentionCleanupEnabled) },
    { label: "Production HTTPS origin and strong CMS secret", ready: Boolean(safeURL(env.NEXT_PUBLIC_SITE_URL) && env.PAYLOAD_SECRET && env.PAYLOAD_SECRET.length >= 32 && env.PAYLOAD_SECRET !== "development-only-secret-change-before-production") },
  ];
}
