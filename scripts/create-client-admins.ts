import {getPayload,type SanitizedConfig} from "payload";
export async function script(config:SanitizedConfig){
 if(!process.env.CLIENT_ADMIN_SETUP||!process.env.DATABASE_URL?.startsWith("postgres"))throw new Error("Hosted setup only");
 const payload=await getPayload({config});
 for(const account of [{email:"vertixcommerce@gmail.com",displayName:"Vertix Owner",roles:["owner" as const],password:process.env.CLIENT_OWNER_PASSWORD},{email:"admin@vertixcommerce.com",displayName:"Vertix Administrator",roles:["administrator" as const],password:process.env.CLIENT_ADMIN_PASSWORD}]){
  if(!account.password||account.password.length<20)throw new Error("Private password missing");
  const existing=await payload.find({collection:"users",where:{email:{equals:account.email}},limit:1,depth:0});
  if(existing.docs.length){console.log("Existing account preserved: "+account.email);continue;}
  await payload.create({collection:"users",data:account});
  await payload.login({collection:"users",data:{email:account.email,password:account.password}});
  console.log("Created and verified: "+account.email+" ("+account.roles[0]+")");
 }
}
