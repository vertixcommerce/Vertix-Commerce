import { safeURL } from "./public-config";

/** Only public event URLs are accepted for the third-party iframe. No prefilled PII. */
export function calendlyEventURL(value: unknown): string {
  const safe = safeURL(value);
  if (!safe) return "";
  const url = new URL(safe);
  if (!["calendly.com", "www.calendly.com"].includes(url.hostname) || url.port ||
      !/^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return "";
  return `https://calendly.com${url.pathname.replace(/\/$/, "")}`;
}

export function configuredBookingURL(cmsURL: unknown, env: Partial<NodeJS.ProcessEnv> = process.env): string {
  // An explicit environment override fails closed if malformed; never load an arbitrary iframe.
  if (env.CALENDLY_EVENT_URL?.trim()) return calendlyEventURL(env.CALENDLY_EVENT_URL.trim());
  return safeURL(cmsURL || env.NEXT_PUBLIC_BOOKING_URL);
}

export function meetingHref(value: unknown): string {
  return calendlyEventURL(value) ? "/meeting" : safeURL(value, true) || "/contact?intent=meeting";
}

/** Match Calendly’s inline widget parameters without downloading its extra loader script. */
export function calendlyEmbedURL(value: unknown, siteURL: unknown): string {
  const event = calendlyEventURL(value);
  if (!event) return "";
  const url = new URL(event);
  const site = safeURL(siteURL);
  if (site) url.searchParams.set("embed_domain", new URL(site).hostname);
  url.searchParams.set("embed_type", "Inline");
  return url.toString();
}
