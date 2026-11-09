# Tasks next-seo-discoverability

- Document version: 0.1
- Date: 2026-11-09
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-SEO-1` | `seoDiscoverability.test.ts` (red) for `REQ-280` and `REQ-281` | `[A]` | Suite fails on the new cases | Done |
| `T-SEO-2` | Metadata and JSON-LD in `index.html`; `robots.txt` sitemap line; `sitemap.xml`; `llms.txt` (green) | `[A]` | `T-SEO-1` passes; `npm run build` ships the three files | Done |
| `T-SEO-3` | Docs: changelog, traceability, registry | `[A]` | Documents reference the spec | Done |
| `T-SEO-4` | Submit the sitemap in Search Console and Bing Webmaster Tools after the deploy | `[H]` | Sitemap reported as read | Pending |
| `T-SEO-5` | Approve or reject the spec | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-09):** `T-SEO-1` to `T-SEO-3`.
- **Verified:** `npm test` 142 passed (7 of the 8 new tests failed first); `npm run build` copies
  `llms.txt`, `robots.txt` and `sitemap.xml` to `dist/`.
- **Not verified:** the live host, which changes only after the owner merges and Pages deploys.
- **Blocked:** `T-SEO-4` and `T-SEO-5` need the owner.
