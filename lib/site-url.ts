import { safeURL } from "./public-config";

const canonicalOrigin = "https://vertixcommerce.com";
const migratedHosts = new Set(["vertix-commerce.vercel.app", "vertix-commerce.onrender.com", "www.vertixcommerce.com"]);

// Public URL generation must never depend on an incoming Host/forwarded header.
export function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? canonicalOrigin : "http://localhost:3000");
  const url = new URL(configured);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTP(S) origin without credentials, a path or query.");
  if (migratedHosts.has(url.hostname) || url.hostname === "vertixcommerce.com") return canonicalOrigin;
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("The production site URL must use HTTPS.");
  return url.origin;
}

export function absoluteSiteURL(path: string) {
  return new URL(path, getSiteOrigin()).href;
}

export function canonicalPageURL(path: string, override?: string | null) {
  const url = new URL(safeURL(override, true) || path, getSiteOrigin());
  if (migratedHosts.has(url.hostname) || url.hostname === "vertixcommerce.com") {
    const current = new URL(getSiteOrigin());
    url.protocol = current.protocol; url.host = current.host;
  }
  url.hash = "";
  return url.href;
}
