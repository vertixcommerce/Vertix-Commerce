import { getSiteChrome } from "@/lib/site-content";
import { HomepageBody, HomepageHero } from "@/components/homepage-sections";
import { ReferenceHomepage } from "@/components/reference-homepage";
import { getArticles } from "@/lib/editorial-content";
export default async function Home() {
  const chrome = await getSiteChrome();
  if (chrome.homepage.homepageLayoutMode === "reference") {
    const articles = chrome.homepage.referenceHomepage?.blogEnabled !== false ? (await getArticles()).docs : [];
    return <ReferenceHomepage chrome={chrome} articles={articles}/>;
  }
  return <main><HomepageHero chrome={chrome}/><HomepageBody chrome={chrome}/></main>;
}
