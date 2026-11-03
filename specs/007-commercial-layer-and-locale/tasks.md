# Tasks 007 — Commercial layer and bilingual copy

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-701` | Record ADR-009 as `Proposed` and register it in `docs/README.md` | `[A]` | File exists and is listed | Done |
| `T-702` | Write `messages.test.ts`, `locale.test.ts`, `tabRoute.test.ts`, `runSummary.test.ts` and the bilingual cases of `narration.test.ts` (red) | `[A]` | `npm test` fails only on the new cases | Done |
| `T-703` | Implement the message catalogue, `detectLocale`, `useLocale`, `parseTabHash`, `runSummary`; narration and guides take a locale (green) | `[A]` | `T-702` passes | Done |
| `T-704` | `HeroBand`, `ValueCards`, `EngageBand`; locale toggle in the header; hash routing in `App.vue`; copy-evidence button; OG metadata | `[A]` | First screen shows the hero in the browser's language; cards open their tab; copy works | Done |
| `T-705` | Browser walkthrough in both locales at 1440 px and 390 px | `[A]` | Observations recorded in `docs/public-demo.md` | Done |
| `T-706` | Verification gate: `npm test`, `npm run build` | `[A]` | Green and reported | Done |
| `T-707` | Update `docs/changelog.md`, `docs/traceability.md`, `docs/README.md`, `docs/public-demo.md`, `README.md` | `[A]` | Documents reference spec 007 and ADR-009 | Done |
| `T-709` | Client job in `ci.yml`; `ghostPath` with test; race track SVG; hero live status; full localization of the four secondary views | `[A]` | CI green; browser walkthrough recorded | Done |
| `T-708` | Approve or reject ADR-009 and spec 007; confirm the services URL as the contact action | `[H]` | Status updated by the owner | Pending |

## Session handoff

- **Done (2026-11-03):** `T-701` to `T-707`. ADR-009 written (`Proposed`). Catalogue, locale,
  tab routes and run summary with 25 tests; `HeroBand`, `ValueCards`, `EngageBand`, locale toggle,
  hash routing, copy-evidence button, Open Graph metadata; narration, guides, headers, controls,
  legend and chips localized.
- **Verified:** `npm test` 99/99; `npm run build` (`vue-tsc`) clean; Playwright in `es-ES` and
  `en-US` at 1440 px and 390 px (see `docs/public-demo.md`).
- **Second pass done:** `T-709` (CI job, idle pulse, race track with stacked variant, hero probe
  state, full localization of the secondary tabs).
- **Not verified:** the services page as the right contact destination (owner decision, `T-708`);
  how the Open Graph card renders on each network (needs the deploy); a `Live` run from Pages.
- **Next:** `T-708`.
- **Blocked:** `T-708` needs the owner.
