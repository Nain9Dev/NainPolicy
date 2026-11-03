import { describe, expect, it } from 'vitest';
import type { PublicDemoRunResponse, ScenarioRun } from '../types/contracts';
import { buildTimeline } from './blueprintTimeline';
import { runSummary } from './runSummary';

const policyId = '9f1c7a52-0000-4000-8000-000000000001';

const response: PublicDemoRunResponse = {
  runId: 'ABCD1234',
  executedAtUtc: '2026-11-03T16:00:00Z',
  dataRetentionHours: 24,
  totalDurationMs: 67,
  cleanupCompleted: true,
  steps: [
    { operation: 'create_draft', method: 'POST', path: '/api/v1/policies', status: 201, result: 'succeeded', resourceStatus: 'Draft', etag: '"AAAAAAAAAAE="', errorCode: null, durationMs: 14 },
    { operation: 'activate_policy', method: 'POST', path: `/api/v1/policies/${policyId}/activate`, status: 200, result: 'succeeded', resourceStatus: 'Active', etag: '"AAAAAAAAAAI="', errorCode: null, durationMs: 18 },
    { operation: 'reject_stale_update', method: 'POST', path: `/api/v1/policies/${policyId}/cancel`, status: 412, result: 'rejected_as_expected', resourceStatus: 'Active', etag: '"AAAAAAAAAAE="', errorCode: 'concurrency_conflict', durationMs: 11 },
    { operation: 'cancel_policy', method: 'POST', path: `/api/v1/policies/${policyId}/cancel`, status: 200, result: 'succeeded', resourceStatus: 'Cancelled', etag: '"AAAAAAAAAAM="', errorCode: null, durationMs: 16 },
    { operation: 'read_audit_trail', method: 'GET', path: `/api/v1/policies/${policyId}/transitions`, status: 200, result: 'succeeded', resourceStatus: null, etag: null, errorCode: null, durationMs: 8 },
  ],
  policy: {
    id: policyId,
    organizationId: '33333333-3333-3333-3333-333333333333',
    policyNumber: 'SYNTH-POL-2026-1234',
    insuredAmount: 150000,
    currency: 'EUR',
    insuredPartyReference: 'SYNTH',
    coverageStartDate: '2026-11-03',
    coverageEndDate: '2027-11-03',
    status: 'Cancelled',
    createdAtUtc: '2026-11-03T16:00:00Z',
    version: 'AAAAAAAAAAM=',
  },
  transitions: [],
};

const live: ScenarioRun = { source: 'live', response, elapsedMs: 980 };

describe('runSummary (REQ-178)', () => {
  const frames = buildTimeline(response.steps);

  it('states the run id, origin, server time and page address', () => {
    const text = runSummary(live, frames, 'en', 'https://policy.naindev.com/#blueprint');

    expect(text).toContain('ABCD1234');
    expect(text).toContain('Live · SQL Server');
    expect(text).toContain('67 ms');
    expect(text).toContain('https://policy.naindev.com/#blueprint');
  });

  it('lists one line per step with method, short path, status and duration, in order', () => {
    const lines = runSummary(live, frames, 'en', 'https://policy.naindev.com/').split('\n');
    const stepLines = lines.filter((l) => /^\s*\d\./.test(l));

    expect(stepLines).toHaveLength(5);
    expect(stepLines[0]).toMatch(/1\. .*POST \/policies .*201.*14 ms/);
    expect(stepLines[2]).toMatch(/3\. .*POST \/policies\/\{id\}\/cancel .*412.*11 ms/);
    expect(stepLines[4]).toMatch(/5\. .*GET \/policies\/\{id\}\/transitions .*200.*8 ms/);
    expect(lines.join('\n')).not.toContain(policyId);
  });

  it('ends with the final state and the ledger size', () => {
    const text = runSummary(live, frames, 'en', 'https://policy.naindev.com/');

    expect(text).toMatch(/Cancelled/);
    expect(text).toMatch(/2 audit rows/);
  });

  it('labels a simulated run honestly and says so in Spanish too', () => {
    const simulated: ScenarioRun = { ...live, source: 'simulated' };

    expect(runSummary(simulated, frames, 'en', 'x')).toContain('Simulated · in-browser');
    expect(runSummary(simulated, frames, 'es', 'x')).toContain('Simulada · en el navegador');
    expect(runSummary(live, frames, 'es', 'x')).toMatch(/2 filas de auditoría/);
  });
});
