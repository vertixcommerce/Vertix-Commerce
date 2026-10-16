import type { Metadata } from "next";
import { safeURL } from "./public-config";
type SEO = { title?: string | null; description?: string | null; canonicalURL?: string | null; noIndex?: boolean | null };
export function pageMetadata(title: string, description: string, path: string, seo?: SEO | null): Metadata {
  const canonical = safeURL(seo?.canonicalURL, true) || path;
  return {
    title: seo?.title?.trim() || title,
    description: seo?.description?.trim() || description,
    alternates: { canonical },
    robots: { index: seo?.noIndex !== true, follow: true },
    openGraph: { title: seo?.title?.trim() || title, description: seo?.description?.trim() || description, url: canonical, type: "website", images: [{ url: "/images/social-preview.jpg", width: 1200, height: 630, alt: "Vertix Commerce ecommerce management services" }] },
    twitter: { card: "summary_large_image", title: seo?.title?.trim() || title, description: seo?.description?.trim() || description, images: ["/images/social-preview.jpg"] },
  };
}
