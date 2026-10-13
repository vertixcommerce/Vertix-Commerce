import { describe, expect, it } from "vitest";
import { pageMetadata } from "@/lib/page-metadata";
describe("CMS search controls", () => {
  it("uses CMS titles, descriptions, canonical and no-index", () => {
    expect(pageMetadata("Service", "Intro", "/services/test", { title: "CMS search title", description: "CMS search description", canonicalURL: "https://example.com/service", noIndex: true })).toMatchObject({ title: "CMS search title", description: "CMS search description", alternates: { canonical: "https://example.com/service" }, robots: { index: false } });
  });
  it("rejects unsafe canonical URLs and uses published content defaults", () => {
    expect(pageMetadata("Service", "Intro", "/services/test", { canonicalURL: "javascript:alert(1)" })).toMatchObject({ title: "Service", description: "Intro", alternates: { canonical: "/services/test" }, robots: { index: true } });
  });
});
