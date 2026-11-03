import type { BlueprintFrame, NodeId } from './blueprintTimeline';

/**
 * Plain-language narration for the blueprint (spec 006). Pure: a frame in, text out. The copy is
 * derived from the API step so a live run narrates what the server did, not a script.
 */

export const MAX_TITLE_CHARS = 48;
export const MAX_BODY_CHARS = 240;

export interface Evidence {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  etag: string | null;
}

export interface Narration {
  eyebrow: string;
  title: string;
  body: string;
  evidence: Evidence | null;
}

export interface LayerGuide {
  name: string;
  /** Short line drawn under the node title inside the blueprint. */
  tagline: string;
  /** One or two plain sentences shown in the narrator when the layer is selected. */
  role: string;
  responsibilities: string[];
}

export const IDLE_NARRATION: Narration = Object.freeze({
  eyebrow: 'What you will see',
  title: 'One policy, start to finish',
  body:
    'Press run and five real requests cross the system: a policy is created, activated, protected from a stale overwrite, cancelled, and its history is read back. Synthetic data, no sign-up.',
  evidence: null,
});

const KNOWN: Record<string, { title: string; body: string }> = {
  create_draft: {
    title: 'A new policy is created',
    body: "The browser asks for a new policy. The API scopes it to the caller's organization, the domain creates it as a Draft and SQL Server stores it with a version stamp, returned as an ETag.",
  },
  activate_policy: {
    title: 'The draft becomes active',
    body: 'The request carries the current version. The domain checks the activation rules, the policy becomes Active, and the policy row and its audit row are saved in one transaction.',
  },
  reject_stale_update: {
    title: 'A stale write is blocked',
    body: 'A second request arrives with an outdated version. The concurrency guard compares it with the stored version and refuses it with 412. Nothing is changed and nothing is logged.',
  },
  cancel_policy: {
    title: 'The policy is cancelled',
    body: 'With the fresh version the cancellation passes the guard. The policy moves to Cancelled, a final state, and the audit ledger gains its second row in the same transaction.',
  },
  read_audit_trail: {
    title: 'The history is read back',
    body: 'The browser reads the transition ledger. Both state changes come back in order, each with its actor, time and reason, exactly as SQL Server stored them.',
  },
};

function clamp(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function fallbackBody(frame: BlueprintFrame): string {
  const answered = `The server answered ${frame.status} to ${frame.method} in ${frame.durationMs} ms.`;
  if (frame.tone === 'rejected') {
    const why = frame.errorCode ? ` (${frame.errorCode.replace(/_/g, ' ')})` : '';
    return `${answered} The request was refused${why}; nothing changed.`;
  }
  const state = frame.domainState === 'None' ? '' : ` The policy is now ${frame.domainState}.`;
  return `${answered} The request was accepted.${state}`;
}

export function narrate(frame: BlueprintFrame, total: number): Narration {
  if (frame.index === 0) return IDLE_NARRATION;

  const outcome = frame.tone === 'rejected' ? 'Rejected as expected' : 'Accepted';
  const known = KNOWN[frame.operation];

  return {
    eyebrow: `Step ${frame.index} of ${total} · ${outcome}`,
    title: clamp(known?.title ?? frame.label, MAX_TITLE_CHARS),
    body: clamp(known?.body ?? fallbackBody(frame), MAX_BODY_CHARS),
    evidence: {
      method: frame.method,
      path: frame.path,
      status: frame.status,
      durationMs: frame.durationMs,
      etag: frame.etag,
    },
  };
}

export const LAYER_GUIDE: Readonly<Record<NodeId, LayerGuide>> = Object.freeze({
  client: {
    name: 'Browser',
    tagline: 'sends requests, shows results',
    role: 'Your browser sends plain HTTPS requests and shows what comes back. In this demo it sends no personal data and no token: the server uses a fixed synthetic organization.',
    responsibilities: ['One click, one POST to the public demo endpoint', 'Draws the response; computes nothing', 'Labels every run Live or Simulated'],
  },
  api: {
    name: 'API',
    tagline: 'the front door',
    role: 'The front door. It validates the caller, derives organization and role from the token, checks the version header and turns every error into a safe, documented response.',
    responsibilities: ['JWT validation, roles and organization scope', 'ETag out, If-Match in', 'Problem Details, 429 rate limit, 503 with Retry-After'],
  },
  application: {
    name: 'Application',
    tagline: 'runs each use case',
    role: 'Runs each use case: create, activate, cancel, read. It owns the concurrency guard and saves the policy and its audit row in one unit of work. It knows no database details.',
    responsibilities: ['One service per use case, no framework', 'Concurrency guard: If-Match must equal the stored version', 'Policy and audit row saved together'],
  },
  domain: {
    name: 'Domain',
    tagline: 'the rules of a policy',
    role: 'The rules of a policy: which states exist, which transitions are allowed and what a valid amount is. Pure code with no web, database or framework reference.',
    responsibilities: ['Draft, Active and Cancelled; Cancelled is final', 'Activation needs an insured party and coverage dates', 'Every transition produces an audit entry'],
  },
  infrastructure: {
    name: 'Infrastructure',
    tagline: 'talks to the database',
    role: 'Talks to SQL Server through EF Core. It maps the version stamp, retries transient failures while the free database wakes up and owns the migrations.',
    responsibilities: ['EF Core 10 mappings and migrations', 'rowversion as the optimistic concurrency token', 'Transient retry, 60 s command timeout'],
  },
  sql: {
    name: 'SQL Server',
    tagline: 'stores policies and history',
    role: 'Stores the Policies table and the append-only PolicyTransitions ledger. It runs on the Azure free offer, so it may be asleep when you arrive and wake on the first request.',
    responsibilities: ['Policies: status, amount, version stamp', 'PolicyTransitions: append-only audit ledger', 'Constraints enforce the rules even outside the API'],
  },
});
