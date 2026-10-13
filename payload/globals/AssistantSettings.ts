import type { GlobalConfig } from "payload";
import { administrator, ownerField } from "../access";
export const AssistantSettings: GlobalConfig = {
  slug: "assistant-settings", label: "Assistant settings",
  admin: { group: "Assistant", description: "Manage assistant preferences. Connection and messaging features must be configured before use." },
  access: { read: administrator, update: administrator },
  hooks: { beforeChange: [({ data, originalDoc, req }) => {
    if (data.instructions !== undefined && data.instructions !== originalDoc?.instructions && !req.user?.roles?.includes("owner")) data.publicInstructionsApproved = false;
    return data;
  }] },
  fields: [{ type: "tabs", tabs: [
    { label: "Availability", fields: [
      { name: "enabled", label: "Enable the assistant", type: "checkbox", defaultValue: true },
      { name: "allowLeadCapture", label: "Allow consented lead capture", type: "checkbox", defaultValue: true },
    ] },
    { label: "Instructions", fields: [
      { name: "instructions", label: "Additional assistant instructions", type: "textarea", maxLength: 8000, admin: { rows: 12, description: "Optional public communication preferences. They are NOT sent to Google unless the owner approves below. Only the first 1,000 characters are used. Facts must still come from approved public knowledge; these instructions cannot override exact-source safety rules." } },
      { name: "publicInstructionsApproved", label: "Owner approval: these instructions are public and non-confidential", type: "checkbox", defaultValue: false, access: { create: ownerField, update: ownerField }, admin: { description: "Allows these preferences to be sent to Gemini free tier. Do not include personal information, confidential business details or secrets." } },
    ] },
    { label: "Human follow-up", fields: [
      { name: "humanHandoffEnabled", label: "Offer human follow-up", type: "checkbox", defaultValue: true },
      { name: "offlineMessage", label: "Message when the team is unavailable", type: "text", defaultValue: "A human agent is not currently available. Leave your details and the team can follow up." },
      { name: "offlineMessageDE", label: "German offline message", type: "text", defaultValue: "Ein menschlicher Mitarbeiter ist derzeit nicht verfügbar. Hinterlassen Sie eine Anfrage; das Team kann sich bei Verfügbarkeit melden." },
    ] },
    { label: "Usage", fields: [
      { name: "monthlyTokenBudget", label: "Monthly token budget", type: "number", min: 0, admin: { description: "Optional shared Redis token cap. Zero means no additional cap. Requests reserve a conservative token allowance before contacting the provider." } },
    ] },
  ] }],
};
