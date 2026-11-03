import { describe, expect, it } from 'vitest';
import { JOURNEY, journeyPosition, nextTab } from './journey';
import { TAB_IDS } from './tabRoute';

describe('journey (spec 010)', () => {
  it('visits every tab exactly once, in display order', () => {
    expect([...JOURNEY]).toEqual(TAB_IDS);
  });

  it('points each tab at the next one and ends after the last', () => {
    expect(nextTab('scenario')).toBe('workbench');
    expect(nextTab('workbench')).toBe('concurrency');
    expect(nextTab('concurrency')).toBe('audit');
    expect(nextTab('audit')).toBe('resilience');
    expect(nextTab('resilience')).toBeNull();
  });

  it('numbers the steps from one', () => {
    expect(journeyPosition('scenario')).toBe(1);
    expect(journeyPosition('resilience')).toBe(5);
  });
});
