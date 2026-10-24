import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pageMetadata } from "@/lib/page-metadata";
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vertixcommerce.com"));
afterEach(() => vi.unstubAllEnvs());
describe("CMS search controls", () => {
  it("keeps canonical sharing URLs and images when describing an article", () => {
    expect(pageMetadata("Article", "Summary", "/blogs/story", undefined, "article").openGraph).toMatchObject({ type: "article", url: "https://vertixcommerce.com/blogs/story", images: [{ url: "/images/social-preview.jpg" }] });
  });

  it("uses CMS titles, descriptions, canonical and no-index", () => {
    expect(pageMetadata("Service", "Intro", "/services/test", { title: "CMS search title", description: "CMS search description", canonicalURL: "https://example.com/service", noIndex: true })).toMatchObject({ title: "CMS search title", description: "CMS search description", alternates: { canonical: "https://example.com/service" }, robots: { index: false } });
  });
  it("rejects unsafe canonical URLs and uses published content defaults", () => {
    expect(pageMetadata("Service", "Intro", "/services/test", { canonicalURL: "javascript:alert(1)" })).toMatchObject({ title: "Service", description: "Intro", alternates: { canonical: "https://vertixcommerce.com/services/test" }, robots: { index: true } });
  });
});
