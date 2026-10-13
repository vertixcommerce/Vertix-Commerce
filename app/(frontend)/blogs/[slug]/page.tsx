import "../../../blog-page.css";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/editorial-content";
import { pageMetadata } from "@/lib/page-metadata";
import { RichContent } from "@/components/rich-content";
import { ResponsiveCMSImage } from "@/components/homepage-sections";
import { ArticleDate } from "@/components/article-grid";
import { publicImage } from "@/lib/homepage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  return article ? { ...pageMetadata(article.title, article.excerpt, `/blogs/${article.slug}`, article.seo), openGraph: { title: article.seo?.title || article.title, description: article.seo?.description || article.excerpt, type: "article" as const } } : { title: "Article not found", robots: { index: false } };
}
export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  return <main className="py-12 md:py-20"><article className="container"><div className="mx-auto max-w-4xl"><a href="/blogs" className="text-sm font-bold text-blue-700">← All articles</a><h1 className="mt-7 break-words text-4xl font-black leading-tight tracking-tight md:text-6xl">{article.title}</h1><p className="mt-5 text-sm text-slate-500"><ArticleDate value={article.publishedAt}/>{article.authorName && <span>{article.publishedAt ? " · " : ""}{article.authorName}</span>}</p><p className="mb-8 mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p>{publicImage(article.coverImage) && <ResponsiveCMSImage settings={{ image: article.coverImage, imageRatio: "landscape", mobileImageRatio: "landscape" }} hero sizes="(min-width: 1024px) 896px, 100vw"/>}<div className="blog-article-content mt-10 break-words"><RichContent data={article.content}/></div></div></article></main>;
}
