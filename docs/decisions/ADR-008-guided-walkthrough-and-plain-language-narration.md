# ADR-008: Guided walkthrough and plain-language narration in the client

- Identifier: ADR-008
- Date: 2026-11-03
- Status: Proposed
- Decision owner: Aitor Nain Mendoza Vallejo

## Context

ADR-007 made the architecture the first screen of `PolicyOperations.Client`. The blueprint is
accurate, but every word on it is implementation vocabulary, the replay finishes in about a second
(spec 005) and there is no narration, no step control and no explanation of a layer. A visitor who
is not a .NET engineer sees boxes light up and cannot say what was proven. On a phone the sheet
scrolls sideways, so half of the diagram is off screen at any time.

The portfolio link is opened by recruiters, product people and founders as often as by engineers.
The showcase has to work for all of them without a reading guide.

## Decision

### Narration is part of the diagram

- Every blueprint frame carries plain-language narration: a title, one sentence that says what
  happened and why it matters, and the measured evidence (method, path, status, duration). The copy
  is derived from the API step, so a live run narrates what the server actually did.
- Every layer has a short guide in plain language, shown when the visitor selects it.
- The copy is English, the current client locale (ADR-007 deferred the locale decision).

### The run has two phases

1. The fast trace of spec 005 is kept unchanged: the result arrives and the five frames are drawn
   within 1.1 s so the `Live` / `Simulated` label and the durations are on screen immediately.
2. A guided walkthrough then shows one step at a time at reading pace (1.8 s per step) with the
   narration beside the diagram. It can be paused, resumed and stepped with controls or arrow
   keys. Under reduced motion it does not start by itself.

### One diagram, two layouts

- The blueprint geometry moves out of the component into a layout module with a wide layout
  (desktop) and a stacked layout (phones). Both carry the same nodes and edges, so the timeline
  model and the tests do not change. Horizontal scrolling of the sheet is removed.

### Visual rules

- One accent for the request path (brand green), one for a rejection (brand red), dotted hairlines
  for what has not been visited; a legend states this.
- Mono type is reserved for measured values and routes; prose uses the heading face.
- Motion only shows order and path: packets hop along the lit path and lit edges carry a slow
  dash flow. Both stop under reduced motion.

## Consequences

- A visitor can press one button and follow the whole story without knowing HTTP.
- The client gains three pure modules (`narration`, `walkthrough`, `blueprintLayout`) with tests;
  the SVG component becomes layout-driven and about the same size.
- The spec 005 timing evidence stays valid; the walkthrough is additive and pausable.
- No runtime dependency, no API change, no cost change.

## Rejected alternatives

- Slow down the fast trace to reading pace: rejected, it would undo spec 005's measured 1 s result
  and delay the honesty label.
- Add a tooltip library or a tour library: rejected, a dependency for two panels of text.
- Keep the sideways scroll on phones: rejected, the right half of the architecture was invisible
  on the most common portfolio device.
- Translate the client to Spanish in the same change: still deferred; a separate product decision.
