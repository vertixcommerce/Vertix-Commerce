import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch as doesProxyMatch } from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";
describe("invalid URL protection without crawler bypasses", () => {
  it.each(["/contact%5C", "/blogs%5c"])("rejects the malformed path %s before the launcher", path => {
    expect(doesProxyMatch({ config, nextConfig: {}, url: path })).toBe(true);
    for (const userAgent of ["Googlebot", "VertixTechnicalAudit/1.0"]) {
      const response = proxy(new NextRequest("https://vertixcommerce.com" + path, { headers: { "user-agent": userAgent } }));
      expect(response.status).toBe(404); expect(response.headers.get("x-robots-tag")).toBe("noindex");
    }
  });
  it.each(["/", "/contact", "/sitemap.xml", "/robots.txt", "/api/leads", "/api/media/file/cover.webp", "/_next/static/app.js", "/contact?source=%5C"])("does not intercept normal URL %s", url => {
    expect(doesProxyMatch({ config, nextConfig: {}, url })).toBe(false);
  });
});
