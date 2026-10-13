import { NextRequest, NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { saveLead } from "@/lib/leads";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { boundedJSON, publicGuard } from "@/lib/request-security";
import { looksSensitive } from "@/lib/chat";
export async function POST(request:NextRequest) {
  const rejected=await publicGuard(request,"lead",4,600000);if(rejected)return rejected;
  let body:unknown;try{body=await boundedJSON(request)}catch{return NextResponse.json({error:"Invalid request."},{status:400})}
  const result=leadSchema.safeParse(body);if(!result.success)return NextResponse.json({error:"Please review the required fields and consent."},{status:400});
  const de=result.data.locale==="de";
  if(looksSensitive(result.data.requirements))return NextResponse.json({error:de?"Bitte entfernen Sie sensible Zugangsdaten aus Ihrer Anfrage.":"Please remove sensitive account credentials from your inquiry."},{status:400});
  if(!process.env.DATABASE_URL)return NextResponse.json({error:de?"Online-Anfragen sind nicht verfügbar. Bitte verwenden Sie die Kontaktoptionen.":"Online submissions are not available. Please use the contact options."},{status:503});
  try {
    const settings=await getRuntimeSettings();
    if(process.env.NODE_ENV==="production"&&(!settings.website.privacyApproved||!settings.website.privacyText?.trim()))return NextResponse.json({error:de?"Online-Anfragen warten auf die Freigabe des Datenschutzhinweises.":"Online inquiries await business approval of the privacy notice. Please use the contact options."},{status:503});
    if(result.data.source==="assistant"&&(!settings.publicAssistant.enabled||!settings.publicAssistant.allowLeadCapture))return NextResponse.json({error:de?"Anfragen über den Assistenten sind deaktiviert.":"Assistant lead capture is disabled."},{status:403});
    const found=await settings.payload.find({collection:"services",where:{and:[{or:[{slug:{equals:result.data.service}},{name:{equals:result.data.service}}]},{status:{equals:"published"}},{_status:{equals:"published"}}]},draft:false,limit:1,depth:0});
    if(!found.docs[0])return NextResponse.json({error:de?"Bitte wählen Sie eine veröffentlichte Leistung.":"Please choose a currently published service."},{status:400});
    const saved=await saveLead({...result.data,service:found.docs[0].name});
    return NextResponse.json({accepted:true,id:saved.id});
  }catch{return NextResponse.json({error:de?"Ihre Anfrage konnte nicht sicher gespeichert werden. Bitte versuchen Sie es erneut.":"We could not securely save your inquiry. Please try again or use the contact options."},{status:503})}
}
