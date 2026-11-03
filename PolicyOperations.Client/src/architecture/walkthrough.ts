/**
 * Guided walkthrough pacing and step navigation (spec 006). The fast trace that follows a run is
 * `replayDelayMs` in `blueprintTimeline.ts` and is unchanged; the walkthrough is the second,
 * pausable phase that shows one step at reading pace.
 */

/** Slowest pace a visitor should have to wait for; the walkthrough is never faster. */
export const MIN_READABLE_STEP_MS = 1200;

/** Pause between walkthrough steps. */
export const WALK_STEP_MS = 1800;

/** Milliseconds after the walkthrough starts at which step `index` (0-based) becomes current. */
export function walkthroughDelayMs(index: number): number {
  return index * WALK_STEP_MS;
}

/** Next 1-based step, clamped to `total`; from idle (0) it enters step 1. */
export function nextStep(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(current + 1, total);
}

/** Previous 1-based step, never below 1; from idle (0) it enters step 1. */
export function previousStep(current: number): number {
  return Math.max(current - 1, 1);
}
