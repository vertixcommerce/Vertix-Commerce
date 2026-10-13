# About Vertix, Blogs and social links

The header's About menu sits immediately after Services. It opens on desktop hover or keyboard activation; mobile navigation uses a tap disclosure. The label is editable in Website settings → Brand & homepage → About navigation label.

## About Vertix

Open Content → About Vertix. In Hero & meeting, edit the headings and introduction, choose a desktop/default image from Media library, and optionally choose a separate mobile image. Frame ratios, cover/contain fitting and focal-point controls adapt the image to device sizes. Uploads are processed by the existing responsive Media library.

There is one meeting button. Its optional HTTPS override takes priority over Website settings → Contact & booking → booking URL. If neither exists, it opens `/contact?intent=meeting` and says this is a meeting request, not a confirmed booking. Set a real booking-system URL to enable actual scheduling.

In Who we are, edit the card heading and rich-text company introduction. Save changes and refresh `/about`; no rebuild is required. Empty introductions do not invent a company story. About content does not automatically become approved assistant knowledge.

## Blog articles

Open Content → Blog articles → Create New. Add a title, unique lowercase URL name, short card introduction, optional cover image and full rich-text article. Public author and search metadata are optional. Publication date is set on first publication if blank; it controls display and sorting, not scheduled publishing.

Use Save Draft while working. To display the article, set Publication status to Published and click Publish. Both the editorial publication status and Payload's draft status must be published. Draft article URLs return 404 publicly; anonymous users cannot edit articles. Content editors, administrators and owners can manage articles.

`/blogs` displays CMS articles in three desktop columns, two tablet columns and one mobile column. It adds rows automatically, newest first, and paginates after 12 articles. There is no built-in article list or business copy. Each card opens `/blogs/<URL-name>`. Changing the URL name changes its address; redirects for renamed URLs are not included. Unpublishing/deleting removes the public article.

## Footer social icons

Open Settings → Website → Social media. Add a row, select Facebook, Instagram, TikTok or LinkedIn, enter the real complete HTTPS profile URL and an accessible label, then Save. Drag rows to reorder, edit destinations or remove rows manually. Icons use the selected platform; profile URLs are never hardcoded.

A URL must belong to its selected social platform. An unrelated destination is hidden from the footer, with an admin warning explaining the row that needs correction. No profile URLs are invented. Existing invalid values are preserved for the business to correct.

## Local checks

- `npm test`: retrieval, publication filtering, fallback states, UI grid/navigation and SVG icons.
- `npm run test:homepage`: isolated image, About save and 13-article pagination checks in a temporary database, without modifying business content.
- `npm run test:editorial`: local HTTP draft/publication/edit/private-access checks. It creates and removes only its own fictional article. Requires the development server and local admin test credentials.
- `npm run test:admin`: every admin module, CSS delivery and permissions.
- `npm run typecheck` and `npm run build`: compile verification.

Existing production databases need reviewed Payload migrations for the new collection/global/settings fields. Local SQLite development schema updates are not a substitute for production migration planning.
