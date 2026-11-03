import { describe, expect, it } from 'vitest';
import { replayDelayMs } from './blueprintTimeline';
import { MIN_READABLE_STEP_MS, nextStep, previousStep, WALK_STEP_MS, walkthroughDelayMs } from './walkthrough';

describe('walkthrough pacing (REQ-154)', () => {
  it('advances at a readable pace of at least 1.2 s per step', () => {
    expect(WALK_STEP_MS).toBeGreaterThanOrEqual(MIN_READABLE_STEP_MS);
    expect(MIN_READABLE_STEP_MS).toBe(1200);
  });

  it('shows the first step immediately and each later step one pace after the previous', () => {
    expect(walkthroughDelayMs(0)).toBe(0);
    for (let i = 1; i < 5; i++) {
      expect(walkthroughDelayMs(i) - walkthroughDelayMs(i - 1)).toBe(WALK_STEP_MS);
    }
  });

  it('is slower than the fast trace of spec 005, which stays unchanged', () => {
    expect(walkthroughDelayMs(4)).toBeGreaterThan(replayDelayMs(4, false));
    expect(replayDelayMs(4, false)).toBeLessThanOrEqual(800);
  });
});

describe('step navigation (REQ-153)', () => {
  it('moves forward one step and stops at the last', () => {
    expect(nextStep(1, 5)).toBe(2);
    expect(nextStep(4, 5)).toBe(5);
    expect(nextStep(5, 5)).toBe(5);
  });

  it('moves back one step and stops at the first', () => {
    expect(previousStep(5)).toBe(4);
    expect(previousStep(2)).toBe(1);
    expect(previousStep(1)).toBe(1);
  });

  it('enters the first step from the idle position', () => {
    expect(nextStep(0, 5)).toBe(1);
    expect(previousStep(0)).toBe(1);
  });

  it('never leaves the idle position when there are no steps', () => {
    expect(nextStep(0, 0)).toBe(0);
  });
});
