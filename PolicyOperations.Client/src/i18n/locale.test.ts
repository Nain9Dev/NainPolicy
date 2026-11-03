import { describe, expect, it } from 'vitest';
import { detectLocale, LOCALE_STORAGE_KEY } from './locale';

describe('detectLocale (REQ-174)', () => {
  it('honours a stored preference over the browser language', () => {
    expect(detectLocale('es', 'en-US')).toBe('es');
    expect(detectLocale('en', 'es-ES')).toBe('en');
  });

  it('picks Spanish for a Spanish browser when nothing is stored', () => {
    expect(detectLocale(null, 'es')).toBe('es');
    expect(detectLocale(null, 'es-ES')).toBe('es');
    expect(detectLocale(null, 'ES-MX')).toBe('es');
  });

  it('falls back to English for any other or unknown language', () => {
    expect(detectLocale(null, 'en-GB')).toBe('en');
    expect(detectLocale(null, 'fr-FR')).toBe('en');
    expect(detectLocale(null, undefined)).toBe('en');
    expect(detectLocale(null, '')).toBe('en');
  });

  it('ignores a stored value that is not a supported locale', () => {
    expect(detectLocale('de', 'es-ES')).toBe('es');
    expect(detectLocale('garbage', 'en')).toBe('en');
  });

  it('persists under a stable key', () => {
    expect(LOCALE_STORAGE_KEY).toBe('nainpolicy_locale');
  });
});
