import Link from "next/link";
import "../../blog-page.css";
import { notFound } from "next/navigation";
import { articlePageNumber, getArticles } from "@/lib/editorial-content";
import { pageMetadata } from "@/lib/page-metadata";
import { ArticleGrid } from "@/components/article-grid";
export const metadata = pageMetadata("Blogs", "Read the latest articles published by Vertix Commerce.", "/blogs");
export default async function Blogs({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = articlePageNumber((await searchParams).page);
  const result = await getArticles(page);
  if (!result.unavailable && page > result.totalPages) notFound();
  return <main className="blog-listing"><section className="bg-blue-50 py-14 md:py-20"><div className="container"><p className="eyebrow">Vertix Commerce</p><h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Insights & resources</h1><p className="mt-5 max-w-2xl text-lg text-slate-600">Explore the latest articles published by Vertix Commerce.</p></div></section>
    <section className="py-14 md:py-20"><div className="container">{result.docs.length ? <ArticleGrid articles={result.docs} featured={page===1}/> : <div className="card p-10 text-center"><h2 className="text-2xl font-bold">{result.unavailable ? "Articles are temporarily unavailable" : "No articles published yet"}</h2><p className="mt-4 text-slate-600">{result.unavailable ? "Please try again shortly." : "Check back for new articles from Vertix Commerce."}</p></div>}
      {result.totalPages > 1 && <nav aria-label="Blog pagination" className="mt-10 flex flex-wrap items-center justify-center gap-5">{page > 1 && <Link prefetch={false} href={page === 2 ? "/blogs" : `/blogs?page=${page - 1}`} className="button button-secondary" rel="prev">Previous</Link>}<span className="text-sm text-slate-600">Page {page} of {result.totalPages}</span>{page < result.totalPages && <Link prefetch={false} href={`/blogs?page=${page + 1}`} className="button button-secondary" rel="next">Next</Link>}</nav>}
    </div></section></main>;
}
