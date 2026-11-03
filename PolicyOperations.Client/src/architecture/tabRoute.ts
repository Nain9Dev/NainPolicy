/**
 * Tabs addressable by URL hash (spec 007, REQ-177), so the portfolio can link straight to a proof.
 */

export type TabId = 'scenario' | 'workbench' | 'concurrency' | 'audit' | 'resilience';

export const TAB_IDS: TabId[] = ['scenario', 'workbench', 'concurrency', 'audit', 'resilience'];

const HASHES: Record<TabId, string> = {
  scenario: 'blueprint',
  workbench: 'lifecycle',
  concurrency: 'concurrency',
  audit: 'audit',
  resilience: 'resilience',
};

export function hashForTab(tab: TabId): string {
  return `#${HASHES[tab]}`;
}

export function parseTabHash(hash: string): TabId {
  const wanted = hash.replace(/^#/, '').toLowerCase();
  const found = TAB_IDS.find((tab) => HASHES[tab] === wanted);
  return found ?? 'scenario';
}
