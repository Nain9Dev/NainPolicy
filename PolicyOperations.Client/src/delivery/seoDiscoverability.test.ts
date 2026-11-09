import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Spec next-seo-discoverability: the public page and its discovery files must be crawler-ready.
 * These tests read the files exactly as `vite build` ships them: `index.html` and everything under
 * `public/`, which Vite copies verbatim to the site root.
 */
const root = resolve(__dirname, '../..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const publicFile = (name: string): string => readFileSync(resolve(root, 'public', name), 'utf8');

const CANONICAL = 'https://policy.naindev.com/';
const AUTHOR_ID = 'https://www.naindev.com/#person';
const REPOSITORY = 'https://github.com/Nain9Dev/NainPolicy';

/* Opening tags of one element, outside <noscript>, with their attributes parsed. */
function tags(name: string): Record<string, string>[] {
  const withoutNoscript = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
  const found = withoutNoscript.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? [];
  return found.map((tag) => {
    const attributes: Record<string, string> = {};
    for (const match of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) attributes[match[1]] = match[2];
    return attributes;
  });
}

function meta(key: string): string {
  const values = tags('meta')
    .filter((attributes) => attributes.property === key || attributes.name === key)
    .map((attributes) => attributes.content);
  expect(values, `exactly one <meta> for ${key}`).toHaveLength(1);
  return values[0];
}

describe('search and AI-engine discoverability (spec next-seo-discoverability)', () => {
  it('declares exactly one canonical link equal to the host root (REQ-280)', () => {
    const canonicals = tags('link').filter((attributes) => attributes.rel === 'canonical');

    expect(canonicals.map((attributes) => attributes.href)).toEqual([CANONICAL]);
  });

  it('has a single description of 70 to 160 characters (REQ-280)', () => {
    const description = meta('description');

    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('agrees between Open Graph, Twitter card and the canonical URL (REQ-280)', () => {
    expect(meta('og:type')).toBe('website');
    expect(meta('og:site_name')).toBe('NainPolicy');
    expect(meta('og:title')).toBeTruthy();
    expect(meta('og:description')).toBeTruthy();
    expect(meta('og:url')).toBe(CANONICAL);
    expect(meta('og:image')).toMatch(/^https:\/\//);

    expect(meta('twitter:card')).toBe('summary_large_image');
    expect(meta('twitter:title')).toBeTruthy();
    expect(meta('twitter:description')).toBeTruthy();
    expect(meta('twitter:image')).toBe(meta('og:image'));
  });

  it('links its author (REQ-280)', () => {
    const authors = tags('link').filter((attributes) => attributes.rel === 'author');

    expect(authors.map((attributes) => attributes.href)).toEqual(['https://www.naindev.com/']);
  });

  it('embeds SoftwareApplication JSON-LD that names the author by id (REQ-280)', () => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    expect(blocks).toHaveLength(1);

    const data = JSON.parse(blocks[0][1]);

    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.name).toBe('NainPolicy');
    expect(data.url).toBe(CANONICAL);
    expect(data.operatingSystem).toBe('Web');
    expect(data.isAccessibleForFree).toBe(true);
    expect(data.description).toBe(meta('description'));
    expect(data.author['@id']).toBe(AUTHOR_ID);
    expect(data.sameAs).toContain(REPOSITORY);
  });

  it('ships a robots.txt that allows the site and advertises the sitemap (REQ-281)', () => {
    const robots = publicFile('robots.txt');

    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).not.toMatch(/^Disallow: \/$/m);
    expect(robots).toMatch(new RegExp(`^Sitemap: ${CANONICAL}sitemap\\.xml$`, 'm'));
  });

  it('ships a sitemap that lists the canonical URL (REQ-281)', () => {
    const locations = [...publicFile('sitemap.xml').matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);

    expect(locations).toEqual([CANONICAL]);
  });

  it('ships an llms.txt that starts with an H1 and links the repository and the main site (REQ-281)', () => {
    const llms = publicFile('llms.txt');

    expect(llms).toMatch(/^# NainPolicy\r?\n/);
    expect(llms).toContain(REPOSITORY);
    expect(llms).toContain('https://www.naindev.com/');
  });
});
