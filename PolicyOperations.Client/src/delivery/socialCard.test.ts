import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Spec 015: the link preview of policy.naindev.com must show NainPolicy's own card, served from the
 * same origin, at the size the social networks expect.
 */
const root = resolve(__dirname, '../..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

function meta(property: string): string | null {
  const match = html.match(new RegExp(`<meta\\s+(?:property|name)="${property}"\\s+content="([^"]*)"`));
  return match ? match[1] : null;
}

function pngSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('social preview card (spec 015)', () => {
  it('points the Open Graph and Twitter images at a card served from the own origin (REQ-270)', () => {
    const image = meta('og:image');

    expect(image).toBe('https://policy.naindev.com/og-cover.png');
    expect(meta('twitter:image')).toBe(image);
    expect(meta('og:image:width')).toBe('1200');
    expect(meta('og:image:height')).toBe('630');
    expect(meta('og:image:alt')).toBeTruthy();
  });

  it('ships the card at 1200 by 630 pixels (REQ-271)', () => {
    expect(pngSize(resolve(root, 'public/og-cover.png'))).toEqual({ width: 1200, height: 630 });
  });

  it('declares the Spanish locale with English as the alternate (REQ-272)', () => {
    expect(meta('og:locale')).toBe('es_ES');
    expect(meta('og:locale:alternate')).toBe('en_GB');
  });
});
