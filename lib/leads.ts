import { createHash } from "node:crypto";
import { getPayload } from "payload";
import config from "@payload-config";
import type { LeadInput } from "./validation";
export async function saveLead(input:LeadInput) {
  const payload=await getPayload({config});
  const settings=await payload.findGlobal({slug:"website-settings"});
  const {website:_honeypot,idempotencyKey,locale:_locale,...leadInput}=input;
  const submissionKey=idempotencyKey?createHash("sha256").update(idempotencyKey+":"+input.email.toLowerCase()).digest("hex"):undefined;
  if(submissionKey) {
    const result=await payload.find({collection:"leads",where:{submissionKey:{equals:submissionKey}},limit:1,depth:0});
    if(result.docs[0])return {id:result.docs[0].id};
  }
  try {
    const lead=await payload.create({collection:"leads",data:{...leadInput,submissionKey,leadStatus:"new",source:input.source,consentedAt:new Date().toISOString(),retentionExpiresAt:new Date(Date.now()+(settings.leadRetentionDays||365)*86400000).toISOString(),notificationStatus:"pending"}});
    return {id:lead.id};
  }catch(error) {
    if(submissionKey){const result=await payload.find({collection:"leads",where:{submissionKey:{equals:submissionKey}},limit:1,depth:0});if(result.docs[0])return {id:result.docs[0].id};}
    throw error;
  }
}
