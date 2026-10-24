import { readPublicContent } from "@/lib/public-content-cache";
import { absoluteSiteURL, canonicalPageURL } from "@/lib/site-url";
import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

// Serve the generated XML from the page cache. Publishing also invalidates the
// tagged data dependency, so crawlers do not invoke the database on every fetch.
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = absoluteSiteURL("/");
  return readPublicContent(["sitemap-v2", base], async () => {
    const routes: MetadataRoute.Sitemap = ["/", "/services", "/blogs", "/contact", "/meeting"].map(path => ({ url: absoluteSiteURL(path) }));
    if (!process.env.DATABASE_URL) return routes;
    const payload = await getPayload({ config });
    const [settings, about] = await Promise.all([
      payload.findGlobal({ slug: "website-settings", depth: 0 }),
      payload.findGlobal({ slug: "about-page", depth: 0 }),
    ]);
    if (!about.seo?.noIndex && canonicalPageURL("/about", about.seo?.canonicalURL) === absoluteSiteURL("/about")) routes.push({ url: absoluteSiteURL("/about") });
    if (settings.privacyApproved && settings.privacyText?.trim()) routes.push({ url: absoluteSiteURL("/privacy") });
    if (settings.termsApproved && settings.termsText?.trim()) routes.push({ url: absoluteSiteURL("/terms") });
    for (const collection of ["services", "articles"] as const) {
      const result = await payload.find({ collection, where: { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] }, draft: false, depth: 0, pagination: false });
      for (const doc of result.docs) {
        // Match public page publication rules even if the data source misbehaves.
        if (doc.status !== "published" || doc._status !== "published" || doc.seo?.noIndex || !doc.slug) continue;
        const path = `/${collection === "articles" ? "blogs" : collection}/${doc.slug}`;
        const url = absoluteSiteURL(path);
        if (canonicalPageURL(path, doc.seo?.canonicalURL) !== url) continue;
        routes.push({ url, ...(doc.updatedAt ? { lastModified: doc.updatedAt } : {}) });
      }
    }
    return routes;
  });
}
