import type { CollectionConfig } from "payload";
import { contentEditor, authenticated } from "../access";
import { orderField, slugField } from "../fields";

export const ServiceCategories: CollectionConfig = {
  slug: "service-categories", labels: { singular: "Menu category", plural: "Service menu categories" },
  admin: { useAsTitle: "name", group: "Website content", description: "These headings group services in the hover menu. Rename, reorder, or disable a heading here.", defaultColumns: ["name", "enabled", "displayOrder"], listSearchableFields: ["name", "slug"] },
  defaultSort: "displayOrder",
  access: { read: authenticated, create: contentEditor, update: contentEditor, delete: contentEditor },
  fields: [
    { name: "name", label: "Category heading", type: "text", required: true, admin: { description: "For example E-commerce Services or Web Development." } },
    slugField,
    { name: "enabled", label: "Show this category in menu", type: "checkbox", defaultValue: true, admin: { description: "Disabling a category hides its menu group. Service pages remain available." } },
    orderField,
  ],
};
