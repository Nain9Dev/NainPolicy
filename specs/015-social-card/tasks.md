# Tasks 015 — Social preview card

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-1501` | `socialCard.test.ts` (red) for `REQ-270` to `REQ-272` | `[A]` | Suite fails on the new cases | Done |
| `T-1502` | `scripts/og-cover.cjs`, `npm run build:og`, the rendered `public/og-cover.png`, metadata in `index.html` (green) | `[A]` | `T-1501` passes; `npm run build` ships the PNG | Done |
| `T-1503` | Docs: changelog, traceability, registry, evidence | `[A]` | Documents reference spec 015 | Done |
| `T-1504` | After deploy, refresh the LinkedIn post inspector for `policy.naindev.com` so the cached generic cover is replaced | `[H]` | Preview shows the new card | Pending |
| `T-1505` | Approve or reject spec 015 | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-1501` to `T-1503`.
- **Verified:** `npm test`; `npm run build` copies `og-cover.png` to `dist/`; the card reviewed at
  1200 by 630 (no clipped text, all proofs on one line each).
- **Not verified:** how each network renders the card; LinkedIn and others cache the previous
  image until the owner refreshes it (`T-1504`).
- **Next:** `T-1504`, `T-1505`.
- **Blocked:** both need the owner.
