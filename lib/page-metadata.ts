import type { Metadata } from "next";
import { canonicalPageURL } from "./site-url";
type SEO = { title?: string | null; description?: string | null; canonicalURL?: string | null; noIndex?: boolean | null };
export function pageMetadata(title: string, description: string, path: string, seo?: SEO | null, openGraphType: "website" | "article" = "website"): Metadata {
  const canonical = canonicalPageURL(path, seo?.canonicalURL);
  const resolvedTitle = seo?.title?.trim() || title;
  // Editors may include the brand in an SEO title. In that case, keep the
  // supplied title intact instead of applying the layout's brand template.
  const metadataTitle = resolvedTitle.endsWith(" | Vertix Commerce") ? { absolute: resolvedTitle } : resolvedTitle;
  return {
    title: metadataTitle,
    description: seo?.description?.trim() || description,
    alternates: { canonical },
    robots: { index: seo?.noIndex !== true, follow: true },
    openGraph: { title: resolvedTitle, description: seo?.description?.trim() || description, url: canonical, type: openGraphType, images: [{ url: "/images/social-preview.jpg", width: 1200, height: 630, alt: "Vertix Commerce ecommerce management services" }] },
    twitter: { card: "summary_large_image", title: resolvedTitle, description: seo?.description?.trim() || description, images: ["/images/social-preview.jpg"] },
  };
}
