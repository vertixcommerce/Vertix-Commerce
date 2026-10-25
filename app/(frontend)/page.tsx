import type { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import { getArticles } from "@/lib/editorial-content";
import { pageMetadata } from "@/lib/page-metadata";
import { absoluteSiteURL } from "@/lib/site-url";
import { getSiteChrome } from "@/lib/site-content";
import { HomepageBody, HomepageHero } from "@/components/homepage-sections";
import { ReferenceHomepage } from "@/components/reference-homepage";

const homepageTitle = "Vertix Commerce | Ecommerce Store Management";
const homepageDescription = "Vertix Commerce helps Amazon, eBay, Walmart and Shopify sellers with listings, store operations, content and marketplace support. Explore our services or contact our team.";

const baseMetadata = pageMetadata(homepageTitle, homepageDescription, "/");
export const metadata: Metadata = {
  ...baseMetadata,
  // The homepage should lead with the brand and avoid duplicating the
  // site-wide title template.
  title: { absolute: homepageTitle },
  openGraph: { ...baseMetadata.openGraph, title: homepageTitle, description: homepageDescription },
  twitter: { ...baseMetadata.twitter, title: homepageTitle, description: homepageDescription },
};

export default async function Home() {
  const chrome = await getSiteChrome();
  const siteName = <StructuredData data={{
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vertix Commerce",
    alternateName: "Vertix",
    url: absoluteSiteURL("/"),
  }} />;

  if (chrome.homepage.homepageLayoutMode === "reference") {
    const articles = chrome.homepage.referenceHomepage?.blogEnabled !== false ? (await getArticles()).docs : [];
    return <>{siteName}<ReferenceHomepage chrome={chrome} articles={articles}/></>;
  }
  return <>{siteName}<main><HomepageHero chrome={chrome}/><HomepageBody chrome={chrome}/></main></>;
}
