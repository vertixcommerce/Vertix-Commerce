# Reference-style homepage — 9 October 2026

The provided screenshot was used for visual structure: pale split hero with floating cards, country strip and feature row; service cards; four landmark cards; collaborative introduction; numbered timeline; reviews; navy inquiry panel; FAQ/blog split; multi-column navy footer. Existing logo.jpeg remains the brand asset. Country flags are SVG so they render on Windows without relying on emoji fonts.

This is a local implementation, not a deployment. Countries and Process links previously removed from the header were not restored automatically. Optional extra navigation is editable in the new reference settings. Existing Services and About menus remain connected to CMS content and working routes.

## Editing

Updated October 10: reference section editing is now under **Settings → Website settings → Homepage sections**. The **Client reviews** tab is directly visible; other reference controls are under **Other homepage sections**. Hero/layout controls remain in Brand & homepage. See [Calendly and reviews setup](calendly-free-setup.md).

Open Settings → Website → Brand & homepage. The active Homepage layout is Screenshot-style commerce homepage. Expand Reference design content and the relevant subsection. Hero title/introduction/image and device crop controls remain above it in Hero layout & images.

- Hero details: edit/remove highlights, feature strip, overlay copy and optional verified figures. No sample sales figures were published.
- Service cards: introduction/visibility here; manage the actual cards through Content → Services → Feature on homepage. Only the two existing published services currently appear. The grid expands up to four desktop columns as the library grows; removed services are not restored.
- Market cards: edit names/descriptions, drag order, replace uploaded images or remove rows. Cards use existing published country pages where available; otherwise they open the inquiry form with the country preselected. Empty saved arrays intentionally hide the cards and country strip.
- Why choose Vertix: edit heading/introduction/features, upload responsive replacement photos and change the small image badge.
- Process timeline: edit/reorder/remove steps or hide the section.
- Client reviews: enter genuine permitted feedback and explicitly check its approval box. Unapproved reviews are hidden. No sample people, five-star claims or fabricated quotes were published.
- Inquiry, FAQs and latest articles: edit headings, footer copy, visibility and optional header links. FAQ answers come from published English FAQs; the latest three blog cards come from published articles. No placeholder articles are presented as published content. WhatsApp/booking buttons use real Website settings destinations; missing booking honestly opens a meeting request.

Rows/headings and major section visibility are editable. The reference template's section sequence is fixed to match the screenshot; use My custom sections below for free-form reusable section ordering. Hero layout/theme/image controls in the original/custom renderer remain available; the reference template keeps its pale screenshot palette and supports split/centered and left/right hero composition.

The explicit local activation step changed only the layout selection and new reference settings, initialized neutral editable starter rows, and verified custom blocks, images, contact, social and legal values were unchanged. It is not an automatic seed. `scripts/activate-reference-homepage.mjs` preserves saved lists by default; `--initialize-empty-sections` is only for first-time setup and should not be rerun after intentionally clearing rows.

## Images and prompts

Generated with the built-in image-generation tool; inspected and saved into the project, then converted to compact WebP by Sharp. These are illustrative assets, not photographs of real Vertix employees/clients. Upload your own approved images to replace them. The six shipped assets total approximately 310 KB.

Saved paths:

- `public/homepage/hero.webp`
- `public/homepage/team.webp`
- `public/homepage/usa.webp`
- `public/homepage/uk.webp`
- `public/homepage/australia.webp`
- `public/homepage/germany.webp`

Hero prompt: “Use case: photorealistic-natural. Asset type: e-commerce agency homepage hero photo, landscape 4:3. A smiling young adult male commerce consultant with dark hair, neatly trimmed beard and black eyeglasses, wearing a navy blue shirt, working at a silver laptop in a bright modern office. Camera front three-quarter view, desk in foreground, soft windows and green plant blurred behind. Premium natural commercial photography, blue-white palette, daylight, realistic hands. No embedded UI, no text, no logos, no fake charts. Illustrative person, not a real employee.”

Team prompt: “Use case: photorealistic-natural. Asset type: agency homepage supporting photo, landscape 4:3. Three diverse adult commerce professionals, two men in navy/blue shirts and a woman in a white blouse, leaning towards a laptop at a desk in a bright modern office, smiling naturally while collaborating. Premium natural commercial photography, white and navy palette, daylight, realistic faces/hands, no text, logos, charts or UI. Illustrative team, not actual company staff.”

Landmark prompt template: “Use case: photorealistic-natural. Asset type: landscape 16:9 destination photograph for a commerce website country card. [Scene]. Premium travel photography, natural architectural proportions, beautiful realistic details. Landmark prominent and centered, no close-up identifiable people. No text, logos, borders, UI or watermark.”

Scenes used:

- USA: “Statue of Liberty, New York harbor, clear soft blue sky”
- UK: “Big Ben and Westminster, London, with one red double-decker bus in foreground, clear soft blue sky”
- Australia: “Sydney Opera House by the harbor, clear soft blue sky”
- Germany: “Brandenburg Gate, Berlin in warm afternoon light, clear soft blue sky”

## Verification

- 162 automated tests, including 11 reference-layout tests: approved reviews only, no invented metrics, saved row removal/visibility, safe links, published cards/FAQs/articles, required unchecked consent and country preselection.
- 14 isolated persistence/upload checks: new settings, images, SQL enum names, removal/hiding and preservation of old custom blocks, alongside media and editorial checks. Their temporary database/images were cleaned up.
- 35 admin HTTP checks and 12 public HTTP checks passed. The admin check was updated to distinguish explicitly selected reference markets from the standard auto-list of published countries.
- 7 editorial HTTP checks passed; only the fictional article they created was deleted. Admin fixtures were also cleaned up, preserving business records.
- Generated Payload types, TypeScript and production build passed.
- Connected Chrome reviewed hero, service/market cards, inquiry/consent, footer Facebook icon, mobile navigation, native reference CMS editor and Germany preselection. At 390 px and 320 px, document scroll width equaled client width (375 and 305 px respectively, excluding the browser scrollbar). Narrow-phone service cards use one column. All six images loaded. Temporary viewport overrides were reset; no actual lead submission/provider email/meeting reservation was performed.
- Full-page browser capture timed out; separate viewport previews were saved instead. This was browser emulation, not physical-phone/virtual-keyboard testing or a pixel-perfect copy of the reference's unverified content.

![Desktop hero and services](../artifacts/qa-2026-10-09/reference-homepage-desktop.jpg)

![Market section](../artifacts/qa-2026-10-09/reference-homepage-markets.jpg)

![Inquiry section](../artifacts/qa-2026-10-09/reference-homepage-inquiry.jpg)
