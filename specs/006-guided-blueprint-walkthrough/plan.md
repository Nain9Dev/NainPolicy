# Plan 006 — Guided blueprint walkthrough

## Design

All changes are in `PolicyOperations.Client`; the API is untouched.

1. `architecture/narration.ts` (pure, tested)
   - `narrate(frame, total)` returns `{ eyebrow, title, body, evidence }` for a `BlueprintFrame`.
     Five known operations have hand-written plain-language copy; anything else falls back to the
     label and the HTTP outcome (`REQ-151`, `REQ-152`). Lengths are bounded (`REQ-159`).
   - `IDLE_NARRATION` is the copy shown before a run (`REQ-150`).
   - `LAYER_GUIDE` maps every `NodeId` to a name, a one-line role and a short list of
     responsibilities (`REQ-155`).
2. `architecture/walkthrough.ts` (pure, tested)
   - `WALK_STEP_MS` (1,800 ms) and `walkthroughDelayMs(i)` (`REQ-154`).
   - `nextStep(index, total)` and `previousStep(index)` clamp at both ends (`REQ-153`).
3. `architecture/blueprintLayout.ts` (pure, tested)
   - Two layouts, `wide` (1200 × 520) and `stacked` (440 × 1250), each with the same node and edge
     ids, box geometry, edge paths and the reverse path of the rejected request.
   - `layoutFor(width)` returns `stacked` under 720 px (`REQ-156`).
4. `components/ArchitectureBlueprint.vue`
   - Draws whichever layout it receives. Node content is positioned relative to its box, so the
     same template serves both layouts. Chips flow into one or two columns from the box width.
   - Each node gets a plain-language line under its title; the technical chips stay but shrink.
   - Nodes are focusable (`role="button"`, `tabindex="0"`) and emit `select-node`.
   - Lit edges show a slow dash flow while a step is displayed; packets keep their hop animation.
     Both stop under reduced motion (`REQ-158`).
5. `views/ScenarioView.vue`
   - Two-column stage on wide screens: sheet on the left, narrator panel on the right; on phones
     the narrator moves under the sheet.
   - The narrator renders `IDLE_NARRATION`, the current frame's narration or a selected layer's
     guide, plus previous / next, walkthrough play / pause, run and JSON controls.
   - After the fast trace (`replayDelayMs`, spec 005) reaches `done`, the walkthrough starts from
     step 1 unless reduced motion is on. Arrow keys step when a run exists and focus is not in a
     form field.
   - A step rail under the stage replaces the five cards: numbered, connected, clickable.
   - A legend row explains the line states (`REQ-157`).
6. `components/ViewHeader.vue` and `components/SourceChip.vue`: the plain-language opening and the
   honest origin chip shared by the blueprint and the four secondary views (`REQ-160`, `REQ-161`).
   Audit and Concurrency switch from `runPublicDemo()` (which drops the origin) to `runScenario()`.
7. `style.css` is unchanged: depth comes from SVG gradients and glow filters inside the component
   and from scoped styles; reduced motion is handled per component with the existing media query.

## Why the fast trace stays

Spec 005 bounded the trace at 1.1 s because a visitor who clicks wants to see the result arrive.
The walkthrough is a second, pausable phase that starts after `done`, so the measured evidence
(`Live` / `Simulated`, durations) is on screen as early as before, and the explanation follows at
reading speed. Nothing in `blueprintTimeline.ts` changes.

## Tests

Vitest only, no browser. Three new suites next to the modules. Existing 43 tests keep passing.
The browser checks (keys, pause, legend, reduced motion, phone width) are recorded as dated
observations in `docs/public-demo.md`.
