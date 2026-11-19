# CMS Rich Text Tables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Vertix editors create structured tables and display them responsively in public blog articles, tighten excessive spacing between bullets, then fix the eBay comparison in the already-published article.

**Architecture:** Enable Payload's `EXPERIMENTAL_TableFeature` alongside the existing default Lexical features. Extend the existing shared `RichContent` renderer for table, row, and cell nodes, and add scoped responsive styles. Test locally before committing and deploying through the repository's verified production path; after deployment, replace the flattened comparison in the CMS while preserving its Published status.

**Tech Stack:** Next.js 16.4.1, Payload 3.90.2, `@payloadcms/richtext-lexical`, React 19, Vitest, Testing Library, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-19-cms-rich-text-tables-design.md`

## Global Constraints

- Keep the content in structured Lexical JSON; do not inject raw HTML.
- Preserve current non-table rich-text rendering.
- Do not change the eBay article's Published status.
- Deploy only after local verification passes.
- Keep user secrets and `.env.local` out of inspection output, commits, and logs.

## Review Focus

- Existing rich-text nodes continue rendering unchanged; the renderer adds table cases without altering paragraphs, links, lists, or uploads.
- Header cells and regular cells remain distinguishable in serialized table data; cover both in the table-renderer test.
- Cell span values cannot create invalid React attributes; cover valid spans and ensure absent spans remain absent.
- Narrow screens can reach all table columns by horizontal scrolling without causing document-wide overflow; inspect locally at desktop and mobile widths.
- Lists with wrapped items and paragraph nodes have compact, consistent spacing without removing readable line height.
- The production comparison remains published after the CMS edit; verify the status and public route after saving.

---

### Task 1: Add table rendering coverage and semantic renderer support

**Files:**
- Modify: `tests/rich-content.test.tsx`
- Modify: `components/rich-content.tsx`
- Modify: `app/blog-page.css`

**Interfaces:**
- Consumes: serialized Payload Lexical content passed to `RichContent({ data }: { data: unknown })`.
- Produces: semantic table markup for supported table, row, and cell node types, retaining existing renderer behavior for all other nodes.

- [ ] **Step 1: Write a failing renderer test**

Add a Lexical fixture with a two-column header row and one data row. Assert `getByRole('table')`, column header roles and names, and the data cell text. Add a list fixture with paragraphs inside two list items and assert the list and item classes use compact spacing. Include a spanning cell fixture if the current Payload node schema supports spans.

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `npm run test -- tests/rich-content.test.tsx`
Expected: FAIL because the current renderer does not create a table.

- [ ] **Step 3: Render the supported table nodes**

Extend the safe node type and renderer in `components/rich-content.tsx`. Use `<table>`, `<tbody>`, `<tr>`, `<th scope>` for header cells, and `<td>` for regular cells. Validate any span values before applying them. Keep editor-controlled content as React children.

- [ ] **Step 4: Add responsive table styling**

Add a containing `div` with a table-specific class and `overflow-x: auto`; style the table with a sensible minimum width, collapsed borders, readable padding, and a contrasting header. Scope rules to `.blog-article-content`.

- [ ] **Step 5: Tighten article list spacing**

Change rendered lists from `space-y-2` to `space-y-1`, mark list items with a stable `blog-list-item` class, and add `.blog-article-content .blog-list-item > p { margin-bottom: 0; }` so nested Lexical paragraphs do not inflate bullet gaps.

- [ ] **Step 6: Run the focused test**

Run: `npm run test -- tests/rich-content.test.tsx`
Expected: PASS, including the existing image tests.

### Task 2: Enable table editing in Payload Lexical

**Files:**
- Modify: `payload.config.ts`

- [ ] **Step 1: Add the experimental table feature without replacing defaults**

Import `EXPERIMENTAL_TableFeature` from `@payloadcms/richtext-lexical` and configure `editor: lexicalEditor({ features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()] })`.

- [ ] **Step 2: Install from the lockfile and validate types**

Run: `npm ci`
Run: `npm run typecheck`
Expected: dependencies install from `package-lock.json` without lockfile changes, and types pass.

### Task 3: Verify the feature locally

**Files:**
- No additional source files.

- [ ] **Step 1: Run the repository test suite**

Run: `npm run test`
Expected: all tests pass.

- [ ] **Step 2: Build the production bundle locally**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 3: Inspect local rendering**

Run the app locally with the configured local database only. Verify an article table on desktop and a narrow viewport; confirm horizontal scrolling stays within the table wrapper. Verify the admin slash menu or toolbar offers table insertion. Do not point local admin writes at production data.
Verify bullet spacing on an article with multi-line list entries at desktop and narrow widths.

### Task 4: Deploy the verified application and repair the published comparison

**Files:**
- No additional source files; production content edit is through the authorized CMS.

- [ ] **Step 1: Confirm the production deployment path and current branch relationship**

Inspect the configured production deployment integration and remote branch status. Deploy the tested commit only through the established production path; if it cannot be identified or access is unavailable, stop and report the concrete blocker.

- [ ] **Step 2: Deploy the verified commit**

Commit only the table feature, renderer, styles, tests, and approved spec/plan documentation. Push/deploy the same verified commit using the confirmed production integration.

- [ ] **Step 3: Verify the deployed code**

Open the live blog and admin editor. Confirm the table renderer loads and table insertion is available. Do not change the article's status.

- [ ] **Step 4: Replace the flattened CMS comparison with a table**

In the live CMS, replace only the existing eBay-versus-Amazon comparison text with a native Lexical table using the article's existing comparison content. Preserve the article's existing Published status and all content outside the comparison.

- [ ] **Step 5: Verify the public article**

Confirm the comparison is displayed as an aligned table on desktop and horizontally scrollable on mobile, and that the article remains Published.
