import { format, MESSAGES, type Locale } from '../i18n/messages';
import type { PolicyStatus, PolicyTransitionResponse, ScenarioSource } from '../types/contracts';
import { describeSource } from './narration';

/**
 * Plain-language text for the audit ledger (spec 012). Pure: a transition in, a sentence out. The
 * state names come from the catalogue, never the raw API words.
 */

function stateName(status: PolicyStatus, locale: Locale): string {
  const states = MESSAGES[locale].lifecycle.states;
  return status === 'Draft' ? states.draft : status === 'Active' ? states.active : states.cancelled;
}

function verbFor(to: PolicyStatus, locale: Locale): string {
  const verbs = MESSAGES[locale].history.verbs;
  return to === 'Active' ? verbs.activated : to === 'Cancelled' ? verbs.cancelled : verbs.changed;
}

/** `3 Nov 2026, 16:09` in the given locale and time zone (the visitor's by default). */
export function formatMoment(iso: string, locale: Locale, timeZone?: string): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone }).format(date);
  const time = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(date);
  return `${day.replace(/\.$/, '').replace(/ de /g, ' ')}, ${time}`;
}

/** One sentence: when, who, what changed, and why when a reason was given. */
export function transitionSentence(tr: PolicyTransitionResponse, locale: Locale, timeZone?: string): string {
  const m = MESSAGES[locale].history;
  const sentence = format(m.sentence, {
    when: formatMoment(tr.occurredAtUtc, locale, timeZone),
    actor: tr.actorSubject,
    verb: verbFor(tr.toStatus, locale),
    from: stateName(tr.fromStatus, locale).toLowerCase(),
    to: stateName(tr.toStatus, locale).toLowerCase(),
  });
  return tr.reason ? `${sentence} ${format(m.reason, { reason: tr.reason })}` : sentence;
}

/** Plain-text summary of a ledger for the clipboard. */
export function historySummary(
  transitions: ReadonlyArray<PolicyTransitionResponse>,
  policyLabel: string,
  source: ScenarioSource,
  locale: Locale,
  timeZone?: string
): string {
  const m = MESSAGES[locale].history;
  const head = `${format(m.summaryHead, { policy: policyLabel })} · ${describeSource(source, locale).label}`;
  if (transitions.length === 0) return `${head}\n${m.none}`;
  const lines = transitions.map((tr, i) => `${i + 1}. ${transitionSentence(tr, locale, timeZone)} [${tr.correlationId}]`);
  return [head, ...lines].join('\n');
}
