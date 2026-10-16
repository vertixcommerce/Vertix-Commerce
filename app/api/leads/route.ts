import { NextRequest, NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { saveLead } from "@/lib/leads";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { boundedInquiryForm, boundedJSON, publicGuard } from "@/lib/request-security";
import { looksSensitive } from "@/lib/chat";
export async function POST(request:NextRequest) {
  const htmlForm=request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded") === true;
  function reply(data: Record<string, unknown>, options: { status?: number } = {}) {
    if (!htmlForm) return NextResponse.json(data,options);
    const url=new URL("/contact",process.env.NEXT_PUBLIC_SITE_URL || request.url);
    url.searchParams.set("submission",data.accepted ? "accepted" : options.status === 429 ? "limited" : "error");
    const response=NextResponse.redirect(url,303);response.headers.set("Cache-Control","no-store");return response;
  }
  const rejected=await publicGuard(request,"lead",4,600000);if(rejected)return htmlForm?reply({error:true},{status:rejected.status}):rejected;
  let body:unknown;try{body=htmlForm?await boundedInquiryForm(request):await boundedJSON(request)}catch{return reply({error:"Invalid request."},{status:400})}
  const result=leadSchema.safeParse(body);if(!result.success)return reply({error:"Please review the required fields and consent."},{status:400});
  const de=result.data.locale==="de";
  if(looksSensitive(result.data.requirements))return reply({error:de?"Bitte entfernen Sie sensible Zugangsdaten aus Ihrer Anfrage.":"Please remove sensitive account credentials from your inquiry."},{status:400});
  if(!process.env.DATABASE_URL)return reply({error:de?"Online-Anfragen sind nicht verfügbar. Bitte verwenden Sie die Kontaktoptionen.":"Online submissions are not available. Please use the contact options."},{status:503});
  try {
    const settings=await getRuntimeSettings();
    if(result.data.source==="assistant"&&(!settings.publicAssistant.enabled||!settings.publicAssistant.allowLeadCapture))return reply({error:de?"Anfragen über den Assistenten sind deaktiviert.":"Assistant lead capture is disabled."},{status:403});
    let serviceName="Other";
    if(result.data.service!=="other") {
    const found=await settings.payload.find({collection:"services",where:{and:[{or:[{slug:{equals:result.data.service}},{name:{equals:result.data.service}}]},{status:{equals:"published"}},{_status:{equals:"published"}}]},draft:false,limit:1,depth:0});
    if(!found.docs[0])return reply({error:de?"Bitte wählen Sie eine veröffentlichte Leistung.":"Please choose a currently published service."},{status:400});
    serviceName=found.docs[0].name;
    }
    const saved=await saveLead({...result.data,service:serviceName});
    return reply({accepted:true,id:saved.id});
  }catch{return reply({error:de?"Ihre Anfrage konnte nicht sicher gespeichert werden. Bitte versuchen Sie es erneut.":"We could not securely save your inquiry. Please try again or use the contact options."},{status:503})}
}
