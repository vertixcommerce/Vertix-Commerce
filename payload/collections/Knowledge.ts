import type { CollectionConfig } from "payload";
import { contentEditor, authenticated } from "../access";
import { localeField, statusField } from "../fields";
export const Knowledge: CollectionConfig = {
  slug: "knowledge", labels: { singular: "Knowledge article", plural: "Knowledge base" },
  admin: { useAsTitle: "title", group: "Assistant", description: "The assistant can use an article only when it is both approved and published.", defaultColumns: ["title", "locale", "approved", "status"], listSearchableFields: ["title", "content"] },
  versions: { drafts: true },
  access: { read: authenticated, create: contentEditor, update: contentEditor, delete: contentEditor },
  fields: [
    { name: "title", label: "Article title", type: "text", required: true }, statusField,
    { type: "tabs", tabs: [
      { label: "Knowledge content", fields: [
        { name: "content", label: "Approved business information", type: "textarea", required: true, maxLength: 12000, admin: { rows: 14, description: "Use factual content authorized by the business. Do not include passwords, payment data, or customer personal information." } },
      ] },
      { label: "Review & discovery", fields: [
        localeField,
        { name: "tags", label: "Search keywords", type: "text", hasMany: true, admin: { description: "Add topics customers might ask about, such as listings, store setup, or Germany." } },
        { name: "approved", label: "Approved public content for assistant use", type: "checkbox", defaultValue: false, required: true, admin: { description: "Gemini free tier receives this content. Approve only public, non-confidential business facts with no personal information. Publication is also required." } },
      ] },
    ] },
  ],
};
