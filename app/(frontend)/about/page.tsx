import "../../service-hero-visual.css";
import { getAboutPage } from "@/lib/editorial-content";
import { getSiteChrome } from "@/lib/site-content";
import { pageMetadata } from "@/lib/page-metadata";
import { AboutContent } from "@/components/about-content";

import "../../about-page.css";

export async function generateMetadata() {
  const about = await getAboutPage();
  return pageMetadata("About Us", "Meet Vertix Commerce, an ecommerce services agency supporting Amazon, eBay, Walmart and Shopify sellers with store content, listings and daily operations.", "/about", about.seo);
}
export default async function About() {
  const [about, chrome] = await Promise.all([getAboutPage(), getSiteChrome()]);
  return <AboutContent about={about} bookingURL={chrome.contact.bookingURL} markets={chrome.countries}/>;
}

