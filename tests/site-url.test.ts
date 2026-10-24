import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteSiteURL, canonicalPageURL, getSiteOrigin } from "@/lib/site-url";
afterEach(() => vi.unstubAllEnvs());
describe("canonical production URLs", () => {
  it.each(["https://vertixcommerce.com", "https://www.vertixcommerce.com", "https://vertix-commerce.vercel.app", "https://vertix-commerce.onrender.com"])("normalizes the migrated configured origin %s", origin => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", origin);
    expect(getSiteOrigin()).toBe("https://vertixcommerce.com");
    expect(absoluteSiteURL("/sitemap.xml")).toBe("https://vertixcommerce.com/sitemap.xml");
    expect(canonicalPageURL("/services/test", "https://vertix-commerce.vercel.app/services/test#section")).toBe("https://vertixcommerce.com/services/test");
  });
  it("never emits localhost in production when configuration is missing", () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteOrigin()).toBe("https://vertixcommerce.com");
  });
  it.each(["javascript:alert(1)", "https://user:pass@example.com", "https://example.com/path", "https://example.com?query=1"])("rejects invalid origin configuration %s", value => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", value); expect(() => getSiteOrigin()).toThrow();
  });
  it("preserves an intentional external syndication canonical and absolute media URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vertixcommerce.com");
    expect(canonicalPageURL("/blogs/story", "https://publisher.example/story")).toBe("https://publisher.example/story");
    expect(absoluteSiteURL("https://images.example/cover.webp")).toBe("https://images.example/cover.webp");
  });
});
