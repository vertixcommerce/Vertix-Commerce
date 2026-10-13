import type { CollectionConfig } from "payload";
import { contentEditor, publishedOrAuthenticated } from "../access";
import { countries, orderField, seoFields, slugField, statusField } from "../fields";

import { servicePageFields } from "../service-page-fields";

export const Services: CollectionConfig = {
  slug: "services", labels: { singular: "Service", plural: "Services" },
  admin: {
    useAsTitle: "name", group: "Website content",
    description: "Each record is a service link you control. Rename it, change its category or order, or turn off Show in Services menu in the Menu & homepage tab. Publish to apply changes; refresh the website to see them.",
    defaultColumns: ["name", "category", "status", "navigationVisible", "displayOrder"],
    listSearchableFields: ["name", "slug", "shortDescription"],
    preview: doc => "/services/" + doc.slug,
  },
  defaultSort: "displayOrder", versions: { drafts: true },
  access: { read: publishedOrAuthenticated, create: contentEditor, update: contentEditor, delete: contentEditor },
  fields: [
    { name: "name", label: "Service name", type: "text", required: true },
    statusField,
    { type: "tabs", tabs: [
      { label: "Page content", description: "The information customers see on this service page.", fields: [
        { type: "row", fields: [slugField, { name: "category", label: "Menu category", type: "relationship", relationTo: "service-categories", required: true, admin: { description: "Choose the heading this service appears under in the Services menu." } }] },
        { name: "shortDescription", label: "Short introduction", type: "textarea", required: true, maxLength: 300, admin: { description: "Appears in the page introduction and service cards. Up to 300 characters." } },
        { name: "fullDescription", label: "Detailed service content", type: "richText" },
        { name: "benefits", label: "Service benefits", type: "array", labels: { singular: "Benefit", plural: "Benefits" }, fields: [{ name: "text", label: "Benefit", type: "text", required: true }] },
        { name: "processSteps", label: "How the service works", type: "array", labels: { singular: "Step", plural: "Steps" }, fields: [{ name: "title", label: "Step title", type: "text", required: true }, { name: "description", type: "textarea" }] },
      ] },
      { label: "Service layout", fields: servicePageFields },
      { label: "Menu & homepage", description: "Control where this service appears.", fields: [
        { name: "navigationVisible", label: "Show in Services menu", type: "checkbox", defaultValue: true, admin: { description: "Turn off to remove this link from the hover menu without hiding its page." } },
        { name: "featured", label: "Feature on homepage", type: "checkbox", defaultValue: false, admin: { description: "Shows a card in the homepage expertise section. Published services only." } },
        orderField,
        { name: "countryAvailability", label: "Countries served", admin: { description: "Published services automatically appear on these country pages. Unselect a country to remove the service from its page." }, type: "select", hasMany: true, options: countries },
      ] },
      { label: "Search & sharing", fields: [seoFields] },
      { label: "Assistant approval", fields: [
        { name: "locale", label: "Content language", type: "select", required: true, defaultValue: "en", options: [{ label: "English", value: "en" }, { label: "German", value: "de" }] },
        { name: "assistantApproved", label: "Approved for assistant use", type: "checkbox", defaultValue: false, admin: { description: "The assistant uses this service only when approved and published. Review all business claims first." } },
      ] },
    ] },
  ],
};

