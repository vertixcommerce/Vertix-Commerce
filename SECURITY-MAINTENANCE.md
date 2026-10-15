# Dependency security maintenance

The October 16, 2026 review replaced vulnerable Sass, selector-parser, and legacy esbuild dependencies with compatible patched versions. Payload and Tailwind keep their existing major versions.

## Unfixed upstream braces advisory

GHSA-vfj7-8cjw-p6xm affects braces 3.0.3 and has no published patched release at the time of this review. `npm audit` still reports nine dependent package entries (including six in the production dependency graph). These are not nine different underlying vulnerabilities.

`scripts/apply-dependency-security-patches.mjs` runs on `npm ci`/`npm install` through the root postinstall hook. It bounds brace/parenthesis parsing and recursive AST walking to 128 levels, preventing the reported deeply nested stack-exhaustion input. It checks source hashes, accepts only the reviewed package version, and is safe to run repeatedly. It does not rename the package, alter its version, suppress audit reports, or claim an upstream fix.

Regression tests cover normal glob/range expansion, adversarial nested strings, and directly supplied deeply nested ASTs. Do not disable installation scripts. When an upstream patch is available, review and upgrade it, then remove this temporary mitigation and its tests.

## Inquiry delivery

New inquiry notifications are scheduled after the HTTP response and database commit. The notification uses a fresh operation rather than the completed request transaction. A failed notification does not undo the accepted inquiry; pending/failed notifications can be reviewed and retried in admin.

Resend still needs a verified customer-owned sending domain and `RESEND_FROM_EMAIL_ADDRESS`. No real notification-delivery test was sent during this review. Domain purchase/DNS verification and an authorized inbox test are required to finish that check.

## Mobile verification

A headless browser checked seven public routes at 320, 375, 390 and 768 px, plus mobile-menu opening at each phone width: 31 checks, no horizontal overflow or JavaScript errors. Scrolling the homepage also confirmed its lazy-loaded images resolve successfully. This is viewport emulation, not testing every physical phone or Safari version.
