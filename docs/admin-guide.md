# Vertix Commerce admin

See [the current launch guide](launch-guide.md) for assistant approval, legal pages, inbox retry, staff replies, retention scheduling and production setup.

Open `/admin` and sign in with your existing team account. The dashboard shows live counts, recent inquiries, and shortcuts for the sections your role can access. A dash means a count could not load; it is not a zero.

The sidebar is the main navigation: icon rows with short labels, an Overview button, and four expandable groups (Content, Customers, Assistant, Settings). Groups start closed on the overview; the current editor's group opens automatically. My account, View website, and Sign out stay at the bottom. The mobile drawer uses Payload's existing menu and close controls.

Dashboard management shortcuts are also organized into four groups, closed by default. Expand a group to find its tools; groups and tools you cannot access are omitted. Counts are informational rather than additional links. The admin layout imports Payload's base CSS before custom styles; both are required for correctly positioned navigation, forms, and responsive behavior.

## Find the right editor

| Task | Location |
| --- | --- |
| Edit About hero, upload device images, and set its meeting button | Content → About Vertix → Hero & meeting |
| Write the company introduction card | About Vertix → Who we are |
| Create, edit, publish or remove a blog article | Content → Blog articles |
| Edit a service introduction, benefits, or process | Website content → Services → Page content |
| Choose its category, menu visibility, homepage flag, or order | Services → Menu & homepage |
| Rename, reorder, or disable a menu heading | Website content → Service menu categories |
| Edit local market content | Website content → Countries |
| Write customer answers | Website content → Frequently asked questions |
| Review contact details and update follow-up status | Customers → Customer inquiries |
| Keep private sales notes | Inquiry → Follow-up notes |
| Check consent, notification delivery, and expiry | Inquiry → Consent & delivery |
| Review stored messages and flag follow-up | Customers → Conversations |
| Review approved assistant knowledge | Assistant → Knowledge base |
| Save assistant preferences | Assistant → Assistant settings |
| Change homepage section labels | Settings → Website settings → Brand & homepage |
| Edit hero images, device crops, buttons and reusable section order | Brand & homepage → Hero layout & images / Reusable homepage sections |
| Upload public website images | Content → Media library |
| Add footer social profiles | Website settings → Social media |
| Rename the About header menu | Website settings → Brand & homepage → About navigation label |
| Update contact and booking preferences | Website settings → Contact & booking |
| Configure retention preferences | Website settings → Data retention |
| Manage team accounts | Settings → Team members |
| Edit your own details, password, or appearance | My account |

Lists keep Payload's search, filters, sorting, column selection, pagination, and authorized bulk actions. Editors retain validation, save controls, relationship selection, arrays, and draft/version controls where supported.

The shared design supports light and dark appearance, compact screens, horizontally scrollable tables and tabs, keyboard focus, and reduced motion. Responsive rules are implemented; browser visual review is still required.

## Publishing and menu visibility

Create a category before creating a service, then choose it in the service editor. Smaller display-order values appear first. Turn off **Show in Services menu** to hide a CMS service link; turn off the category to hide its group. For versioned content, save drafts while editing. Set Publication status to Published and use Publish when the content is ready. Check the public page afterward.

The services menu and homepage expertise cards now use only CMS records. Hidden, deleted, unpublished, or disabled-category menu items are not restored from a built-in list. An empty menu hides the Services navigation control. Hiding a link or disabling its category does not remove its published service page; deleting or unpublishing a service removes its page. Homepage cards use their own Feature on homepage checkbox, independent of menu visibility. Publish changes and refresh the public page; no rebuild is needed.

The current starter menu can be imported into an empty CMS library once with `npm run services:import`. This command does not overwrite an existing service library, does not run automatically, and should not be rerun after deliberately deleting all services unless you want to restore the starter list. Standard homepage sections remain available; custom layouts use your saved reusable sections. See [the homepage editor guide](homepage-editor.md).

## Roles and private data

Owners can assign roles. Administrators manage team records but cannot assign roles. Other team members may read and update only their own team-account record. Content editors manage content, sales reviews inquiries, and support reviews conversations. Dashboard shortcuts respect these collection permissions. REST/API checks enforce the restrictions too.

Consent metadata and stored messages are read-only in the editor. This is an editing affordance, not a claim of immutable audit storage. Never enter account passwords, payment information, or unnecessary customer data into notes or knowledge articles. No transcript-email action is added by this dashboard redesign.

## Connections and limitations

This redesign covers all ten collections, including Media library and Blog articles, all three globals, and the native account/authentication experience.

Consented conversations support staff replies polled by the visitor's same browser session; this is not immediate live support. Monthly AI allowance requires shared Redis. Instruction notes stay internal unless the owner approves them as public, non-confidential preferences. Facts still require approved public passages, and raw visitor history is not forwarded to Gemini free tier. Retention dates do not delete data automatically without a scheduled job and owner approval. Actual password-reset email delivery requires the configured email provider and verified sender. See the launch guide for provider privacy and remaining production requirements.

## Verification

- `npm run test`: chat/lead regressions and admin access, navigation coverage, and saved field-path tests.
- `npm run typecheck` and `npm run build`: TypeScript and production compilation.
- With a local server running, `npm run test:admin`: owner login, rendered graphical navigation and delivered base/custom CSS, every existing admin section, native account/auth screens, draft creation and edits, anonymous protection, and viewer restrictions. It reads local credentials from `.env.local` without printing them and deletes only its own temporary QA records. It refuses non-localhost servers.

The integration check verifies HTTP rendering and API behavior, not browser interaction, mobile screenshots, actual email delivery, or production infrastructure.

For About images, article publication, pagination and social icons, see [the editorial guide](editorial-guide.md). The latest local browser review is recorded in [the completion report](completion-check-2026-10-09.md).
