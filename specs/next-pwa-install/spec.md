# Spec next-pwa-install — Installable on Android and iOS

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-14
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Shared contract: portfolio spec `next-pwa-install` in the `nain9dev.github.io` repository

## Problem

`https://policy.naindev.com/` is the Vite build of `PolicyOperations.Client/`, published to
GitHub Pages by `deploy.yml` (`dist-path: dist`). It publishes no web app manifest, so a phone
cannot install it with its own icon and name and a window without a browser bar.

## Goal

A visitor on Android Chrome or iOS Safari can add the site to the home screen as `NainPolicy` and
open it like an app.

## Non-goals

- No service worker, cache, offline page or install button (owner decision, 2026-11-13).
- No change to the Azure `/demo/` page (`wwwroot/demo/index.html`): it is a separate document
  served by the API, not the published site.
- No visual change to the page.

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-290` The site shall publish `/manifest.webmanifest` declaring `id`, `start_url` and `scope`
  as `/`, `display` as `standalone`, `name` and `short_name` as `NainPolicy`, `lang` as `en`,
  `dir` as `ltr`, the page's meta description as `description`, and `theme_color` and
  `background_color` as `#060D1A`. It shall not declare `prefer_related_applications`.
- `REQ-291` The manifest shall declare PNG icons that exist at their declared size: 192 px and
  512 px with purpose `any`, and 512 px with purpose `maskable` (opaque, mark inside the centred
  circle of radius 40% of the width). The site shall also serve a 180 px opaque
  `icons/apple-touch-icon.png`.
- `REQ-292` When a browser loads the page, its head shall link the manifest and the touch icon and
  set `mobile-web-app-capable` and `apple-mobile-web-app-capable` to `yes`,
  `apple-mobile-web-app-title` to `NainPolicy` and `apple-mobile-web-app-status-bar-style` to
  `black` (the page is dark).

## Edge cases

- Vite copies `public/` unchanged to the root of `dist/`, so the manifest and icons are published
  as files without any change to `deploy.yml`. The site sets no Content-Security-Policy.
- The page already uses root-absolute asset paths, so the manifest does too.
- Without a service worker, an installed window offline shows the browser's own offline screen.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-290` `REQ-291` `REQ-292` | Vitest: `src/delivery/pwaInstall.test.ts`, run by `npm test` in the `client-tests` job of `ci.yml` |
| Opacity, safe zone, Chrome installability | Install verifier and Chrome `Page.getInstallabilityErrors` on the built `dist/` |
| Live behaviour | After the deploy, the owner installs the site on an Android phone and an iPhone |

## Session state

- Last updated: 2026-11-14.
- Done: `T-PWA-1` to `T-PWA-3`.
- Verified: `npm test` 146 passed, `npm run build` ok, Chrome reports no installability error.
- Next: `T-PWA-4` after the deploy.
- Blocked: `T-PWA-4` needs the owner's phones.
