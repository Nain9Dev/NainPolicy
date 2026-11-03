# Tasks 012 — The history in plain words

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-1201` | `historyText.test.ts` (red) for `REQ-240` to `REQ-242` | `[A]` | Suite fails on the new cases | Done |
| `T-1202` | `transitionSentence`, `historySummary`; sentence and copy action in the `History` tab (green) | `[A]` | `T-1201` passes; browser walkthrough | Done |
| `T-1203` | Docs: changelog, traceability, registry, evidence | `[A]` | Documents reference spec 012 | Done |
| `T-1204` | Approve or reject spec 012 | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-1201` to `T-1203`.
- **Verified:** `npm test` 121/121; `npm run build`; Playwright: sentences on screen and the copied text read back.
- **Next:** `T-1204`.
- **Blocked:** `T-1204` needs the owner.
