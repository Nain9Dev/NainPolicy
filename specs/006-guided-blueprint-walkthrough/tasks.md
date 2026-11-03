# Tasks 006 — Guided blueprint walkthrough

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-601` | Record ADR-008 as `Proposed` and register it in `docs/README.md` | `[A]` | File exists and is listed | Done |
| `T-602` | Write `narration.test.ts`, `walkthrough.test.ts`, `blueprintLayout.test.ts` (red) | `[A]` | `npm test` fails only on the new suites | Done |
| `T-603` | Implement `narration.ts`, `walkthrough.ts`, `blueprintLayout.ts` (green) | `[A]` | `T-602` passes | Done |
| `T-604` | Rebuild `ArchitectureBlueprint.vue` on the layout module; plain-language lines; selectable nodes; flow animation | `[A]` | Renders both layouts; `vue-tsc` clean | Done |
| `T-605` | Rebuild `ScenarioView.vue`: narrator panel, step rail, walkthrough, keys, legend | `[A]` | First screen explains the run; walkthrough plays and pauses | Done |
| `T-606` | Browser walkthrough at 1440 px and 390 px, reduced motion emulated, keyboard | `[A]` | Observations recorded in `docs/public-demo.md` | Done |
| `T-607` | Verification gate: `npm test`, `npm run build`; .NET gate unchanged (client-only change) | `[A]` | Green and reported | Done for the client (71/71, build clean); the .NET gate was not run in this session (no SDK in the container; no .NET file changed) and is left to CI |
| `T-608` | Update `docs/changelog.md`, `docs/traceability.md`, `docs/README.md`, `docs/architecture.md`, `docs/public-demo.md`, `README.md` | `[A]` | Documents reference spec 006 and ADR-008 | Done |
| `T-609` | Approve or reject ADR-008 and spec 006 | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-601` to `T-606` and `T-608`. ADR-008 written (`Proposed`). Three pure
  modules with 28 tests; `ArchitectureBlueprint.vue` rebuilt on `blueprintLayout.ts` with
  plain-language lines, selectable nodes, flow animation and two layouts; `ScenarioView.vue` rebuilt
  with the start overlay, narrator band, walkthrough, keys, rail and legend.
- **Verified:** `npm test` 71/71; `npm run build` (`vue-tsc`) clean; Playwright against the
  production build at 1440 px and 390 px, with and without reduced motion (see `docs/public-demo.md`).
- **Not verified:** a `Live` run from the Pages site with the new client (needs the deploy); real
  touch devices; screen-reader reading of the `aria-live` band; the .NET gate (unchanged code, CI).
- **Next:** `T-609`.
- **Blocked:** `T-609` needs the owner.
