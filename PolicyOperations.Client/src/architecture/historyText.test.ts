import { describe, expect, it } from 'vitest';
import type { PolicyTransitionResponse } from '../types/contracts';
import { historySummary, transitionSentence } from './historyText';

const activation: PolicyTransitionResponse = {
  id: 'f02af124-f585-434a-92eb-e0e4922b0eb0',
  policyId: '9f1c7a52-0000-4000-8000-000000000001',
  fromStatus: 'Draft',
  toStatus: 'Active',
  occurredAtUtc: '2026-11-03T16:09:19.955Z',
  actorSubject: 'public-demo',
  reason: 'Public demo activation',
  correlationId: '0HN6KP6NF4:00000001',
};

const cancellation: PolicyTransitionResponse = {
  ...activation,
  id: '6defb84c-45ee-4fca-a21a-9d027b3e1637',
  fromStatus: 'Active',
  toStatus: 'Cancelled',
  occurredAtUtc: '2026-11-03T16:09:20.005Z',
  reason: null,
  correlationId: '0HN6KP6NF4:00000002',
};

describe('transitionSentence (spec 012)', () => {
  it('says who did what and when, in plain English, with the reason when there is one', () => {
    const text = transitionSentence(activation, 'en', 'UTC');

    expect(text).toContain('public-demo');
    expect(text).toMatch(/activated/i);
    expect(text).toContain('3 Nov 2026');
    expect(text).toContain('16:09');
    expect(text).toContain('Public demo activation');
  });

  it('says it in Spanish with the state names a reader knows', () => {
    const text = transitionSentence(cancellation, 'es', 'UTC');

    expect(text).toMatch(/cancel/i);
    expect(text).toContain('public-demo');
    expect(text).toContain('3 nov 2026');
    expect(text).not.toMatch(/motivo/i);
  });

  it('never prints the raw status words of the API', () => {
    for (const locale of ['en', 'es'] as const) {
      expect(transitionSentence(activation, locale, 'UTC')).not.toMatch(/\bDraft\b|\bActive\b/);
    }
  });
});

describe('historySummary (spec 012)', () => {
  it('lists one numbered sentence per transition with the policy and the origin', () => {
    const text = historySummary([activation, cancellation], 'SYNTH-0001', 'live', 'en', 'UTC');
    const lines = text.split('\n');

    expect(lines[0]).toContain('SYNTH-0001');
    expect(lines[0]).toContain('Live · SQL Server');
    expect(lines.filter((l) => /^\d\. /.test(l))).toHaveLength(2);
    expect(text).toContain('0HN6KP6NF4:00000001');
  });

  it('says so when there is nothing recorded', () => {
    expect(historySummary([], 'SYNTH-0001', 'simulated', 'es', 'UTC')).toMatch(/sin transiciones|no hay transiciones/i);
  });
});
