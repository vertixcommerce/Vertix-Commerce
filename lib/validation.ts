import { z } from "zod";

export const leadSchema=z.object({
  name:z.string().trim().min(2).max(100),
  email:z.string().email().max(180),
  whatsapp:z.string().trim().min(7).max(30),
  country:z.enum(["United States","United Kingdom","Australia","Germany","Other"]),
  service:z.string().trim().min(2).max(120),
  requirements:z.string().trim().min(10).max(3000),
  consent:z.literal(true),
  website:z.string().max(0).optional(),
  source:z.enum(["website","assistant"]).default("website"),
  locale:z.enum(["en","de"]).default("en"),
  idempotencyKey:z.string().uuid().optional()
});
export type LeadInput=z.infer<typeof leadSchema>;

export const chatSchema=z.object({
  message:z.string().trim().min(1).max(1200),
  locale:z.enum(["en","de"]).default("en"),
  history:z.array(z.object({role:z.enum(["user","assistant"]),content:z.string().max(1500)})).max(8).default([]),
  storeConversation:z.boolean().default(false),
  action:z.enum(["message","handoff"]).default("message")
});
