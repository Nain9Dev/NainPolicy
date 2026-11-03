import { describe, expect, it } from 'vitest';
import { MAX_BODY_CHARS, MAX_TITLE_CHARS } from '../architecture/narration';
import { format, LOCALES, MESSAGES } from './messages';

type Tree = Record<string, unknown>;

function leafPaths(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      return value.flatMap((item, i) => (item && typeof item === 'object' ? leafPaths(item as Tree, `${path}[${i}]`) : [`${path}[${i}]`]));
    }
    if (value && typeof value === 'object') return leafPaths(value as Tree, path);
    return [path];
  });
}

function leaves(tree: Tree): string[] {
  return Object.values(tree).flatMap((value): string[] => {
    if (Array.isArray(value)) return value.flatMap((item) => (item && typeof item === 'object' ? leaves(item as Tree) : [String(item)]));
    if (value && typeof value === 'object') return leaves(value as Tree);
    return [String(value)];
  });
}

describe('message catalogue (REQ-176)', () => {
  it('offers Spanish and English', () => {
    expect(LOCALES).toEqual(['en', 'es']);
  });

  it('defines exactly the same keys in both locales', () => {
    const en = leafPaths(MESSAGES.en as unknown as Tree).sort();
    const es = leafPaths(MESSAGES.es as unknown as Tree).sort();
    expect(es).toEqual(en);
  });

  it('leaves no string empty in either locale', () => {
    for (const locale of LOCALES) {
      for (const text of leaves(MESSAGES[locale] as unknown as Tree)) {
        expect(text.trim(), locale).not.toBe('');
      }
    }
  });

  it('keeps the hero headline short enough to read at a glance (REQ-170)', () => {
    for (const locale of LOCALES) {
      expect(MESSAGES[locale].hero.title.length, locale).toBeLessThanOrEqual(60);
      expect(MESSAGES[locale].hero.proofs).toHaveLength(4);
    }
  });

  it('keeps every step narration and layer guide inside the spec 006 bounds in both locales', () => {
    for (const locale of LOCALES) {
      const m = MESSAGES[locale];
      for (const step of Object.values(m.narration.steps)) {
        expect(step.title.length, `${locale} ${step.title}`).toBeLessThanOrEqual(MAX_TITLE_CHARS);
        expect(step.body.length, `${locale} ${step.title}`).toBeLessThanOrEqual(MAX_BODY_CHARS);
      }
      expect(m.narration.idle.title.length).toBeLessThanOrEqual(MAX_TITLE_CHARS);
      expect(m.narration.idle.body.length).toBeLessThanOrEqual(MAX_BODY_CHARS);
      for (const guide of Object.values(m.layers)) {
        expect(guide.role.length, `${locale} ${guide.name}`).toBeLessThanOrEqual(MAX_BODY_CHARS);
        expect(guide.responsibilities.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('never calls a simulated result live, verified or real (REQ-161)', () => {
    for (const locale of LOCALES) {
      const s = MESSAGES[locale].source.simulated;
      expect(`${s.label} ${s.title}`).not.toMatch(/\b(live|en vivo|verified|verificado|real)\b/i);
    }
  });

  it('states only verifiable proof in the hero: no counts, no customers (REQ-171)', () => {
    for (const locale of LOCALES) {
      for (const proof of MESSAGES[locale].hero.proofs) {
        expect(proof, `${locale} ${proof}`).not.toMatch(/\d+\s*(%|clientes|customers|x\b)/i);
        expect(proof).not.toMatch(/cliente|customer|testimon/i);
      }
    }
  });

  it('fills placeholders and leaves unknown ones visible', () => {
    expect(format('Step {n} of {total}', { n: 2, total: 5 })).toBe('Step 2 of 5');
    expect(format('Paso {n}', {})).toBe('Paso {n}');
  });
});
