import { getPayload, type SanitizedConfig } from "payload";

export async function script(config:SanitizedConfig){
  const email=process.env.ADMIN_EMAIL;
  const password=process.env.ADMIN_PASSWORD;
  if(!email||!password)throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  const payload=await getPayload({config});
  const existing=await payload.find({collection:"users",where:{email:{equals:email}},limit:1});
  if(!existing.docs.length){
    await payload.create({collection:"users",data:{email,password,displayName:"Vertix Administrator",roles:["owner","administrator"]}});
    console.log("Created Vertix owner: "+email);
  }else{
    await payload.update({collection:"users",id:existing.docs[0].id,data:{password,loginAttempts:0,lockUntil:null}});
    console.log("Reset password and cleared login lock for: "+email);
  }
  await payload.login({collection:"users",data:{email,password}});
  console.log("Verified admin login: "+email);
}
