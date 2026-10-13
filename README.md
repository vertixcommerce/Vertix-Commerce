# Vertix Commerce

Next.js and Payload CMS foundation for the Vertix Commerce website and AI assistant.

## Local setup

1. Install Node.js 20+ and run `npm install`.
2. Create a PostgreSQL database.
3. Copy `.env.example` to `.env.local` and configure `DATABASE_URL`, a random `PAYLOAD_SECRET`, and server-only integration secrets.
4. Run `npm run db:migration:create`, review the generated migration, then run `npm run db:migrate`.
5. Run `npm run dev`. Bootstrap the first owner through a controlled deployment/seed procedure, then use `/admin`; unauthenticated user creation is intentionally disabled.

For this local workspace, `npm run admin:bootstrap` creates or repairs the configured owner from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Restart the dev server after changing database or authentication environment variables.

## Password recovery

The `/admin/forgot` flow uses short-lived reset tokens, throttles requests and does not disclose whether an account exists. Configure `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL_ADDRESS` for real delivery. Without these values, public recovery reports unavailable without generating or logging a reset token.

The assistant falls back honestly without a provider key or approved knowledge. It retrieves only approved, published CMS knowledge, services and FAQs in the requested language. Consented inquiries are stored before success; optional consented chat storage supports session-owned polling and staff replies. Inbox notifications contain references, not transcripts or personal contact details.

## Admin roles

- Owner: account roles and all administrative operations
- Administrator: settings, records, and content administration
- Editor: services, countries, FAQs, and knowledge
- Sales: lead review and status management
- Support: conversation review and handoff state
- Viewer: authenticated read-only foundation

Payload enforces collection access for both the dashboard and APIs. Do not use Local API calls with untrusted users unless `overrideAccess: false` and the authenticated user are supplied.

## Production gates

Production requires shared Redis protection, real provider credentials and verified sender, approved business/legal content, trusted HTTPS hosting/proxy configuration, real contact/booking/social links, scheduled retention and backup/restore validation. Production inquiry capture and chat storage require an approved privacy notice. [The launch guide](docs/launch-guide.md) explains configuration, verification and separately phased advanced capabilities.

## Admin workspace

The admin dashboard groups every existing editor by task and shows permission-aware shortcuts, live counts, and recent inquiries. Read [the admin guide](docs/admin-guide.md) for field locations, publication steps, role permissions, integration limits, and local verification commands.
