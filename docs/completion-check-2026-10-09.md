# Follow-up implementation and verification — 9 October 2026

## Latest follow-up: screenshot-style homepage

The provided commerce-homepage reference is implemented locally with editable settings, responsive illustrative photography, SVG country flags, working service/market links, approved-only reviews, consented inline inquiry and a navy multi-column footer. The active layout was switched from standard to reference, preserving existing custom sections, hero images/buttons, contact, social and legal settings. Only the existing published service catalogue is used; no sample testimonials/sales figures/articles were invented. The new Website settings group has seven collapsible editing sections.

Verification: 162 automated tests across 18 files; 14 isolated save/media checks; 35 admin HTTP checks; 12 public HTTP checks; 7 editorial HTTP checks; generated types, TypeScript and production build passed. Connected Chrome checked the desktop section layouts, mobile navigation, CMS controls, Facebook footer icon and Germany inquiry preselection. Emulated 390/320 px layouts had no horizontal document overflow; overrides were reset and test tabs closed. Fictional test records and isolated images were removed, not business records. No real lead submission, provider transmission, meeting reservation or deployment occurred.

See [reference design guide and image prompts](homepage-reference-design.md) for editing, assets, verification boundaries and production migration requirements.

## Latest follow-up: About, Blogs and social icons

- An editable-label About menu immediately follows Services, with desktop hover/keyboard support and mobile tap navigation to About Vertix and Blogs. Browser review caught and fixed hover-then-click closing the menu.
- About Vertix has an editable hero, responsive uploaded images, one meeting button and a rich-text Who we are card. With no booking URL configured, the button honestly opens a meeting inquiry. No company story or business image was invented.
- The Blog articles CMS collection supports drafts, publication, cover images, rich article bodies, author/date and SEO. Public listing expands to three desktop columns with 12-per-page pagination; unpublished/missing articles are 404. New content appears without a rebuild.
- Facebook, Instagram, TikTok and LinkedIn have proper SVG icons. Profile destinations remain entirely CMS-managed. The existing Facebook row points to an unrelated website and is therefore still hidden; a visible admin warning now explains how to correct it. No real profile URLs were supplied, guessed or overwritten.
- Verification: 151 automated tests across 17 files; 35 admin HTTP checks; 12 isolated homepage/media/editorial persistence checks; 7 editorial HTTP checks including temporary draft → publish → edit → public render and anonymous mutation rejection. Generated types, typecheck and production build passed.
- Connected Chrome verified desktop dropdown, About image controls and social warning, and followed Blogs navigation. At a 390 px emulated viewport, About and Blogs had no horizontal document overflow (375 px client/scroll width, browser scrollbar excluded). The temporary viewport was reset and test tabs closed. The three-column populated grid is component-tested; 13-article pagination is isolated-database-tested, rather than visually checked with real business articles.
- The exact fictional article created by the HTTP test was removed. Existing business records, saved profile settings and the user's editor were preserved. No external booking, social publishing or cloud deployment was performed.

Editor locations and publication instructions: [editorial guide](editorial-guide.md).

![About Vertix desktop preview](../artifacts/qa-2026-10-09/about-page.jpg)

This supersedes the code-gap portion of the earlier [QA report](qa-report-2026-10-09.md). Local implementation work was authorized in the follow-up request. It is not a production deployment or a claim of external integration readiness.

## Completed code gaps

- CMS contact/booking, homepage headings, service details/benefits/process, FAQs and country pages are connected to public screens. The form lists only current published services and service links preselect that service. Service/country SEO titles, descriptions, canonical links and no-index controls are connected. Removed catalogue items were not restored.
- Footer links only render as social links when their host matches the selected platform. The existing unrelated Facebook value remains in the CMS for business correction, not silently replaced with an invented profile.
- Assistant enablement, capture, instructions, handoff and offline messages are consumed at runtime and enforced by APIs. English/German UI, accessible mobile launcher, safe connection failures and correct narrow panel bounds are implemented.
- Only explicitly approved/published CMS knowledge, services and FAQs in the requested language reach AI retrieval. Exact-passage validation rejects fabricated model output. Missing approval or provider configuration produces an honest fallback. No hardcoded business knowledge fallback remains.
- Optional consented/redacted chat storage, session-owned history/deletion, follow-up flags, polling staff replies and human-mode AI pause are implemented. A handshake gate prevents concurrent initial responses from replacing the session cookie.
- Consented lead capture, sensitive-input rejection, idempotent retries, pending-submit guards, network failure feedback/reset and immutable consent/source metadata are implemented. Notification failures are recorded; an authenticated GUI retry exists. Notification bodies exclude names, email, WhatsApp, requirements and transcripts.
- Shared Redis rate/cost protection, bounded development buckets, trusted-proxy opt-in, same-origin checks and streamed-body limits are implemented. Production APIs fail closed without shared protection.
- Private retention preview/deletion endpoints require a strong scheduler secret and an owner cleanup toggle. Legal text is CMS-editable and visibly awaiting approval until the owner approves it. Production capture/storage requires approved privacy text.
- Public password recovery fails honestly without email configuration and never returns/logs a reset token. Draft revisions, the full knowledge library, private conversations/leads and global configuration are protected from anonymous access.
- Admin help/readiness lists are collapsed by default to keep the graphical dashboard compact. Readiness shows configuration flags, not secrets or proof of working integrations.

## Verification

- **113 automated tests**, 13 files: passed.
- **30 admin HTTP integration checks**: passed, including CSS delivery, every editor/global, saved content, CMS service details/FAQs/countries, menu publication/rename/hide/disable, viewer restrictions and private draft/knowledge access.
- **12 public HTTP checks**: passed with the two current published services; unknown service is 404, input failures are safe and EN/DE credential refusal works. Rate bursts were removed from the default smoke run to avoid disrupting the user's browser; actual limiter behavior is unit-tested.
- **10 assistant HTTP checks plus fixture cleanup**: passed. Consent/session isolation, staff reply delivery, human-mode pause, visitor deletion, assistant lead capture, duplicate retries, metadata/retention/privacy, notification retry, unavailable recovery and maintenance authentication were exercised without real provider keys.
- TypeScript, generated Payload types and production build: passed.
- Connected Chrome: compact branded dashboard, stored staff reply visible as Team, German chat/inquiry controls, unchecked lead consent, current service choices and service-to-contact preselection were verified. Logical viewport bounds: at 320px, chat left=12/right=293; at 390px, left=12/right=363, with no document overflow. This was emulation, not physical-phone/keyboard testing. Temporary viewport override was reset.
- Only explicitly identified fictional fixtures created by QA were removed. Existing business/customer records and the user's open FAQ editor were not altered. No external provider request, business notification email, reset email, deployment or external account creation was performed.

![Final compact admin workspace](../artifacts/qa-2026-10-09/admin-final.jpg)

## Not complete externally

The owner dashboard currently reports **0/11 launch configuration checks satisfied**. Real AI/email credentials, verified sender/inbox, real contact/booking/social links, approved English/German knowledge and legal text, production HTTPS/database/proxy/Redis configuration and a monitored retention scheduler still need business/account setup. These cannot be fabricated or approved by development work.

The conservative first phase uses keyword retrieval, extractive answers, manual email retry and polling. Live presence/socket transport, background queues, semantic search, evaluated paraphrasing and distributed concurrent message appends/load testing are separately phased enhancements. No full production security audit or high-concurrency guarantee is claimed.

Follow [the launch guide](launch-guide.md) to supply the missing setup securely and validate actual delivery before launch.

## Follow-up: visual homepage builder and Gemini

The results above describe the previous implementation. This follow-up adds eight reusable homepage block types, native add/duplicate/drag-order controls, manual section names/headings, visibility/background/spacing controls, configurable hero layouts/buttons, and a responsive Media library. Standard content remains unchanged until the admin selects custom layout. Countries and Process/Discuss are removed from desktop/mobile headers, not deleted from the CMS.

Authenticated image uploads are MIME-limited and capped at 4 MB. Sharp converts to WebP, bounds dimensions and creates proportional 640/960/1600 px variants. The frontend supports optional mobile assets, distinct device frame ratios, fit/contain and crop focal controls. S3-compatible persistent storage is wired behind server-only environment variables; local development still uses local media. [Homepage editor instructions](homepage-editor.md).

OpenAI was replaced with a server-only Gemini REST adapter and the agent is named Vertix. The configurable default is the currently documented free-tier `gemini-3.5-flash-lite`; actual availability/quota/billing depends on the Google project. Raw visitor messages/history, sessions, leads and unapproved instructions are excluded from provider requests. Only public approved knowledge, matching public-vocabulary topic terms and optional owner-approved public communication preferences are sent. Sources are additionally contact-pattern redacted; exact-source output validation and safe quota/failure fallbacks remain enforced. The owner's instruction-approval checkbox resets on non-owner text edits. Free-tier provider terms still require public, non-confidential inputs and allow product-improvement processing.

Updated verification:

- Automated unit/component suite: 132 tests across 15 files.
- Admin HTTP checks: 32, including Media library list/create screens and existing permissions/content saves.
- Public HTTP checks: 12.
- Assistant HTTP checks: 10 plus identified-fixture cleanup, with no external provider transmission.
- Isolated homepage/media integration checks: 8, including real authenticated upload/conversion, forbidden upload types/size, saved hero/media relationships, block edit/reorder/rename/hide/remove, unsafe-link rejection, unauthorized saves and intentional empty layouts. These use an in-memory database and their own temporary media directory; the user's homepage is not edited.
- Connected Chrome: reusable block picker and editable Image & text controls were inspected without publishing the sample. Public navigation and Vertix chat were checked at 390 × 844; chat boundaries left=12/right=363, with no horizontal overflow, and viewport overrides were reset. Browser review caught and fixed the neutral hero card's background contrast. Separate mobile image selection/crop is unit/integration tested, not physical-device tested with a live business asset.
- TypeScript and production build passed. Latest environment names and Supabase/S3/Resend/Gemini/Redis/scheduler requirements are in the updated launch guide.

![Reusable homepage section editor — unsaved example](../artifacts/qa-2026-10-09/homepage-builder.jpg)

No real Gemini, Resend, S3 or Redis credentials are configured locally. No real cloud migration, bucket transfer, email delivery, Gemini authentication, deployment or external account setup was performed. Existing .env.local values were preserved and empty Gemini/S3 placeholders added. The dependency audit reports unresolved advisories (24 production dependency findings: 2 low, 13 moderate, 9 high; no production critical findings). Review fixes before production; a forced breaking downgrade was not attempted. A failed first isolated-save attempt left a schema-only QA database in the temporary folder `C:/Users/rhajr/AppData/Local/Temp/vertix-homepage-qa-X440CV`; automatic cleanup was denied by the execution policy. Later isolated tests passed and cleaned up their own temporary images. No business data was removed.
