import { describe, expect, it } from 'vitest';
import { formatAmount, formatDay } from './humanValues';

const plain = (text: string) => text.replace(/\u00a0/g, ' ');

describe('formatAmount (spec 013)', () => {
  it('writes a money amount the way a reader of each locale expects', () => {
    expect(plain(formatAmount(150000, 'EUR', 'es'))).toBe('150.000,00 €');
    expect(plain(formatAmount(150000, 'EUR', 'en'))).toBe('€150,000.00');
    expect(plain(formatAmount(1234.5, 'USD', 'en'))).toBe('US$1,234.50');
  });

  it('keeps an unknown currency code visible instead of failing', () => {
    expect(plain(formatAmount(10, 'XYZ', 'es'))).toMatch(/10,00\s*XYZ/);
  });
});

describe('formatDay (spec 013)', () => {
  it('writes a calendar date without a time, in the locale', () => {
    expect(formatDay('2026-11-03', 'es')).toBe('3 nov 2026');
    expect(formatDay('2026-11-03', 'en')).toBe('3 Nov 2026');
  });

  it('leaves an unparsable value as it came', () => {
    expect(formatDay('not-a-date', 'es')).toBe('not-a-date');
  });
});
