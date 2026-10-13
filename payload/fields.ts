import type { Field } from "payload";

export const statusField: Field = {
  name: "status", label: "Publication status", type: "select", required: true,
  defaultValue: "draft", index: true,
  options: [{ label: "Draft — hidden from visitors", value: "draft" }, { label: "Published — visible on website", value: "published" }],
  admin: { position: "sidebar", description: "Publish only when the content is ready for visitors." },
};
export const seoFields: Field = {
  name: "seo", label: "Search engine appearance", type: "group",
  fields: [
    { name: "title", label: "Search title", type: "text", maxLength: 70, admin: { description: "Up to 70 characters. Use a clear, descriptive title." } },
    { name: "description", label: "Search description", type: "textarea", maxLength: 170, admin: { description: "A short summary for search results, up to 170 characters." } },
    { name: "canonicalURL", label: "Canonical URL", type: "text", admin: { description: "Optional preferred URL when the same content appears elsewhere." } },
    { name: "noIndex", label: "Hide from search engines", type: "checkbox", defaultValue: false },
  ],
};
export const slugField: Field = {
  name: "slug", label: "Page URL name", type: "text", required: true, unique: true, index: true,
  admin: { description: "Lowercase words separated by hyphens, for example ebay-account-management. Changing this changes the page address." },
  validate: (value: unknown) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? true : "Use lowercase letters, numbers, and single hyphens.",
};
export const localeField: Field = {
  name: "locale", label: "Language", type: "select", required: true, defaultValue: "en",
  options: [{ label: "English", value: "en" }, { label: "German", value: "de" }],
};
export const orderField: Field = {
  name: "displayOrder", label: "Display order", type: "number", defaultValue: 0,
  admin: { description: "Lower numbers appear first. Use 10, 20, 30 to leave room between items." },
};
export const countries = ["usa", "uk", "australia", "germany"].map(value => ({
  label: value === "usa" ? "United States" : value === "uk" ? "United Kingdom" : value[0].toUpperCase() + value.slice(1), value,
}));
