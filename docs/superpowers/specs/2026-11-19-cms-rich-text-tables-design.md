# CMS Rich Text Tables

## Intent

Allow editors to create real comparison tables in Payload rich-text fields and render those tables as structured HTML on public blog pages. This addresses the eBay-versus-Amazon comparison, which is currently stored as unrelated text blocks.

## Goals

- Enable native Lexical table blocks in the Payload editor.
- Render table, row, header-cell, and cell nodes in the public rich-content renderer.
- Style tables for legibility and horizontal scrolling on narrow screens.
- Reduce excessive vertical gaps between list items in public blog articles.
- Rebuild the eBay private-label comparison as a real table after the code change is deployed.
- Deploy the application change to production after local verification.

## Non-goals

- Rewrite or fact-check the full article.
- Convert existing plain-text content into tables automatically.

## Approaches

- **Native Lexical table feature (selected):** enable table editing, render the resulting Lexical nodes to accessible HTML, and add responsive styling. This supports future CMS articles as well as the current comparison.
- **One-off article component:** hard-code the eBay comparison outside article content. This would not let editors create tables in future articles and would couple the page to one slug.
- **Image of a table:** visually compact but not searchable or accessible as data, and difficult to maintain on mobile.

## Implementation details

- Configure Payload's Lexical editor with its table feature while preserving existing features.
- Extend the shared rich-content renderer to map Lexical table nodes to semantic `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` elements as supported by the stored node shape.
- Add scoped blog table styles, including a wrapper with horizontal overflow, readable cell padding, borders, and header contrast.
- Tighten list spacing in the shared rich-content renderer and remove paragraph bottom margins inside list items so each bullet reads as one compact item.
- Recreate the comparison in the CMS as a table block after the updated code is running. Existing article content remains unchanged until that CMS edit is separately saved.

## Constraints

- Keep table content in Payload's structured Lexical JSON; do not inject raw HTML.
- Preserve current non-table rich-text rendering.
- Deploy only after local verification passes.
- Do not change the article's publication status; keep the existing published article published while replacing only its comparison content with a table.

## Verification

- Confirm the editor configuration exposes table insertion.
- Inspect a representative Lexical table JSON shape and confirm the renderer outputs semantic table markup.
- Review responsive styles in the existing blog layout.
- Run tests and the local production build before deployment, as requested.
