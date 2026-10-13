# Implementation plan

## Phase 1 — foundation and reliable chat slice

- Design system, responsive home/service/country shell
- Approved-content repository and deterministic fallback
- Server-only Gemini endpoint, input limits, abuse throttling, approved bilingual sources
- Consent-based lead capture contract and coordinated floating contact dock
- Automated tests for retrieval, fallbacks, lead validation, and failure handling

## Phase 2 — Payload CMS and persistence (foundation implemented)

- Implemented: authenticated roles; services, countries, FAQs, knowledge, leads, conversations, and settings; draft/publish workflows; PostgreSQL adapter; durable consent/retention metadata; minimal lead notifications.
- Implemented since foundation: About and Blog pages, approved review slots, Media library and optional S3 integration, CMS-driven public menus and standard/custom/reference homepage templates.
- Remaining: audit events, reviewed production migrations and actual cloud/storage deployment verification.

## Phase 3 — operations

- Resend/SMTP queue and delivery status, Calendly settings, qualified-lead notifications
- Support inbox, human takeover state, presence/offline fallback
- Distributed throttling, retention jobs, exports/deletion, monitoring and cost budgets

## Phase 4 — content, SEO, and release

- Remaining public pages, localized German content, country-specific editorial review
- Sitemap, structured data, accessibility/performance review, cross-browser QA
- Deployment, backup/restore drill, legal review, domain and integration verification

Each phase requires configured credentials and acceptance testing before production claims are made.
