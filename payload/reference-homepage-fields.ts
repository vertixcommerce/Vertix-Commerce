import type { CollapsibleField, Field } from "payload";
import { imageFields } from "./homepage-fields";
import { safeURL } from "../lib/public-config";

const whyImageFields = imageFields().map(field => field.type === "row" ? {
  ...field, fields: field.fields.map(child => child.type === "select" ? { ...child, enumName: `ref_home_why_${child.name}` } : child),
} : field);
const sections: CollapsibleField[] = [
    { type: "collapsible", label: "Hero details", admin: { initCollapsed: true }, fields: [
      { name: "compactLayout", label: "Use streamlined homepage", type: "checkbox", defaultValue: true, admin: { description: "Keeps the hero clear, removes repeated highlight strips, shortens the About preview, and hides empty sections. Saved detailed content is retained; turn off to show it again." } },
      { name: "heroChecks", label: "Short hero highlights", type: "array", maxRows: 3, fields: [{ name: "text", type: "text", required: true, maxLength: 80 }] },
      { name: "heroBadges", label: "Feature strip below hero", type: "array", maxRows: 4, fields: [{ name: "title", type: "text", required: true, maxLength: 100 }, { name: "description", type: "text", maxLength: 180 }] },
      { name: "heroOverlayHeading", type: "text", defaultValue: "Commerce overview" },
      { name: "heroOverlayText", type: "text", defaultValue: "Your store. Your next steps." },
      { name: "heroMetrics", label: "Verified hero figures (optional)", type: "array", maxRows: 2, admin: { description: "Only real, approved figures. Blank means no sales/results statistics are displayed." }, fields: [{ name: "label", type: "text", required: true }, { name: "value", type: "text", required: true }, { name: "context", type: "text" }] },
    ] },
    { type: "collapsible", label: "Service cards", admin: { initCollapsed: true }, fields: [
      { name: "servicesEnabled", label: "Show services", type: "checkbox", defaultValue: true },
      { name: "servicesIntroduction", type: "textarea", defaultValue: "Explore our published services and discuss the support your business needs." },
    ] },
    { type: "collapsible", label: "Market cards", admin: { initCollapsed: true }, fields: [
      { name: "marketsEnabled", label: "Show markets", type: "checkbox", defaultValue: true },
      { name: "marketsEyebrow", type: "text", defaultValue: "Global coverage" },
      { name: "marketsHeading", type: "text", defaultValue: "Your Business. Four Key Markets." },
      { name: "marketsIntroduction", type: "textarea", defaultValue: "Explore your requirements across the USA, UK, Australia and Germany." },
      { name: "markets", label: "Market cards and hero country strip", type: "array", maxRows: 12, fields: [
        { name: "country", type: "select", required: true, options: [{ label: "USA", value: "usa" }, { label: "UK", value: "uk" }, { label: "Australia", value: "australia" }, { label: "Germany", value: "germany" }] },
        { name: "title", type: "text", required: true }, { name: "description", type: "textarea" },
        { name: "image", label: "Optional replacement landmark image", type: "upload", relationTo: "media" },
      ] },
    ] },
    { type: "collapsible", label: "Why choose Vertix", admin: { initCollapsed: true }, fields: [
      { name: "whyEnabled", label: "Show introduction", type: "checkbox", defaultValue: true },
      { name: "whyEyebrow", type: "text", defaultValue: "Why choose Vertix Commerce" },
      { name: "whyHeading", type: "text", defaultValue: "Commerce Support Built Around You" },
      { name: "whyIntroduction", type: "textarea", defaultValue: "Tell us about your store, priorities and target markets. Together, we can discuss the scope and next steps for your business." },
      { name: "whyMedia", label: "Optional replacement collaboration image", type: "group", fields: whyImageFields },
      { name: "whyBadge", type: "text", defaultValue: "Your commerce goals, in focus" },
      { name: "whyCards", type: "array", maxRows: 8, fields: [{ name: "title", type: "text", required: true }, { name: "description", type: "textarea" }] },
    ] },
    { type: "collapsible", label: "Process timeline", admin: { initCollapsed: true }, fields: [
      { name: "processEnabled", label: "Show process", type: "checkbox", defaultValue: true },
      { name: "processEyebrow", type: "text", defaultValue: "Start a conversation" },
      { name: "processHeading", type: "text", defaultValue: "A Clearer Path to Your Next Step" },
      { name: "steps", type: "array", maxRows: 8, fields: [{ name: "title", type: "text", required: true }, { name: "description", type: "textarea" }] },
    ] },
    { type: "collapsible", label: "Client reviews", fields: [
      { name: "reviewsHelp", type: "ui", admin: { components: { Field: "/components/admin/ReviewsHelp#ReviewsHelp" } } },
      { name: "reviewsEnabled", label: "Show review section when approved reviews are available", type: "checkbox", defaultValue: true },
      { name: "reviewsEyebrow", type: "text", defaultValue: "Client reviews" },
      { name: "reviewsHeading", type: "text", defaultValue: "What Our Clients Say" },
      { name: "reviews", label: "Client review cards", type: "array", labels: { singular: "Client review", plural: "Client reviews" }, maxRows: 12, admin: { description: "Click Add Client review, enter the name and feedback, then approve it only after permission is obtained. Drag rows to reorder; delete a row to remove it." }, fields: [
        { name: "approved", label: "Permission obtained and review approved", type: "checkbox", defaultValue: false },
        { name: "name", label: "Public client name", type: "text", required: true },
        { name: "quote", type: "textarea", required: true }, { name: "country", type: "text" },
        { name: "portrait", type: "upload", relationTo: "media" },
        { name: "rating", type: "number", min: 1, max: 5 },
      ] },
    ] },
    { type: "collapsible", label: "Inquiry, FAQs and latest articles", admin: { initCollapsed: true }, fields: [
      { name: "contactEnabled", label: "Show inquiry form", type: "checkbox", defaultValue: true },
      { name: "contactEyebrow", type: "text", defaultValue: "Let's discuss" },
      { name: "contactHeading", type: "text", defaultValue: "Ready to Grow Your Commerce Business?" },
      { name: "contactIntroduction", type: "textarea", defaultValue: "Share your project with us and discuss how we can support your commerce goals. Scope, pricing and timing are confirmed by the team." },
      { name: "faqEnabled", label: "Show published FAQs", type: "checkbox", defaultValue: true },
      { name: "faqHeading", type: "text", defaultValue: "Answers to Common Questions" },
      { name: "blogEnabled", label: "Show latest published articles", type: "checkbox", defaultValue: true },
      { name: "blogHeading", type: "text", defaultValue: "Latest Insights & Resources" },
      { name: "footerIntroduction", type: "textarea", defaultValue: "Explore Vertix Commerce services and discuss your business requirements with our team." },
      { name: "footerTagline", type: "text", defaultValue: "Your commerce goals. Our next conversation." },
      { name: "extraNavigation", label: "Optional header links", type: "array", maxRows: 4, admin: { description: "Only add links to existing pages or sections, such as /#reviews. Removed Countries/Process navigation is not automatically restored." }, fields: [{ name: "label", type: "text", required: true }, { name: "url", type: "text", required: true, validate: (value: unknown) => safeURL(value, true) ? true : "Use an HTTPS URL or local page/section path." }] },
    ] },
];
export const referenceHomepageFields: Field = {
  name: "referenceHomepage", label: "Homepage section content", type: "group",
  admin: { description: "For the screenshot-style homepage. Switching layouts preserves these settings. Publish only verified content and consented reviews." },
  // Unnamed tabs are presentation-only: all existing referenceHomepage field paths stay unchanged.
  fields: [{ type: "tabs", tabs: [
    { label: "Client reviews", fields: sections.find(section => section.label === "Client reviews")!.fields },
    { label: "Other homepage sections", fields: sections.filter(section => section.label !== "Client reviews") },
  ] }],
};
