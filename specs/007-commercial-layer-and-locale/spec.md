# Spec 007 — Commercial layer and bilingual copy

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-001 (product direction), ADR-005 (public demo boundary), ADR-007 and
  ADR-008 (proposed, client presentation), ADR-009 (commercial layer and locale, proposed)
- Builds on: spec 006 (narration, walkthrough, headers)

## Problem

`https://policy.naindev.com/` is the first executable thing a prospect opens from the portfolio.
After spec 006 it explains *how* the system works, but still not *why it matters to them* or
*what the owner can build for them*. Reviewed on 2026-11-03:

| Observation | Impact |
|---|---|
| The first screen is a diagram and a run button; nothing says what problem this solves for an insurance operation | A non-technical buyer has to infer the value from HTTP codes |
| There is no call to action beyond `Source` and `naindev.com` in the footer | A prospect who is convinced has nowhere to go |
| Every word is in English while the portfolio, the `/demo/` page and the customer hypothesis (ADR-001, economic brief) are Spanish | The most likely buyer reads a foreign-language page |
| A tab cannot be linked from outside | The portfolio cannot point at "the 412 proof" or "the audit ledger" directly |
| A run leaves nothing a visitor can take away | The evidence of a run cannot be pasted into an e-mail or a chat |

Commercial boundary (economic brief, ADR-001): the demo is portfolio evidence, not a validated
product. Every claim on the page must be verifiable in this repository or at a linked source.

## Goal

A visitor understands within seconds what the system protects (lost updates, missing audit trail,
cross-tenant leakage, false errors on a cold database), sees that it is live and tested, can read it
in Spanish or English, and has one obvious way to start a conversation with the owner.

## Non-goals

- No pricing, no customer logos, no testimonials, no conversion numbers: there is no evidence.
- No analytics or tracking script; no form that collects data on this page.
- No change to the API, contracts, Azure resources or cost boundary.
- The Lifecycle workbench forms (a JWT-only engineering surface) keep their English technical labels.

## Design references

Reviewed on 2026-11-03: developer-tool and B2B landing pages (hero that states an outcome in under
about 45 characters, proof placed next to the hero, one primary call to action, a
problem → solution → proof → call-to-action order); insurance compliance vendors (the recurring
buyer question is "who changed what, when and why").

## Requirements

Notation: EARS ("When X, the system shall Y").

### Value proposition

- `REQ-170` When the client loads, the first screen shall show, above the blueprint, a headline
  that states the outcome in plain language, one sentence that names the three protections
  (no lost updates, every change on record, one organization never sees another), a primary
  action that runs the live demo and a secondary action that opens the owner's services page.
- `REQ-171` When the hero renders, it shall show proof chips whose every statement is verifiable:
  live on Azure SQL, tests against a real SQL Server in CI, zero-euro infrastructure, MIT source.
  No chip shall state a number that is not produced by a run or a linked document.
- `REQ-172` When the blueprint view renders below the legend, it shall list the problems the
  system solves as problem → what happens here → "show me" cards, and each "show me" shall open the
  tab or evidence that demonstrates it.
- `REQ-173` When the blueprint view renders, it shall end with an engagement band that says what
  the owner can build with the same method and offers the services page and the source as actions.
  It shall not claim customers, outcomes or availability that are not in `docs/`.

### Locale

- `REQ-174` When the client loads, it shall pick Spanish if the stored preference is `es`, or if
  there is no preference and the browser language starts with `es`; otherwise English. The
  visitor shall be able to switch from the header and the choice shall persist in the browser.
- `REQ-175` When the locale changes, the hero, value cards, engagement band, narration, layer
  guides, view headers, controls, legend and chips shall change language without a reload, and
  the document `lang` attribute shall follow.
- `REQ-176` When any copy is produced in either locale, it shall respect the length bounds of
  spec 006 (`REQ-159`) and both locales shall define the same keys.

### Shareable evidence

- `REQ-177` When the URL hash names a tab (`#blueprint`, `#lifecycle`, `#concurrency`, `#audit`,
  `#resilience`), the client shall open that tab; when the visitor changes tab, the hash shall
  follow. An unknown hash opens the blueprint.
- `REQ-178` When a run has finished, the visitor shall be able to copy a plain-text summary of
  it: run id, origin (`Live` / `Simulated`), server time, one line per step with method, path,
  status and duration, final state and ledger rows, and the page address.
- `REQ-179` When the page is shared on a social network or chat, it shall carry Open Graph and
  Twitter card metadata with the title, description and the existing portfolio cover image.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-174` | Vitest: `locale.test.ts` (`detectLocale`) |
| `REQ-176` | Vitest: `messages.test.ts` (same keys, non-empty, bounded) and `narration.test.ts` in both locales |
| `REQ-177` (parsing) | Vitest: `tabRoute.test.ts` |
| `REQ-178` | Vitest: `runSummary.test.ts` |
| `REQ-170` `REQ-171` `REQ-172` `REQ-173` `REQ-175` `REQ-177` (browser) `REQ-179` | Browser walkthrough recorded in `docs/public-demo.md` with the date, in both locales, at 1440 px and 390 px |
