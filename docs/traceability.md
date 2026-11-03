# Traceability

- Document version: 0.7
- Status: Active
- Date: 2026-11-03
- Scope: Approved rule identifier to the test that demonstrates it

## How to read this

A rule is *demonstrated* when a named, runnable test fails if the rule is removed. Rules covered
only by a SQL constraint or by manual observation are marked as such, because a constraint that no
test exercises is a design intention, not evidence.

Suites:

- `D` — `PolicyOperations.Domain.Tests` (no infrastructure)
- `A` — `PolicyOperations.Application.Tests` (no database)
- `I` — `PolicyOperations.IntegrationTests` (real SQL Server)
- `M` — `PolicyOperations.IntegrationTests` migration suite (real SQL Server)

## Policy identity and value

| Rule | Suite | Test |
|---|---|---|
| `POL-001` | D | `CreateWithValidValuesCreatesOrganizationScopedDraftPolicy` |
| `POL-002` | D | `CreateWithoutPolicyNumberThrowsRuleViolation`, `CreateWithPolicyNumberOverMaximumLengthThrowsRuleViolation` |
| `POL-003` | A | `CreatePersistsNormalizedPolicyAndSavesOnce` |
| `POL-004` | A, I | `CreateRejectsDuplicateNormalizedNumberInsideTheSameOrganization`, `DuplicateNormalizedNumberWithinOrganizationReturnsConflict` |
| `POL-005` | A, I | `CreateAllowsTheSameNumberInAnotherOrganization`, `PolicyNumberAndReadsAreIsolatedByOrganization` |
| `POL-006` | D, I | `CreateWithInvalidInsuredAmountThrowsRuleViolation`, `CreateAboveMaximumInsuredAmountThrowsRuleViolation`, `CreateWithMaximumAmountPersistsExactValue` |
| `POL-007` | D, I | `CreateWithMaximumInsuredAmountPreservesExactValue`, `CreateWithInvalidAmountReturnsSafeValidationProblem` |
| `POL-008` | D | `CreateWithInvalidCurrencyThrowsRuleViolation` |
| `POL-009` | A, I | `CreateRejectsCurrencyThatIsNotEnabledForTheDeployment`, `UnsupportedCurrencyReturnsSafeValidationProblem` |
| `POL-010` | — | Versioned configuration in `appsettings.json`; no test asserts the specific list, by design |
| `POL-011` | — | Structural: no mutation command exists for amount or currency |
| `POL-012` | D | `CreateWithNonUtcTimestampThrowsRuleViolation` |

## Organization and authorization

| Rule | Suite | Test |
|---|---|---|
| `SEC-001` | I | `UnauthenticatedPolicyRequestReturnsProblemDetails` |
| `SEC-002` | I | `ReaderCannotCreatePolicy` |
| `SEC-003` | I | `CreateThenGetReturnsScopedDraftWithEtag`, `ActivateThenCancelUsesConcurrencyAndAppendsAudit` |
| `SEC-004` | A, I | `ActivateWritesOneAuditRecordAndSavesOnce`, `ActivateThenCancelUsesConcurrencyAndAppendsAudit` |
| `SEC-005` | I | `PolicyNumberAndReadsAreIsolatedByOrganization` |
| `SEC-006` | — | Structural: request contracts expose neither field |
| `SEC-007` | A, I | `ListReturnsOnlyTheRequestingOrganization`, `PolicyNumberAndReadsAreIsolatedByOrganization` |
| `SEC-008` | A, I | `GetByIdTreatsAnotherOrganizationsPolicyAsNotFound`, `GetMissingPolicyReturnsNotFoundProblem` |
| `SEC-009` | I | `UnsupportedCurrencyReturnsSafeValidationProblem`, `CreateWithInvalidAmountReturnsSafeValidationProblem` |
| `SEC-010` | — | Boundary rule; enforced by review, not by a test |

## Lifecycle and completeness

| Rule | Suite | Test |
|---|---|---|
| Draft to Active | D, A | `ActivateDraftStoresCompletenessAndReturnsAuditTransition`, `ActivateWritesOneAuditRecordAndSavesOnce` |
| Draft or Active to Cancelled | D, A | `CancelDraftRequiresReasonAndReturnsAuditTransition`, `CancelRecordsTheReasonInTheAuditTrail` |
| Cancelled is terminal | D, A | `CancelledPolicyCannotReactivate`, `CancelIsTerminal` |
| Activation completeness | D, I | `ActivateWithInvalidCoverageDoesNotChangeDraft`, `ActivationRequiresEtagAndCompleteData` |
| Cancellation reason required | D | `CancelWithoutReasonDoesNotChangePolicy` |
| Transition actor required | D | `InvalidTransitionActorDoesNotMutateDraft` |

## Concurrency

| Rule | Suite | Test |
|---|---|---|
| `CONC-001` | I | `ActivateThenCancelUsesConcurrencyAndAppendsAudit` |
| `CONC-002` | A, I | `ResponseExposesTheRowVersionAsBase64`, `CreateThenGetReturnsScopedDraftWithEtag` |
| `CONC-003` | A | `ActivateRejectsAnEtagThatIsNotASqlServerRowVersion` |
| `CONC-004` | I | `ActivationRequiresEtagAndCompleteData` |
| `CONC-005` | A, I | `ActivateRejectsAnEtagThatIsNotASqlServerRowVersion`, `ActivationRequiresEtagAndCompleteData` |
| `CONC-006` | A, I | `ActivateRejectsAStaleVersionWithoutWritingAnAuditRecord`, `ActivateThenCancelUsesConcurrencyAndAppendsAudit` |
| `CONC-007` | A | `CancelIsTerminal` |

## Audit trail

| Rule | Suite | Test |
|---|---|---|
| One record per accepted transition | A, I | `ActivateWritesOneAuditRecordAndSavesOnce`, `ActivateThenCancelUsesConcurrencyAndAppendsAudit` |
| Reason recorded on cancellation | A | `CancelRecordsTheReasonInTheAuditTrail` |
| Ordered by occurrence then identifier | A | `ListTransitionsReturnsOccurrenceOrder` |
| Scoped to the organization | A | `ListTransitionsRejectsAPolicyOutsideTheOrganization` |
| Update and audit share one save | A | `ActivateWritesOneAuditRecordAndSavesOnce` |

## Pagination

| Rule | Suite | Test |
|---|---|---|
| `PAGE-001` | A | `ListRejectsPagingOutsideTheSupportedRange` |
| `PAGE-002` | A, I | `ListRejectsPagingOutsideTheSupportedRange`, `ListReturnsBoundedPageAndTotalCount` |
| `PAGE-003` | A, I | `ListRejectsAPageOffsetThatWouldOverflowTheSqlOffset`, `ListWithOverflowingPageReturnsValidationProblem` |
| `PAGE-004` | I | `ListReturnsBoundedPageAndTotalCount` |

## Public portfolio demo

| Rule | Suite | Test |
|---|---|---|
| `DEMO-001` | — | Configuration gate; the disabled path is asserted by review of `PublicDemoOptions` validation |
| `DEMO-002` | I | `PublicDemoRunsCompleteSyntheticLifecycleWithoutAuthentication` |
| `DEMO-003` | I | `PublicDemoRunsCompleteSyntheticLifecycleWithoutAuthentication` |
| `DEMO-004` | I | `PublicDemoRunsCompleteSyntheticLifecycleWithoutAuthentication` |
| `DEMO-005` | I | `UnauthenticatedPolicyRequestReturnsProblemDetails`, `ReaderCannotCreatePolicy` |
| `DEMO-006` | — | Configured limit; observed manually against the live deployment |
| `DEMO-007` | I | `PublicDemoPrunerDeletesOnlyExpiredDemoPolicies` |
| `DEMO-008` | I | `PublicDemoRunsCompleteSyntheticLifecycleWithoutAuthentication` |

## Free-tier resilience (ADR-006, proposed)

| Rule | Suite | Test |
|---|---|---|
| `OPS-001` transient conditions are recognised, other failures are not | I | `TransientDatabaseConditionsAreRecognisedAndOtherFailuresAreNot` |
| `OPS-002` cleanup degrades without failing the run | I | `PublicDemoPrunerDeletesOnlyExpiredDemoPolicies` covers the success path; the degraded path is covered by construction and logged |
| `OPS-003` per-step route, status and server timing are reported | I | `PublicDemoRunReportsPerStepRouteStatusAndServerTiming` |
| `OPS-004` baseline security headers on every response | I | `EveryResponseCarriesTheBaselineSecurityHeaders` |
| `OPS-005` demo page keeps a restrictive content security policy | I | `DemoPageIsServedWithARestrictiveContentSecurityPolicy` |
| `OPS-006` transient failure returns `503` with `Retry-After` | — | **Gap.** Producing a genuine transient SQL failure in a test needs a fault-injection seam; only the recognition function is covered today |

## Migration boundary

| Rule | Suite | Test |
|---|---|---|
| Legacy rows preserved | M | `LifecycleMigrationPreservesLegacyRows` |
| Duplicate legacy numbers stop the upgrade | M | `LifecycleMigrationStopsBeforeLosingDuplicatePolicyNumbers` |
| Ownership and currency are never invented (`51003`) | M | `OrganizationMigrationRefusesToInventOwnershipOrCurrency` |
| Down migration refuses data loss (`51004`) | M | `OrganizationDownMigrationRefusesDataLoss` |

## API description

| Rule | Suite | Test |
|---|---|---|
| OpenAPI document is anonymous, publishes the Bearer scheme, a quoted `If-Match` example and JSON media types (spec 003, `REQ-030`, `REQ-032` to `REQ-035`) | I | `OpenApiDocumentExplainsQuotedEtagAndDocumentsJsonResponses` |
| Liveness and readiness are separate | I | `LivenessAndSqlReadinessAreSeparateAndHealthy` |

## Client presentation (spec 002, ADR-007 proposed)

Suite `C` — `PolicyOperations.Client` Vitest (`npm test`, no browser).

| Requirement | Suite | Test |
|---|---|---|
| `REQ-102` successful command lights every layer and moves the domain state | C | `lights every layer down to SQL Server for a successful lifecycle command`, `moves the domain state to the resulting status of each successful command` |
| `REQ-103` `412` stops at the concurrency guard without state or ledger change | C | `draws a 412 as a rejected path stopped at the concurrency guard, without touching state or ledger` |
| `REQ-104` one ledger row per transition, two at the end | C | `appends one ledger row per state transition so a full run ends with two rows` |
| `REQ-140` no API contact until the visitor shows intent (spec 005) | C | `does nothing until the visitor shows intent`, `can be disarmed…`; browser: 0 requests before input |
| `REQ-141` first intent signal starts the wake-up once | C | `starts the wake-up on pointermove / pointerdown / touchstart / keydown / scroll`, `ignores every signal after the first`, `lists exactly the intent signals…` |
| `REQ-142` a run without earlier intent starts the wake-up | C | `starts the wake-up as part of a run that had no earlier intent` |
| `REQ-143` pending wake-up: wait at most 0.8 s, then simulated without a demo request | C | `runs live when the pending wake-up becomes ready within 0.8 s`, `answers simulated without sending the demo request…` |
| `REQ-144` otherwise the demo request has a 2 s limit | C | `aborts the demo request after 2 s…`, `keeps waiting while the demo answer is inside the 2 s limit`, `still tries the demo request when the wake-up was unavailable` |
| `REQ-145` live answer inside the limit is labelled `live` | C | `labels a fast answer live` |
| `REQ-146` replay ends within 1.1 s (spec 005) | C | `finishes the five-frame replay within 1.1 s…`, `starts the first frame immediately`; browser: 0.97 to 0.98 s click to done on a warm database |
| `REQ-147` owner cost-guard steps documented | — | Review: `specs/005-intent-warmup-cost-guard/azure-cost-guard-runbook.md` |
| `REQ-130` (replaced by `REQ-140` to `REQ-142`) client sends one `GET /health/ready` on load (spec 004) | C | `sends one GET /health/ready to the configured API` |
| `REQ-131` wake-up sent at most once per page load | C | `sends the wake-up at most once however often it is requested` |
| `REQ-132` ready only on 200; error, network failure or 120 s is unavailable, never simulated | C | `reports ready when the API answers 200`, `reports unavailable on an error status…`, `…when the network fails`, `gives up after 120 s…` |
| `REQ-133` waking status shown near the run button | C | `notifies subscribers so the view can show the waking status` (state); chip observed in a browser run |
| `REQ-134` live run waits at most 6 s, then simulated | C | `aborts after 6 s and answers with a run labelled simulated`, `keeps waiting while the answer is still inside the limit` |
| `REQ-135` fast live run stays labelled `live` | C | `labels a fast answer live` |
| `REQ-136` run does not depend on a pending wake-up | C | `does not wait for a pending wake-up before running` |
| `REQ-137` replay of five frames finishes within 1.5 s (spec 004) | C | `finishes the five-frame replay within 1.5 s including the visual transition`, `starts the first frame immediately`; browser run: 1.36 to 1.40 s click to done against Azure |
| `REQ-138` frames in order; reduced motion never later | C | `keeps frames in order, each strictly after the previous`, `never starts a frame later under reduced motion…` |
| `REQ-110` run labelled `live` or `simulated` by source | C | `labels a 200 from the configured API as live…`, `labels the in-browser fallback as simulated when the network fails`, `…when the API answers with an error status` |
| `REQ-111` base URL from `VITE_API_BASE_URL`, same-origin when absent | C | `prefixes the request with VITE_API_BASE_URL…`, `keeps same-origin paths when VITE_API_BASE_URL is absent`, `derives the OpenAPI explorer link from the same base URL` |
| `REQ-112` CORS accepts `https://policy.naindev.com` | I | `PreflightFromPolicySubdomainIsAllowed` |
| `REQ-113` client contract matches the API shape | C | `labels a 200 from the configured API as live and passes the response through unchanged` (typed against `PublicDemoRunResponse`; `vue-tsc` enforces the shape) |
| `REQ-101` `REQ-105` `REQ-120` `REQ-121` `REQ-123` | — | Browser walkthrough recorded in `docs/public-demo.md` (2026-10-22) |
| `REQ-122` reduced motion | — | Emulated in a browser on 2026-11-03 (spec 006 walkthrough): no packets, no flow, trace lands on the last step |
| `REQ-123` accessible name and description, keyboard reach, WCAG 2.2 AA contrast | — | `npm run audit:a11y` (axe-core 4.14, WCAG 2.x A/AA and best practices): 0 violations on the five tabs on 2026-11-03; keyboard: `Enter` and `Space` on a focused layer box select it, `Escape` clears |

## Client walkthrough (spec 006, ADR-008 proposed)

| Requirement | Suite | Test |
|---|---|---|
| `REQ-151` step position, plain title, one explanation, evidence line | C | `states the step position, a plain-language title, one explanation and the evidence line`, `gives each of the five known operations its own title and explanation`, `marks the rejected step as such in the eyebrow…` |
| `REQ-152` unknown operation falls back to label and HTTP outcome, never empty | C | `falls back to the label and the HTTP outcome for an unknown operation, never empty`, `explains a rejected unknown operation from its status code` |
| `REQ-159` title at most 48 and explanation at most 240 characters | C | `keeps every title and explanation short enough for a phone panel` |
| `REQ-150` idle narration names the five actions, synthetic data and no sign-up | C | `narrates the idle frame with the five things a run does and the synthetic, no sign-up boundary`; browser: overlay button and band observed |
| `REQ-155` every node has a guide | C | `describes every node with a name, a one-line role and at least two responsibilities`; browser: selection by click and Enter observed |
| `REQ-153` previous / next clamp at both ends; arrow keys | C | `moves forward one step and stops at the last`, `moves back one step and stops at the first`, `enters the first step from the idle position`; browser: ← → observed, bounded |
| `REQ-154` walkthrough at least 1.2 s per step, pausable, slower than the trace | C | `advances at a readable pace of at least 1.2 s per step`, `shows the first step immediately…`, `is slower than the fast trace of spec 005…`; browser: auto-start after trace, Pause / Replay observed |
| `REQ-156` stacked layout under 720 px, same nodes and edges, no overlap, edges on node borders | C | `uses the stacked layout under 720 px and the wide layout from 720 px`, `defines every node and every edge`, `never overlaps two nodes`, `starts and ends each edge on the boundary of the nodes it joins`; browser: 390 px has no horizontal scroll |
| `REQ-157` legend | — | Browser walkthrough recorded in `docs/public-demo.md` (2026-11-03) |
| `REQ-160` secondary views open with eyebrow, title and one sentence | — | Browser walkthrough recorded in `docs/public-demo.md` (2026-11-03) |
| `REQ-161` demo results labelled `Live` / `Simulated`, never verified | C | `names a live result after SQL Server and a simulated one after the browser`, `never calls a simulated result live, verified or real`; browser: chip observed on Audit and Concurrency |

## Commercial layer and locale (spec 007, ADR-009 proposed)

| Requirement | Suite | Test |
|---|---|---|
| `REQ-170` hero: outcome headline, three protections, two actions | — | Browser walkthrough recorded in `docs/public-demo.md` (2026-11-03); `keeps the hero headline short enough to read at a glance` bounds the title |
| `REQ-171` proof chips state only verifiable facts | C | `states only verifiable proof in the hero: no counts, no customers`; browser: each chip links to the repository or the CI workflow |
| `REQ-172` problem cards open the proving tab or evidence | — | Browser: card 1 opens `#concurrency`, card 3 links to `docs/traceability.md` |
| `REQ-173` engagement band without unverifiable claims | — | Review of the catalogue; browser walkthrough |
| `REQ-174` locale from stored preference, then browser language, else English | C | `honours a stored preference over the browser language`, `picks Spanish for a Spanish browser when nothing is stored`, `falls back to English for any other or unknown language`, `ignores a stored value that is not a supported locale` |
| `REQ-175` every visitor-facing surface follows the locale; `lang` attribute follows | — | Browser: `lang` is `es` for `es-ES`, toggle switches headers and stores `en`; narration in both locales covered by `narration in Spanish` |
| `REQ-176` same keys in both locales, bounded lengths | C | `defines exactly the same keys in both locales`, `leaves no string empty in either locale`, `keeps every step narration and layer guide inside the spec 006 bounds in both locales` |
| `REQ-177` tabs addressable by hash | C | `maps each hash to its tab, case-insensitively`, `opens the blueprint for an empty or unknown hash`, `round-trips every tab through its hash`; browser: `#audit` opens the Audit tab |
| `REQ-178` copyable run summary | C | `states the run id, origin, server time and page address`, `lists one line per step…`, `ends with the final state and the ledger size`, `labels a simulated run honestly and says so in Spanish too`; browser: clipboard content read back in both locales |
| `REQ-179` Open Graph and Twitter metadata | — | Review of `index.html` |
| `REQ-180` secondary views fully follow the locale | — | Browser walkthrough: Lifecycle, Concurrency, Audit and Resilience in Spanish (2026-11-03) |
| `REQ-181` concurrency race drawn as a track following the real phases and ETags | — | Browser walkthrough: phases `read`, `alpha_committed`, `beta_rejected`, `completed` observed on desktop and phone |
| `REQ-182` idle pulse along the request route; none under reduced motion | C | `runs the idle pulse from the browser to SQL Server`; browser: `.ghost` present when idle |
| `REQ-183` hero proof reflects the database probe | — | Browser: `state-unavailable` with its title after pointer intent without a backend |
| `REQ-184` client tests and build in CI | — | `.github/workflows/ci.yml` job `client-tests` |

## Practice mode (spec 008 proposed)

| Requirement | Suite | Test |
|---|---|---|
| `REQ-190` no token: in-browser engine, no API contact, labelled simulated | C | `answers from the in-browser engine without contacting the API when there is no token`, `refuses a stale version in the in-browser engine with a 412 Problem Details` |
| `REQ-191` token and 2xx: API body and ETag labelled live | C | `returns the API body and ETag labelled live on a 2xx with a token` |
| `REQ-192` token and non-2xx: thrown with Problem Details, never a fallback | C | `surfaces a non-2xx answer from the API as an error with its Problem Details and never falls back` |
| `REQ-193` token and network failure: simulated | C | `answers from the in-browser engine labelled simulated when the network fails with a token` |
| `REQ-194` `REQ-195` Lifecycle usable without a token; stale-write action | — | Browser walkthrough recorded in `docs/public-demo.md` (2026-11-03) |
| `REQ-196` Audit origin follows the answer | C | `labels a live transition list by its origin`; browser: simulated chip after a token-less read |
| `REQ-197` continuity: Audit shows the driven policy or the last run first | C | `remembers the last policy driven by hand, latest wins, as a copy`, `remembers the last scenario run with its origin`, `forgets everything on demand`; browser: run → Audit shows two rows named as the last run; drive → Audit shows the driven policy |
| `REQ-198` Audit never runs the demo on its own | — | Browser: opening `#audit` in a fresh session makes no request and shows the hint |

## One path through the tabs (spec 010 proposed)

| Requirement | Suite | Test |
|---|---|---|
| `REQ-221` (order) each tab points at the next, the last ends | C | `visits every tab exactly once, in display order`, `points each tab at the next one and ends after the last`, `numbers the steps from one` |
| `REQ-220` `REQ-223` `REQ-224` keys in both locales | C | `defines exactly the same keys in both locales`, `leaves no string empty in either locale` |
| `REQ-220` to `REQ-224` on screen | — | Browser walkthrough recorded in `docs/public-demo.md` (2026-11-03) |
| `REQ-158` reduced motion: no flow, no auto walkthrough, stepping works | — | Browser walkthrough with `prefers-reduced-motion: reduce` emulated (2026-11-03) |

## Known gaps

1. `OPS-006` has no end-to-end test. Closing it requires a fault-injection seam around the
   database connection; that is a design change and is not in scope for spec 001.
2. `DEMO-006` (rate limit) is verified only by manual observation against the live deployment.
3. `POL-010` deliberately has no test: the supported currency list is deployment configuration,
   not a domain rule.
