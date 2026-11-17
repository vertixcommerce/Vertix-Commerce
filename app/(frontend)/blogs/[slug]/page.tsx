import { absoluteSiteURL } from "@/lib/site-url";
import { StructuredData } from "@/components/structured-data";
import Link from "next/link";
import "../../../blog-page.css";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/editorial-content";
import { pageMetadata } from "@/lib/page-metadata";
import { RichContent } from "@/components/rich-content";
import { ResponsiveCMSImage } from "@/components/homepage-sections";
import { ArticleDate } from "@/components/article-grid";
import { publicImage } from "@/lib/homepage";
import { getSiteChrome } from "@/lib/site-content";
import { breadcrumbSchema, organizationId, relatedServiceSlugs } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  return article ? pageMetadata(article.title, article.excerpt, `/blogs/${article.slug}`, article.seo, "article") : { title: "Article not found", robots: { index: false } };
}
export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  const serviceSlugs = relatedServiceSlugs(article.slug);
  const relatedServices = serviceSlugs.length ? (await getSiteChrome()).services.filter(service => serviceSlugs.includes(service.slug)) : [];
  return <main className="py-12 md:py-20"><StructuredData data={{"@context":"https://schema.org","@type":"BlogPosting",headline:article.title,description:article.excerpt,datePublished:article.publishedAt,dateModified:article.updatedAt,author:{"@type":"Organization",name:article.authorName || "Vertix Commerce"},publisher:{"@type":"Organization","@id":organizationId,name:"Vertix Commerce"},mainEntityOfPage:absoluteSiteURL(`/blogs/${article.slug}`),...(publicImage(article.coverImage) ? {image:absoluteSiteURL(publicImage(article.coverImage)!.src)} : {})}}/><StructuredData data={breadcrumbSchema([{name:"Home",path:"/"},{name:"Blogs",path:"/blogs"},{name:article.title,path:`/blogs/${article.slug}`}])}/><article className="container"><div className="mx-auto max-w-4xl"><Link prefetch={false} href="/blogs" className="text-sm font-bold text-blue-700">← All articles</Link><h1 className="mt-7 break-words text-4xl font-black leading-tight tracking-tight md:text-6xl">{article.title}</h1><p className="mt-5 text-sm text-slate-500"><ArticleDate value={article.publishedAt}/>{article.authorName && <span>{article.publishedAt ? " · " : ""}{article.authorName}</span>}</p><p className="mb-8 mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p>{publicImage(article.coverImage) && <ResponsiveCMSImage settings={{ image: article.coverImage, imageRatio: "landscape", mobileImageRatio: "landscape" }} hero sizes="(min-width: 1024px) 896px, 100vw"/>}<div className="blog-article-content mt-10 break-words"><RichContent data={article.content}/></div>{relatedServices.length > 0 && <aside aria-labelledby="article-related-services" className="mt-12 border-t border-slate-200 pt-8"><h2 id="article-related-services" className="text-2xl font-bold">Related services</h2><ul className="mt-5 grid gap-4 sm:grid-cols-2">{relatedServices.map(service => <li key={service.slug} className="card p-6"><Link prefetch={false} href={`/services/${service.slug}`} className="text-lg font-bold text-blue-700">{service.title}</Link><p className="mt-2 leading-7 text-slate-600">{service.text}</p></li>)}</ul></aside>}</div></article></main>;
}

// Generate public pages on first visit and keep them until CMS invalidation or timed refresh.
export async function generateStaticParams() { return []; }
