import type { SanitizedPermissions } from "payload";

export const adminModules = [
  { slug: "about-page", title: "About Vertix", group: "Website content", description: "Hero image, meeting button and company introduction.", icon: "users", global: true },
  { slug: "articles", title: "Blog articles", group: "Website content", description: "Draft, publish and expand your article library.", icon: "book" },
  { slug: "media", title: "Media library", group: "Website content", description: "Responsive images for your homepage, About page and articles.", icon: "image" },
  { slug: "services", title: "Services", group: "Website content", description: "Service pages, homepage cards, and menu visibility.", icon: "store" },
  { slug: "service-categories", title: "Menu categories", group: "Website content", description: "Rename and reorder the Services menu headings.", icon: "layers" },
  { slug: "countries", title: "Countries", group: "Website content", description: "Local content and services for each market.", icon: "globe" },
  { slug: "faqs", title: "FAQs", group: "Website content", description: "Helpful answers to customer questions.", icon: "help" },
  { slug: "leads", title: "Customer inquiries", group: "Customers", description: "Contact details, requirements, and follow-up status.", icon: "inbox" },
  { slug: "conversations", title: "Conversations", group: "Customers", description: "Stored messages and requests for team follow-up.", icon: "chat" },
  { slug: "knowledge", title: "Knowledge base", group: "Assistant", description: "Review and approve the facts the assistant can use.", icon: "book" },
  { slug: "assistant-settings", title: "Assistant settings", group: "Assistant", description: "Assistant instructions and follow-up preferences.", icon: "bot", global: true },
  { slug: "website-settings", title: "Website settings", group: "Settings", description: "Homepage sections, client reviews, booking, social links and retention.", icon: "settings", global: true },
  { slug: "users", title: "Team members", group: "Settings", description: "Team accounts and role permissions.", icon: "users" },
] as const;

export function visibleAdminModules(permissions: SanitizedPermissions) {
  return adminModules.filter(module => "global" in module
    ? permissions.globals?.[module.slug]?.read === true
    : permissions.collections?.[module.slug]?.read === true);
}

const adminGroups = [
  { title: "Website content", description: "About, articles, images, services, menu headings and FAQs", icon: "store" },
  { title: "Customers", description: "Customer inquiries and conversation follow-up", icon: "inbox" },
  { title: "Assistant", description: "Approved knowledge and assistant preferences", icon: "bot" },
  { title: "Settings", description: "Website preferences and team accounts", icon: "settings" },
] as const;

export function groupedAdminModules(permissions: SanitizedPermissions) {
  const modules = visibleAdminModules(permissions);
  return adminGroups.map(group => ({ ...group, modules: modules.filter(module => module.group === group.title) }))
    .filter(group => group.modules.length > 0);
}
