import {getPayload,type SanitizedConfig} from "payload";
import {readFileSync,writeFileSync,existsSync} from "node:fs";
import path from "node:path";
const collections=["media","service-categories","services","countries","articles","knowledge","faqs"] as const;
const globals=["website-settings","assistant-settings","about-page"] as const;
export async function script(config:SanitizedConfig){
 const payload=await getPayload({config});const file=path.resolve("backups/migration-content.json");
 if(process.env.CONTENT_MIGRATION==="export"){
  if(!process.env.DATABASE_URL?.startsWith("file:"))throw new Error("Local source required");
  const data:any={collections:{},globals:{}};
  for(const slug of collections){data.collections[slug]=(await payload.find({collection:slug,pagination:false,depth:0,draft:false})).docs;console.log("Exported "+slug+": "+data.collections[slug].length);}
  for(const slug of globals)data.globals[slug]=await payload.findGlobal({slug,depth:0});
  writeFileSync(file,JSON.stringify(data));return;
 }
 if(process.env.CONTENT_MIGRATION!=="import"||!process.env.DATABASE_URL?.startsWith("postgres"))throw new Error("Hosted import required");
 const source=JSON.parse(readFileSync(file,"utf8"));const maps:any={};
 const clean=(obj:any,fields:any[]):any=>{const result:any={};for(const field of fields){if(field.type==="tabs"){for(const tab of field.tabs||[]){if(tab.name&&obj[tab.name]!=null)result[tab.name]=clean(obj[tab.name],tab.fields);else Object.assign(result,clean(obj,tab.fields));}continue;}if(!field.name){if(field.fields)Object.assign(result,clean(obj,field.fields));continue;}const value=obj[field.name];if(value===undefined)continue;if(field.type==="relationship"||field.type==="upload"){const remap=(v:any)=>{if(v===null)return null;if(typeof field.relationTo==="string")return maps[field.relationTo]?.[typeof v==="object"?v.id:v]??null;return v;};result[field.name]=field.hasMany?(value||[]).map(remap).filter((x:any)=>x!==null):remap(value);}else if(field.type==="group"&&value)result[field.name]=clean(value,field.fields);else if(field.type==="array"&&value)result[field.name]=value.map((row:any)=>clean(row,field.fields));else if(field.type==="blocks"&&value)result[field.name]=value.map((row:any)=>({...clean(row,field.blocks.find((b:any)=>b.slug===row.blockType)?.fields||[]),blockType:row.blockType}));else result[field.name]=value;}return result;};
 for(const slug of collections){maps[slug]={};const fields=payload.config.collections.find(c=>c.slug===slug)!.fields;const existing=await payload.find({collection:slug,pagination:false,depth:0});
  for(const doc of source.collections[slug]){
   if(slug==="countries"&&(!doc.name||!doc.slug||!doc.introduction)){console.log("Skipped incomplete country draft");continue;}
   const key=slug==="media"?"filename":doc.slug?"slug":"name";
   const prior=existing.docs.find((row:any)=>row[key]===doc[key]&&doc[key]);
   if(prior){maps[slug][doc.id]=prior.id;continue;}
   const data=clean(doc,fields);let created:any;if(slug==="media"){const filename=path.resolve("media",doc.filename);if(!existsSync(filename))throw new Error("Source image missing");created=await payload.create({collection:slug,data,filePath:filename});}else created=await payload.create({collection:slug,data,draft:false});maps[slug][doc.id]=created.id;}
  console.log("Imported "+slug+": "+source.collections[slug].length);
 }
 for(const slug of globals){const fields=payload.config.globals.find(g=>g.slug===slug)!.fields;const data=clean(source.globals[slug],fields);if(slug==="assistant-settings")data.enabled=false;if(slug==="website-settings"){data.bookingURL="";if(process.env.NEXT_PUBLIC_CONTACT_EMAIL)data.contactEmail=process.env.NEXT_PUBLIC_CONTACT_EMAIL;if(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)data.whatsappNumber=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;}
 await payload.updateGlobal({slug,data});console.log("Imported "+slug);}
 console.log("Hosted content migration completed; assistant disabled and booking deferred.");
}

