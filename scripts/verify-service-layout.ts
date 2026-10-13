import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { getPayload, type SanitizedConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
export async function script(base: SanitizedConfig) {
  const isolated: SanitizedConfig = {...base,db:{...sqliteAdapter({client:{url:"file::memory:"}}),allowIDOnCreate:false,name:"sqlite"}};
  const payload=await getPayload({config:isolated,key:`service-layout-${randomBytes(6).toString("hex")}`});
  try {
    const category=await payload.create({collection:"service-categories",data:{name:"Fictional QA",slug:"fixture",enabled:true}});
    const service=await payload.create({collection:"services",data:{name:"Fictional QA service",slug:"fixture-service",category:category.id,shortDescription:"Fixture only",locale:"en",status:"draft",_status:"draft",servicePage:{packages:[{title:"First offering",description:"Fixture description",items:[{text:"First activity"}]}],results:[{value:"5",label:"Fixture count",context:"Isolated test",approved:false}],caseStudies:[{title:"Fixture case",description:"Fixture only",approved:false}],faqs:[{question:"Fixture question?",answer:"Fixture answer"}]}}});
    assert.equal(service.servicePage?.packages?.[0].items?.[0].text,"First activity");
    assert.equal(service.servicePage?.results?.[0].approved,false);
    const anonymous=await payload.find({collection:"services",overrideAccess:false,where:{slug:{equals:"fixture-service"}},draft:false});
    assert.equal(anonymous.totalDocs,0);
    await assert.rejects(payload.update({collection:"services",id:service.id,overrideAccess:false,data:{name:"Unauthorized"}}));
    const published=await payload.update({collection:"services",id:service.id,data:{status:"published",_status:"published"},draft:false});
    assert.equal(published.servicePage?.faqs?.[0].answer,"Fixture answer");
    const visible=await payload.find({collection:"services",overrideAccess:false,where:{slug:{equals:"fixture-service"}},draft:false});
    assert.equal(visible.docs[0].servicePage?.packages?.[0].title,"First offering");
    await payload.update({collection:"services",id:service.id,data:{servicePage:{packages:[]}},draft:false});
    const cleared=await payload.findByID({collection:"services",id:service.id});
    assert.equal(cleared.servicePage?.packages?.length,0);
    console.log("PASS service fields persist, anonymous drafts hidden, unauthorized edits denied, publication retains rows, removal persists (isolated database only).");
  } finally {await payload.db.destroy?.();}
}

