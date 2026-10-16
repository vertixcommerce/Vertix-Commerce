import { StructuredData } from "@/components/structured-data";
import type { Metadata } from "next";
import "../globals.css";
import "../reference-home.css";
import { Header } from "@/components/header";
import { ContactDockLoader } from "@/components/contact-dock-loader";
import { SiteFooter } from "@/components/site-footer";
import { getSiteChrome } from "@/lib/site-content";
import { homepageHasFAQs } from "@/lib/homepage";

export const revalidate = 3600;

export const metadata: Metadata = {
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Vertix Commerce | Commerce Services", template: "%s | Vertix Commerce" },
  description: "Explore Vertix Commerce services and discuss your business requirements with our team."
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const chrome = await getSiteChrome();
  return <html lang="en"><body><StructuredData data={{"@context":"https://schema.org","@type":"Organization",name:"Vertix Commerce",url:process.env.NEXT_PUBLIC_SITE_URL,logo:(process.env.NEXT_PUBLIC_SITE_URL || "") + "/icon.png",email:"vertixcommerce@gmail.com",address:{"@type":"PostalAddress",addressCountry:"PK"}}}/><Header groups={chrome.groups.map(group => ({ name: group.name, slug: group.slug, services: group.services.map(service => ({ slug: service.slug, title: service.title })) }))} servicesLabel={chrome.servicesLabel} aboutMenuLabel={chrome.aboutMenuLabel} hasFAQs={homepageHasFAQs(chrome.homepage, chrome.faqs.length)} extraLinks={chrome.homepage.referenceHomepage?.extraNavigation || []}/>{children}<ContactDockLoader config={chrome.assistant} contact={chrome.contact} services={chrome.services.map(service=>({slug:service.slug,title:service.title}))}/><SiteFooter chrome={chrome}/></body></html>;
}
