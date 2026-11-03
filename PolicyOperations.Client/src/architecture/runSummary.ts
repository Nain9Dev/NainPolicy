import { format, MESSAGES, type Locale } from '../i18n/messages';
import type { ScenarioRun } from '../types/contracts';
import type { BlueprintFrame } from './blueprintTimeline';
import { describeSource } from './narration';

/** Plain-text summary of a finished run, meant for the clipboard (spec 007, REQ-178). */
export function runSummary(run: ScenarioRun, frames: ReadonlyArray<BlueprintFrame>, locale: Locale, pageUrl: string): string {
  const m = MESSAGES[locale];
  const last = frames[frames.length - 1];
  const lines = [
    `${format(m.summary.headline, { id: run.response.runId })} · ${describeSource(run.source, locale).label} · ${format(m.summary.server, { ms: run.response.totalDurationMs })}`,
    ...frames.map((f) => `${f.index}. ${f.method} ${shortPath(f.path)} → ${f.status} · ${f.durationMs} ms`),
  ];
  if (last) {
    lines.push(format(m.summary.final, { state: last.domainState, rows: last.ledgerRows }));
  }
  lines.push(`${m.summary.synthetic} · ${pageUrl}`);
  return lines.join('\n');
}

function shortPath(path: string): string {
  return path.replace(/\/api\/v1/, '').replace(/[0-9a-f-]{36}/, '{id}');
}
