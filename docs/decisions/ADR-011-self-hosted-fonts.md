# ADR-011: Self-hosted fonts and no third party in the first paint

- Identifier: ADR-011
- Date: 2026-11-03
- Status: Proposed
- Decision owner: Aitor Nain Mendoza Vallejo

## Context

The client at `https://policy.naindev.com/` loaded its two typefaces, Urbanist and IBM Plex
Mono, through the Google Fonts stylesheet, and the brand tokens sheet from `brand.naindev.com`,
both as render-blocking `<link rel="stylesheet">` elements. Measured with Lighthouse 12 on
2026-11-03 (spec 014), those two requests held the first paint for about 1.3 s on the simulated
mobile profile. The page defines every CSS variable it uses, so the brand sheet is not needed to
paint it; the fonts are needed, but not from a third party.

Two further facts weigh on the decision:

- A request to `fonts.googleapis.com` sends the visitor's IP address to Google before the page
  shows anything. The page is visited from Spain by people deciding whether to hire the owner;
  not sending their IP to a third party for a font is the simpler position to defend.
- Both families are published under the SIL Open Font License 1.1, which allows serving the files
  from one's own origin provided the licence travels with them.

## Decision (proposed)

- Serve Urbanist (variable, weights 500 to 900) and IBM Plex Mono (400, 500, 600) from the
  client's own origin under `/fonts/`, latin subset, `woff2`, with `font-display: swap`. The
  licence text of each family is committed beside the files.
- Preload only the heading file, which the hero needs for its largest text.
- Keep the brand tokens sheet, but load it without blocking the first paint (print-media swap
  with a `noscript` fallback). The client does not depend on it to render; the ecosystem bar,
  which is already deferred, is the only consumer.
- Ship a `robots.txt` that allows the whole site, so crawlers do not receive the SPA's HTML in
  its place.
- No font pipeline, no new dependency: four files, two licences, one stylesheet block. Updating a
  font is a deliberate replacement of a file, recorded in the changelog.

## Consequences

- One fewer third party in the critical path, and none that receives visitor addresses for a
  font. The measured effect is recorded in `docs/public-demo.md`; the claim is the measurement,
  not this document.
- About 73 KB of font files are now part of the repository and of every deploy, the same bytes
  the browser downloaded from Google before, now from the same origin and cacheable with the
  site.
- Characters outside the latin range (U+0000 to U+00FF plus the usual punctuation) render in the
  system fallback. The page's two languages, Spanish and English, do not need more.
- The ecosystem bar may paint a few milliseconds before the brand sheet arrives. It is deferred
  JavaScript, so in practice the sheet is there first; the owner confirms it on the live page
  (`T-1406`).

## Rejected alternatives

- **Keep Google Fonts and add `preconnect` only:** removes some latency, keeps the third-party
  request and the IP disclosure.
- **A `@fontsource` npm dependency:** the same files behind a package manager, plus a dependency
  to keep current for no gain; the committed files are simpler to audit.
- **System fonts only:** the fastest option, but the typography is part of the brand the
  portfolio and the repository banner already use.
- **Inline the brand tokens:** the client already defines its own; duplicating the brand sheet
  would create a second source of truth for the bar's tokens.
