# Plan next-pwa-install

- Document version: 0.1
- Date: 2026-11-14

## Modules (client only)

- `PolicyOperations.Client/public/manifest.webmanifest`: static file, copied by Vite to the root of
  `dist/`. Covers `REQ-290` and `REQ-291`.
- `PolicyOperations.Client/public/icons/`: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
  and `apple-touch-icon.png`, rendered from `public/favicon.svg` (the existing shield mark, sky
  blue `#38bdf8`) on the page background `#060D1A`. Covers `REQ-291`.
- `PolicyOperations.Client/index.html`: manifest link, touch icon and iOS tags next to the existing
  `theme-color`. Covers `REQ-292`.
- `PolicyOperations.Client/src/delivery/pwaInstall.test.ts`: reads the files as the build ships
  them; written first and red before the change. Covers `REQ-290` to `REQ-292`.

## Publishing

`deploy.yml` builds with `npm run build` in `PolicyOperations.Client` and publishes `dist/`. Vite
copies every file of `public/` there unchanged, so no workflow change is needed. There is no SPA
fallback and no Content-Security-Policy on GitHub Pages.

## Decisions

- Static manifest, no plugin and no service worker (owner decision, 2026-11-13).
- Root-absolute paths (`/icons/...`), matching the page's existing `/favicon.svg` and `/fonts/...`.
- The `any` icons are opaque on `#060D1A` so the sky-blue mark stays legible on a light launcher.
- The Azure `/demo/` page is not touched.

## Regenerating the icons

```text
node make-install-icons.mjs --source public/favicon.svg --out public/icons --bg "#060D1A" --any-bg "#060D1A" --apple-scale 0.8
```

The maskable scale is the script default (0.56).

## Verification

`npm test`, `npm run build`, then the install verifier and Chrome's installability check on
`dist/`.
