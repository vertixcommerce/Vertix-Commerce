# Vertix Commerce — service page editor

Updated 13 October 2026 in the existing Desktop/vertix workspace.

## Add content and create components

Open `/admin` → **Services** → select a service → **Service layout**.

| CMS field | Public component |
| --- | --- |
| Page content: name and short introduction | Hero title and introduction |
| Hero image and description | Responsive hero image; otherwise a labelled commerce illustration |
| Results | Results strip, with value, description and measurement context |
| Client logos | Responsive logo grid |
| Case studies | Image and description cards, optional documented outcome and safe link |
| Service offering cards | Cards containing the description, included activities and inquiry button |
| Page content: detailed service content | About this service section |
| Page content: benefits | Benefit grid |
| Page content: process steps | Numbered process section |
| Service FAQs | Expandable questions and answers |
| Final inquiry heading and introduction | Final contact section |

Add rows to create components; reorder rows using the CMS array controls. Empty sections stay hidden. Publish the service to apply changes, then refresh its public page. The section sequence follows the supplied reference; this is a fixed reusable template, not a freeform section-order builder.

Results, client logos and case studies require **Approved for public use**. Supply genuine content and permission before checking it. Results require measurement context. Case-study outcomes render only with context. No statistics, testimonials, credentials or client logos were copied from the reference image.

Publish both the service's publication status and its document version. Draft services remain unavailable to public visitors. Every service uses the same template; no page coding is needed when adding another service.

## Local website completion

- Preserved the existing reference homepage, navigation, About, Blogs, legal pages, contact/lead forms, floating contact widget, meeting integration and grounded assistant implementation.
- Populated the existing eBay account management service with offering cards, practical service details, benefits, process and FAQs.
- Published eBay country pages for USA, UK, Australia and Germany, with country-specific information and preselected inquiry links.
- Retained the existing Amazon and Walmart records as unpublished drafts. The CMS remains extensible.
- Filled empty About and FAQ content without replacing existing written content or creating a company history.
- Added a CMS-aware sitemap excluding unpublished and no-index records, plus robots guidance for admin/API routes.
- Preserved original edited files and a pre-update database copy in the task's private work directory. The Desktop/vertix folder has no Git repository.

## Verification

- 177 automated tests passed across 20 files.
- Generated Payload types and TypeScript passed.
- Production build passed.
- 35 local CMS integration checks passed, including authenticated editors, draft/publish behaviour and restricted access.
- 11 public integration checks passed, including form validation and credential-safe assistant responses.
- All four country pages, About, Blogs, meeting, sitemap and robots responded successfully. Existing Amazon and Walmart public routes returned 404.
- An isolated in-memory CMS check verified service-row persistence, publishing, empty-row removal, hidden drafts and rejected anonymous edits.
- Browser verification covered the service page, Germany link and mobile navigation. At 390 and 320 px viewport widths, document scroll width equalled its available width.
- The full assistant HTTP fixture suite refused to run because an email provider key is present. Its safety gate was retained; no attempt was made to send email or call a provider. Assistant unit tests and public safe-response checks passed.

## Configuration still needed

The existing public contact and booking settings are populated and were preserved. Their external ownership/delivery/reservation was not verified.

Gemini configuration, a complete verified email sender/inbox setup, shared production rate limiting, production HTTPS origin, approved privacy/terms, approved assistant knowledge in English and German, production database migrations/backups, and retention scheduling still need setup or verification. The Germany page currently uses English content. Blog publishing is available; no attributed business articles were invented. No approved reviews or proof content were added.

The website runs locally. No cloud deployment or external provider transmission was performed.

Local preview: http://localhost:3000/services/ebay-account-management

