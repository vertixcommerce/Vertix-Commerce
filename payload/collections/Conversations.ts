import type { CollectionConfig } from "payload";
import { administrator, supportTeam } from "../access";
import { looksSensitive } from "../../lib/chat";
export const Conversations: CollectionConfig = {
  slug: "conversations", labels: { singular: "Conversation", plural: "Conversations" },
  admin: { useAsTitle: "sessionId", group: "Customers", description: "Only consented conversations are stored. Reply to a visitor or organize human follow-up. Visitors with the same browser session can receive your reply.", defaultColumns: ["sessionId", "locale", "mode", "followUpRequired", "updatedAt"], hideAPIURL: true },
  defaultSort: "-updatedAt",
  access: { read: supportTeam, create: () => false, update: supportTeam, delete: administrator },
  fields: [
    { name: "sessionId", label: "Conversation reference", type: "text", required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: "followUpRequired", label: "Needs human follow-up", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    { type: "tabs", tabs: [
      { label: "Messages", fields: [
        { name: "messages", label: "Conversation history", type: "array", admin: { readOnly: true }, fields: [
          { type: "row", fields: [{ name: "role", label: "Sender", type: "select", required: true, options: [{ label: "Visitor", value: "user" }, { label: "AI assistant", value: "assistant" }, { label: "Team member", value: "human" }] }, { name: "sentAt", label: "Time sent", type: "date", required: true }] },
          { name: "content", label: "Message", type: "textarea", required: true, maxLength: 2000 },
        ] },
      ] },
      { label: "Follow-up & privacy", fields: [
        { name: "locale", label: "Conversation language", type: "select", required: true, options: [{ label: "English", value: "en" }, { label: "German", value: "de" }], admin: { readOnly: true } },
        { name: "mode", label: "Conversation status", type: "select", required: true, defaultValue: "ai", options: [{ label: "AI assistant", value: "ai" }, { label: "Waiting for human follow-up", value: "waiting-for-human" }, { label: "Assigned to human", value: "human" }, { label: "Closed", value: "closed" }], admin: { description: "Assign to human to pause AI replies. Staff replies are polled while the visitor's consented chat is open; this is not a promise of immediate availability." } },
        { name: "storageConsent", label: "Consent to store chat received", type: "checkbox", admin: { readOnly: true } },
        { name: "consentedAt", label: "Storage consent recorded at", type: "date", admin: { readOnly: true } },
        { name: "replyToVisitor", label: "Send a reply to the visitor", type: "textarea", maxLength: 2000, admin: { rows: 5, description: "Save to send. Only the current consented browser session can receive it. No email transcript is sent." } },
        { name: "retentionExpiresAt", label: "Retention expiry", type: "date", required: true, index: true, admin: { readOnly: true } },
      ] },
    ] },
  ],
  hooks: { beforeChange: [({ data, originalDoc, req }) => {
    if (req.user) { for (const field of ["sessionId", "messages", "locale", "storageConsent", "consentedAt", "retentionExpiresAt"]) {
      if (originalDoc?.[field] !== undefined) data[field] = originalDoc[field]; else delete data[field];
    } }
    if (data.replyToVisitor?.trim()) {
      if (!originalDoc?.storageConsent || Date.parse(originalDoc.retentionExpiresAt) <= Date.now()) throw new Error("This conversation has no active storage consent.");
      if (looksSensitive(data.replyToVisitor)) throw new Error("Do not request passwords, card details, or secret credentials.");
      data.messages = [...(originalDoc.messages || []), { role: "human", sentAt: new Date().toISOString(), content: data.replyToVisitor.trim() }].slice(-100);
      data.replyToVisitor = ""; data.mode = "human"; data.followUpRequired = false;
    }
    return data;
  }] },
};
