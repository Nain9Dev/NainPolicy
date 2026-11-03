# Tasks 011 — Honest health probes and a readable backend state

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-1101` | `health.test.ts` (red) for `REQ-230` to `REQ-232` | `[A]` | Suite fails on the new cases | Done |
| `T-1102` | `probeHealth` reports healthy, waking, unhealthy or unreachable; in-browser health stub removed (green) | `[A]` | `T-1101` passes | Done |
| `T-1103` | Stage strip and localized outcomes in the `Controlled failures` tab | `[A]` | Browser walkthrough | Done |
| `T-1104` | Docs: changelog, traceability, registry, evidence | `[A]` | Documents reference spec 011 | Done |
| `T-1105` | Approve or reject spec 011 | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-1101` to `T-1104`.
- **Verified:** `npm test`; `npm run build`; Playwright without a backend: `Inaccesible` on both
  probes and the `Dormida o inaccesible` stage highlighted.
- **Not verified:** the `waking` stage against the paused Azure database (unit test only).
- **Next:** `T-1105`.
- **Blocked:** `T-1105` needs the owner.
