import { getPayload, type SanitizedConfig } from "payload";
export async function script(config: SanitizedConfig) {
  if(!process.env.DATABASE_URL?.startsWith("file:"))throw new Error("Local CMS preparation only.");
  const payload=await getPayload({config});
  const about=await payload.findGlobal({slug:"about-page"});
  await payload.updateGlobal({slug:"about-page",data:{
    ...(!about.focusHeading ? {focusHeading:"A practical starting point"} : {}),
    ...(!about.focusIntroduction ? {focusIntroduction:"Start with your store’s needs, then agree a scope that fits your priorities."} : {}),
    ...(!about.focusItems?.length ? {focusItems:[{text:"An initial focus on eBay services"},{text:"USA, UK, Australia and Germany"},{text:"Scope and responsibilities agreed together"}]} : {}),
    ...(!about.principlesHeading ? {principlesHeading:"Built around a clearer way of working"} : {}),
    ...(!about.principlesIntroduction ? {principlesIntroduction:"A useful working relationship starts with clear expectations, relevant information and a shared plan."} : {}),
    ...(!about.principles?.length ? {principles:[{title:"Clarity before activity",description:"Discuss what needs attention and define the activities, responsibilities and reporting before work begins."},{title:"Your store in context",description:"Bring your products, target market and current workflows into the conversation. The scope should reflect your setup."},{title:"Care with information",description:"Use the inquiry form for your requirements. Access arrangements are discussed separately; passwords and one-time codes do not belong in a message."}]} : {}),
    ...(!about.approachHeading ? {approachHeading:"A conversation. A plan. A next step."} : {}),
    ...(!about.approachIntroduction ? {approachIntroduction:"From your first inquiry to a defined service scope, here is the starting framework."} : {}),
    ...(!about.approachSteps?.length ? {approachSteps:[{title:"Understand",description:"Share your store, market and priorities. Identify the questions you want to resolve."},{title:"Define",description:"Discuss the activities, reporting and support you need."},{title:"Agree",description:"Confirm responsibilities, access, timing and pricing with the team."},{title:"Review",description:"Review completed activities and discuss which priorities come next."}]} : {}),
    ...(!about.marketsHeading ? {marketsHeading:"Four markets. Your commerce goals."} : {}),
    ...(!about.marketsIntroduction ? {marketsIntroduction:"Our initial published services focus on eBay in these markets. Explore the local information, then tell us about your requirements."} : {}),
    ...(!about.contactHeading ? {contactHeading:"Let’s start with your business."} : {}),
    ...(!about.contactIntroduction ? {contactIntroduction:"Tell us what you sell, where you sell and what support you are looking for. The team will discuss your scope and next steps."} : {}),
    ...(!about.contactButtonLabel ? {contactButtonLabel:"Let’s discuss"} : {}),
  }});
  console.log("About layout content prepared; existing text and images retained. No company history, staff names or credentials invented.");
}
