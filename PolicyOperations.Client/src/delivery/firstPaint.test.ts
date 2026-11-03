import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Spec 014: the shipped page must paint without a third party in the way. These tests read the
 * files exactly as `vite build` ships them, so a regression in `index.html` or `style.css` fails
 * here before it reaches the browser.
 */
const root = resolve(__dirname, '../..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'src/style.css'), 'utf8');
const fontsDir = resolve(root, 'public/fonts');

/* Link tags outside <noscript>: those inside it never block a browser that runs scripts. */
function linkTags(): string[] {
  return html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '').match(/<link\b[^>]*>/g) ?? [];
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return match ? match[1] : null;
}

function fontFaces(): string[] {
  return css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
}

describe('first paint (spec 014)', () => {
  it('requests no stylesheet from a third party in the render-blocking path (REQ-260)', () => {
    const blocking = linkTags().filter((tag) => {
      const rel = attr(tag, 'rel');
      const href = attr(tag, 'href') ?? '';
      const crossOrigin = /^https?:\/\//.test(href);
      const deferred = attr(tag, 'media') === 'print' && /onload=/.test(tag);
      return rel === 'stylesheet' && crossOrigin && !deferred;
    });

    expect(blocking).toEqual([]);
    expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  });

  it('gives every deferred cross-origin stylesheet a noscript fallback (REQ-260)', () => {
    const deferred = linkTags().filter((tag) => attr(tag, 'media') === 'print' && /onload=/.test(tag));
    const noscript = html.match(/<noscript>[\s\S]*?<\/noscript>/g)?.join('\n') ?? '';

    for (const tag of deferred) {
      expect(noscript).toContain(attr(tag, 'href'));
    }
  });

  it('declares every web font from the own origin with swap and a shipped licence (REQ-261)', () => {
    const faces = fontFaces();
    expect(faces.length).toBeGreaterThan(0);
    const shipped = readdirSync(fontsDir);

    for (const face of faces) {
      const url = face.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] ?? '';
      expect(url).toMatch(/^\/fonts\/[a-z0-9-]+\.woff2$/);
      expect(shipped).toContain(url.replace('/fonts/', ''));
      expect(face).toMatch(/font-display:\s*swap/);
    }
    expect(shipped).toContain('LICENSE-urbanist.txt');
    expect(shipped).toContain('LICENSE-ibm-plex-mono.txt');
    expect(readFileSync(resolve(fontsDir, 'LICENSE-urbanist.txt'), 'utf8')).toContain('SIL Open Font License');
    expect(readFileSync(resolve(fontsDir, 'LICENSE-ibm-plex-mono.txt'), 'utf8')).toContain('SIL Open Font License');
  });

  it('preloads only the heading font file (REQ-262)', () => {
    const preloads = linkTags().filter((tag) => attr(tag, 'rel') === 'preload' && attr(tag, 'as') === 'font');

    expect(preloads).toHaveLength(1);
    const href = attr(preloads[0], 'href') ?? '';
    expect(href).toMatch(/urbanist/);
    expect(existsSync(resolve(root, 'public', href.replace(/^\.?\//, '')))).toBe(true);
    expect(attr(preloads[0], 'type')).toBe('font/woff2');
    expect(preloads[0]).toMatch(/\bcrossorigin\b/);
  });

  it('covers the latin range so Spanish punctuation renders in the web font (REQ-263)', () => {
    for (const face of fontFaces()) {
      expect(face).toMatch(/unicode-range:[^;]*U\+0000-00FF/);
    }
  });

  it('ships a robots.txt that allows the whole site (REQ-264)', () => {
    const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');

    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).not.toMatch(/^Disallow: \/$/m);
  });
});
