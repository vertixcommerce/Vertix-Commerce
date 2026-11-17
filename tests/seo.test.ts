import { describe, expect, it } from "vitest";
import { areaServed, breadcrumbSchema, faqSchema, organizationSchema, relatedServiceSlugs } from "@/lib/seo";

describe("SEO structured data helpers", () => {
  it("links each guide back to the services that list it", () => {
    expect(relatedServiceSlugs("ebay-item-specifics-checklist")).toEqual(["ebay-account-management"]);
    expect(relatedServiceSlugs("marketplace-fulfilment-vs-seller-fulfilment")).toEqual(["amazon-seller-central-management", "walmart-seller-central-management"]);
    expect(relatedServiceSlugs("unknown-guide")).toEqual([]);
  });
  it("builds FAQ and breadcrumb markup from page content", () => {
    expect(faqSchema([{ question: "Q?", answer: "A." }]).mainEntity).toEqual([{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }]);
    const crumbs = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]).itemListElement;
    expect(crumbs.map(item => item.position)).toEqual([1, 2]);
    expect(crumbs[1].item.endsWith("/services")).toBe(true);
  });
  it("only publishes social profiles and countries that are configured", () => {
    expect(organizationSchema("", [])).not.toHaveProperty("sameAs");
    expect(organizationSchema("", [])).not.toHaveProperty("email");
    expect(organizationSchema("a@b.co", ["https://www.linkedin.com/company/x"]).sameAs).toEqual(["https://www.linkedin.com/company/x"]);
    expect(areaServed(["usa", "uk", "mars"]).map(country => country.name)).toEqual(["United States", "United Kingdom"]);
  });
});
