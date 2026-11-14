# Tasks next-pwa-install

- Document version: 0.1
- Date: 2026-11-14
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-PWA-1` | `pwaInstall.test.ts` (red) for `REQ-290` to `REQ-292` | `[A]` | Suite fails on the new cases | Done |
| `T-PWA-2` | Manifest, icons and head tags (green) | `[A]` | `T-PWA-1` passes; `npm run build` ships the manifest and icons in `dist/` | Done |
| `T-PWA-3` | Docs: changelog, traceability, registry | `[A]` | Documents reference the spec | Done |
| `T-PWA-4` | After the deploy, install on an Android phone and an iPhone | `[H]` | Icon uncropped, label `NainPolicy`, no browser bar | Pending |
| `T-PWA-5` | Approve or reject the spec | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-14):** `T-PWA-1` to `T-PWA-3`.
- **Verified:** `npm test` 146 passed (the 4 new tests failed first); `npm run build` copies the
  manifest and icons to `dist/`; Chrome reports no installability error on `dist/`.
- **Not verified:** the live host, which changes only after the owner merges and Pages deploys.
- **Blocked:** `T-PWA-4` and `T-PWA-5` need the owner.
