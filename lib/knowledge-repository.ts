import { getPayload } from "payload";
import config from "@payload-config";
import type { KnowledgeItem } from "./content";
import { richTextToPlainText } from "./content-text";

export function rankApprovedKnowledge(items: KnowledgeItem[], query: string, limit = 3) {
  const terms = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(term => term.length > 2);
  return items.filter(item=>item.approved).map(item=>({item,score:terms.reduce((sum,term)=>sum+((item.title+" "+item.body+" "+item.tags.join(" ")).toLowerCase().includes(term)?1:0),0)})).filter(result=>result.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(result=>result.item);
}
export async function retrieveApprovedKnowledge(query: string, locale: "en"|"de", limit=3) {
  if(!process.env.DATABASE_URL)return [];
  try {
    const payload=await getPayload({config});
    const [articles,services,faqs]=await Promise.all([
      payload.find({collection:"knowledge",limit:100,depth:0,draft:false,where:{and:[{approved:{equals:true}},{status:{equals:"published"}},{_status:{equals:"published"}},{locale:{equals:locale}}]}}),
      payload.find({collection:"services",limit:100,depth:0,draft:false,where:{and:[{assistantApproved:{equals:true}},{status:{equals:"published"}},{_status:{equals:"published"}},{locale:{equals:locale}}]}}),
      payload.find({collection:"faqs",limit:100,depth:0,where:{and:[{assistantApproved:{equals:true}},{status:{equals:"published"}},{locale:{equals:locale}}]}}),
    ]);
    const items:KnowledgeItem[]=[
      ...articles.docs.map(doc=>({id:"knowledge:"+doc.id,title:doc.title,body:doc.content,locale:doc.locale,tags:(doc.tags||[]).filter((tag):tag is string=>typeof tag==="string"),approved:doc.approved===true&&doc.status==="published"&&doc._status==="published"})),
      ...services.docs.map(doc=>({id:"services:"+doc.id,title:doc.name,body:[doc.shortDescription,richTextToPlainText(doc.fullDescription),...(doc.benefits||[]).map(item=>item.text),...(doc.processSteps||[]).map(item=>item.title+" "+(item.description||""))].join("\n"),locale:doc.locale,tags:[doc.name,doc.slug],approved:doc.assistantApproved===true&&doc.status==="published"&&doc._status==="published"})),
      ...faqs.docs.map(doc=>({id:"faqs:"+doc.id,title:doc.question,body:doc.answer,locale:doc.locale,tags:[doc.question],approved:doc.assistantApproved===true&&doc.status==="published"})),
    ];
    return rankApprovedKnowledge(items.filter(item=>item.locale===locale),query,limit).map(item=>({...item,body:item.body.slice(0,2000)}));
  } catch { return []; } // No built-in facts or stale approval fallback when storage fails.
}
