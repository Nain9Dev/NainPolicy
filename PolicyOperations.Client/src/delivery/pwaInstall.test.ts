import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Spec next-pwa-install: the site must be installable on Android Chrome and iOS Safari.
 * Reads the files as `vite build` ships them: `index.html` and everything under `public/`.
 * Opacity and the maskable safe zone are checked by the install verifier, not here.
 */
const root = resolve(__dirname, '../..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const publicPath = (name: string): string => resolve(root, 'public', name);

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}

function readManifest(): Record<string, unknown> {
  return JSON.parse(readFileSync(publicPath('manifest.webmanifest'), 'utf8'));
}

/* Width and height from the PNG IHDR chunk (bytes 16 to 23). */
function pngSize(file: string): string {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString('ascii'), `${file} is a PNG`).toBe('PNG');
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

function tags(name: string): Record<string, string>[] {
  const withoutNoscript = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  const found = withoutNoscript.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? [];
  return found.map((tag) => {
    const attributes: Record<string, string> = {};
    for (const match of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) attributes[match[1]] = match[2];
    return attributes;
  });
}

const metaContent = (name: string): string[] =>
  tags('meta')
    .filter((attributes) => attributes.name === name)
    .map((attributes) => attributes.content);

describe('installable site (spec next-pwa-install)', () => {
  it('declares the standalone manifest members with the approved names (REQ-290)', () => {
    const manifest = readManifest();
    const description = metaContent('description')[0];
    expect(manifest).toMatchObject({
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      name: 'NainPolicy',
      short_name: 'NainPolicy',
      lang: 'en',
      dir: 'ltr',
      theme_color: '#060D1A',
      background_color: '#060D1A',
      description,
    });
    expect(manifest).not.toHaveProperty('prefer_related_applications');
    expect(metaContent('theme-color')).toEqual([manifest.theme_color]);
  });

  it('ships the three icons at their declared sizes, one purpose each (REQ-291)', () => {
    const icons = readManifest().icons as ManifestIcon[];
    expect(icons.map((icon) => `${icon.src} ${icon.sizes} ${icon.purpose}`)).toEqual([
      '/icons/icon-192.png 192x192 any',
      '/icons/icon-512.png 512x512 any',
      '/icons/icon-maskable-512.png 512x512 maskable',
    ]);
    for (const icon of icons) {
      expect(icon.type).toBe('image/png');
      const file = publicPath(icon.src.slice(1));
      expect(existsSync(file), `${icon.src} exists`).toBe(true);
      expect(pngSize(file)).toBe(icon.sizes);
    }
  });

  it('ships a 180 px apple touch icon (REQ-291)', () => {
    expect(pngSize(publicPath('icons/apple-touch-icon.png'))).toBe('180x180');
  });

  it('links the manifest and the touch icon, and sets the iOS app tags (REQ-292)', () => {
    const links = tags('link');
    expect(links.filter((link) => link.rel === 'manifest').map((link) => link.href)).toEqual([
      '/manifest.webmanifest',
    ]);
    expect(links.filter((link) => link.rel === 'apple-touch-icon').map((link) => link.href)).toEqual([
      '/icons/apple-touch-icon.png',
    ]);
    expect(metaContent('mobile-web-app-capable')).toEqual(['yes']);
    expect(metaContent('apple-mobile-web-app-capable')).toEqual(['yes']);
    expect(metaContent('apple-mobile-web-app-title')).toEqual(['NainPolicy']);
    expect(metaContent('apple-mobile-web-app-status-bar-style')).toEqual(['black']);
  });
});
