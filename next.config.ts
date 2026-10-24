import type { NextConfig } from "next";
import { contentSecurityPolicy } from "./lib/security-headers";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { globalNotFound: true, serverActions: { bodySizeLimit: "1mb" } },
  async redirects() {
    return ["www\\.vertixcommerce\\.com", "vertix-commerce\\.vercel\\.app"].map(host => ({
      source: "/:path*", has: [{ type: "host" as const, value: host }],
      destination: "https://vertixcommerce.com/:path*", permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/control-room-6f3a9d82c17e/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }] }, { source: "/api/:path((?!media/file/).*)", headers: [{ key: "Cache-Control", value: "private, no-store" }] }, {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy(process.env.NODE_ENV === "development") },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" }
      ]
    }];
  }
};

export default withPayload(nextConfig);
