import Image from "next/image";
import logo from "@/logo.jpeg";
import type { SiteChrome } from "@/lib/site-content";
import { SocialLinks } from "./social-links";
import { marketInfo } from "@/lib/reference-homepage";
import { CountryFlag } from "./country-flag";

export function SiteFooter({ chrome }: { chrome: SiteChrome }) {
  const ref = chrome.homepage.referenceHomepage;
  return <footer className="commerce-footer"><div className="container"><div className="commerce-footer-grid">
    <div className="commerce-footer-brand"><a href="/" aria-label="Vertix Commerce home"><Image src={logo} alt="Vertix Commerce" width={120} className="footer-logo" sizes="120px"/></a><p>{ref?.footerIntroduction ?? "Explore Vertix Commerce services and discuss your business requirements with our team."}</p><SocialLinks links={chrome.socialLinks}/></div>
    <nav aria-label="Footer quick links"><h2>Quick Links</h2><a href="/">Home</a><a href="/about">About Vertix</a><a href="/blogs">Blogs</a><a href="/contact">Contact</a></nav>
    <nav aria-label="Footer services"><h2>Our Services</h2>{chrome.groups.flatMap(group=>group.services).map(service=><a key={service.slug} href={`/services/${service.slug}`}>{service.title}</a>)}{!chrome.groups.length && <a href="/contact">Discuss your requirements</a>}</nav>
    <nav aria-label="Footer markets"><h2>Markets</h2>{(ref?.markets ?? []).map((market,i)=>{const country=chrome.countries.find(country=>country.slug===market.country);return <a key={i} href={`/contact?country=${encodeURIComponent(marketInfo[market.country].contactCountry)}`}><CountryFlag country={market.country}/>{market.title}</a>;})}{!ref?.markets?.length && chrome.countries.map(country=><a href={`/contact?country=${encodeURIComponent(country.name)}`} key={country.slug}>{country.name}</a>)}{!ref?.markets?.length && !chrome.countries.length && <a href="/contact">Discuss your market</a>}</nav>
    </div><div className="commerce-footer-bottom"><p>© {new Intl.DateTimeFormat("en", {year:"numeric",timeZone:"Asia/Karachi"}).format(new Date())} {chrome.homepage.businessName}. All rights reserved.</p><p>{ref?.footerTagline ?? "Your commerce goals. Our next conversation."}</p></div></div></footer>;
}
