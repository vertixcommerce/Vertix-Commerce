import { readPublicContent } from "./public-content-cache";
import { getPayload } from "payload";
import { cache } from "react";
import { connection } from "next/server";
import config from "@payload-config";
import type { PublicService, ServiceGroup } from "./content";
import type { Service } from "@/payload-types";
import type { HomepageSettings } from "./homepage";
import { configuredBookingURL } from "./booking";
import { defaultAssistant, safeURL, socialURL, type AssistantConfig, type ContactConfig } from "./public-config";

export type SocialLink = { platform: string; label: string; url: string };
export type SiteChrome = {
  homepage: HomepageSettings;
  servicesLabel: string; aboutMenuLabel: string; expertiseEyebrow: string; expertiseTitle: string;
  socialLinks: SocialLink[]; groups: ServiceGroup[]; featuredServices: PublicService[];
  services: PublicService[]; faqs: { question: string; answer: string }[];
  countries: { slug: string; name: string; introduction: string }[];
  assistant: AssistantConfig; contact: ContactConfig; heroTitle: string; heroIntroduction: string;
  privacyText: string; privacyApproved: boolean; termsText: string; termsApproved: boolean;
};
// Empty CMS and storage failures must never restore removed catalogue items.
export const defaultChrome: SiteChrome = {
  homepage: { businessName: "Vertix Commerce", homepageLayoutMode: "standard" },
  servicesLabel: "Services", aboutMenuLabel: "About", expertiseEyebrow: "Focused expertise",
  expertiseTitle: "Services built around your business", socialLinks: [], groups: [], featuredServices: [],
  services: [], faqs: [], countries: [], assistant: defaultAssistant, contact: { email: "", whatsapp: "", bookingURL: "" },
  heroTitle: "Grow Your eCommerce Store with Expert Support", heroIntroduction: "Tell us about your business and the support you need. Our team can discuss the right scope and next steps.",
  privacyText: "", privacyApproved: false, termsText: "", termsApproved: false,
};
function publicService(doc: Service): PublicService {
  const category = typeof doc.category === "object" && doc.category ? doc.category : null;
  return {
    slug: doc.slug, title: doc.name, text: doc.shortDescription,
    category: category?.name || "Services", categorySlug: category?.slug || "services", featured: doc.featured === true,
    servicePage: doc.servicePage, countryAvailability: doc.countryAvailability, fullDescription: doc.fullDescription, seo: doc.seo, benefits: doc.benefits || [], processSteps: doc.processSteps || [],
  };
}
export const getSiteChrome = cache(async (): Promise<SiteChrome> => {
  const fallback = { ...defaultChrome, contact: { ...defaultChrome.contact, bookingURL: configuredBookingURL(undefined) } };
  if (!process.env.DATABASE_URL) { await connection(); return fallback; }
  try { return await readPublicContent(["getSiteChrome"], async () => {
    const payload = await getPayload({ config });
    const [settings, categories, serviceResult, assistant, faqs, countries] = await Promise.all([
      payload.findGlobal({ slug: "website-settings", depth: 2 }),
      payload.find({ collection: "service-categories", where: { enabled: { equals: true } }, sort: "displayOrder", pagination: false, depth: 0 }),
      payload.find({ collection: "services", where: { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] }, draft: false, sort: "displayOrder", pagination: false, depth: 1 }),
      payload.findGlobal({ slug: "assistant-settings" }),
      payload.find({ collection: "faqs", where: { and: [{ status: { equals: "published" } }, { locale: { equals: "en" } }] }, sort: "displayOrder", pagination: false, depth: 0 }),
      payload.find({ collection: "countries", where: { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] }, draft: false, sort: "name", pagination: false, depth: 0 }),
    ]);
    const menuServices = serviceResult.docs.filter(doc => doc.navigationVisible === true).map(publicService);
    const groups = categories.docs.map(category => ({
      name: category.name, slug: category.slug,
      services: menuServices.filter(service => service.categorySlug === category.slug),
    })).filter(group => group.services.length > 0);
    return {
      homepage: { businessName: settings.businessName || "Vertix Commerce", heroEnabled: settings.heroEnabled, heroEyebrow: settings.heroEyebrow, heroLayout: settings.heroLayout, heroImageSide: settings.heroImageSide, heroTheme: settings.heroTheme, heroMedia: settings.heroMedia, heroButtons: settings.heroButtons, homepageLayoutMode: settings.homepageLayoutMode, homepageSections: settings.homepageSections, referenceHomepage: settings.referenceHomepage },
      servicesLabel: settings.servicesMenuLabel || defaultChrome.servicesLabel,
      aboutMenuLabel: settings.aboutMenuLabel || defaultChrome.aboutMenuLabel,
      expertiseEyebrow: settings.expertiseEyebrow || defaultChrome.expertiseEyebrow,
      expertiseTitle: settings.expertiseTitle || defaultChrome.expertiseTitle,
      socialLinks: (settings.socialLinks || []).map(link => ({ platform: link.platform, label: link.label || `Vertix Commerce on ${link.platform}`, url: socialURL(link.platform, link.url) })).filter(link => link.url),
      groups,
      // Homepage cards remain independent of menu visibility and category enablement.
      featuredServices: serviceResult.docs.filter(doc => doc.featured === true).map(publicService),
      services: serviceResult.docs.map(publicService),
      faqs: faqs.docs.map(doc => ({ question: doc.question, answer: doc.answer })),
      countries: countries.docs.map(doc => ({ slug: doc.slug, name: doc.name, introduction: doc.introduction })),
      assistant: { ...defaultAssistant, enabled: assistant.enabled === true, allowLeadCapture: assistant.allowLeadCapture === true, humanHandoffEnabled: assistant.humanHandoffEnabled === true, offlineMessage: assistant.offlineMessage || defaultAssistant.offlineMessage, offlineMessageDE: assistant.offlineMessageDE || defaultAssistant.offlineMessageDE, conversationRetentionDays: settings.conversationRetentionDays || 90 },
      contact: { email: settings.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "", whatsapp: settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "", bookingURL: configuredBookingURL(settings.bookingURL) },
      heroTitle: settings.heroTitle || defaultChrome.heroTitle, heroIntroduction: settings.heroIntroduction || defaultChrome.heroIntroduction,
      privacyText: settings.privacyText || "", privacyApproved: settings.privacyApproved === true,
      termsText: settings.termsText || "", termsApproved: settings.termsApproved === true,
    };
  }); } catch { await connection(); return fallback; }
});
export const getPublicService = cache(async (slug: string): Promise<PublicService | undefined> => {
  if (!process.env.DATABASE_URL) { await connection(); return undefined; }
  try { return await readPublicContent(["service", slug], async () => {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "services", where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }, { _status: { equals: "published" } }] },
      draft: false, limit: 1, depth: 1,
    });
    const doc = result.docs[0];
    return doc && doc.status === "published" && doc._status === "published" ? publicService(doc) : undefined;
  }); } catch { await connection(); return undefined; }
});
export const getPublicCountry = cache(async (slug: string) => {
  if (!process.env.DATABASE_URL) { await connection(); return undefined; }
  try { return await readPublicContent(["country", slug], async () => {
    const payload = await getPayload({ config });
    const result = await payload.find({ collection: "countries", where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }, { _status: { equals: "published" } }] }, draft: false, limit: 1, depth: 1 });
    const country = result.docs[0];
    if (!country || country.status !== "published" || country._status !== "published") return undefined;
    const services = await payload.find({ collection: "services", where: { and: [{ countryAvailability: { contains: slug } }, { status: { equals: "published" } }, { _status: { equals: "published" } }] }, draft: false, sort: "displayOrder", pagination: false, depth: 1 });
    return { ...country, ctaURL: safeURL(country.ctaURL, true) || "/contact", services: services.docs.map(publicService) };
  }); } catch { await connection(); return undefined; }
});

