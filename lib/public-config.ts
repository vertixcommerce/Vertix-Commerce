export type AssistantConfig = {
  enabled: boolean; allowLeadCapture: boolean; humanHandoffEnabled: boolean;
  offlineMessage: string; offlineMessageDE: string; conversationRetentionDays: number;
};
export type ContactConfig = { email: string; whatsapp: string; bookingURL: string };
export function whatsappURL(value: unknown): string {
  if (typeof value !== "string" || !/^\+?[\d\s().-]+$/.test(value.trim())) return "";
  const digits = value.replace(/\D/g, "").replace(/^00/, "");
  // International number: country code, no domestic leading zero, max 15 digits.
  return /^[1-9]\d{7,14}$/.test(digits) ? `https://wa.me/${digits}` : "";
}
export function safeURL(value: unknown, allowLocal = false): string {
  if (typeof value !== "string" || !value.trim() || /[\\\u0000-\u0020\u007f]/.test(value)) return "";
  if (allowLocal && /^\/(?!\/)/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}
export function socialURL(platform: string, value: unknown): string {
  const url = safeURL(value);
  if (!url) return "";
  const domains: Record<string, string[]> = { facebook: ["facebook.com", "fb.com", "fb.me"], instagram: ["instagram.com"], linkedin: ["linkedin.com"], youtube: ["youtube.com", "youtu.be"], x: ["x.com", "twitter.com"], tiktok: ["tiktok.com"] };
  const host = new URL(url).hostname.toLowerCase();
  return domains[platform]?.some(domain => host === domain || host.endsWith("." + domain)) ? url : "";
}
export const defaultAssistant: AssistantConfig = {
  enabled: false, allowLeadCapture: false, humanHandoffEnabled: true,
  offlineMessage: "A human agent is not currently available. Leave a consented inquiry and the team can follow up when available.",
  offlineMessageDE: "Ein menschlicher Mitarbeiter ist derzeit nicht verfügbar. Hinterlassen Sie eine Anfrage mit Ihrer Einwilligung; das Team kann sich bei Verfügbarkeit melden.",
  conversationRetentionDays: 90,
};
