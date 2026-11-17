import { absoluteSiteURL, getSiteOrigin } from "./site-url";

// Guides shown on each service page. The reverse lookup below links each guide
// back to its services, so articles and service pages always reference each other.
export const relatedGuideSlugs: Record<string, string[]> = {
  "ebay-account-management": ["ebay-item-specifics-checklist", "product-listing-optimisation-amazon-ebay-walmart"],
  "amazon-seller-central-management": ["product-listing-optimisation-amazon-ebay-walmart", "marketplace-fulfilment-vs-seller-fulfilment"],
  "walmart-seller-central-management": ["product-listing-optimisation-amazon-ebay-walmart", "marketplace-fulfilment-vs-seller-fulfilment"],
};

export function relatedServiceSlugs(articleSlug: string): string[] {
  return Object.keys(relatedGuideSlugs).filter(service => relatedGuideSlugs[service].includes(articleSlug));
}

export const organizationId = `${getSiteOrigin()}/#organization`;

const countryNames: Record<string, string> = { usa: "United States", uk: "United Kingdom", australia: "Australia", germany: "Germany" };
export function areaServed(countries?: string[] | null) {
  return (countries || []).flatMap(slug => countryNames[slug] ? [{ "@type": "Country", name: countryNames[slug] }] : []);
}

export function organizationSchema(contactEmail: string, socialURLs: string[]) {
  return {
    "@context": "https://schema.org", "@type": "Organization", "@id": organizationId,
    name: "Vertix Commerce", url: getSiteOrigin(), logo: absoluteSiteURL("/icon.png"),
    description: "Ecommerce management services for Amazon, eBay, Walmart and Shopify sellers.",
    ...(contactEmail ? { email: contactEmail } : {}),
    ...(socialURLs.length ? { sameAs: socialURLs } : {}),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteSiteURL(item.path) })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
}
