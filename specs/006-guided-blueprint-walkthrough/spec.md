# Spec 006 — Guided blueprint walkthrough

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-005 (public demo boundary), ADR-007 (blueprint-first client, proposed),
  ADR-008 (guided walkthrough and plain-language narration, proposed)
- Builds on: spec 002 (blueprint), spec 005 (replay timing `REQ-146`, unchanged)

## Problem

The blueprint at `https://policy.naindev.com/` draws the architecture, but it still assumes an
engineer is looking at it. Reviewed in a browser on 2026-11-03 at 1440 px and 390 px:

| Observation | Impact |
|---|---|
| Every label is implementation vocabulary (`rowversion predicate`, `one UnitOfWork save`, `no provider types`) | A non-engineer visitor cannot tell what a layer does or why it matters |
| The replay ends in about 1 s (`REQ-146`) and nothing explains each step | The visitor sees five cards light up and has to infer the story from HTTP codes |
| After a run, steps can be clicked but there is no previous/next control, no keyboard path and no pacing | The run cannot be *watched*; it can only be inspected |
| Nodes are not interactive | There is no way to ask "what is Application?" without leaving the page |
| Under 640 px the SVG keeps a 760 px minimum width and scrolls sideways | On a phone the diagram is a strip the visitor pans across; the right half is hidden |
| The Audit and Concurrency tabs show a demo result with badges such as `Append-Only Verified` and `Simulate Live Race Condition`, whatever its origin | A result produced by the in-browser fallback is presented as verified evidence, against ADR-007 |
| No legend | The meaning of the green, red and dotted lines is not stated anywhere |

## Goal

Anyone, engineer or not, can press one button and understand what the system does and what it
protects against, in under a minute, on any screen size. The architecture stays the content; the
words become plain.

## Non-goals

- No change to the API, contracts, persistence, CORS, Azure resources or cost boundary.
- No change to the fast replay of spec 005: `REQ-146` still holds for the trace that follows a run.
- No new runtime dependency; no analytics; no third-party script beyond the existing ecosystem bar.
- No translation of the client; its locale stays English (ADR-007 deferred that decision).
- The Spanish `/demo/` page served by the API is unchanged.

## Design references

Reviewed on 2026-11-03 while shaping this spec. None is copied; they set the bar.

- Step-by-step request-flow players (Reqflow, the open "architecture diagram" HTML skill): a packet
  travels along wires, each step has a caption, there is a play / pause / step control and a legend.
- Restrained developer-tool pages (Linear, Stripe docs): one accent colour for "active", mono type
  only for measured values, plain sentences for everything else.
- Presently's animated-diagram guide: use motion only to show order, path and causality; give the
  diagram an accessible description; ship a still state for reduced motion.
- Dark "glowing lines" architecture illustrations (iso-glow, isometric SaaS trend): one glowing
  accent reused by name; the lit path is the only bright element.

## Requirements

Notation: EARS ("When X, the system shall Y").

### Narration

- `REQ-150` When the blueprint is idle, the narrator panel shall state in plain language what a
  run does (create, activate, block a stale overwrite, cancel, read the history), that the data is
  synthetic and that no sign-up is needed, and shall offer the run action.
- `REQ-151` When a frame is current, the narrator shall show the step position ("step N of M"), a
  plain-language title and a one-sentence explanation derived from the operation and its outcome,
  and the evidence line: method, path, HTTP status and server-measured duration.
- `REQ-152` When the operation is not one of the five known operations, the narrator shall fall
  back to a title derived from the step label and an explanation built from the HTTP outcome; no
  field shall be empty.
- `REQ-159` When any narration string is produced, the title shall be at most 48 characters and
  the explanation at most 240 characters, so the panel never scrolls on a phone.

### Controls

- `REQ-153` When a run has finished, the visitor shall be able to move to the previous or next
  step with on-screen controls and with the left and right arrow keys; both directions shall stop
  at the first and last step.
- `REQ-154` When the fast trace of a run has finished, the system shall start a walkthrough that
  shows one step at a time at a readable pace of at least 1.2 s per step, and the visitor shall be
  able to pause and resume it. Under reduced motion the walkthrough shall not start by itself; the
  controls still work.
- `REQ-155` When the visitor selects a layer in the blueprint by pointer or keyboard, the narrator
  shall show that layer's plain-language description and its responsibilities. Every node shall
  have one.

### Secondary views

- `REQ-160` When a secondary view (Lifecycle, Concurrency, Audit, Resilience) renders, it shall open
  with an eyebrow, a plain-language title and one sentence that says what the tab demonstrates,
  in the same visual form as the narrator band of the blueprint.
- `REQ-161` When a secondary view shows data that came from a demo run, it shall label the origin
  with the same `Live` / `Simulated` wording and colours as the blueprint, and shall never call a
  simulated result verified, real or live.

### Phones

- `REQ-162` When the stacked layout is in use and a run exists, a compact strip with the current
  step (position, title, previous, pause and next) shall stay visible at the bottom of the
  viewport while the tall sheet is on screen, so the narration is never off screen during the
  walkthrough. On wide screens the strip is not shown.

### Layout and legend

- `REQ-156` When the viewport is narrower than 720 px, the blueprint shall render a stacked layout
  that fits the width without horizontal scrolling; otherwise it shall render the wide layout. Both
  layouts shall contain the same nodes and edges.
- `REQ-157` When the blueprint renders, a legend shall explain the three line states: request path,
  rejected path and not yet visited.
- `REQ-158` When the visitor prefers reduced motion, flow and packet animations shall not play and
  the walkthrough shall not auto-advance; stepping by control or key shall still work.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-151` `REQ-152` `REQ-159` | Vitest: `narration.test.ts` |
| `REQ-153` (bounds) `REQ-154` (pace) | Vitest: `walkthrough.test.ts` |
| `REQ-155` (every node has a guide) | Vitest: `narration.test.ts` |
| `REQ-156` (threshold, same nodes and edges, no overlapping boxes) | Vitest: `blueprintLayout.test.ts` |
| `REQ-161` (wording) | Vitest: `narration.test.ts` (`describeSource`) |
| `REQ-150` `REQ-153` (keys) `REQ-154` (pause) `REQ-157` `REQ-158` `REQ-160` `REQ-161` (views) | Browser walkthrough recorded in `docs/public-demo.md` with the date, at 1440 px and 390 px, with reduced motion emulated |
