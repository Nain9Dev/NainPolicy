# Tasks 008 — Practice mode

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-801` | Write `policyOps.test.ts` (red) for `REQ-190` to `REQ-193` and `REQ-196` | `[A]` | `npm test` fails only on the new suite | Done |
| `T-802` | Implement the origin rules in `services/api.ts` (`operate`, `PolicyResult`, `TransitionsResult`) (green) | `[A]` | `T-801` passes; a non-2xx with a token is thrown, never masked | Done |
| `T-803` | Lifecycle tab usable without a token: practice header, origin chip, last answer, stale-write action, labelled inputs | `[A]` | Create, activate, stale attempt and cancel work without a token and show `Simulated` | Done |
| `T-804` | Audit tab reads a history without a token and labels the origin from the answer | `[A]` | Chip follows the result | Done |
| `T-805` | Browser walkthrough, desktop and phone | `[A]` | Observations in `docs/public-demo.md` | Done |
| `T-806` | Docs: changelog, traceability, registry, README row | `[A]` | Documents reference spec 008 | Done |
| `T-807` | Approve or reject spec 008 | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-801` to `T-806`.
- **Verified:** `npm test` 105/105; `npm run build` clean; Playwright in `es-ES` at 1440 px and
  390 px: create → activate → stale attempt (`412`, explained) → cancel without a token, every
  result labelled `Simulada · en el navegador`; the Audit tab reads the practised policy's history
  without a token.
- **Not verified:** the same flow with a real token against the Azure API (needs the owner's
  local issuer); the `412` surfacing from the real server is covered by the unit test only.
- **Next:** `T-807`.
- **Blocked:** `T-807` needs the owner.
