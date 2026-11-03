import { describe, expect, it } from 'vitest';
import { hashForTab, parseTabHash, TAB_IDS } from './tabRoute';

describe('tab routes (REQ-177)', () => {
  it('lists the five tabs in display order', () => {
    expect(TAB_IDS).toEqual(['scenario', 'workbench', 'concurrency', 'audit', 'resilience']);
  });

  it('maps each hash to its tab, case-insensitively', () => {
    expect(parseTabHash('#blueprint')).toBe('scenario');
    expect(parseTabHash('#lifecycle')).toBe('workbench');
    expect(parseTabHash('#concurrency')).toBe('concurrency');
    expect(parseTabHash('#Audit')).toBe('audit');
    expect(parseTabHash('#resilience')).toBe('resilience');
  });

  it('opens the blueprint for an empty or unknown hash', () => {
    expect(parseTabHash('')).toBe('scenario');
    expect(parseTabHash('#')).toBe('scenario');
    expect(parseTabHash('#pricing')).toBe('scenario');
  });

  it('round-trips every tab through its hash', () => {
    for (const tab of TAB_IDS) {
      expect(parseTabHash(hashForTab(tab))).toBe(tab);
      expect(hashForTab(tab)).toMatch(/^#[a-z]+$/);
    }
  });
});
