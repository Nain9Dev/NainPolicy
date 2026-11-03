import { ref } from 'vue';
import type { PolicyStatus, ScenarioRun, ScenarioSource } from '../types/contracts';

/**
 * What the visitor did in this page session, shared across tabs (spec 008, REQ-197). Nothing is
 * persisted: a reload starts clean. The Audit tab reads from here before it asks anything.
 */

export interface RememberedPolicy {
  id: string;
  policyNumber: string;
  status: PolicyStatus;
  source: ScenarioSource;
}

export const lastPolicy = ref<RememberedPolicy | null>(null);
export const lastRun = ref<ScenarioRun | null>(null);

/** The policy the visitor last drove by hand; the latest call wins. */
export function rememberPolicy(policy: RememberedPolicy): void {
  lastPolicy.value = { ...policy };
}

/** The last scenario run; its ledger is shown without a new request. */
export function rememberRun(run: ScenarioRun): void {
  lastRun.value = run;
}

export function forgetSession(): void {
  lastPolicy.value = null;
  lastRun.value = null;
}
