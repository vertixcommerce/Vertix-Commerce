import type { CollectionConfig } from "payload";
import { contentEditor, publicOrAuthenticated } from "../access";
import { localeField, orderField, statusField } from "../fields";
export const FAQs: CollectionConfig = {
  slug: "faqs", labels: { singular: "FAQ", plural: "Frequently asked questions" },
  admin: { useAsTitle: "question", group: "Website content", description: "Keep customer answers short, accurate, and easy to understand.", defaultColumns: ["question", "locale", "service", "status"], listSearchableFields: ["question", "answer"] },
  defaultSort: "displayOrder",
  access: { read: publicOrAuthenticated, create: contentEditor, update: contentEditor, delete: contentEditor },
  fields: [
    { name: "question", label: "Customer question", type: "text", required: true },
    { name: "answer", label: "Approved answer", type: "textarea", required: true, admin: { rows: 6 } },
    { type: "row", fields: [localeField, { name: "service", label: "Related service", type: "relationship", relationTo: "services", admin: { description: "Optional. Leave empty for a general website FAQ." } }] },
    orderField, statusField,
    { name: "assistantApproved", label: "Approved for assistant use", type: "checkbox", defaultValue: false },
  ],
};
