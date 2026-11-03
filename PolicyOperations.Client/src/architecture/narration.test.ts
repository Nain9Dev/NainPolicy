import { describe, expect, it } from 'vitest';
import type { PublicDemoStepResponse } from '../types/contracts';
import { buildTimeline, IDLE_FRAME, type NodeId } from './blueprintTimeline';
import { describeSource, IDLE_NARRATION, LAYER_GUIDE, MAX_BODY_CHARS, MAX_TITLE_CHARS, narrate } from './narration';

const policyPath = '/api/v1/policies/9f1c7a52-0000-4000-8000-000000000001';

function step(overrides: Partial<PublicDemoStepResponse>): PublicDemoStepResponse {
  return {
    operation: 'create_draft',
    method: 'POST',
    path: '/api/v1/policies',
    status: 201,
    result: 'succeeded',
    resourceStatus: 'Draft',
    etag: '"AAAAAAAAAAE="',
    errorCode: null,
    durationMs: 10,
    ...overrides,
  };
}

const canonicalRun: PublicDemoStepResponse[] = [
  step({}),
  step({ operation: 'activate_policy', path: `${policyPath}/activate`, status: 200, resourceStatus: 'Active', etag: '"AAAAAAAAAAI="', durationMs: 18 }),
  step({ operation: 'reject_stale_update', path: `${policyPath}/cancel`, status: 412, result: 'rejected_as_expected', resourceStatus: 'Active', etag: '"AAAAAAAAAAE="', errorCode: 'concurrency_conflict', durationMs: 11 }),
  step({ operation: 'cancel_policy', path: `${policyPath}/cancel`, status: 200, resourceStatus: 'Cancelled', etag: '"AAAAAAAAAAM="', durationMs: 16 }),
  step({ operation: 'read_audit_trail', method: 'GET', path: `${policyPath}/transitions`, status: 200, resourceStatus: null, etag: null, durationMs: 8 }),
];

const NODE_IDS: NodeId[] = ['client', 'api', 'application', 'domain', 'infrastructure', 'sql'];

describe('narrate (spec 006)', () => {
  const frames = buildTimeline(canonicalRun);

  it('states the step position, a plain-language title, one explanation and the evidence line (REQ-151)', () => {
    const third = narrate(frames[2], frames.length);

    expect(third.eyebrow).toContain('Step 3 of 5');
    expect(third.title).toBe('A stale write is blocked');
    expect(third.body).toMatch(/412/);
    expect(third.body).not.toMatch(/rowversion predicate|UnitOfWork/);
    expect(third.evidence).toEqual({
      method: 'POST',
      path: `${policyPath}/cancel`,
      status: 412,
      durationMs: 11,
      etag: '"AAAAAAAAAAE="',
    });
  });

  it('gives each of the five known operations its own title and explanation (REQ-151)', () => {
    const titles = frames.map((f) => narrate(f, frames.length).title);

    expect(new Set(titles).size).toBe(5);
    expect(titles).toEqual([
      'A new policy is created',
      'The draft becomes active',
      'A stale write is blocked',
      'The policy is cancelled',
      'The history is read back',
    ]);
  });

  it('marks the rejected step as such in the eyebrow and the others as accepted', () => {
    const eyebrows = frames.map((f) => narrate(f, frames.length).eyebrow);

    expect(eyebrows[2]).toMatch(/rejected/i);
    for (const i of [0, 1, 3, 4]) expect(eyebrows[i]).toMatch(/accepted/i);
  });

  it('falls back to the label and the HTTP outcome for an unknown operation, never empty (REQ-152)', () => {
    const [frame] = buildTimeline([step({ operation: 'renew_policy', path: `${policyPath}/renew`, status: 200, resourceStatus: 'Active' })]);
    const text = narrate(frame, 1);

    expect(text.title).toBe('Renew policy');
    expect(text.body).toContain('200');
    expect(text.body.length).toBeGreaterThan(20);
    expect(text.eyebrow).toContain('Step 1 of 1');
  });

  it('explains a rejected unknown operation from its status code (REQ-152)', () => {
    const [frame] = buildTimeline([step({ operation: 'renew_policy', status: 409, result: 'rejected_as_expected', errorCode: 'state_conflict' })]);
    const text = narrate(frame, 1);

    expect(text.body).toMatch(/409/);
    expect(text.body).toMatch(/refus|reject/i);
  });

  it('keeps every title and explanation short enough for a phone panel (REQ-159)', () => {
    const samples = [
      ...frames.map((f) => narrate(f, frames.length)),
      narrate(buildTimeline([step({ operation: 'some_very_long_operation_name_from_a_future_version', status: 503, result: 'rejected_as_expected' })])[0], 1),
      IDLE_NARRATION,
    ];

    for (const text of samples) {
      expect(text.title.length).toBeLessThanOrEqual(MAX_TITLE_CHARS);
      expect(text.body.length).toBeLessThanOrEqual(MAX_BODY_CHARS);
      expect(text.title.trim()).not.toBe('');
      expect(text.body.trim()).not.toBe('');
    }
  });

  it('narrates the idle frame with the five things a run does and the synthetic, no sign-up boundary (REQ-150)', () => {
    expect(narrate(IDLE_FRAME, 0)).toEqual(IDLE_NARRATION);
    expect(IDLE_NARRATION.body).toMatch(/creat/i);
    expect(IDLE_NARRATION.body).toMatch(/activat/i);
    expect(IDLE_NARRATION.body).toMatch(/stale|outdated/i);
    expect(IDLE_NARRATION.body).toMatch(/cancel/i);
    expect(IDLE_NARRATION.body).toMatch(/histor/i);
    expect(IDLE_NARRATION.body).toMatch(/synthetic/i);
    expect(IDLE_NARRATION.body).toMatch(/no sign-up/i);
  });
});

describe('LAYER_GUIDE (REQ-155)', () => {
  it('describes every node with a name, a one-line role and at least two responsibilities', () => {
    for (const id of NODE_IDS) {
      const guide = LAYER_GUIDE[id];
      expect(guide, id).toBeDefined();
      expect(guide.name.trim()).not.toBe('');
      expect(guide.role.length).toBeGreaterThan(20);
      expect(guide.role.length).toBeLessThanOrEqual(MAX_BODY_CHARS);
      expect(guide.responsibilities.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('has no guide for an id that is not a node', () => {
    expect((LAYER_GUIDE as Record<string, unknown>)['cache']).toBeUndefined();
  });
});

describe('describeSource (REQ-161)', () => {
  it('names a live result after SQL Server and a simulated one after the browser', () => {
    expect(describeSource('live').label).toBe('Live · SQL Server');
    expect(describeSource('simulated').label).toBe('Simulated · in-browser');
  });

  it('never calls a simulated result live, verified or real', () => {
    const text = describeSource('simulated');
    expect(`${text.label} ${text.title}`).not.toMatch(/\blive\b|verified|real/i);
  });
});
