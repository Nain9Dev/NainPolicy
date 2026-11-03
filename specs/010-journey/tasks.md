# Tasks 010 — One path through the tabs

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-1001` | `journey.ts` with its test (red, then green) | `[A]` | `npm test` green | Done |
| `T-1002` | Plain-language tab names in both locales; `NextStep` band on the five tabs; closing card in the practice flow; delivery line in the engagement band; Spanish default reason | `[A]` | Build clean; browser walkthrough | Done |
| `T-1003` | Docs: changelog, traceability, registry, evidence | `[A]` | Documents reference spec 010 | Done |
| `T-1004` | Approve or reject spec 010 (tab names are a product wording decision) | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-1001` to `T-1003`.
- **Verified:** `npm test`; `npm run build`; Playwright in `es-ES`: tab names, next-step band on
  each tab, closing card after cancelling a practised policy, delivery line.
- **Next:** `T-1004`.
- **Blocked:** `T-1004` needs the owner.
