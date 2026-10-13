import type { Block, Field } from "payload";
import { safeURL } from "../lib/public-config";

const url: Field = { name: "url", label: "Link", type: "text", validate: (value: unknown) => !value || safeURL(value, true) ? true : "Use an HTTPS URL or a local path such as /contact." };
export const buttonFields: Field[] = [
  { name: "label", type: "text", required: true, maxLength: 80 }, { ...url, required: true },
];
const shared = (): Field[] => [
  { name: "sectionName", label: "Section name in this editor", type: "text", required: true, maxLength: 100 },
  { type: "row", fields: [
    { name: "enabled", label: "Show this section", type: "checkbox", defaultValue: true },
    { name: "theme", label: "Background", type: "select", defaultValue: "white", options: [{ label: "White", value: "white" }, { label: "Soft blue", value: "blue" }, { label: "Dark navy", value: "navy" }] },
    { name: "spacing", type: "select", defaultValue: "normal", options: [{ label: "Compact", value: "compact" }, { label: "Normal", value: "normal" }, { label: "Spacious", value: "spacious" }] },
  ] },
  { name: "eyebrow", label: "Small heading", type: "text", maxLength: 150 },
  { name: "heading", type: "text", maxLength: 300 },
];
export const imageFields = (): Field[] => [
  { name: "image", label: "Desktop / default image", type: "upload", relationTo: "media" },
  { name: "mobileImage", label: "Optional mobile image", type: "upload", relationTo: "media", admin: { description: "Used below 768 px. Otherwise the default image adapts automatically." } },
  { type: "row", fields: [
    { name: "imageFit", label: "Image fitting", type: "select", defaultValue: "cover", options: [{ label: "Fill frame (may crop)", value: "cover" }, { label: "Show complete image", value: "contain" }] },
    { name: "imageRatio", label: "Desktop frame", type: "select", defaultValue: "landscape", options: [{ label: "Landscape 16:9", value: "landscape" }, { label: "Square", value: "square" }, { label: "Portrait 4:5", value: "portrait" }] },
    { name: "mobileImageRatio", label: "Mobile frame", type: "select", defaultValue: "square", options: [{ label: "Landscape 16:9", value: "landscape" }, { label: "Square", value: "square" }, { label: "Portrait 4:5", value: "portrait" }] },
  ] },
  { type: "row", fields: [
    { name: "imagePositionX", label: "Horizontal crop focus (%)", type: "number", min: 0, max: 100, admin: { description: "Optional override. Defaults to the image's focal point; 50 is centered." } },
    { name: "imagePositionY", label: "Vertical crop focus (%)", type: "number", min: 0, max: 100 },
  ] },
];
export const homepageBlocks: Block[] = [
  { slug: "services", labels: { singular: "Service cards", plural: "Service cards" }, fields: [...shared(), { name: "serviceSource", label: "Show services", type: "select", defaultValue: "featured", options: [{ label: "Featured published services", value: "featured" }, { label: "All published services", value: "all" }] }] },
  { slug: "imageText", labels: { singular: "Image & text", plural: "Image & text" }, fields: [...shared(), { name: "body", type: "richText" }, ...imageFields(), { name: "imageSide", label: "Image position", type: "select", defaultValue: "right", options: [{ label: "Right", value: "right" }, { label: "Left", value: "left" }] }, { name: "buttons", type: "array", maxRows: 2, fields: buttonFields }] },
  { slug: "text", labels: { singular: "Text / announcement", plural: "Text sections" }, fields: [...shared(), { name: "body", type: "richText" }] },
  { slug: "features", labels: { singular: "Feature cards", plural: "Feature card sections" }, fields: [...shared(), { name: "cards", type: "array", maxRows: 12, fields: [{ name: "title", type: "text", required: true }, { name: "description", type: "textarea" }, { ...url }] }] },
  { slug: "gallery", labels: { singular: "Image gallery", plural: "Image galleries" }, fields: [...shared(), { name: "images", type: "array", maxRows: 12, fields: [{ name: "image", type: "upload", relationTo: "media", required: true }, { name: "caption", type: "text" }] }] },
  { slug: "faqs", labels: { singular: "Published FAQs", plural: "FAQ sections" }, fields: shared() },
  { slug: "markets", labels: { singular: "Published country cards", plural: "Country sections" }, fields: shared() },
  { slug: "cta", labels: { singular: "Call to action", plural: "Calls to action" }, fields: [...shared(), { name: "description", type: "textarea" }, { name: "buttons", type: "array", maxRows: 2, fields: buttonFields }] },
];
export const homepageFields: Field[] = [
  { type: "collapsible", label: "Hero layout & images", admin: { initCollapsed: true }, fields: [
    { name: "heroEnabled", label: "Show hero section", type: "checkbox", defaultValue: true },
    { name: "heroEyebrow", label: "Hero small heading", type: "text", defaultValue: "Vertix Commerce" },
    { name: "heroLayout", label: "Hero layout", type: "select", defaultValue: "split", options: [{ label: "Text beside image", value: "split" }, { label: "Centered text with image below", value: "centered" }] },
    { name: "heroImageSide", label: "Hero image position", type: "select", defaultValue: "right", options: [{ label: "Right", value: "right" }, { label: "Left", value: "left" }] },
    { name: "heroTheme", label: "Hero background", type: "select", defaultValue: "blue", options: [{ label: "White", value: "white" }, { label: "Soft blue", value: "blue" }, { label: "Dark navy", value: "navy" }] },
    { name: "heroMedia", label: "Responsive hero image", type: "group", fields: imageFields() },
    { name: "heroButtons", label: "Custom hero buttons", type: "array", maxRows: 2, admin: { description: "Leave empty for the contact and configured booking buttons." }, fields: buttonFields },
  ] },
  { name: "homepageLayoutMode", label: "Homepage layout", type: "select", defaultValue: "standard", options: [{ label: "Screenshot-style commerce homepage", value: "reference" }, { label: "Original standard sections", value: "standard" }, { label: "My custom sections below", value: "custom" }], admin: { description: "Reference uses the screenshot design and its editor below. Custom uses the saved reusable sections in their order. Switching layouts preserves both sets of content." } },
  { name: "homepageSections", label: "Reusable homepage sections", type: "blocks", blocks: homepageBlocks, maxRows: 30, admin: { initCollapsed: true, description: "Add sections, drag to reorder, duplicate from the row menu, or switch off a section. Only publish approved business information. Homepage text is not automatically approved as AI knowledge." } },
];
