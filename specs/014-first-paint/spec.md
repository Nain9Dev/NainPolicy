# Spec 014 — First paint without third-party blocking

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-007 (blueprint-first client), ADR-011 (self-hosted fonts, proposed)
- Builds on: spec 007 (commercial layer: the hero is the first thing a prospect sees)

## Problem

Lighthouse 12 against the built client, served locally, on 2026-11-03 (the numbers are in
`docs/public-demo.md`): on the simulated mobile profile the first paint waited 2.6 s and the
report attributed 1.3 s of it to two render-blocking cross-origin stylesheets, the Google Fonts
CSS and the brand tokens sheet. The page itself defines every CSS variable it uses, so neither
sheet is needed to paint it. The Google Fonts request also sends every visitor's IP address to a
third party before the page shows anything, which is not needed to show a font. `robots.txt` did
not exist, so the SPA answered it with HTML and the SEO audit scored it as malformed.

## Goal

The hero paints from the same origin, with the same fonts, without waiting for any third party;
the licence of each font travels with it; crawlers get a valid `robots.txt`.

## Non-goals

- No change to the API, the Azure `/demo/` page or its CSP.
- No change to typography: the same families and weights, the same visual result.
- No build-time font pipeline or new dependency; the files are committed as served.
- The ecosystem bar script stays as it is (already deferred).

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-260` When the client page loads, it shall request no stylesheet from a third-party origin
  in the render-blocking path; a cross-origin stylesheet, if kept, shall be loaded without
  blocking the first paint and shall have a `noscript` fallback.
- `REQ-261` When a web font is declared, its file shall be served from the client's own origin
  under `/fonts/`, with `font-display: swap`, and the Open Font License text of each family shall
  be shipped beside the files.
- `REQ-262` When the page loads, it shall preload only the font file the hero needs (the heading
  family), so the largest text paints in its final face without delaying anything else.
- `REQ-263` When a font subset is declared, its `unicode-range` shall cover `U+0000-00FF`, so
  Spanish diacritics, `¿`, `¡`, `«»` and `€` render in the web font and not in the fallback.
- `REQ-264` When a crawler requests `/robots.txt`, the system shall answer a valid file that
  allows the whole site.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-260` to `REQ-264` | Vitest: `firstPaint.test.ts`, which reads `index.html`, `style.css`, `public/fonts/` and `public/robots.txt` as the build will ship them |
| Measured effect | Lighthouse 12 before and after, same machine and profile, recorded in `docs/public-demo.md` with the conditions of the measurement |
| No third-party request | Playwright network capture of the built client recorded in `docs/public-demo.md` |
