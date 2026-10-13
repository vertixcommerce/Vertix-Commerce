import type { Field } from "payload";
export const aboutLayoutFields: Field[] = [
  { name: "focusHeading", label: "Focus card heading", type: "text" },
  { name: "focusIntroduction", label: "Focus card introduction", type: "textarea" },
  { name: "focusItems", label: "Focus card items", type: "array", fields: [{ name: "text", type: "text", required: true }] },
  { name: "principlesHeading", label: "Principles heading", type: "text" },
  { name: "principlesIntroduction", label: "Principles introduction", type: "textarea" },
  { name: "principles", label: "Principle cards", type: "array", fields: [
    { name: "title", type: "text", required: true }, { name: "description", type: "textarea", required: true },
  ] },
  { name: "approachHeading", label: "Working approach heading", type: "text" },
  { name: "approachIntroduction", label: "Working approach introduction", type: "textarea" },
  { name: "approachSteps", label: "Working approach steps", type: "array", fields: [
    { name: "title", type: "text", required: true }, { name: "description", type: "textarea", required: true },
  ] },
  { name: "marketsEnabled", label: "Show published markets", type: "checkbox", defaultValue: true, admin: { description: "Uses published country records automatically. No unpublished market is added." } },
  { name: "marketsHeading", label: "Markets heading", type: "text" },
  { name: "marketsIntroduction", label: "Markets introduction", type: "textarea" },
  { name: "teamHeading", label: "Team section heading", type: "text" },
  { name: "teamMembers", label: "Team members (optional)", type: "array", admin: { description: "Add only real people with permission. The section stays hidden until at least one member is approved." }, fields: [
    { name: "name", type: "text", required: true }, { name: "role", type: "text", required: true },
    { name: "bio", type: "textarea" }, { name: "portrait", type: "upload", relationTo: "media" },
    { name: "approved", label: "Approved for public use", type: "checkbox", defaultValue: false },
  ] },
  { name: "contactHeading", label: "Final contact heading", type: "text" },
  { name: "contactIntroduction", label: "Final contact introduction", type: "textarea" },
  { name: "contactButtonLabel", label: "Final contact button label", type: "text" },
];
