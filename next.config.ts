import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  async headers() {
    return [{ source: "/control-room-6f3a9d82c17e/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }] }, { source: "/api/:path((?!media/file/).*)", headers: [{ key: "Cache-Control", value: "private, no-store" }] }, {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-src https://calendly.com; upgrade-insecure-requests" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" }
      ]
    }];
  }
};

export default withPayload(nextConfig);
