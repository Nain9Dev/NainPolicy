# ADR-009: Commercial layer and bilingual client

- Identifier: ADR-009
- Date: 2026-11-03
- Status: Proposed
- Decision owner: Aitor Nain Mendoza Vallejo

## Context

The client at `https://policy.naindev.com/` is opened from the portfolio by people who may hire
the owner: operations managers and technical leads of small brokerages or insurtech teams
(ADR-001, economic brief), as well as engineers. After ADR-008 it explains how a request crosses
the system, but it never says what that protects in their business, what the owner can build for
them, or how to start a conversation. It is also entirely in English, while the portfolio, the
`/demo/` page and the customer hypothesis are Spanish. ADR-007 deferred the locale decision.

The economic brief records no commercial evidence. Anything the page says must therefore be a fact
of this repository, not a promise.

## Decision

### The page sells with evidence, not adjectives

- A hero above the blueprint states the outcome in one line, names the three protections the
  system demonstrates, and offers two actions: run the live demo, talk to the owner (the existing
  services page on naindev.com). Proof chips next to it state only verifiable facts: live on Azure
  SQL, tests against a real SQL Server in CI, zero-euro infrastructure, MIT source.
- Below the blueprint, problem cards translate each technical proof into a buyer's question
  ("two people edit the same policy", "who changed this and why", "one brokerage must never see
  another", "the free database is asleep") and link to the tab or test that demonstrates it.
- An engagement band closes the page: the same method (specification first, tests before code,
  clean architecture, public evidence) applied to a custom policy API, a legacy .NET
  modernization or deterministic data validation, with the services page and the source as actions.
- No pricing, logos, testimonials, conversion claims, analytics or data-collecting form.

### Spanish and English, Spanish first for Spanish browsers

- All visitor-facing prose of the client (hero, cards, band, narration, layer guides, view
  headers, controls, legend, chips) exists in both languages in one typed message catalogue.
- The locale is Spanish when the stored preference or the browser language says so, English
  otherwise; a header toggle switches it and the choice persists in the browser.
- The Lifecycle workbench forms, a JWT-only engineering surface, keep English technical labels.
- Code, identifiers, documentation and commits stay in English (AGENTS.md section 6); the catalogue
  is the one place where Spanish text lives in the client, as the `/demo/` page is for the API.

### Shareable evidence

- Tabs are addressable by URL hash so the portfolio can link to a specific proof.
- A finished run can be copied as plain text (id, origin, steps, final state, address).
- Open Graph and Twitter metadata reuse the existing portfolio cover image.

## Consequences

- A prospect gets, in their language, the problem, the proof and the next step on one page.
- The client gains a message catalogue and three small pure modules (locale, tab route, run
  summary), each tested; the narration and guide modules take a locale parameter.
- Nothing on the page outruns `docs/`; when commercial evidence appears, this ADR is the place to
  extend what the page may claim.

## Rejected alternatives

- Spanish only: rejected, the source and the engineering audience are international.
- A tracking pixel or contact form on the page: rejected, no data collection without a privacy
  decision; the services page already handles contact.
- Marketing numbers ("x faster", "y customers"): rejected, no evidence exists.
