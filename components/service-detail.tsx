import { ArrowRight, Check, Globe2, ShieldCheck } from "lucide-react";
import type { PublicService } from "@/lib/content";
import type { ContactConfig } from "@/lib/public-config";
import { safeURL } from "@/lib/public-config";
import { meetingHref } from "@/lib/booking";
import { publicImage } from "@/lib/homepage";
import { ResponsiveCMSImage } from "./homepage-sections";
import { RichContent } from "./rich-content";
import { CountryFlag } from "./country-flag";

import { ServiceOfferingIcon } from "./service-offering-icon";
import { ServiceHeroVisual } from "./service-hero-visual";

const offeringIcons = ["listing", "analytics", "advertising", "health", "logistics", "store"];
function OfferingIcon({ title, index, icon }: { title: string; index: number; icon?: string | null }) {
  const automatic = /ads|advertis|campaign/i.test(title) ? "advertising" : /health|account|performance/i.test(title) ? "health" : /logistic|fulfil|inventory/i.test(title) ? "logistics" : /brand|store/i.test(title) ? "store" : /optimi|report|review/i.test(title) ? "analytics" : /listing|catalog/i.test(title) ? "listing" : offeringIcons[index % offeringIcons.length];
  return <ServiceOfferingIcon kind={icon && icon !== "auto" ? icon : automatic}/>;
}
function Heading({ title, intro }: { title: string; intro?: string }) { return <div className="service-heading"><h2>{title}</h2>{intro && <p>{intro}</p>}</div>; }
export function ServiceDetail({ service, contact }: { service: PublicService; contact: ContactConfig }) {
  const page = service.servicePage || {};
  const inquiry = `/contact?service=${encodeURIComponent(service.slug)}`;
  const results = (page.results || []).filter(row => row.approved && row.context?.trim());
  const clients = (page.clients || []).filter(row => row.approved && publicImage(row.logo));
  const studies = (page.caseStudies || []).filter(row => row.approved);
  const markets = service.countryAvailability || [];
  return <main className="service-detail">
    <section className="service-hero"><div className="container service-hero-grid"><div><p className="eyebrow">{service.category}</p><h1>{service.title}</h1><p className="service-intro">{service.text}</p><div className="service-actions"><a href={inquiry} className="button button-primary">Discuss this service<ArrowRight size={17}/></a><a href={meetingHref(contact.bookingURL)} className="button button-secondary">{page.secondaryButtonLabel || "Schedule a meeting"}</a></div>{markets.length > 0 && <div className="service-market-pills">{markets.map(country => <a key={country} href={`/contact?country=${encodeURIComponent(({usa:"United States",uk:"United Kingdom",australia:"Australia",germany:"Germany"})[country])}`}><CountryFlag country={country}/>{({usa:"USA",uk:"UK",australia:"Australia",germany:"Germany"})[country]}</a>)}</div>}</div>
      <div className="service-hero-visual">{publicImage(page.heroImage) ? <ResponsiveCMSImage settings={{image:typeof page.heroImage === "object" && page.heroImage ? {...page.heroImage,alt:page.heroImageAlt || page.heroImage.alt} : page.heroImage,imageRatio:"landscape",mobileImageRatio:"landscape"}} hero/> : <ServiceHeroVisual serviceName={service.title}/>}</div>
    </div></section>
    {results.length > 0 && <section className="service-section"><div className="container"><Heading title={page.resultsHeading || "Documented results"}/><div className="service-results">{results.map((row,i)=><div key={i}><strong>{row.value}</strong><p>{row.label}</p><small>{row.context}</small></div>)}</div></div></section>}
    {clients.length > 0 && <section className="service-section"><div className="container"><Heading title={page.clientsHeading || "Businesses we support"}/><div className="service-client-grid">{clients.map((row,i)=><figure key={i}><ResponsiveCMSImage settings={{image:row.logo,imageFit:"contain",imageRatio:"landscape",mobileImageRatio:"landscape"}}/><figcaption>{row.name}</figcaption></figure>)}</div></div></section>}
    {studies.length > 0 && <section className="service-section"><div className="container"><Heading title={page.caseStudiesHeading || "Work in focus"}/><div className="service-card-grid">{studies.map((row,i)=><article className="service-content-card" key={i}>{publicImage(row.image) && <ResponsiveCMSImage settings={{image:row.image,imageRatio:"landscape",mobileImageRatio:"landscape"}}/>}<div><h3>{row.title}</h3><p>{row.description}</p>{row.outcome && row.context && <p className="service-outcome">{row.outcome}<small>{row.context}</small></p>}{safeURL(row.url,true) && <a href={safeURL(row.url,true)} className="service-text-link">Read case study<ArrowRight size={16}/></a>}</div></article>)}</div></div></section>}
    {!!page.packages?.length && <section className="service-section service-pale"><div className="container"><Heading title={page.packagesHeading || "Our management services"}/><div className="service-card-grid service-offering-grid">{page.packages.map((row,i)=><article key={i} className="service-offering-card"><span className="service-card-icon"><OfferingIcon title={row.title} index={i} icon={row.icon}/></span><h3>{row.title}</h3><p>{row.description}</p><ul>{row.items?.map((item,j)=><li key={j}><Check size={16}/>{item.text}</li>)}</ul></article>)}</div></div></section>}
    {!page.hideAboutSection && service.fullDescription && <section className="service-section"><div className="container service-prose"><Heading title="About this service"/><RichContent data={service.fullDescription}/></div></section>}
    {!!service.benefits?.length && <section className="service-section"><div className="container"><Heading title="Support built around your priorities"/><ul className="service-benefit-grid">{service.benefits.map((item,i)=><li key={i}><Check size={20}/><p>{item.text}</p></li>)}</ul></div></section>}
    {!!service.processSteps?.length && <section className="service-section service-pale"><div className="container"><Heading title="How it works"/><ol className="service-process">{service.processSteps.map((step,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol></div></section>}
    {!!page.faqs?.length && <section className="service-section"><div className="container service-prose"><Heading title="Your questions, answered"/>{page.faqs.map((faq,i)=><details className="service-faq" key={i}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>}
    <section className="service-section"><div className="container service-final"><Globe2 size={32}/><h2>{page.contactHeading || "Let’s discuss your next step"}</h2><p>{page.contactIntroduction || "Tell us about your store, target market and priorities. Scope, pricing and timing are confirmed with the team."}</p><a href={inquiry} className="button button-primary">Discuss this service<ArrowRight size={17}/></a></div></section>
    <div className="container service-security"><ShieldCheck size={22}/><p><strong>Keep your account secure</strong>Never send passwords, payment card details, one-time codes, or secret keys through this website.</p></div>
  </main>;
}

