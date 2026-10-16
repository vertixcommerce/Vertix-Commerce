// Inline Next.js hydration scripts/styles are allowed to preserve static page caching.
// External scripts, objects and arbitrary frames remain blocked in production.
export function contentSecurityPolicy(development = false) {
  return [
    "default-src 'self'", "base-uri 'self'", "object-src 'none'",
    "frame-ancestors 'self'", "form-action 'self'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:",
    "font-src 'self' data:", `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:", "frame-src https://calendly.com",
    ...(!development ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
