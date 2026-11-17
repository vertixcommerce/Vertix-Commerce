import { absoluteSiteURL } from "@/lib/site-url";
import { StructuredData } from "@/components/structured-data";
import "../../../service-hero-visual.css";
import { notFound } from "next/navigation";
import { getPublicService, getSiteChrome } from "@/lib/site-content";
import { ServiceDetail } from "@/components/service-detail";
import "../../../service-detail.css";
import { pageMetadata } from "@/lib/page-metadata";
import { getRelatedGuides } from "@/lib/editorial-content";
import { areaServed, breadcrumbSchema, faqSchema, organizationId, relatedGuideSlugs } from "@/lib/seo";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const service=await getPublicService(slug);
  return service ? pageMetadata(service.title,service.text,"/services/"+service.slug,service.seo) : { robots: { index: false, follow: false } };
}
export default async function ServicePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const service=await getPublicService(slug); if(!service)notFound();
  const [chrome, guides] = await Promise.all([getSiteChrome(), getRelatedGuides(relatedGuideSlugs[slug] || [])]);
  const faqs = service.servicePage?.faqs || [];
  const served = areaServed(service.countryAvailability);
  return <><StructuredData data={{"@context":"https://schema.org","@type":"Service",name:service.title,serviceType:service.title,description:service.text,url:absoluteSiteURL(`/services/${service.slug}`),provider:{"@type":"Organization","@id":organizationId,name:"Vertix Commerce"},...(served.length ? {areaServed:served} : {})}}/><StructuredData data={breadcrumbSchema([{name:"Home",path:"/"},{name:"Services",path:"/services"},{name:service.title,path:`/services/${service.slug}`}])}/>{faqs.length > 0 && <StructuredData data={faqSchema(faqs)}/>}<ServiceDetail service={service} contact={chrome.contact} guides={guides}/></>;
}


// Generate public pages on first visit and keep them until CMS invalidation or timed refresh.
export async function generateStaticParams() { return []; }
