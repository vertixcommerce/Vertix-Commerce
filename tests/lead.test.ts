import { describe,expect,it } from "vitest";
import { leadSchema } from "@/lib/validation";
const valid={name:"Alex Smith",email:"alex@example.com",whatsapp:"+1 555 555 5555",country:"United States",service:"eBay Account Management",requirements:"Please review our current listings.",consent:true};
describe("lead capture",()=>{it("accepts consented, complete input",()=>expect(leadSchema.safeParse(valid).success).toBe(true));it("rejects missing consent",()=>expect(leadSchema.safeParse({...valid,consent:false}).success).toBe(false));it("rejects bot honeypot",()=>expect(leadSchema.safeParse({...valid,website:"spam"}).success).toBe(false));it("rejects malformed email",()=>expect(leadSchema.safeParse({...valid,email:"nope"}).success).toBe(false))});
