import type { CollectionConfig } from "payload";
import { contentEditor, publishedOrAuthenticated } from "../access";
import { localeField, seoFields, slugField, statusField } from "../fields";
export const Countries: CollectionConfig = {
  slug: "countries", labels: { singular: "Country", plural: "Countries" },
  admin: { useAsTitle: "name", group: "Website content", description: "Manage useful local content and the services assigned to each market.", defaultColumns: ["name", "slug", "locale", "status"] },
  versions: { drafts: true },
  access: { read: publishedOrAuthenticated, create: contentEditor, update: contentEditor, delete: contentEditor },
  fields: [
    { name: "name", label: "Country name", type: "text", required: true }, statusField,
    { type: "tabs", tabs: [
      { label: "Local content", fields: [
        { type: "row", fields: [slugField, localeField] },
        { name: "introduction", label: "Country introduction", type: "textarea", required: true },
        { name: "localGuidance", label: "Country-specific guidance", type: "richText", admin: { description: "Write helpful local information. Avoid repeating the same text for every market." } },
      ] },
      { label: "Services & contact", fields: [
        { name: "services", label: "Legacy service links (not used on public page)", admin: { readOnly: true, description: "Public services are now listed automatically from each service’s Countries served selection." }, type: "relationship", relationTo: "services", hasMany: true },
        { type: "row", fields: [{ name: "ctaLabel", label: "Contact button label", type: "text" }, { name: "ctaURL", label: "Contact button URL", type: "text" }] },
      ] },
      { label: "Search & sharing", fields: [seoFields] },
    ] },
  ],
};
