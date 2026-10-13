import { ArrowRight, BookOpen } from "lucide-react";
import type { ArticleCard } from "@/lib/editorial-content";
import { ResponsiveCMSImage } from "./homepage-sections";
import { publicImage } from "@/lib/homepage";

export function ArticleDate({ value }: { value?: string | null }) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return null;
  return <time dateTime={value}>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(value))}</time>;
}
export function ArticleGrid({ articles, featured = false }: { articles: ArticleCard[]; featured?: boolean }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article,index) => <article key={article.id} className={`blog-card card flex min-w-0 flex-col overflow-hidden transition hover:-translate-y-1 hover:border-blue-300 ${featured && index===0 ? "blog-featured-card sm:col-span-2 lg:col-span-3" : ""}`}>
    <a href={`/blogs/${article.slug}`} aria-label={`Read ${article.title}`} className="block [&_picture]:rounded-none">{publicImage(article.coverImage) ? <ResponsiveCMSImage settings={{ image: article.coverImage, imageRatio: "landscape", mobileImageRatio: "landscape" }} sizes="(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw"/> : <div aria-hidden="true" className="blog-cover-placeholder grid aspect-video place-items-center bg-blue-50 text-blue-400"><div><BookOpen size={40} strokeWidth={1.4}/><span>VERTIX COMMERCE</span></div></div>}</a>
    <div className="flex flex-1 flex-col p-6">{featured && index===0 && <p className="eyebrow mb-4">Latest article</p>}<div className="text-xs font-semibold text-slate-500"><ArticleDate value={article.publishedAt}/>{article.authorName && <span>{article.publishedAt ? " · " : ""}{article.authorName}</span>}</div><h2 className="mt-3 break-words text-xl font-black leading-7"><a href={`/blogs/${article.slug}`} className="hover:text-blue-700">{article.title}</a></h2><p className="mt-3 flex-1 break-words leading-7 text-slate-600">{article.excerpt}</p><a href={`/blogs/${article.slug}`} className="mt-6 inline-flex items-center gap-2 font-bold text-blue-700" aria-label={`Read article: ${article.title}`}>Read article<ArrowRight size={17}/></a></div>
  </article>)}</div>;
}
