import { readPublicContent } from "./public-content-cache";
import { cache } from "react";
import { connection } from "next/server";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import type { AboutPage as AboutPageData, Article } from "@/payload-types";

const published: Where = { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] };
export const defaultAbout: Partial<AboutPageData> = { heroEyebrow: "Vertix Commerce", heroTitle: "About Vertix", cardHeading: "Who we are", meetingButtonLabel: "Schedule a meeting" };
export const getAboutPage = cache(async (): Promise<Partial<AboutPageData>> => {
  if (!process.env.DATABASE_URL) { await connection(); return defaultAbout; }
  try { return await readPublicContent(["getAboutPage"], async () => { const payload = await getPayload({ config }); return await payload.findGlobal({ slug: "about-page", depth: 1 }); }); }
  catch { await connection(); return defaultAbout; }
});
export type ArticleCard = Pick<Article, "id" | "title" | "slug" | "excerpt" | "coverImage" | "authorName" | "publishedAt">;
export function articlePageNumber(value: string | string[] | undefined): number {
  return typeof value === "string" && /^[1-9]\d{0,5}$/.test(value) ? Number(value) : 1;
}
export const getArticles = cache(async (page = 1): Promise<{ docs: ArticleCard[]; totalDocs: number; totalPages: number; page: number; unavailable?: boolean }> => {
  const empty = { docs: [], totalDocs: 0, totalPages: 1, page };
  if (!process.env.DATABASE_URL) { await connection(); return { ...empty, unavailable: true }; }
  try { return await readPublicContent(["articles", String(page)], async () => {
    const payload = await getPayload({ config });
    const result = await payload.find({ collection: "articles", where: published, draft: false, sort: "-publishedAt", limit: 12, page, depth: 1,
      select: { title: true, slug: true, excerpt: true, coverImage: true, authorName: true, publishedAt: true } });
    return { docs: result.docs, totalDocs: result.totalDocs, totalPages: Math.max(1, result.totalPages), page };
  }); } catch { await connection(); return { ...empty, unavailable: true }; }
});
export const getArticle = cache(async (slug: string): Promise<Article | undefined> => {
  if (!process.env.DATABASE_URL) { await connection(); return undefined; }
  try { return await readPublicContent(["article", slug], async () => {
    const payload = await getPayload({ config });
    const result = await payload.find({ collection: "articles", where: { and: [{ slug: { equals: slug } }, published] }, draft: false, limit: 1, depth: 1 });
    const article = result.docs[0];
    return article?.status === "published" && article._status === "published" ? article : undefined;
  }); } catch { await connection(); return undefined; }
});
