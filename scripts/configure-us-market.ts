import { getPayload, type SanitizedConfig } from "payload";
export async function script(config: SanitizedConfig) {
 const payload = await getPayload({config});
 const found = await payload.find({collection:"countries",where:{slug:{equals:"usa"}},depth:0,limit:1});
 if(!found.docs[0]) throw new Error("United States page missing");
 const text = "Whether you’re launching a store or improving an existing business, we’ll help you identify the services that fit your priorities. Browse the available services below or contact our team to discuss your requirements.";
 await payload.update({collection:"countries",id:found.docs[0].id,draft:false,data:{introduction:"Explore our e-commerce services for businesses targeting the United States. Find support for store setup, product listings, marketplace management, and day-to-day operations.",localGuidance:{root:{type:"root",format:"",indent:0,version:1,direction:"ltr",children:[{type:"paragraph",format:"",indent:0,version:1,direction:"ltr",children:[{type:"text",text,format:0,detail:0,mode:"normal",style:"",version:1}]}]}}}});
 console.log("United States general marketplace content updated.");
}
