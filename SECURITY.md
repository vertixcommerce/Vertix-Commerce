# Security configuration

- Generate a unique high-entropy `PAYLOAD_SECRET`; never reuse the development fallback.
- Keep `DATABASE_URL`, `GEMINI_API_KEY`, `RESEND_API_KEY`, and S3/Redis credentials server-only.
- Use TLS for the site and database, restricted database credentials, and encrypted managed backups.
- Replace the process-local rate limiter with a shared store before horizontal scaling.
- Configure a verified Resend sender; notification emails intentionally omit requirements and chat transcripts.
- Schedule deletion or anonymization using `retentionExpiresAt` and document exceptions such as legal holds.
- Restrict initial owner creation after bootstrap and review role changes through audit logging.
- Website images use authenticated editor uploads, MIME allowlists, a 4 MB limit, Sharp re-encoding, and optional S3-compatible storage. All media is publicly readable; never store customer/private documents there. External malware scanning is not implemented.
- Gemini free-tier requests exclude raw chat/history/lead data. Approve public non-confidential knowledge only; review Google's unpaid-service terms and quotas.
- Dependency audit still reports unresolved advisories. Review/patch and retest the dependency tree before production; do not run forced breaking downgrades blindly.
- Treat the privacy and terms pages as drafts until reviewed for applicable jurisdictions.
