# Changelog

- Document version: 0.1
- Status: Active
- Date: 2026-09-08

Relevant behavioural changes, newest first. Dates are the date the change was made, not released.
A change is listed only when it alters behaviour, contracts, evidence or operating boundaries.

## 0.26 — 2026-11-03 — Money and dates a reader understands

Governing spec: 013 (`Proposed`). Client only.

- The practice inspector writes the insured amount as money (`150.000,00 €`), and the coverage
  period and creation time as dates and times in the page locale; the raw API values stay as
  tooltips. 4 new client tests (125 in total).

## 0.25 — 2026-11-03 — The history in plain words

Governing spec: 012 (`Proposed`). Client only.

- Each transition in the `History` tab opens with one sentence in the page language: when (in
  the visitor's time zone), who, what changed with the state names a reader knows, and why when a
  reason was recorded. The technical fields stay below it.
- `Copy history` puts the ledger on the clipboard as numbered sentences with the policy, the
  origin and each request identifier.
- 5 new client tests (121 in total).

## 0.24 — 2026-11-03 — Narration stays on screen on phones

Spec 006, `REQ-162`. Client only.

- On screens narrower than 720 px a compact strip with the current step (position, title,
  previous, pause, next) stays at the bottom of the viewport while the tall stacked sheet is on
  screen, so the walkthrough can be followed without scrolling back and forth. Not shown on wide
  screens.

## 0.23 — 2026-11-03 — Honest health probes and a readable backend state

Governing spec: 011 (`Proposed`). Client only.

- Defect fixed: the health probe fell back to the in-browser engine when the API did not answer
  `2xx` and showed `Healthy` with `Simulated` details, on the very tab about honest failures. The
  probe now reports `healthy`, `waking` (`503`, with the `Retry-After` seconds), `unhealthy` or
  `unreachable`, and nothing else; the in-browser health stub is removed.
- The `Controlled failures` tab shows the database in three plain-language stages (asleep or
  unreachable, waking, ready), highlights the latest readiness answer and says what each stage
  means for someone using the system. Outcomes read in the page language everywhere.
- 4 new client tests (116 in total).

## 0.22 — 2026-11-03 — One path through the tabs

Governing spec: 010 (`Proposed`). Client only.

- Tabs read in plain language: `How it works`, `Try it`, `Two at once`, `History`, `Controlled
  failures` (`Cómo funciona`, `Pruébalo`, `Dos a la vez`, `Historial`, `Fallos controlados`).
  Hashes are unchanged, so existing links keep working.
- Every tab ends with a `Step n of 5` band that offers the next tab as one action; the last offers
  the services page.
- Cancelling a practised policy shows a closing card that says what the visitor did and offers its
  history; the Spanish practice form has a Spanish default reason.
- The engagement band states what a delivery includes (database, backend and frontend, with tests
  and documentation), as the owner's own statement.
- 3 new client tests (112 in total).

## 0.21 — 2026-11-03 — Design of an anonymous sandbox (documents only)

ADR-010 and spec 009 record, as `Proposed` and design only, how a prospect could drive a policy
of their own against the real API without a token: a dedicated sandbox organization served by the
existing application services, a closed allow-list with no free text, possession of the random
identifier as the only key, per-client and global daily caps, 24-hour retention, disabled by
default, and a measured seven-day trial before it may stay enabled. No code, no deployment and
no cost change; the owner decides (`T-902`).

## 0.20 — 2026-11-03 — The Azure `/demo/` page follows the blueprint identity

Static files of the API only (`wwwroot/demo`); no C# change, the CSP and the contract are untouched.

- Tokens of the server-rendered Spanish page now match the repository banner and the guided
  client: navy grid, brand green action with the red offset on hover, hairline frames, square
  corners. System fonts stay, as the CSP requires.
- The five steps read in plain language (`Se bloquea una escritura con versión antigua (412)`
  instead of `Rechazar ETag obsoleto`), in the page and in the script that fills them.
- A `Recorrido guiado paso a paso` action links to `https://policy.naindev.com/`, the primary
  showcase the portfolio points to.

## 0.19 — 2026-11-03 — Continuity between tabs; the Audit tab no longer runs the demo by itself

Spec 008, second pass. Client only.

- A page session remembers the policy the visitor drove and the last scenario run. The Audit tab
  opens on that policy's history (named `History of the policy you drove` / `History of your last
  run`) without a new request; a live run's ledger is shown from the answer already received.
- Opening the Audit tab no longer runs the demo on its own, which spent free quota per visit and
  showed an unrelated policy. The demo runs only on the visitor's click; the empty state explains
  what to do.
- 4 new client tests (109 in total).

## 0.18 — 2026-11-03 — Accessibility: zero axe violations on every tab

Closes the `REQ-123` gap of spec 002 with evidence. Client only.

- `axe-core` audit (WCAG 2.0/2.1/2.2 A and AA plus best practices) on the five tabs: 0 violations
  after this change; before it reported insufficient contrast of the dim text token (3.8:1),
  accessible names that did not contain the visible text (locale toggle, blueprint layers),
  focusable descendants inside a `role="img"`, heading levels that skipped one, and seven form
  controls without a label.
- The dim text token is now 6.1:1 on the surface colour; the rejected status pill 5.2:1.
- Blueprint layers are named by their visible title and tagline; the focus target is the box; the
  sheet is a `group` with a description instead of an image with focusable children.
- Card titles are `h3` under the view `h2`; the locale toggle's name starts with its visible text.
- `npm run audit:a11y` (`scripts/axe-audit.cjs`) reruns the audit against a local preview; it
  needs Playwright with Chromium available to Node and is not part of CI.

## 0.17 — 2026-11-03 — Practice mode: the workbench works without a token

Governing spec: 008 (`Proposed`). Client only; no API change.

- The Lifecycle tab is usable by anyone: without a token every action answers from the in-browser
  engine and is labelled `Simulated`; with a local token the same actions go to the real API and
  its real answers are shown, including refusals. A one-click "try with the old version" action
  provokes the `412` and explains it; the inspector shows the last HTTP answer.
- Defect fixed: with a token, a non-`2xx` answer from the real API (`412`, `409`, `400`) was
  swallowed and the in-browser engine answered instead. Every authorized operation now follows one
  origin rule (`operate` in `services/api.ts`): no token → simulated; `2xx` → live; other status →
  thrown as `ApiError` with the Problem Details; network failure → simulated.
- The Audit tab reads a policy's history without a token and labels the origin from the answer.
- The in-browser engine returns copies of its state, so a view never mutates it by reference.
- Lifecycle inputs carry explicit labels.
- 6 new client tests (105 in total).

## 0.16 — 2026-11-03 — Commercial layer and bilingual client

Governing spec: 007 (`Proposed`); ADR-009 (`Proposed`). Client only; no API, contract or cost change.

- A hero above the blueprint states the outcome, names the three protections and offers two
  actions: run the live demo and talk to naindev (the existing services page). Four proof chips
  link to verifiable facts only: live on Azure SQL, tests against a real SQL Server in CI,
  zero-euro infrastructure, MIT source.
- Below the blueprint, four problem cards (concurrent edits, who changed what, tenant isolation,
  sleeping free database) link to the tab or test that proves each one, and an engagement band
  closes the page with the method and the services page. No pricing, logos, testimonials or
  analytics.
- The client is bilingual: Spanish for Spanish browsers or a stored preference, English
  otherwise, with a header toggle that persists. One typed catalogue holds every visitor-facing
  string; narration, guides, headers, controls, legend and chips follow the locale. The Lifecycle
  workbench forms keep English technical labels.
- Tabs are addressable by hash (`#blueprint`, `#lifecycle`, `#concurrency`, `#audit`,
  `#resilience`); a finished run can be copied as plain text; Open Graph and Twitter metadata are
  set.
- Second pass: the Concurrency tab draws the race as a track (two operators, one stored version,
  Alpha's write advancing it, Beta's write stopped at the guard with `412`), with a stacked variant
  on phones; the idle blueprint carries a faint pulse along the request route; the first proof chip
  of the hero reflects the real database probe; the four secondary tabs are fully localized; and
  the client tests and build now run in CI (`client-tests` job).
- 27 new client tests (99 in total).

## 0.15 — 2026-11-03 — Guided blueprint walkthrough

Governing spec: 006 (`Proposed`); ADR-008 (`Proposed`). Client only; no API, contract or cost change.

- Every blueprint step now has plain-language narration beside the diagram: title, one sentence
  derived from the API step, and the measured evidence (method, path, status, duration, version).
- After the fast trace of spec 005 (unchanged, about 1 s) a guided walkthrough shows one step every
  1.8 s; it can be paused, resumed and stepped with on-screen arrows or the keyboard. Under reduced
  motion it does not start by itself.
- Every layer can be selected to read what it does and its responsibilities.
- The blueprint geometry moved to a layout module with a wide and a stacked variant; phones no
  longer scroll the sheet sideways.
- A start button over the sheet, a connected step rail and a legend replace the control strip and
  the five step cards. `Stale ETag` is now labelled `Stale version`.
- The four secondary tabs open with a plain-language title and one sentence; Audit and Concurrency
  now label a demo result `Live` or `Simulated` instead of `Verified`, and their wording drops the
  implementation vocabulary.
- 29 new client tests (72 in total); the response-only `runPublicDemo` alias is removed because no view uses it.

## 0.14 — 2026-10-26 — Azure cost guard applied

- Created the subscription budget `budget-nain-policy-1eur` (1 EUR a month; alerts at 50 % and 100 %
  actual and 100 % forecast). It only notifies; the free offer's `AutoPause` and the F1 plan are the
  real stop.
- Azure rejected lowering the auto-pause delay to 15 min on the free database; it stays 60 min.
  Evidence in `specs/005-intent-warmup-cost-guard/`.

## 0.13 — 2026-10-26 — Intent-based warm-up and free-quota guard

Governing spec: 005 (`Proposed`); amends 004.

- The client no longer contacts the API on load. The wake-up starts on the first pointer, touch,
  key or scroll signal, or when the visitor runs the scenario, so crawlers do not spend the free
  vCore-seconds.
- While the wake-up is pending, a run waits at most 0.8 s and otherwise answers `Simulated` without
  a demo request; with the database awake, the demo request has a 2 s limit (was 6 s).
- The blueprint replay steps every 0.2 s: about 1 s from click to last frame on a warm database
  (0.97 to 0.98 s measured against Azure).
- Added `azure-cost-guard-runbook.md` with the owner steps for a 15 min auto-pause delay and a 1 EUR
  budget. Not executed by the agent.

## 0.12 — 2026-10-26 — Prewarm the live demo

Governing spec: 004 (`Proposed`).

- The client sends one `GET /health/ready` when it loads, so the free-tier database wakes while the
  visitor reads the page, and shows a `Waking free-tier database` / `Database ready` status.
- A live run now waits at most 6 s; if the API has not answered, the in-browser result is shown and
  labelled `Simulated`. Before, a run on a paused database could hang for up to 100 s.
- The blueprint replay now steps every 0.3 s instead of 1.15 s: a warm live run goes from click to
  the last frame in about 1.4 s (measured 1.36 to 1.40 s against Azure); it took about 6 s before.
  The step pause lives in `replayDelayMs` (`blueprintTimeline.ts`).
- No API, persistence, cost or infrastructure change.

## 0.11 — 2026-10-26 — Azure redeploy

Deployed the current build to the existing App Service (`T-019`, `T-116`): ADR-006 resilience and
the `policy.naindev.com` CORS origin are now live. No schema or setting change. Evidence in
`docs/public-demo.md`.

## 0.10 — 2026-10-22 — Live architecture blueprint and honest execution source

Governing decision: ADR-007 (`Proposed`), spec 002.

### Added

- `PolicyOperations.Client` opens on a live architecture blueprint: an SVG map of Client, API,
  Application, Domain (three lifecycle states), Infrastructure and SQL Server (`Policies` and the
  append-only `PolicyTransitions` ledger). Running the scenario replays the returned steps through
  the map; a `412` is drawn as a rejected path at the concurrency guard and each state change
  appends a ledger row.
- Every run is labelled `Live` (response from the API) or `Simulated` (in-browser fallback).
- `VITE_API_BASE_URL` with a committed `.env.production` pointing the Pages build at the Azure API.
- `https://policy.naindev.com` added to the API CORS origins (`PreflightFromPolicySubdomainIsAllowed`).
- Vitest in the client: `blueprintTimeline.test.ts` and `api.test.ts` (16 tests).
- Telemetry for the ecosystem architecture drawer is emitted for live and simulated runs.

### Changed

- Client theme moved to the NainDev brand tokens (Urbanist, IBM Plex Mono, brand blue, green and
  red, 4 px radius, blueprint grid). Secondary views keep their function with a title and one
  subtitle; explanatory paragraphs removed.
- Client wire contracts aligned to the API records (`operation`, `status`, `result`,
  `resourceStatus`, `dataRetentionHours`, `policy`, `occurredAtUtc`, `actorSubject`,
  `correlationId`). Before this change a live response rendered undefined values.

## 0.9 — 2026-10-22 — OpenAPI contract evidence restored after the Scalar migration

Specification: `specs/003-openapi-contract-test/`.

### Fixed

- The OpenAPI document moved to `/openapi/v1.json` in 0.8 and fell under the authenticated-user
  fallback policy, so anonymous requests received `401` and the `/docs` reference could not load
  its own document. The document, `/docs` and the `/swagger` redirect are anonymous again; every
  other endpoint keeps the fallback policy.
- The Swashbuckle operation filter removed in 0.8 was not replaced, so the native document
  described `If-Match` as optional without an example, listed `text/plain` and `text/json` on
  every response and published no security scheme. `BearerSecurityDocumentTransformer` and
  `PolicyOperationTransformer` restore the Bearer scheme with its global requirement, the empty
  requirement on anonymous operations, the required quoted `If-Match` example and the
  `application/json` / `application/problem+json` media types.
- `SwaggerExplainsQuotedEtagAndDocumentsJsonResponses` still requested the removed Swagger path.
  Renamed to `OpenApiDocumentExplainsQuotedEtagAndDocumentsJsonResponses`, pointed at the native
  document and extended to assert the Bearer scheme and the global requirement.

### Verified

- Local SQL Server 2025, Release build, 0 warnings, `dotnet format` clean: 22 domain, 25
  application and 25 integration tests passed, 0 skipped.

## 0.8 — 2026-10-14 — NainPolicy Client, OpenAPI Scalar migration and commercial alignment

Governing decision: ADR-006 (`Approved`), `OPEN-012` and `OPEN-013`.

### Added

- `PolicyOperations.Client` on port `5375`: Vue 3 + TypeScript + Vite interactive engineering showcase with dark glassmorphic UI matching the `naindev.com` portfolio standard:
  - Interactive Finite State Machine (FSM) workbench covering `Draft -> Active -> Cancelled`.
  - Optimistic Concurrency Laboratory showcasing two competing operators with `ETag` / `rowversion`, deterministically provoking HTTP `412 Precondition Failed` with RFC 7807 problem details.
  - Append-only immutable audit trail transitions timeline.
  - Real-time cloud resilience probe measuring latency and cold-start wake-up metrics against `/health` and `/health/ready`.
- Direct CORS policy supporting `http://localhost:5375` and `https://naindev.com` with exposed `ETag` and `Retry-After` headers.
- Native `Microsoft.AspNetCore.OpenApi` (.NET 10) and `Scalar.AspNetCore` modern API explorer mounted at `/docs`.
- Central Package Management direct pin for `System.Security.Cryptography.Pkcs 10.0.13` fixing transitive vulnerability warnings `NU1902` and `NU1903`.

### Changed

- Replaced deprecated `Swashbuckle.AspNetCore` with `Scalar.AspNetCore` and redirected `/swagger` to `/docs`.
- Formalized commercial product brand as **NainPolicy** across portfolio documentation.

## 0.7 — 2026-09-08 — Free-tier resilience and demo evidence

Governing decision: ADR-006 (`Approved`). Specification: `specs/001-portfolio-demo-resilience/`.

### Fixed

- A public demo run issued after an idle period returned `500 internal_error`. The Azure SQL
  Serverless resume exceeded the provider's default 30-second command timeout, and the failure was
  mapped to a generic internal error. Measured on the live deployment: `500` after 71.3 s, then
  `200` after 26.7 s once the database was awake.
- Public-demo cleanup aborted the whole run when it failed. Cleanup is opportunistic housekeeping
  and now degrades: the failure is logged, the run continues, and the response reports
  `cleanupCompleted`.

### Added

- `503 service_unavailable` with `Retry-After` for recognised transient database conditions.
  `500 internal_error` is now reserved for genuine defects.
- `SqlTransientErrors` in the Infrastructure layer: an explicit, reviewable set of SQL Server and
  Azure SQL transient error numbers.
- `PolicyOperations:SqlResilience` configuration section with validated retry count, retry delay,
  command timeout (default 60 s) and `Retry-After` value.
- `method`, `path` and `durationMs` on each public-demo step; `totalDurationMs` and
  `cleanupCompleted` on the run response.
- Baseline security headers on every response, HSTS outside development, and short-lived caching
  for demo static assets.
- `PolicyOperations.Application.Tests`: 21 database-free tests covering the currency allow-list,
  pagination limits, ETag shape, the stale-version pre-check and audit orchestration.
- Four integration tests: per-step evidence, baseline security headers, the demo page content
  security policy and transient-condition recognition.
- CI now runs the SQL Server suite against a real SQL Server service container, collects coverage
  and fails on vulnerable NuGet packages. CodeQL analysis and Dependabot updates were added.
- `.editorconfig`, `AGENTS.md`, `CLAUDE.md`, `SECURITY.md`, `docs/traceability.md` and this file.

### Changed

- The `/demo/` page was rebuilt: readiness pre-flight, staged progress with elapsed time, bounded
  automatic retry on `503`, per-step route/status/ETag/latency, a copy-ready `curl` command,
  Open Graph metadata, keyboard and screen-reader support, and the `naindev.com` palette.

### Not verified

- The deployed environment. Until this change is released to Azure, the `500` observed on
  2026-09-08 remains reproducible in production.

## 0.6 — 2026-08-02 — Live zero-cost public demo

- Deployed the public demo to Azure App Service F1 and Azure SQL Free in France Central.
- Recorded the quota alert boundary and the `AutoPause` cutoff.
- Enabled transient SQL retries for serverless wake-up and moved demo cleanup into one retryable
  transaction.
- Public HTTPS smoke: liveness, readiness and the five-step run all returned `200`.

## 0.5 — 2026-08-02 — One-click public demo

- Added the anonymous fixed-scenario endpoint, the same-origin demo page, the fixed-window rate
  limit, the dedicated demo organization and 24-hour retention.
- Separated process liveness from SQL readiness.

## 0.4 — 2026-08-02 — OpenAPI accuracy

- Documented the quoted `If-Match` example and aligned OpenAPI response media types.

## 0.3 — 2026-08-02 — Lifecycle, security and audit

- Implemented the policy lifecycle, organization-scoped authorization, ETag concurrency, the audit
  trail, the MIT license and the local demo walkthrough.

## 0.2 — 2026-08-01 — First vertical slice

- Approved the product and architecture decisions and implemented create, get and list on .NET 10
  with real SQL Server verification.

## 0.1 — 2026-08-01 — Repository assessment

- Reviewed the pre-1.0 prototype and recorded its contradictions and material findings.
