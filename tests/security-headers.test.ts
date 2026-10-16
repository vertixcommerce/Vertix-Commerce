import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/lib/security-headers";
describe("production CSP", () => {
  it("limits external frames and scripts without allowing production eval", () => { const policy = contentSecurityPolicy(); expect(policy).toContain("frame-src https://calendly.com"); expect(policy).toContain("script-src 'self' 'unsafe-inline'"); expect(policy).not.toContain("unsafe-eval"); expect(policy).toContain("object-src 'none'"); expect(policy).toContain("form-action 'self'"); expect(policy).toContain("upgrade-insecure-requests"); });
  it("supports local development without upgrading localhost to HTTPS", () => { const policy = contentSecurityPolicy(true); expect(policy).toContain("unsafe-eval"); expect(policy).toContain("ws: wss:"); expect(policy).not.toContain("upgrade-insecure-requests"); });
});
