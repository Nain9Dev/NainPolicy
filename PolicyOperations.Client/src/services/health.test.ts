import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadApi() {
  vi.resetModules();
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
  return await import('./api');
}

describe('api.probeHealth (spec 011)', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('reports healthy on a 2xx with the measured round trip (REQ-230)', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"status":"Healthy"}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const { api } = await loadApi();

    const result = await api.probeHealth('/health/ready');

    expect(result.outcome).toBe('healthy');
    expect(result.statusCode).toBe(200);
    expect(result.retryAfterSeconds).toBeNull();
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/health/ready', expect.objectContaining({ method: 'GET' }));
  });

  it('reports waking on a 503 and reads Retry-After (REQ-231)', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"status":"Unhealthy"}', { status: 503, headers: { 'Retry-After': '60' } }));
    const { api } = await loadApi();

    const result = await api.probeHealth('/health/ready');

    expect(result.outcome).toBe('waking');
    expect(result.statusCode).toBe(503);
    expect(result.retryAfterSeconds).toBe(60);
  });

  it('reports unhealthy on any other non-2xx answer (REQ-231)', async () => {
    fetchMock.mockResolvedValueOnce(new Response('boom', { status: 500 }));
    const { api } = await loadApi();

    const result = await api.probeHealth('/health');

    expect(result.outcome).toBe('unhealthy');
    expect(result.statusCode).toBe(500);
  });

  it('reports unreachable when the network fails and never invents a healthy answer (REQ-232)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { api } = await loadApi();

    const result = await api.probeHealth('/health');

    expect(result.outcome).toBe('unreachable');
    expect(result.statusCode).toBe(0);
    expect(result.details).toBeUndefined();
  });
});
