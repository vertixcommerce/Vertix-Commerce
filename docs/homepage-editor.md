# Homepage visual editor

Open **Admin → Settings → Website → Brand & homepage**. Only an owner or administrator can change website settings. Editors can upload marketing images through **Content → Media library**.

## Screenshot-style layout

Updated October 10: edit reference sections under **Website settings → Homepage sections**. The **Client reviews** tab opens directly with an **Add Client review** button; all other reference controls are under **Other homepage sections**. Hero and layout controls remain in Brand & homepage. [Calendly Free setup](calendly-free-setup.md).

The active homepage uses **Screenshot-style commerce homepage**. Expand **Reference design content** to edit the hero highlights/overlays, market cards, introduction/photo/features, process steps, approved reviews, inquiry copy, FAQ/blog headings, footer copy and optional header links. Each major section has a visibility switch. Array rows can be added, dragged, renamed or removed; empty saved arrays stay empty. Service cards still use published services marked **Feature on homepage**; FAQ and blog entries come from their CMS collections. See [the reference-design guide](homepage-reference-design.md).

Switching to **Original standard sections** or **My custom sections below** preserves the saved reference content and your previous reusable blocks. No automatic import runs on requests. The inquiry form preserves unchecked required consent, privacy notices and existing API safeguards.

## Hero

Edit the main heading and introduction, then expand **Hero layout & images**. You can hide the hero, change its small heading/background, choose split or centered layout, move the image left/right, and add up to two custom buttons. Empty button lists use Contact plus your configured booking link.

Choose a desktop/default image from Media library or create an image through the upload picker. An optional mobile image takes over below 768 px; without one, the default adapts automatically. Choose desktop and mobile frames separately: landscape, square, or portrait. **Show complete image** preserves the whole image inside the frame; **Fill frame** crops to fit. Set the image's focal point in Media library, or override horizontal/vertical focus with 0–100% controls. No fixed source dimensions are needed in code.

## Reusable sections

1. Keep your current layout selected while preparing a custom layout. Existing business content is not overwritten or automatically repopulated.
2. Under **Reusable homepage sections**, click **Add Homepage Section** and choose Service cards, Image & text, Text / announcement, Feature cards, Image gallery, Published FAQs, Published country cards, or Call to action.
3. Name each section for your own reference, edit its public heading/content, select background/spacing and keep **Show this section** enabled. Add the same type more than once where useful.
4. Drag the row handles to change order. Use the row menu to duplicate or remove a section. Switch off a section to hide it without removing its saved content.
5. Select **My custom sections below** and **Save**. Reload the homepage to see the saved layout; no rebuild is needed. Preview at mobile and desktop widths before publishing. An empty custom list intentionally removes all body sections. The hero remains independently controlled.

Published-data sections use current published records: Service cards can show featured or all services; FAQs show published English FAQs; country cards show published country pages. Menu visibility remains separate. Countries and Process/Discuss links have been removed from both header layouts, not from the CMS or their existing pages. The FAQ header link is omitted when a custom layout has no visible FAQ block.

Only add business-approved content. New homepage text is **not** automatically approved for AI answers. Approve public factual source documents separately in Knowledge, Services, or FAQs.

## Media and deployment

Images must be JPEG, PNG, WebP or AVIF, under 4 MB, with an accessibility description. SVG and other file types are not accepted. Sharp limits the original to 2560 × 2560, converts it to WebP and creates proportional 640/960/1600 px variants without enlarging smaller images. The browser selects a suitable variant using responsive picture/srcset/sizes markup. Images below the hero load lazily and reserved frames prevent layout shifts. A separate mobile focal point is supported by the optional mobile asset.

Media library files are **public website assets**. Do not upload confidential documents or customer personal data. The underlying S3 bucket may remain private; Payload serves published image files through its public access-checked route. Media deletions can break references: hide a section or change its image before removing a used asset. Deleted references render without a broken image, and the hero uses its neutral fallback visual.

Locally images live in the ignored `media/` directory. For serverless/ephemeral hosting, configure persistent S3-compatible storage before uploading real content; existing local assets must be copied to the bucket with their filenames/variants and database metadata preserved. See [Launch guide](launch-guide.md). There is no automatic SQLite-to-Postgres or local-media-to-S3 migration.
