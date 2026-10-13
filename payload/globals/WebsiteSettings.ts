import type { GlobalConfig } from "payload";
import { administrator, ownerField } from "../access";
import { homepageFields } from "../homepage-fields";
import { referenceHomepageFields } from "../reference-homepage-fields";
export const WebsiteSettings: GlobalConfig = {
  slug: "website-settings", label: "Website settings",
  admin: { group: "Settings", description: "Manage your branding, service section labels, contact links, and privacy preferences." },
  access: { read: administrator, update: administrator },
  fields: [{ type: "tabs", tabs: [
    { label: "Brand & homepage", fields: [
      { name: "businessName", label: "Business name", type: "text", required: true, defaultValue: "Vertix Commerce" },
      { name: "servicesMenuLabel", label: "Services navigation label", type: "text", required: true, defaultValue: "Services" },
      { name: "aboutMenuLabel", label: "About navigation label", type: "text", required: true, defaultValue: "About", maxLength: 50 },
      { name: "expertiseEyebrow", label: "Small expertise heading", type: "text", required: true, defaultValue: "Focused expertise" },
      { name: "expertiseTitle", label: "Main expertise heading", type: "text", required: true, defaultValue: "Services built around your business" },
      { name: "heroTitle", label: "Homepage main heading", type: "text", defaultValue: "Grow Your eCommerce Store with Expert Support" },
      { name: "heroIntroduction", label: "Homepage introduction", type: "textarea", admin: { description: "Approved business introduction. Leave empty to display a neutral invitation to discuss your requirements." } },
      ...homepageFields,
    ] },
    { label: "Homepage sections", fields: [referenceHomepageFields] },
    { label: "Contact & booking", fields: [
      { name: "bookingSetupHelp", type: "ui", admin: { components: { Field: "/components/admin/BookingSetupHelp#BookingSetupHelp" } } },
      { name: "contactEmail", label: "Public contact email", type: "email" },
      { name: "whatsappNumber", label: "Business WhatsApp", type: "text", admin: { description: "Include the international country code, for example +441234567890." } },
      { name: "bookingURL", label: "Meeting booking link", type: "text", admin: { description: "Paste the full event URL, e.g. https://calendly.com/your-business/consultation. CALENDLY_EVENT_URL in the server environment takes priority." } },
      { name: "leadNotificationEmail", label: "Inquiry notification inbox", type: "email", admin: { description: "Private address that receives notifications when inquiries arrive." } },
    ] },
    { label: "Social media", fields: [
      { name: "socialLinksHelp", type: "ui", admin: { components: { Field: "/components/admin/SocialLinksHelp#SocialLinksHelp" } } },
      { name: "socialLinks", label: "Footer social links", type: "array", labels: { singular: "Social link", plural: "Social links" }, admin: { description: "Add real business profiles. Drag rows to change their order." }, fields: [
        { name: "platform", type: "select", required: true, options: [{ label: "Facebook", value: "facebook" }, { label: "Instagram", value: "instagram" }, { label: "LinkedIn", value: "linkedin" }, { label: "YouTube", value: "youtube" }, { label: "X", value: "x" }, { label: "TikTok", value: "tiktok" }] },
        { name: "label", label: "Accessible link label", type: "text", admin: { description: "For example Vertix Commerce on LinkedIn." } },
        { name: "url", label: "Profile URL", type: "text", required: true },
      ] },
    ] },
    { label: "Data retention", fields: [
      { name: "leadRetentionDays", label: "Inquiry retention (days)", type: "number", required: true, defaultValue: 365, min: 1, max: 2555, admin: { description: "Used to calculate expiry for newly captured inquiries." } },
      { name: "conversationRetentionDays", label: "Conversation retention (days)", type: "number", required: true, defaultValue: 90, min: 1, max: 365, admin: { description: "Used when conversation records are created. Automatic deletion still requires a scheduled retention job." } },
      { name: "retentionCleanupEnabled", label: "Enable scheduled expiry deletion", type: "checkbox", defaultValue: false, access: { update: ownerField }, admin: { description: "Expired inquiries and conversations are permanently deleted when the authenticated retention job runs. Enable only after approving the retention policy and configuring the scheduler." } },
    ] },
    { label: "Legal pages", fields: [
      { name: "privacyText", label: "Privacy notice content", type: "textarea", maxLength: 30000, admin: { rows: 14, description: "Business-reviewed notice, including contact details, processing purposes, providers, retention, and rights." } },
      { name: "privacyApproved", label: "Privacy notice approved for publication", type: "checkbox", defaultValue: false, access: { update: ownerField } },
      { name: "termsText", label: "Terms content", type: "textarea", maxLength: 30000, admin: { rows: 14 } },
      { name: "termsApproved", label: "Terms approved for publication", type: "checkbox", defaultValue: false, access: { update: ownerField } },
    ] },
  ] }],
};
