import type { Metadata } from "next";
import "../globals.css";
import "../reference-home.css";
import { Header } from "@/components/header";
import { ContactDock } from "@/components/contact-dock";
import { SiteFooter } from "@/components/site-footer";
import { getSiteChrome } from "@/lib/site-content";
import { homepageHasFAQs } from "@/lib/homepage";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Vertix Commerce | Commerce Services", template: "%s | Vertix Commerce" },
  description: "Explore Vertix Commerce services and discuss your business requirements with our team."
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const chrome = await getSiteChrome();
  return <html lang="en"><body><Header groups={chrome.groups} servicesLabel={chrome.servicesLabel} aboutMenuLabel={chrome.aboutMenuLabel} hasFAQs={homepageHasFAQs(chrome.homepage, chrome.faqs.length)} extraLinks={chrome.homepage.referenceHomepage?.extraNavigation || []}/>{children}<ContactDock config={chrome.assistant} contact={chrome.contact} services={chrome.services.map(service=>({slug:service.slug,title:service.title}))}/><SiteFooter chrome={chrome}/></body></html>;
}
