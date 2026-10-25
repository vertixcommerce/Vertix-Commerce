# Vertix Commerce launch guide

## Implemented locally

Public services, categories, country pages, FAQs, homepage headings, contacts, booking and socials come from the CMS. Hidden menu links do not delete pages; drafts and removed services are not restored by fallback content. The inquiry form lists current published services and supports service preselection.

The assistant searches explicitly approved, published knowledge articles, services and FAQs in the requested language. The model selects exact passages and the server rejects altered or invented passages. No hardcoded business knowledge is used. This conservative version falls back rather than guess, paraphrase or translate unapproved business claims.

Inquiries have consent, duplicate-submission protection, retention timestamps, private review, and reference-only inbox notifications. Failed notifications can be retried from **Customer inquiries → Consent & delivery**. Commercial qualification is a staff decision, not an assumed automatic outcome.

Chat storage is optional and off by default. Only messages submitted with storage consent are saved, with contact details redacted. An HttpOnly session cookie owns the stored chat. **Conversations → Follow-up & privacy → Send a reply** delivers staff messages to that same browser session, polling while the chat is open. This is not immediate live support. Sessions last six hours; visitors who lose the session or close chat may not receive a reply. Use consented inquiry capture for asynchronous contact.

## Business setup still required

Use the owner account at `/admin`:

1. **Website settings → Contact & booking:** real public email, international WhatsApp number, actual HTTPS booking URL and private notification inbox.
2. **Social media:** real business profiles. Unrelated websites are not rendered as social links. The existing unrelated Facebook URL was preserved so you can correct or remove it.
3. **Legal pages:** business-reviewed privacy and terms text; the owner approves publication. Production inquiry capture and chat storage are blocked without an approved, nonempty privacy notice.
4. **Knowledge / Services / FAQs:** explicitly approve factual content and publish it. Provide separately approved German documents. Existing records were not automatically AI-approved.
5. **Assistant settings:** availability, capture, human follow-up, offline messages and optional monthly budget. Additional instructions stay internal by default. The owner can explicitly approve public, non-confidential communication preferences for Gemini; only the first 1,000 characters are used. Non-owner edits revoke that approval. Preferences cannot authorize invented claims or override exact-passage validation. Edit approved source passages to change factual answers.
6. **Data retention:** review periods, then enable deletion only after approving the policy and configuring the scheduler. Period changes apply to new records, not retroactively.

The dashboard **Launch readiness** checklist checks configuration presence only. It does not prove provider authentication, email delivery, scheduler operation, legal adequacy or production security.

## Server configuration

Use `.env.example` for variable names. Keep secrets in `.env.local` locally and your host's server-only secret store in production. Never put secrets in `NEXT_PUBLIC_*`, browser code, repositories or chat messages.

- `GEMINI_API_KEY`, optional `GEMINI_MODEL` (default `gemini-3.5-flash-lite`): obtain a key in Google AI Studio for a project with free-tier access. No OpenAI key/package is required. Verify the model and quota in your project; selecting a model does not guarantee free billing. Keep a free-tier project without billing if avoiding charges is essential. There is no automatic paid-model switch. Test real approved English and German answers before launch. [Current Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [project rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL_ADDRESS`: verified email sender. Set the single inquiry recipient in Admin > Website Settings > Inquiry notification inbox. Test real inbox delivery/retry and recovery with a controlled test account. Without sender configuration, public password recovery reports unavailable without generating/logging a token.
- `DATABASE_URL`, random `PAYLOAD_SECRET` of at least 32 characters: private production database with encrypted connections/storage, backups and tested restoration. Keep local SQLite and backup files private. Changing an existing CMS secret can invalidate sessions.
- `NEXT_PUBLIC_SITE_URL`: actual HTTPS site origin, used for trusted-origin checks and notification/reset links.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: shared limits and optional monthly AI budget reservation. Inquiry capture falls back to a bounded per-instance limiter if Redis is unavailable, so leads can still be stored; during fallback, rate limits are less consistent across serverless instances. Other protected APIs fail closed without working shared protection. Development uses a bounded process-local limiter.
- `TRUST_PROXY_HEADERS=true`: enable only behind infrastructure that replaces the forwarded IP header with a trusted client IP. Never enable where visitors can supply that header. Otherwise the safe default shares a global bucket. Verify proxy behavior before deployment.
- `CRON_SECRET`: at least 32 random characters, shared only with a private scheduler.
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: persistent storage for public website images, not chat or lead records. Add `S3_ENDPOINT` and `S3_FORCE_PATH_STYLE=true` for Supabase Storage or another compatible provider. Remote storage activates only when a bucket is set, and incomplete credentials are rejected. Local development keeps files in `media/`. [Payload S3 adapter](https://payloadcms.com/docs/upload/storage-adapters).

### Supabase SQL and image storage

Create a Supabase project and copy the **Postgres connection string** from its Connect panel into `DATABASE_URL`. Use a direct connection when your hosting network supports it, or an appropriate **session pooler** connection for IPv4 access. Use the provider's encrypted connection settings; never disable certificate verification merely to make a connection work. Payload uses Postgres directly, not Supabase's browser data API, so Supabase anon/publishable/service-role keys are not needed for this app. CMS content, users, leads and consented chats live in SQL. Keep database credentials private, isolate the app's tables/access from publicly exposed schemas, and configure backups and a restore test. [Supabase connection options](https://supabase.com/docs/guides/database/connecting-to-postgres).

For images, create a dedicated storage bucket and copy **Storage → S3 configuration** values. Use `S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3`, the displayed region, generated S3 access-key pair, bucket name, and path style enabled. The bucket can remain private because Payload proxies file downloads; its Media collection intentionally makes website images public. Supabase S3 access keys bypass RLS and can access all buckets, so keep them server-only and use a separate project or carefully scoped alternative credentials if stronger isolation is required. [Supabase S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication).

Local SQLite data is not copied when you switch `DATABASE_URL` to Postgres. Back up and plan a staged export/import before switching a working site. With the Postgres adapter selected, create and inspect migrations (`npm run db:migration:create`), apply them in staging (`npm run db:migrate`), test, then migrate production. Do not use development schema push as a production migration strategy. The application's first production migration and existing-data transfer have not been executed here.

Restart development after environment changes. Generate and review production schema migrations with the correct database adapter; back up, test in staging, then migrate. Never run local fixture scripts against production.

### Provider privacy

The agent is named **Vertix**. Gemini receives only retrieved, approved **public** documents, requested language, up to twelve matching vocabulary terms already found in those public documents, and optional owner-approved public communication preferences. Raw visitor questions, chat history, session IDs, lead names/emails/WhatsApp, and unapproved internal admin instructions are not sent upstream. Contact/credential patterns in source content are also redacted as a defense in depth, not a replacement for public-content review. Sensitive-input refusal, consented local storage, exact-quote validation, quota fallback and human escalation remain enforced server-side.

Google's unpaid-service terms say not to submit personal, sensitive or confidential information, and inputs/outputs may be used to improve Google products, including human review. Approve only public, non-confidential source documents. `store: false` opts out of request logging where supported; it is **not** a promise of zero retention or a waiver of unpaid-service data-use terms. Do not use this configuration for confidential support. Free quota exhaustion, timeouts, safety blocks, truncated/malformed answers and provider errors return safe fallbacks without repeated retries. [Gemini API terms](https://ai.google.dev/gemini-api/terms), [Generate Content reference](https://ai.google.dev/api/generate-content).

This privacy-preserving minimal approach does not send multi-turn history to Gemini and can miss nuanced or indirect follow-up questions. The assistant falls back instead of guessing. Use the inquiry form for personal requirements. Before launch, reflect this processing and Google's role accurately in your business-approved privacy notice.

### Homepage and media editor

The new visual builder lives in **Website settings → Brand & homepage**. It includes eight reusable section types, ordering/visibility/duplication, manually editable hero layout/buttons, responsive image variants, optional mobile assets and device-specific crop frames. Existing standard sections remain the default until an admin chooses custom layout. [Editor instructions](homepage-editor.md).

### Scheduled retention

Configure a private scheduler:

```text
GET  /api/maintenance/retention     # non-destructive expired-record counts
POST /api/maintenance/retention    # permanently delete expired batches
Authorization: Bearer <CRON_SECRET>
```

POST also requires the owner's cleanup toggle. Each run deletes at most 100 expired records per collection with a delete-time expiry guard. Schedule enough runs for a backlog and monitor failures. No external scheduler was created or enabled and no expired business records were removed during development. Backup retention is a separate hosting responsibility.

## Verification

```text
npm run payload:types
npm run typecheck
npm run test
npm run build
npm run test:admin
npm run test:public
npm run test:assistant
npm run test:homepage
```

Integration checks target localhost only. Admin checks create/remove their own fictional fixtures. Assistant checks require absent provider keys so no real provider transmission/email occurs; they exercise consent, session ownership, replies, deletion, lead idempotency, notification retry and cleanup. Avoid repeated lead checks within the ten-minute limit. Public smoke tests do not burst shared rate buckets by default; `PUBLIC_TEST_RATE_LIMITS=1` is for an isolated disposable test server only.

`test:homepage` saves hero and reusable-block edits in a fresh isolated in-memory SQLite database, creates responsive-image fixtures in its own temporary directory, verifies permissions and link validation, and cleans up. It refuses external Gemini/Resend/S3 configuration and never edits your actual homepage.

## Separate advanced phase

This version uses bounded keyword retrieval, exact-source answers, manual notification retry and polling. Later phases can add semantic retrieval, evaluated source-backed paraphrasing, audited background retries, presence/assignment workflows and sockets. Stress-test simultaneous multi-tab/staff writes and implement distributed serialization/atomic message append before treating this as a high-concurrency support platform. No multi-worker load test or external penetration test was claimed.
