# Spec next-seo-discoverability — Search and AI-engine discoverability

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-09
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Builds on: spec 014 (`robots.txt`), spec 015 (own-origin social card)

## Problem

`https://policy.naindev.com/` is the Vite build of `PolicyOperations.Client/`, published to
GitHub Pages by `deploy.yml` (`dist-path: dist`). The page already had a canonical link and Open
Graph metadata, but its description was 209 characters (search engines cut it), the Open Graph
site name was `NainDev` instead of the product, and it had no author link, structured data,
sitemap or `llms.txt`. `robots.txt` did not point at a sitemap.

## Goal

A crawler or an AI engine that fetches the root learns what the product is, who made it and where
the source lives, without running the page's JavaScript.

## Non-goals

- No change to the visual design, the copy shown to users or the Azure `/demo/` page.
- No restructuring of the single-page app: the static HTML has only the `#app` mount point and no
  `<h1>`; headings are rendered by Vue at runtime.

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-280` The public page shall declare one canonical URL, a description of 70 to 160
  characters, Open Graph and Twitter card metadata that agree with the canonical URL, an author
  link and `SoftwareApplication` JSON-LD whose author is `https://www.naindev.com/#person`.
- `REQ-281` When a crawler requests `/robots.txt`, `/sitemap.xml` or `/llms.txt`, the system shall
  answer real files: `robots.txt` allowing the site and advertising the sitemap, a sitemap listing
  the canonical URL, and a Markdown `llms.txt` that starts with an H1.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-280` `REQ-281` | Vitest: `src/delivery/seoDiscoverability.test.ts`, which reads `index.html` and `public/` as the build ships them |
