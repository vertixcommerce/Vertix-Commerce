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
  return <ServiceDetail service={service} contact={chrome.contact}/>;
}

