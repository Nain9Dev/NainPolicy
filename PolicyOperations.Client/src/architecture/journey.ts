import type { TabId } from './tabRoute';

/**
 * The visitor's path through the tabs (spec 010): see how it works, try it, see two at once,
 * read the history, see a controlled failure. Each tab knows the one that follows.
 */
export const JOURNEY: readonly TabId[] = ['scenario', 'workbench', 'concurrency', 'audit', 'resilience'];

/** The tab after `tab` on the journey, or `null` at the end. */
export function nextTab(tab: TabId): TabId | null {
  const index = JOURNEY.indexOf(tab);
  return index >= 0 && index < JOURNEY.length - 1 ? JOURNEY[index + 1] : null;
}

/** 1-based position of `tab` on the journey. */
export function journeyPosition(tab: TabId): number {
  return JOURNEY.indexOf(tab) + 1;
}
