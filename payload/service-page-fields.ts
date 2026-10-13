import type { Field, UploadField } from "payload";
import { safeURL } from "../lib/public-config";

const text = (name: string, label: string, required = false): Field => ({ name, label, type: "text", required });
const approved: Field = { name: "approved", label: "Approved for public use", type: "checkbox", defaultValue: false, admin: { description: "Confirm this is accurate and you have permission to publish it. Unapproved rows are hidden." } };
const image = (name: string, label: string): UploadField => ({ name, label, type: "upload", relationTo: "media" });
const url: Field = { name: "url", label: "Optional link", type: "text", validate: (value: unknown) => !value || safeURL(value, true) ? true : "Use an HTTPS URL or a local path starting with /." };
export const servicePageFields: Field[] = [
  { name: "servicePage", label: "Service page layout", type: "group", admin: { description: "Every service uses this reusable layout. Add rows to create components; empty sections stay hidden. Publish the service to apply changes." }, fields: [
    { name: "hideAboutSection", label: "Hide About this service", type: "checkbox", defaultValue: false, admin: { description: "Hide the description section on this service page without deleting its content." } },
    image("heroImage", "Hero image (optional)"), text("heroImageAlt", "Hero image description"),
    text("secondaryButtonLabel", "Second button label (optional)"),
    { name: "results", label: "Results", type: "array", maxRows: 8, fields: [text("value", "Result value", true), text("label", "Result description", true), text("context", "Measurement period / context", true), approved] },
    text("resultsHeading", "Results section heading"),
    { name: "clients", label: "Client logos", type: "array", fields: [text("name", "Client name", true), { ...image("logo", "Client logo"), required: true }, approved] },
    text("clientsHeading", "Client section heading"),
    { name: "caseStudies", label: "Case studies", type: "array", fields: [text("title", "Case study title", true), { name: "description", type: "textarea", required: true }, image("image", "Case study image"), text("outcome", "Documented outcome (optional)"), text("context", "Outcome period / context"), url, approved] },
    text("caseStudiesHeading", "Case studies section heading"),
    { name: "packages", label: "Service offering cards", type: "array", fields: [text("title", "Offering title", true), { name: "icon", label: "Card icon", type: "select", defaultValue: "auto", options: [{label:"Automatic",value:"auto"},{label:"Listing / checklist",value:"listing"},{label:"Growth / analytics",value:"analytics"},{label:"Advertising",value:"advertising"},{label:"Account health",value:"health"},{label:"Warehouse / logistics",value:"logistics"},{label:"Storefront",value:"store"},{label:"Security",value:"security"},{label:"Global markets",value:"markets"}], admin: { description: "Choose an icon for this card. Automatic keeps the existing title-based icon." } }, { name: "description", type: "textarea", required: true }, { name: "items", label: "Included activities", type: "array", fields: [text("text", "Activity", true)] }, text("buttonLabel", "Inquiry button label")] },
    text("packagesHeading", "Offering section heading"),
    { name: "faqs", label: "Service FAQs", type: "array", fields: [text("question", "Question", true), { name: "answer", type: "textarea", required: true }] },
    text("contactHeading", "Final inquiry section heading"),
    { name: "contactIntroduction", label: "Final inquiry introduction", type: "textarea" },
  ] },
];

