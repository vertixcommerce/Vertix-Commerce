import type { GlobalConfig } from "payload";
import { contentEditor } from "../access";
import { imageFields } from "../homepage-fields";
import { seoFields } from "../fields";
import { safeURL } from "../../lib/public-config";

import { aboutLayoutFields } from "../about-layout-fields";

export const AboutPage: GlobalConfig = {
  slug: "about-page", label: "About Vertix",
  admin: { group: "Website content", description: "Edit the About Vertix hero, responsive image, meeting button and company introduction. Saved changes appear without rebuilding." },
  access: { read: contentEditor, update: contentEditor },
  fields: [{ type: "tabs", tabs: [
    { label: "Hero & meeting", fields: [
      { name: "heroEyebrow", label: "Small heading", type: "text", defaultValue: "Vertix Commerce", maxLength: 150 },
      { name: "heroTitle", label: "Hero heading", type: "text", required: true, defaultValue: "About Vertix", maxLength: 300 },
      { name: "heroIntroduction", label: "Hero introduction", type: "textarea", maxLength: 1500 },
      { name: "heroMedia", label: "Hero images", type: "group", fields: imageFields() },
      { name: "meetingButtonLabel", label: "Meeting button text", type: "text", required: true, defaultValue: "Schedule a meeting", maxLength: 80 },
      { name: "meetingURL", label: "Optional meeting booking override", type: "text", validate: (value: unknown) => !value || safeURL(value) ? true : "Use a complete HTTPS booking URL.", admin: { description: "Leave empty to use Website settings → Contact & booking. With neither configured, the button opens the meeting inquiry form, not a confirmed booking." } },
    ] },
    { label: "Who we are", fields: [
      { name: "cardHeading", label: "Introduction card heading", type: "text", required: true, defaultValue: "Who we are", maxLength: 300 },
      { name: "cardContent", label: "Company introduction", type: "richText", admin: { description: "Write your business-approved story here. This text is not automatically approved as AI knowledge." } },
    ] },
    { label: "Page sections", fields: aboutLayoutFields },
    { label: "Search & sharing", fields: [seoFields] },
  ] }],
};

