import { GeminiError, generateApprovedPassages, publicTopicTerms } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import { chatSchema } from "@/lib/validation";
import { looksSensitive, FALLBACK_DE, FALLBACK_EN, redactMessage } from "@/lib/chat";
import { retrieveApprovedKnowledge } from "@/lib/knowledge-repository";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { appendConversation, findConversation, visitorSession, withSession } from "@/lib/conversations";
import { boundedJSON, publicGuard } from "@/lib/request-security";
import { reserveMonthlyTokens } from "@/lib/rate-limit";
import { verifiedPassages } from "@/lib/grounded-answer";
export async function POST(request:NextRequest) {
  const rejected=await publicGuard(request,"chat"); if(rejected)return rejected;
  let body:unknown;try{body=await boundedJSON(request)}catch{return NextResponse.json({error:"Invalid request."},{status:400})}
  const parsed=chatSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:"Invalid message."},{status:400});
  const {message,locale,storeConversation,action}=parsed.data;
  const fallback=locale==="de"?FALLBACK_DE:FALLBACK_EN;
  try {
    const settings=await getRuntimeSettings();
    if(!settings.publicAssistant.enabled)return NextResponse.json({error:locale==="de"?"Der Assistent ist deaktiviert. Bitte verwenden Sie das Kontaktformular.":"The assistant is disabled. Please use the contact form."},{status:503});
    const session=visitorSession(request);
    const respond=async(answer:string,escalate=false,reason?:string)=>{
      let stored=false;
      if(storeConversation&&!looksSensitive(message)) {
        try{await appendConversation(settings.payload,session.id,locale,settings.publicAssistant.conversationRetentionDays,message,answer,escalate&&settings.publicAssistant.humanHandoffEnabled);stored=true}catch{return withSession(NextResponse.json({message:answer,escalate,reason:"storage_failure",stored:false,storageError:true}),session.token)}
      }
      return withSession(NextResponse.json({message:answer,escalate,reason,stored}),session.token);
    };
    if(looksSensitive(message))return respond(locale==="de"?"Bitte senden Sie keine Passwörter, Kartendaten oder Zugangsdaten. Nutzen Sie für weitere Hilfe das Kontaktformular.":"Please do not send passwords, card details, or account credentials. Use the contact form for further help.",true,"sensitive_content");
    if(action==="handoff") {
      if(!settings.publicAssistant.humanHandoffEnabled)return respond(locale==="de"?"Menschliche Chat-Weiterleitung ist deaktiviert. Sie können das Kontaktformular verwenden.":"Human chat follow-up is disabled. You can use the contact form.",false);
      return respond(locale==="de"?settings.publicAssistant.offlineMessageDE:settings.publicAssistant.offlineMessage,true,"handoff_requested");
    }
    const existing=await findConversation(settings.payload,session.id);
    if(existing?.mode==="human"||existing?.mode==="closed")return respond(locale==="de"?"Die KI antwortet in diesem Gespräch nicht weiter. Bitte warten Sie auf die Rückmeldung des Teams oder verwenden Sie das Kontaktformular.":"AI replies are paused for this conversation. Please wait for the team or use the contact form.",false,"human_mode");
    const docs=await retrieveApprovedKnowledge(message,locale);
    if(!docs.length)return respond(fallback,true,"no_approved_knowledge");
    if(!process.env.GEMINI_API_KEY)return respond(fallback,true,"assistant_unconfigured");
    const providerInput={docs:docs.map(doc=>({id:doc.id,title:redactMessage(doc.title),body:redactMessage(doc.body)})),topics:publicTopicTerms(message,docs),locale,
      ...(settings.assistant.publicInstructionsApproved === true ? {publicInstructions:redactMessage(settings.assistant.instructions||"").slice(0,1000)} : {})};
    if(!providerInput.topics.length)return respond(fallback,true,"no_matching_topics");
    const reservation=Buffer.byteLength(JSON.stringify(providerInput),"utf8")+2200;
    if(!await reserveMonthlyTokens(settings.assistant.monthlyTokenBudget||0,reservation))return respond(fallback,true,"usage_limit");
    try {
      const raw=await generateApprovedPassages(providerInput);
      const answer=verifiedPassages(raw,docs);
      return respond(answer||fallback,!answer);
    }catch(error){return respond(fallback,true,error instanceof GeminiError&&error.status===429?"provider_quota":"provider_failure")}
  }catch{return NextResponse.json({message:fallback,escalate:true,reason:"service_failure"},{status:503})}
}
