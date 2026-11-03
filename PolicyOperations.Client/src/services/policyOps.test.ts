import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PolicyResponse } from '../types/contracts';

const policy: PolicyResponse = {
  id: '9f1c7a52-0000-4000-8000-000000000001',
  organizationId: '11111111-1111-1111-1111-111111111111',
  policyNumber: 'SYNTH-0001',
  insuredAmount: 1000,
  currency: 'EUR',
  insuredPartyReference: null,
  coverageStartDate: null,
  coverageEndDate: null,
  status: 'Draft',
  createdAtUtc: '2026-11-03T16:00:00Z',
  version: 'AAAAAAAAAAE=',
};

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

async function loadApi() {
  vi.resetModules();
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
  return await import('./api');
}

describe('policy operations (spec 008)', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('answers from the in-browser engine without contacting the API when there is no token (REQ-190)', async () => {
    const { api } = await loadApi();

    const created = await api.createPolicy({ policyNumber: 'PRACTICE-1', insuredAmount: 500, currency: 'EUR' }, '');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(created.source).toBe('simulated');
    expect(created.policy.policyNumber).toBe('PRACTICE-1');
    expect(created.etag).toMatch(/^".+"$/);

    const activated = await api.activatePolicy(
      created.policy.id,
      { insuredPartyReference: 'X', coverageStartDate: '2026-01-01', coverageEndDate: '2026-12-31' },
      created.etag!,
      ''
    );
    expect(activated.source).toBe('simulated');
    expect(activated.policy.status).toBe('Active');

    const history = await api.listTransitions(created.policy.id, '');
    expect(history.source).toBe('simulated');
    expect(history.transitions).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a stale version in the in-browser engine with a 412 Problem Details (REQ-190, REQ-195)', async () => {
    const { api, ApiError } = await loadApi();
    const created = await api.createPolicy({ policyNumber: 'PRACTICE-2', insuredAmount: 500, currency: 'EUR' }, '');
    await api.activatePolicy(created.policy.id, { insuredPartyReference: 'X', coverageStartDate: '2026-01-01', coverageEndDate: '2026-12-31' }, created.etag!, '');

    await expect(api.cancelPolicy(created.policy.id, { reason: 'stale' }, created.etag!, '')).rejects.toMatchObject({
      status: 412,
      problem: { code: 'concurrency_conflict' },
    });
    await expect(api.cancelPolicy(created.policy.id, { reason: 'stale' }, created.etag!, '')).rejects.toBeInstanceOf(ApiError);
  });

  it('returns the API body and ETag labelled live on a 2xx with a token (REQ-191)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(policy, 201, { ETag: '"AAAAAAAAAAE="' }));
    const { api } = await loadApi();

    const created = await api.createPolicy({ policyNumber: 'SYNTH-0001', insuredAmount: 1000, currency: 'EUR' }, 'token-1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(created.source).toBe('live');
    expect(created.policy).toEqual(policy);
    expect(created.etag).toBe('"AAAAAAAAAAE="');
  });

  it('surfaces a non-2xx answer from the API as an error with its Problem Details and never falls back (REQ-192)', async () => {
    const problem = { status: 412, title: 'Precondition Failed', code: 'concurrency_conflict', detail: 'stale' };
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(problem), { status: 412, headers: { 'Content-Type': 'application/problem+json' } }));
    const { api, ApiError } = await loadApi();

    const attempt = api.cancelPolicy(policy.id, { reason: 'x' }, '"AAAAAAAAAAE="', 'token-1');

    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({ status: 412, problem: { code: 'concurrency_conflict' } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('answers from the in-browser engine labelled simulated when the network fails with a token (REQ-193)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { api } = await loadApi();

    const created = await api.createPolicy({ policyNumber: 'OFFLINE-1', insuredAmount: 500, currency: 'EUR' }, 'token-1');

    expect(created.source).toBe('simulated');
    expect(created.policy.policyNumber).toBe('OFFLINE-1');
  });

  it('labels a live transition list by its origin (REQ-196)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));
    const { api } = await loadApi();

    const history = await api.listTransitions(policy.id, 'token-1');

    expect(history.source).toBe('live');
    expect(history.transitions).toEqual([]);
  });
});
