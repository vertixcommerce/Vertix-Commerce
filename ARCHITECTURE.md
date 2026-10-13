# Architecture

Next.js App Router renders the marketing site and exposes server-only route handlers. Payload CMS manages branding, reusable homepage blocks, uploaded images, services, FAQs, approved knowledge, users, leads and consented conversations. Public projections contain no provider credentials or private customer records.

`Widget → POST /api/chat → validation/origin/shared limits → approved CMS retrieval → public topic extraction → Gemini → exact-passage verification`

`Lead form with consent → POST /api/leads → validation/idempotency → SQL record → reference-only Resend notification`

`Admin image upload → role/MIME/size validation → Sharp WebP + responsive variants → local media or S3 → access-checked Payload file route`

The admin's saved homepage order and visibility are rendered on each request, without a rebuild. Three layouts coexist: standard, custom reusable blocks and the active screenshot-style reference template. Reference copy/market rows/process/reviews live in Website settings; approved reviews are explicitly filtered, while services/FAQs/articles reuse their published collections. Changing layouts preserves both content sets. Media and hero controls are described in [the editor guide](docs/homepage-editor.md).

## Storage and privacy boundaries

- SQLite is for local development; PostgreSQL (including Supabase) stores CMS/team/customer records in production.
- S3-compatible storage persists public marketing images. It is not a private-document or transcript store.
- Gemini receives only approved public source text, language, matching public-vocabulary terms and optional owner-approved public communication preferences. Raw chat/history, sessions, lead data and unapproved internal instructions stay out of provider requests. Free-tier terms still permit provider product-improvement processing; no zero-retention claim is made.
- Business answers are verified exact passages; there is no fabricated business-content fallback, unapproved translation or unrestricted browsing.
- Resend notifications contain a reference/internal link, not complete transcripts or requirement text.
- Roles: owner, administrator, editor, sales, support, viewer. Website settings require administrator/owner access; media uploads require content-editor access.
- Production limits use shared Redis and fail closed if protection fails. Trusted proxy configuration is an explicit hosting responsibility.
- Stored chats require optional consent and an HttpOnly browser session. Staff replies are polled, not guaranteed immediate support.
- Retention deletion requires owner approval plus an authenticated scheduled job.

See [launch requirements](docs/launch-guide.md) for external configuration, migration, legal review, limitations and staged capabilities. Dependency advisories and real provider/infrastructure checks remain production blockers.
