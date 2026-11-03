import { beforeEach, describe, expect, it } from 'vitest';
import type { ScenarioRun } from '../types/contracts';
import { forgetSession, lastPolicy, lastRun, rememberPolicy, rememberRun } from './session';

const run: ScenarioRun = {
  source: 'live',
  elapsedMs: 900,
  response: {
    runId: 'RUN1',
    executedAtUtc: '2026-11-03T16:00:00Z',
    dataRetentionHours: 24,
    totalDurationMs: 60,
    cleanupCompleted: true,
    steps: [],
    policy: {
      id: '9f1c7a52-0000-4000-8000-000000000001',
      organizationId: '33333333-3333-3333-3333-333333333333',
      policyNumber: 'SYNTH-1',
      insuredAmount: 1,
      currency: 'EUR',
      insuredPartyReference: null,
      coverageStartDate: null,
      coverageEndDate: null,
      status: 'Cancelled',
      createdAtUtc: '2026-11-03T16:00:00Z',
      version: 'AAAAAAAAAAM=',
    },
    transitions: [],
  },
};

describe('page session (REQ-197)', () => {
  beforeEach(forgetSession);

  it('starts empty', () => {
    expect(lastPolicy.value).toBeNull();
    expect(lastRun.value).toBeNull();
  });

  it('remembers the last policy driven by hand, latest wins, as a copy', () => {
    const first = { id: 'a', policyNumber: 'P-1', status: 'Draft' as const, source: 'simulated' as const };
    rememberPolicy(first);
    rememberPolicy({ id: 'b', policyNumber: 'P-2', status: 'Active', source: 'live' });
    first.policyNumber = 'mutated';

    expect(lastPolicy.value).toEqual({ id: 'b', policyNumber: 'P-2', status: 'Active', source: 'live' });
  });

  it('remembers the last scenario run with its origin', () => {
    rememberRun(run);

    expect(lastRun.value?.source).toBe('live');
    expect(lastRun.value?.response.policy.id).toBe(run.response.policy.id);
  });

  it('forgets everything on demand', () => {
    rememberPolicy({ id: 'a', policyNumber: 'P-1', status: 'Draft', source: 'simulated' });
    rememberRun(run);
    forgetSession();

    expect(lastPolicy.value).toBeNull();
    expect(lastRun.value).toBeNull();
  });
});
