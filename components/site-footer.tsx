import Link from "next/link";
import Image from "next/image";
import logo from "@/logo.jpeg";
import type { SiteChrome } from "@/lib/site-content";
import { SocialLinks } from "./social-links";
import { marketInfo } from "@/lib/reference-homepage";
import { CountryFlag } from "./country-flag";

export function SiteFooter({ chrome }: { chrome: SiteChrome }) {
  const ref = chrome.homepage.referenceHomepage;
  return <footer className="commerce-footer"><div className="container"><div className="commerce-footer-grid">
    <div className="commerce-footer-brand"><Link prefetch={false} href="/" aria-label="Vertix Commerce home"><Image src={logo} alt="Vertix Commerce" width={120} className="footer-logo" sizes="120px"/></Link><p>{ref?.footerIntroduction ?? "Explore Vertix Commerce services and discuss your business requirements with our team."}</p><SocialLinks links={chrome.socialLinks}/></div>
    <nav aria-label="Footer quick links"><h2>Quick Links</h2><Link prefetch={false} href="/">Home</Link><Link prefetch={false} href="/about">About Vertix</Link><Link prefetch={false} href="/blogs">Blogs</Link><Link prefetch={false} href="/contact">Contact</Link></nav>
    <nav aria-label="Footer services"><h2>Our Services</h2>{chrome.groups.flatMap(group=>group.services).map(service=><Link prefetch={false} key={service.slug} href={`/services/${service.slug}`}>{service.title}</Link>)}{!chrome.groups.length && <Link prefetch={false} href="/contact">Discuss your requirements</Link>}</nav>
    <nav aria-label="Footer markets"><h2>Markets</h2>{(ref?.markets ?? []).map((market,i)=>{const country=chrome.countries.find(country=>country.slug===market.country);return <Link prefetch={false} key={i} href={`/contact?country=${encodeURIComponent(marketInfo[market.country].contactCountry)}`}><CountryFlag country={market.country}/>{market.title}</Link>;})}{!ref?.markets?.length && chrome.countries.map(country=><Link prefetch={false} href={`/contact?country=${encodeURIComponent(country.name)}`} key={country.slug}>{country.name}</Link>)}{!ref?.markets?.length && !chrome.countries.length && <Link prefetch={false} href="/contact">Discuss your market</Link>}</nav>
    </div><div className="commerce-footer-bottom"><p>© {new Intl.DateTimeFormat("en", {year:"numeric",timeZone:"Asia/Karachi"}).format(new Date())} {chrome.homepage.businessName}. All rights reserved.</p><p className="commerce-footer-tagline">{ref?.footerTagline ?? "Your commerce goals. Our next conversation."}</p><nav aria-label="Policies" className="commerce-footer-policies">{chrome.privacyApproved && <Link href="/privacy">Privacy Notice</Link>}{chrome.termsApproved && <Link href="/terms">Service Terms</Link>}</nav></div></div></footer>;
}
