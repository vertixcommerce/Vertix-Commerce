import { readPublicContent } from "@/lib/public-content-cache";
import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin || !/^https?:\/\//.test(origin)) return [];
  const base = origin.replace(/\/$/, "");
  const routes: MetadataRoute.Sitemap = ["", "/about", "/blogs", "/contact", "/meeting"].map(path => ({url:base+path}));
  if (!process.env.DATABASE_URL) return routes;
  return readPublicContent(["sitemap", base], async () => {
  const payload = await getPayload({config});
  for (const collection of ["services", "articles"] as const) {
    const result = await payload.find({collection,where:{and:[{status:{equals:"published"}},{_status:{equals:"published"}}]},draft:false,depth:0,pagination:false});
    for (const doc of result.docs) if (!doc.seo?.noIndex) routes.push({url:`${base}/${collection === "articles" ? "blogs" : collection}/${doc.slug}`,lastModified:doc.updatedAt});
  }
  return routes;
  });
}
