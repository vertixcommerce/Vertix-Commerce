import { StructuredData } from "@/components/structured-data";
import "../../../service-hero-visual.css";
import { notFound } from "next/navigation";
import { getPublicService, getSiteChrome } from "@/lib/site-content";
import { ServiceDetail } from "@/components/service-detail";
import "../../../service-detail.css";
import { pageMetadata } from "@/lib/page-metadata";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const service=await getPublicService(slug);
  return service ? pageMetadata(service.title,service.text,"/services/"+service.slug,service.seo) : { robots: { index: false, follow: false } };
}
export default async function ServicePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const service=await getPublicService(slug); if(!service)notFound();
  const chrome = await getSiteChrome();
  return <><StructuredData data={{"@context":"https://schema.org","@type":"Service",name:service.title,description:service.text,url:`${process.env.NEXT_PUBLIC_SITE_URL}/services/${service.slug}`,provider:{"@type":"Organization",name:"Vertix Commerce"}}}/><ServiceDetail service={service} contact={chrome.contact}/></>;
}


// Generate public pages on first visit and keep them until CMS invalidation or timed refresh.
export async function generateStaticParams() { return []; }
