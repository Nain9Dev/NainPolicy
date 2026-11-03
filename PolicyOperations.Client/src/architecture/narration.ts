import { format, MESSAGES, type LayerText, type Locale, type SourceText } from '../i18n/messages';
import type { ScenarioSource } from '../types/contracts';
import type { BlueprintFrame, NodeId } from './blueprintTimeline';

/**
 * Plain-language narration for the blueprint (spec 006). Pure: a frame in, text out. The copy is
 * derived from the API step so a live run narrates what the server did, not a script. The words
 * live in the message catalogue (spec 007) so the same frame narrates in either locale.
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

export type LayerGuide = LayerText;

function clamp(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function idleNarration(locale: Locale = 'en'): Narration {
  const idle = MESSAGES[locale].narration.idle;
  return { eyebrow: idle.eyebrow, title: idle.title, body: idle.body, evidence: null };
}

/** English idle copy; kept for callers that do not carry a locale. */
export const IDLE_NARRATION: Narration = Object.freeze(idleNarration('en'));

function fallbackBody(frame: BlueprintFrame, locale: Locale): string {
  const m = MESSAGES[locale].narration;
  const values = { status: frame.status, method: frame.method, ms: frame.durationMs };
  if (frame.tone === 'rejected') {
    const why = frame.errorCode ? ` (${frame.errorCode.replace(/_/g, ' ')})` : '';
    return format(m.fallbackRejected, { ...values, why });
  }
  const state = frame.domainState === 'None' ? '' : format(m.fallbackState, { state: frame.domainState });
  return `${format(m.fallbackAccepted, values)}${state}`;
}

export function narrate(frame: BlueprintFrame, total: number, locale: Locale = 'en'): Narration {
  if (frame.index === 0) return locale === 'en' ? IDLE_NARRATION : idleNarration(locale);

  const m = MESSAGES[locale];
  const outcome = frame.tone === 'rejected' ? m.blueprint.rejected : m.blueprint.accepted;
  const known = m.narration.steps[frame.operation];
  const label = m.blueprint.stepLabels[frame.operation] ?? frame.label;

  return {
    eyebrow: `${format(m.blueprint.stepOf, { n: frame.index, total })} · ${outcome}`,
    title: clamp(known?.title ?? label, MAX_TITLE_CHARS),
    body: clamp(known?.body ?? fallbackBody(frame, locale), MAX_BODY_CHARS),
    evidence: {
      method: frame.method,
      path: frame.path,
      status: frame.status,
      durationMs: frame.durationMs,
      etag: frame.etag,
    },
  };
}

export function layerGuide(locale: Locale = 'en'): Readonly<Record<NodeId, LayerGuide>> {
  return MESSAGES[locale].layers;
}

/** English layer guide; kept for callers that do not carry a locale. */
export const LAYER_GUIDE: Readonly<Record<NodeId, LayerGuide>> = layerGuide('en');

/** One wording for the origin of a result, shared by every view (ADR-007, REQ-161). */
export function describeSource(source: ScenarioSource, locale: Locale = 'en'): SourceText {
  return MESSAGES[locale].source[source];
}
