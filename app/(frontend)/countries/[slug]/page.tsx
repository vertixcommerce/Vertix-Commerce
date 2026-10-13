import { redirect } from "next/navigation";
export default async function RemovedCountryPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const names: Record<string,string>={usa:"United States",uk:"United Kingdom",australia:"Australia",germany:"Germany"};
 redirect(names[slug] ? `/contact?country=${encodeURIComponent(names[slug])}` : "/contact");
}
