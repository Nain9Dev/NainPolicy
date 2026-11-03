# Tasks 014 — First paint without third-party blocking

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-1401` | Lighthouse baseline of the built client, desktop and mobile profiles | `[A]` | Numbers recorded in `docs/public-demo.md` | Done |
| `T-1402` | `firstPaint.test.ts` (red) for `REQ-260` to `REQ-264` | `[A]` | Suite fails on the new cases | Done |
| `T-1403` | Self-hosted Urbanist and IBM Plex Mono with licences; preload; deferred brand sheet; `robots.txt` (green) | `[A]` | `T-1402` passes; `npm run build` clean | Done |
| `T-1404` | Lighthouse after, same profile; Playwright network capture | `[A]` | Numbers recorded beside the baseline | Done |
| `T-1405` | Docs: changelog, traceability, registry, ADR-011 | `[A]` | Documents reference spec 014 | Done |
| `T-1406` | Confirm in the live page that the ecosystem bar renders with the deferred brand sheet | `[H]` | Owner looks at `policy.naindev.com` once after deploy | Pending |
| `T-1407` | Approve or reject ADR-011 and spec 014 | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-1401` to `T-1405`.
- **Verified:** `npm test`; `npm run build`; Lighthouse before and after on the same machine;
  Playwright capture with no request to `fonts.googleapis.com` or `fonts.gstatic.com`.
- **Not verified:** the brand tokens sheet could not be fetched from the build container, so the
  effect of deferring it on the ecosystem bar is reasoned, not observed (`T-1406`).
- **Next:** `T-1406`, `T-1407`.
- **Blocked:** both need the owner.
