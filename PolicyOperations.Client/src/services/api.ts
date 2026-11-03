import type {
  ActivatePolicyRequest,
  CancelPolicyRequest,
  CreatePolicyRequest,
  HealthCheckResult,
  PolicyResponse,
  PolicyTransitionResponse,
  ProblemDetails,
  PublicDemoRunResponse,
  ScenarioRun,
  ScenarioSource,
} from '../types/contracts';
import { mockPolicyEngine } from './mockPolicyEngine';
import { emitScenarioTelemetry } from './telemetry';

/**
 * Empty in development so the Vite proxy serves `/api` and `/health`.
 * The production build reads `.env.production` and targets the public API host.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export const API_BASE_URL = BASE_URL;

/** Scalar OpenAPI explorer of the API this client talks to. */
export const DOCS_URL = BASE_URL ? `${BASE_URL}/docs` : 'http://localhost:8110/docs';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem?: ProblemDetails,
    message?: string
  ) {
    super(message || problem?.title || `API error ${status}`);
    this.name = 'ApiError';
  }
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Longest the demo request may take before the in-browser result is shown (spec 005). */
const RUN_TIMEOUT_MS = 2_000;
/** Longest a run waits for a wake-up that is still pending before it stops trying live (spec 005). */
const WARM_GRACE_MS = 800;
/** The free-tier database can need up to two minutes to resume (spec 004). */
const WARM_UP_TIMEOUT_MS = 120_000;

export interface PolicyResult {
  policy: PolicyResponse;
  etag: string | null;
  source: ScenarioSource;
}

export interface TransitionsResult {
  transitions: PolicyTransitionResponse[];
  source: ScenarioSource;
}

function authHeaders(token: string, json = false): Record<string, string> {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token.trim()}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

function quoted(etag: string): string {
  return etag.startsWith('"') ? etag : `"${etag}"`;
}

async function readPolicy(res: Response): Promise<{ policy: PolicyResponse; etag: string | null }> {
  return { policy: (await res.json()) as PolicyResponse, etag: res.headers.get('ETag') };
}

async function problemOf(res: Response): Promise<ApiError> {
  let problem: ProblemDetails | undefined;
  try {
    problem = (await res.json()) as ProblemDetails;
  } catch {
    // No body or not JSON: the status alone is the answer.
  }
  return new ApiError(res.status, problem);
}

/**
 * Origin rules of an authorized policy operation (spec 008):
 * - no token: the in-browser engine answers, labelled `simulated`, and the API is not contacted;
 * - token and a 2xx: the API's answer, labelled `live`;
 * - token and any other status: the API's refusal is thrown as `ApiError`; never a fallback;
 * - token and a network failure: the in-browser engine answers, labelled `simulated`.
 */
async function operate<T>(token: string, send: () => Promise<Response>, read: (res: Response) => Promise<T>, offline: () => T): Promise<T & { source: ScenarioSource }> {
  if (!token.trim()) return { ...offline(), source: 'simulated' };

  let res: Response;
  try {
    res = await send();
  } catch {
    return { ...offline(), source: 'simulated' };
  }
  if (!res.ok) throw await problemOf(res);
  return { ...(await read(res)), source: 'live' };
}

export type WarmState = 'pending' | 'ready' | 'unavailable';

let warmState: WarmState | null = null;
let warmPromise: Promise<'ready' | 'unavailable'> | null = null;
const warmListeners = new Set<(state: WarmState) => void>();

function setWarmState(state: WarmState) {
  warmState = state;
  warmListeners.forEach((listener) => listener(state));
}

/** `fetch` that aborts after `timeoutMs`; the timer is cleared as soon as the call settles. */
async function fetchWithin(timeoutMs: number, input: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  /**
   * Wakes the free-tier database as soon as the client loads. Sent once per page load; it never
   * substitutes a simulated health result, so `ready` always means the API answered 200.
   */
  warmUp(): Promise<'ready' | 'unavailable'> {
    if (!warmPromise) {
      setWarmState('pending');
      warmPromise = fetchWithin(WARM_UP_TIMEOUT_MS, `${BASE_URL}/health/ready`, { cache: 'no-store' })
        .then((res) => (res.ok ? ('ready' as const) : ('unavailable' as const)))
        .catch(() => 'unavailable' as const)
        .then((result) => {
          setWarmState(result);
          return result;
        });
    }
    return warmPromise;
  },

  getWarmState(): WarmState | null {
    return warmState;
  },

  /** Subscribes to warm-up changes; returns the unsubscribe function. */
  onWarmState(listener: (state: WarmState) => void): () => void {
    warmListeners.add(listener);
    return () => warmListeners.delete(listener);
  },

  /**
   * Runs the fixed five-step scenario against the configured API and says where the result came
   * from. When the API is unreachable or answers with an error, the in-browser engine produces the
   * same shape and the run is labelled `simulated`.
   */
  async runScenario(): Promise<ScenarioRun> {
    const started = now();
    try {
      // A run is itself intent: start the wake-up if no earlier signal did. While it is still
      // pending the database is asleep, so the demo request would only hang; give it a short
      // grace and otherwise answer from the browser without spending free quota.
      const warm = api.warmUp();
      if (api.getWarmState() === 'pending') {
        const settled = await Promise.race([
          warm,
          new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), WARM_GRACE_MS)),
        ]);
        if (settled === 'timeout') throw new Error('database still waking');
      }

      const res = await fetchWithin(RUN_TIMEOUT_MS, `${BASE_URL}/api/v1/demo/run`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const response = (await res.json()) as PublicDemoRunResponse;
        emitScenarioTelemetry(response.steps, 'live');
        return { source: 'live', response, elapsedMs: Math.round(now() - started) };
      }
    } catch {
      // Backend unreachable or slower than RUN_TIMEOUT_MS: fall through to the in-browser engine.
    }

    const response = await mockPolicyEngine.runPublicDemo();
    emitScenarioTelemetry(response.steps, 'simulated');
    return { source: 'simulated', response, elapsedMs: Math.round(now() - started) };
  },

  /**
   * Health probe (spec 011). The answer is what the API said, or that it could not be reached:
   * 2xx is healthy, 503 is the free database waking (with its Retry-After), any other status is
   * unhealthy, and a network failure is unreachable. There is no in-browser fallback here.
   */
  async probeHealth(endpoint: '/health' | '/health/ready'): Promise<HealthCheckResult> {
    const start = now();
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${endpoint}`, { method: 'GET', cache: 'no-store' });
    } catch {
      return {
        outcome: 'unreachable',
        statusCode: 0,
        totalDurationMs: Math.round(now() - start),
        retryAfterSeconds: null,
        timestamp: new Date().toISOString(),
      };
    }

    const totalDurationMs = Math.round(now() - start);
    let details: Record<string, unknown> | undefined;
    try {
      details = (await res.json()) as Record<string, unknown>;
    } catch {
      // Empty or non-JSON body: the status line is the answer.
    }
    const retryAfter = Number.parseInt(res.headers.get('Retry-After') ?? '', 10);

    return {
      outcome: res.ok ? 'healthy' : res.status === 503 ? 'waking' : 'unhealthy',
      statusCode: res.status,
      totalDurationMs,
      retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : null,
      timestamp: new Date().toISOString(),
      details,
    };
  },

  /** Reads one policy; see `operate` for the origin rules (spec 008). */
  getPolicy(policyId: string, token: string): Promise<PolicyResult> {
    return operate(
      token,
      () => fetch(`${BASE_URL}/api/v1/policies/${policyId}`, { method: 'GET', headers: authHeaders(token) }),
      readPolicy,
      () => mockPolicyEngine.getPolicy(policyId)
    );
  },

  /** Reads the transition ledger of one policy. */
  listTransitions(policyId: string, token: string): Promise<TransitionsResult> {
    return operate(
      token,
      () => fetch(`${BASE_URL}/api/v1/policies/${policyId}/transitions`, { method: 'GET', headers: authHeaders(token) }),
      async (res) => ({ transitions: (await res.json()) as PolicyTransitionResponse[] }),
      () => ({ transitions: mockPolicyEngine.listTransitions(policyId) })
    );
  },

  /** Creates a Draft policy. */
  createPolicy(req: CreatePolicyRequest, token: string): Promise<PolicyResult> {
    return operate(
      token,
      () => fetch(`${BASE_URL}/api/v1/policies`, { method: 'POST', headers: authHeaders(token, true), body: JSON.stringify(req) }),
      readPolicy,
      () => mockPolicyEngine.createPolicy(req)
    );
  },

  /** Activates a Draft; `If-Match` must carry the version the caller read. */
  activatePolicy(policyId: string, req: ActivatePolicyRequest, ifMatch: string, token: string): Promise<PolicyResult> {
    return operate(
      token,
      () =>
        fetch(`${BASE_URL}/api/v1/policies/${policyId}/activate`, {
          method: 'POST',
          headers: { ...authHeaders(token, true), 'If-Match': quoted(ifMatch) },
          body: JSON.stringify(req),
        }),
      readPolicy,
      () => mockPolicyEngine.activatePolicy(policyId, req, ifMatch)
    );
  },

  /** Cancels a Draft or Active policy; `If-Match` must carry the version the caller read. */
  cancelPolicy(policyId: string, req: CancelPolicyRequest, ifMatch: string, token: string): Promise<PolicyResult> {
    return operate(
      token,
      () =>
        fetch(`${BASE_URL}/api/v1/policies/${policyId}/cancel`, {
          method: 'POST',
          headers: { ...authHeaders(token, true), 'If-Match': quoted(ifMatch) },
          body: JSON.stringify(req),
        }),
      readPolicy,
      () => mockPolicyEngine.cancelPolicy(policyId, req, ifMatch)
    );
  },
};
