import type { CollectionConfig } from "payload";
import { administrator, leadTeam } from "../access";
import { notifyLead } from "../../lib/lead-notifications";
export const Leads: CollectionConfig = {
  slug: "leads", labels: { singular: "Inquiry", plural: "Customer inquiries" },
  admin: { useAsTitle: "name", group: "Customers", description: "Review an inquiry, add internal notes, and update its follow-up status.", defaultColumns: ["name", "email", "country", "service", "leadStatus", "createdAt"], listSearchableFields: ["name", "email", "service"], hideAPIURL: true },
  defaultSort: "-createdAt",
  access: { read: leadTeam, create: () => false, update: leadTeam, delete: administrator },
  fields: [
    { name: "submissionKey", type: "text", unique: true, index: true, admin: { hidden: true } },
    { name: "leadStatus", label: "Follow-up status", type: "select", required: true, defaultValue: "new", admin: { position: "sidebar" }, options: [{ label: "New inquiry", value: "new" }, { label: "Contacted", value: "contacted" }, { label: "Qualified", value: "qualified" }, { label: "Meeting scheduled", value: "meeting-scheduled" }, { label: "Converted", value: "converted" }, { label: "Closed", value: "closed" }] },
    { type: "tabs", tabs: [
      { label: "Contact & requirements", fields: [
        { type: "row", fields: [{ name: "name", label: "Full name", type: "text", required: true }, { name: "email", label: "Email address", type: "email", required: true }] },
        { type: "row", fields: [{ name: "whatsapp", label: "WhatsApp number", type: "text", required: true }, { name: "country", type: "text", required: true }] },
        { name: "service", label: "Requested service", type: "text", required: true },
        { name: "requirements", label: "Customer requirements", type: "textarea", required: true, admin: { rows: 8 } },
      ] },
      { label: "Follow-up notes", fields: [
        { name: "internalNotes", label: "Private team notes", type: "textarea", admin: { rows: 10, description: "Record contact attempts and next steps. These notes are visible only to authorized staff." } },
      ] },
      { label: "Consent & delivery", fields: [
        { name: "consent", label: "Consent to contact received", type: "checkbox", required: true, admin: { readOnly: true } },
        { name: "consentedAt", label: "Consent recorded at", type: "date", required: true, admin: { readOnly: true } },
        { name: "source", label: "Inquiry source", type: "select", required: true, defaultValue: "website", options: [{ label: "Website form", value: "website" }, { label: "AI assistant", value: "assistant" }], admin: { readOnly: true } },
        { name: "notificationStatus", label: "Email notification", type: "select", required: true, defaultValue: "pending", options: [{ label: "Pending", value: "pending" }, { label: "Sent", value: "sent" }, { label: "Failed", value: "failed" }, { label: "Email not configured", value: "not-configured" }], admin: { readOnly: true, description: "Status of the business notification, not the customer's delivery status." } },
        { name: "retryNotification", type: "ui", admin: { components: { Field: "/components/admin/NotificationRetry#NotificationRetry" } } },
        { name: "retentionExpiresAt", label: "Retention expiry", type: "date", required: true, index: true, admin: { readOnly: true } },
      ] },
    ] },
  ],
  hooks: { beforeChange: [({ data, originalDoc, req, context }) => {
    if (req.user && !context.notificationUpdate) {
      for (const field of ["submissionKey", "consent", "consentedAt", "source", "notificationStatus", "retentionExpiresAt"]) {
        if (originalDoc?.[field] !== undefined) data[field] = originalDoc[field]; else delete data[field];
      }
    }
    return data;
  }], afterChange: [async ({ doc, previousDoc, operation, req, context }) => {
    if (!context.notificationUpdate && doc.consent && doc.notificationStatus !== "sent" && (operation === "create" || doc.leadStatus === "qualified" && previousDoc?.leadStatus !== "qualified")) {
      doc.notificationStatus = await notifyLead(req.payload, doc, req);
    }
    return doc;
  }] },
};
