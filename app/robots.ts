import type { MetadataRoute } from "next";
import { absoluteSiteURL } from "@/lib/site-url";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/api/media/file/"], disallow: ["/api/"] }, sitemap: absoluteSiteURL("/sitemap.xml") };
}
