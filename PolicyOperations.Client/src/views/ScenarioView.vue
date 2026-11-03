<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import ArchitectureBlueprint, { type BlueprintPhase } from '../components/ArchitectureBlueprint.vue';
import EngageBand from '../components/EngageBand.vue';
import HeroBand from '../components/HeroBand.vue';
import SourceChip from '../components/SourceChip.vue';
import ValueCards from '../components/ValueCards.vue';
import { layoutFor, type BlueprintLayout } from '../architecture/blueprintLayout';
import { buildTimeline, IDLE_FRAME, replayDelayMs, type BlueprintFrame, type NodeId } from '../architecture/blueprintTimeline';
import { idleNarration, layerGuide, narrate } from '../architecture/narration';
import { runSummary } from '../architecture/runSummary';
import type { TabId } from '../architecture/tabRoute';
import { format } from '../i18n/messages';
import { useLocale } from '../i18n/locale';
import { nextStep, previousStep, walkthroughDelayMs } from '../architecture/walkthrough';
import { api, ApiError, type WarmState } from '../services/api';
import type { ScenarioRun } from '../types/contracts';

const emit = defineEmits<{ (e: 'navigate', tab: TabId): void }>();
const { locale, t } = useLocale();

const phase = ref<BlueprintPhase>('idle');
const copied = ref(false);
const sheetEl = ref<HTMLElement | null>(null);
let copiedTimer: number | null = null;
const run = ref<ScenarioRun | null>(null);
const frames = ref<BlueprintFrame[]>([]);
const currentIndex = ref(0);
const errorMessage = ref<string | null>(null);
const elapsedMs = ref(0);
const showJson = ref(false);
const selectedNode = ref<NodeId | null>(null);
const walking = ref(false);

const warmState = ref<WarmState | null>(api.getWarmState());
const stopWarmListener = api.onWarmState((state) => (warmState.value = state));

const reducedMotion = ref(false);
const layout = ref<BlueprintLayout>(layoutFor(typeof window === 'undefined' ? undefined : window.innerWidth));
let motionQuery: MediaQueryList | null = null;
let elapsedTimer: number | null = null;
let replayTimers: number[] = [];
let walkTimers: number[] = [];

/** The fixed public scenario (docs/public-demo.md); shown dimmed before the first run. */
const PLANNED_OPERATIONS = ['create_draft', 'activate_policy', 'reject_stale_update', 'cancel_policy', 'read_audit_trail'];
const plannedSteps = computed(() => PLANNED_OPERATIONS.map((op) => t.value.blueprint.stepLabels[op] ?? op));

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.value = motionQuery.matches;
  motionQuery.addEventListener('change', onMotionChange);
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKey);
});

onBeforeUnmount(() => {
  stopWarmListener();
  motionQuery?.removeEventListener('change', onMotionChange);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('keydown', onKey);
  stopElapsed();
  clearReplay();
  clearWalk();
});

function onMotionChange(e: MediaQueryListEvent) {
  reducedMotion.value = e.matches;
}

function onResize() {
  layout.value = layoutFor(window.innerWidth);
}

function onKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;

  if (event.key === 'Escape' && selectedNode.value) {
    selectedNode.value = null;
    return;
  }
  if (!frames.value.length || phase.value === 'replaying') return;
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    goNext();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    goPrevious();
  }
}

function startElapsed() {
  const started = performance.now();
  elapsedMs.value = 0;
  elapsedTimer = window.setInterval(() => {
    elapsedMs.value = Math.round(performance.now() - started);
  }, 100);
}

function stopElapsed() {
  if (elapsedTimer !== null) {
    window.clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

function clearReplay() {
  for (const t of replayTimers) window.clearTimeout(t);
  replayTimers = [];
}

function clearWalk() {
  for (const t of walkTimers) window.clearTimeout(t);
  walkTimers = [];
  walking.value = false;
}

const currentFrame = computed<BlueprintFrame>(() =>
  currentIndex.value > 0 && frames.value[currentIndex.value - 1]
    ? frames.value[currentIndex.value - 1]
    : IDLE_FRAME
);

const visitedNodes = computed<NodeId[]>(() => {
  const set = new Set<NodeId>();
  for (let i = 0; i < currentIndex.value - 1 && i < frames.value.length; i++) {
    for (const n of frames.value[i].litNodes) set.add(n);
  }
  return [...set];
});

const narration = computed(() => (frames.value.length ? narrate(currentFrame.value, frames.value.length, locale.value) : idleNarration(locale.value)));
const selectedGuide = computed(() => (selectedNode.value ? layerGuide(locale.value)[selectedNode.value] : null));
const elapsedLabel = computed(() => `${(elapsedMs.value / 1000).toFixed(1)} s`);
const total = computed(() => frames.value.length);
const atLast = computed(() => currentIndex.value >= total.value);
const busy = computed(() => phase.value === 'waiting' || phase.value === 'replaying');

async function handleRun() {
  if (busy.value) return;

  clearReplay();
  clearWalk();
  selectedNode.value = null;
  errorMessage.value = null;
  run.value = null;
  frames.value = [];
  currentIndex.value = 0;
  showJson.value = false;
  phase.value = 'waiting';
  startElapsed();

  try {
    const result = await api.runScenario();
    stopElapsed();
    elapsedMs.value = result.elapsedMs;
    run.value = result;
    frames.value = buildTimeline(result.response.steps);
    replay();
  } catch (err: unknown) {
    stopElapsed();
    phase.value = 'error';
    if (err instanceof ApiError) {
      errorMessage.value = err.status === 429 ? '429 · rate limit, retry in 60 s' : `${err.status} · ${err.problem?.code ?? err.message}`;
    } else {
      errorMessage.value = err instanceof Error ? err.message : String(err);
    }
  }
}

/** Fast trace (spec 005): the whole run is drawn within about a second. */
function replay() {
  phase.value = 'replaying';
  frames.value.forEach((_, i) => {
    replayTimers.push(
      window.setTimeout(() => {
        currentIndex.value = i + 1;
        if (i === frames.value.length - 1) {
          phase.value = 'done';
          if (!reducedMotion.value) startWalkthrough(1);
        }
      }, replayDelayMs(i, reducedMotion.value))
    );
  });
}

/** Guided walkthrough (spec 006): one step at reading pace, pausable. */
function startWalkthrough(from: number) {
  clearWalk();
  if (!total.value) return;
  walking.value = true;
  for (let step = from; step <= total.value; step++) {
    walkTimers.push(
      window.setTimeout(() => {
        currentIndex.value = step;
        if (step === total.value) walking.value = false;
      }, walkthroughDelayMs(step - from))
    );
  }
}

function toggleWalkthrough() {
  if (walking.value) {
    clearWalk();
    return;
  }
  const from = atLast.value ? 1 : Math.max(currentIndex.value, 1);
  startWalkthrough(from);
}

function showStep(index: number) {
  if (phase.value === 'replaying') return;
  clearWalk();
  selectedNode.value = null;
  currentIndex.value = index;
}

function goNext() {
  showStep(nextStep(currentIndex.value, total.value));
}

function goPrevious() {
  showStep(previousStep(currentIndex.value));
}

function selectNode(id: NodeId) {
  clearWalk();
  selectedNode.value = selectedNode.value === id ? null : id;
}

function shortPath(path: string) {
  return path.replace(/\/api\/v1/, '').replace(/[0-9a-f-]{36}/, '{id}');
}

function shortEtag(etag: string | null) {
  if (!etag) return '—';
  const raw = etag.replace(/"/g, '');
  return raw.length > 8 ? `…${raw.slice(-8)}` : raw;
}

const runLabel = computed(() => {
  const b = t.value.blueprint;
  if (phase.value === 'waiting') return b.running;
  if (phase.value === 'replaying') return b.tracing;
  return run.value ? b.runAgain : b.run;
});

const walkLabel = computed(() => {
  const b = t.value.blueprint;
  if (walking.value) return b.pause;
  return atLast.value ? b.replay : b.play;
});

function stepLabel(frame: BlueprintFrame) {
  return t.value.blueprint.stepLabels[frame.operation] ?? frame.label;
}

/** The hero's primary action: bring the sheet into view, then run. */
function runFromHero() {
  sheetEl.value?.scrollIntoView({ behavior: reducedMotion.value ? 'auto' : 'smooth', block: 'start' });
  void handleRun();
}

async function copyEvidence() {
  if (!run.value) return;
  const text = runSummary(run.value, frames.value, locale.value, window.location.href);
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    if (copiedTimer !== null) window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => (copied.value = false), 2000);
  } catch {
    // Clipboard blocked (insecure context or permission): the JSON panel remains available.
    showJson.value = true;
  }
}
</script>

<template>
  <section class="stage" aria-label="Live architecture blueprint">
    <HeroBand @run="runFromHero" />

    <!-- Sheet with the start overlay -->
    <div ref="sheetEl" :class="['glass-panel', 'sheet', { 'has-overlay': !run && phase !== 'waiting' }]">
      <ArchitectureBlueprint
        :frame="currentFrame"
        :visited-nodes="visitedNodes"
        :phase="phase"
        :reduced-motion="reducedMotion"
        :layout="layout"
        :selected-node="selectedNode"
        @select-node="selectNode"
      />

      <div v-if="!run && phase !== 'waiting'" class="overlay">
        <button type="button" class="btn btn-primary start-btn" @click="handleRun">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="6 3 20 12 6 21 6 3"></polygon>
          </svg>
          <span>{{ t.blueprint.overlayCta }}</span>
        </button>
        <span class="overlay-meta font-mono">{{ t.blueprint.overlayMeta }}</span>
        <span v-if="errorMessage" class="error font-mono" role="alert">{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Narrator band -->
    <div class="glass-panel narrator">
      <div class="narration" aria-live="polite">
        <template v-if="selectedGuide">
          <span class="eyebrow eyebrow-layer">{{ format(t.blueprint.layer, { name: selectedGuide.name }) }}</span>
          <h2 class="narr-title">{{ selectedGuide.name }}</h2>
          <p class="narr-body">{{ selectedGuide.role }}</p>
        </template>
        <template v-else>
          <span :class="['eyebrow', { 'eyebrow-rejected': currentFrame.tone === 'rejected' }]">{{ narration.eyebrow }}</span>
          <h2 class="narr-title">{{ narration.title }}</h2>
          <p class="narr-body">{{ narration.body }}</p>
        </template>
      </div>

      <div class="evidence">
        <template v-if="selectedGuide">
          <span class="evidence-head">{{ t.blueprint.responsibilities }}</span>
          <ul class="duties">
            <li v-for="duty in selectedGuide.responsibilities" :key="duty">{{ duty }}</li>
          </ul>
          <button type="button" class="btn btn-secondary small" @click="selectedNode = null">{{ t.blueprint.backToRun }}</button>
        </template>
        <template v-else-if="narration.evidence">
          <span class="evidence-head">{{ t.blueprint.measured }}</span>
          <dl class="facts">
            <div class="fact fact-wide">
              <dt>{{ t.blueprint.request }}</dt>
              <dd class="font-mono">{{ narration.evidence.method }} {{ shortPath(narration.evidence.path) }}</dd>
            </div>
            <div class="fact">
              <dt>{{ t.blueprint.status }}</dt>
              <dd><span :class="['status-pill', currentFrame.tone === 'rejected' ? 'is-rejected' : 'is-ok']">{{ narration.evidence.status }}</span></dd>
            </div>
            <div class="fact">
              <dt>{{ t.blueprint.serverTime }}</dt>
              <dd class="font-mono">{{ narration.evidence.durationMs }} ms</dd>
            </div>
            <div class="fact">
              <dt>{{ t.blueprint.version }}</dt>
              <dd class="font-mono">{{ shortEtag(narration.evidence.etag) }}</dd>
            </div>
          </dl>
        </template>
        <template v-else>
          <span class="evidence-head">{{ t.blueprint.howToReadTitle }}</span>
          <ul class="duties">
            <li v-for="hint in t.blueprint.howToRead" :key="hint">{{ hint }}</li>
          </ul>
        </template>
      </div>

      <div class="controls">
        <div v-if="frames.length" class="stepper" role="group" aria-label="Walkthrough">
          <button type="button" class="btn btn-secondary step-btn" :disabled="busy || currentIndex <= 1" :aria-label="t.blueprint.prev" @click="goPrevious">‹</button>
          <ol class="dots" aria-hidden="true">
            <li v-for="frame in frames" :key="frame.index" :class="{ on: frame.index <= currentIndex, current: frame.index === currentIndex, rejected: frame.tone === 'rejected' }"></li>
          </ol>
          <button type="button" class="btn btn-secondary step-btn" :disabled="busy || atLast" :aria-label="t.blueprint.next" @click="goNext">›</button>
          <button type="button" class="btn btn-secondary walk-btn" :disabled="busy" :aria-pressed="walking" @click="toggleWalkthrough">
            <svg v-if="walking" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3" /></svg>
            <span>{{ walkLabel }}</span>
          </button>
        </div>

        <div class="run-row">
          <button type="button" class="btn btn-primary run-btn" :disabled="busy" @click="handleRun">
            <span v-if="phase === 'waiting'" class="spinner" aria-hidden="true"></span>
            <span>{{ runLabel }}</span>
          </button>
          <span class="readout font-mono" aria-live="polite">
            <template v-if="phase === 'waiting'">{{ elapsedLabel }}</template>
            <template v-else-if="run">{{ format(t.blueprint.readoutDone, { server: run.response.totalDurationMs, wall: (elapsedMs / 1000).toFixed(1) }) }}</template>
            <template v-else>{{ t.blueprint.readoutIdle }}</template>
          </span>
        </div>

        <div class="chips">
          <span
            v-if="warmState === 'pending' || warmState === 'ready'"
            :class="['warm', `warm-${warmState}`]"
            role="status"
            aria-live="polite"
          >
            <span class="source-dot" aria-hidden="true"></span>
            {{ warmState === 'pending' ? t.blueprint.waking : t.blueprint.ready }}
          </span>
          <SourceChip v-if="run" :source="run.source" />
          <span v-if="run" class="run-id font-mono">{{ format(t.blueprint.runId, { id: run.response.runId }) }}</span>
          <span v-if="errorMessage && run" class="error font-mono" role="alert">{{ errorMessage }}</span>
          <button v-if="run && phase === 'done'" type="button" class="btn btn-secondary small" :aria-live="copied ? 'polite' : undefined" @click="copyEvidence">{{ copied ? t.blueprint.copied : t.blueprint.copy }}</button>
          <button v-if="run" type="button" class="btn btn-secondary small json-btn" :aria-expanded="showJson" @click="showJson = !showJson">{{ t.blueprint.json }}</button>
        </div>
      </div>
    </div>

    <!-- Step rail -->
    <ol :class="['rail', { planned: !frames.length }]" aria-label="Scenario steps">
      <template v-if="frames.length">
        <li
          v-for="frame in frames"
          :key="frame.index"
          :class="['rail-item', { reached: frame.index <= currentIndex, passed: frame.index < currentIndex, current: frame.index === currentIndex, rejected: frame.tone === 'rejected' }]"
        >
          <button
            type="button"
            class="rail-btn"
            :aria-current="frame.index === currentIndex ? 'step' : undefined"
            :disabled="phase === 'replaying'"
            @click="showStep(frame.index)"
          >
            <span class="rail-node font-mono">{{ frame.index }}</span>
            <span class="rail-text">
              <span class="rail-label">{{ stepLabel(frame) }}</span>
              <span class="rail-meta font-mono">{{ frame.status }} · {{ frame.durationMs }} ms</span>
            </span>
          </button>
        </li>
      </template>
      <template v-else>
        <li v-for="(label, i) in plannedSteps" :key="label" class="rail-item">
          <div class="rail-btn">
            <span class="rail-node font-mono">{{ i + 1 }}</span>
            <span class="rail-text">
              <span class="rail-label">{{ label }}</span>
              <span class="rail-meta font-mono">{{ i === 2 ? t.blueprint.expects412 : t.blueprint.planned }}</span>
            </span>
          </div>
        </li>
      </template>
    </ol>

    <!-- Legend -->
    <ul class="legend" aria-label="Legend">
      <li><span class="swatch swatch-path" aria-hidden="true"></span>{{ t.blueprint.legend.path }}</li>
      <li><span class="swatch swatch-reject" aria-hidden="true"></span>{{ t.blueprint.legend.reject }}</li>
      <li><span class="swatch swatch-idle" aria-hidden="true"></span>{{ t.blueprint.legend.idle }}</li>
      <li><span class="swatch swatch-select" aria-hidden="true"></span>{{ t.blueprint.legend.selected }}</li>
    </ul>

    <ValueCards @navigate="emit('navigate', $event)" />
    <EngageBand />

    <div v-if="run && showJson" class="glass-panel json-panel">
      <pre class="font-mono"><code>{{ JSON.stringify(run.response, null, 2) }}</code></pre>
    </div>
  </section>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Sheet */
.sheet {
  position: relative;
  padding: 0;
  overflow: hidden;
  line-height: 0;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  line-height: 1.4;
  background: radial-gradient(ellipse at center, rgba(6, 13, 26, 0.82) 0%, rgba(6, 13, 26, 0.55) 45%, rgba(6, 13, 26, 0.15) 100%);
  pointer-events: none;
}

.overlay > * {
  pointer-events: auto;
}

.start-btn {
  padding: 0.95rem 1.8rem;
  font-size: 1.1rem;
  gap: 0.7rem;
  box-shadow: 0 0 0 6px rgba(128, 255, 0, 0.12), 0 0 48px rgba(128, 255, 0, 0.25);
}

.start-btn:hover:not(:disabled),
.start-btn:focus-visible {
  box-shadow: var(--shadow-offset), 0 0 48px rgba(128, 255, 0, 0.3);
}

.overlay-meta {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.has-overlay :deep(.blueprint) {
  filter: saturate(0.85);
}

/* Narrator band */
.narrator {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(300px, 1fr) auto;
  gap: 1.25rem 2rem;
  padding: 1.1rem 1.4rem;
  align-items: start;
}

.narration {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.eyebrow-rejected {
  color: #ff5c6e;
}

.eyebrow-layer {
  color: var(--accent-cyan);
}

.narr-title {
  font-family: var(--font-heading);
  font-size: 1.55rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: #ffffff;
  margin: 0;
}

.narr-body {
  font-size: 0.98rem;
  line-height: 1.5;
  color: #cbd5e1;
  max-width: 60ch;
}

.evidence {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  padding-left: 1.5rem;
  border-left: 1px solid var(--border-subtle);
}

.evidence-head {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: var(--track-label);
  text-transform: uppercase;
  color: var(--text-dim);
}

.facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem 0.75rem;
}

.fact {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.fact-wide {
  grid-column: 1 / -1;
}

.fact dt {
  font-size: 0.7rem;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fact dd {
  font-size: 0.84rem;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-sm);
}

.status-pill.is-ok {
  background: var(--brand-green);
  color: var(--brand-black);
}

.status-pill.is-rejected {
  background: var(--brand-red);
  color: #ffffff;
}

.duties {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.84rem;
  color: #cbd5e1;
}

.duties li {
  position: relative;
  padding-left: 0.9rem;
}

.duties li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 5px;
  height: 5px;
  background: var(--brand-green);
}

.btn.small {
  padding: 0.35rem 0.7rem;
  font-size: 0.74rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  align-self: flex-start;
}

/* Controls */
.controls {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: flex-end;
  min-width: 240px;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.step-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  font-size: 1.2rem;
  line-height: 1;
}

.walk-btn {
  height: 34px;
  padding: 0 0.8rem;
  font-size: 0.78rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  gap: 0.45rem;
}

.walk-btn[aria-pressed='true'] {
  border-color: var(--brand-green);
  color: var(--brand-green);
}

.dots {
  list-style: none;
  display: flex;
  gap: 5px;
  padding: 0 0.3rem;
}

.dots li {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--grid-major);
  transition: background 0.2s ease, transform 0.2s ease;
}

.dots li.on {
  background: var(--brand-green);
}

.dots li.on.rejected {
  background: var(--brand-red);
}

.dots li.current {
  transform: scale(1.4);
  box-shadow: 0 0 8px currentColor;
}

.run-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.run-btn {
  padding: 0.65rem 1.3rem;
  font-size: 0.92rem;
}

.readout {
  font-size: 0.76rem;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.chips {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}


.source-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}




.warm {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.warm-pending .source-dot {
  background: #ffd27a;
  animation: warm-pulse 1.2s ease-in-out infinite;
}

.warm-ready {
  color: var(--brand-green);
}

@keyframes warm-pulse {
  50% { opacity: 0.25; }
}

.run-id {
  font-size: 0.72rem;
  color: var(--text-dim);
}

.error {
  font-size: 0.78rem;
  color: #ff5c6e;
}

/* Step rail */
.rail {
  list-style: none;
  display: flex;
  gap: 0;
  padding: 0.25rem 0;
}

.rail-item {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 0 0.35rem;
}

.rail-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 17px;
  left: calc(50% + 14px);
  width: calc(100% - 28px);
  height: 2px;
  background: var(--grid-major);
  transition: background 0.25s ease;
}

.rail-item.passed:not(:last-child)::after {
  background: var(--brand-green);
}

.rail-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  padding: 0;
  text-align: center;
  color: inherit;
  opacity: 0.5;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.rail-item.reached .rail-btn {
  opacity: 1;
}

.rail-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.rail-node {
  position: relative;
  z-index: 1;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--bg-surface);
  border: 2px solid var(--grid-major);
  color: var(--text-muted);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.rail-item.reached .rail-node {
  border-color: var(--brand-green);
  color: #ffffff;
}

.rail-item.current .rail-node {
  background: var(--brand-green);
  color: var(--brand-black);
  box-shadow: 0 0 18px rgba(128, 255, 0, 0.45);
}

.rail-item.rejected.reached .rail-node {
  border-color: var(--brand-red);
}

.rail-item.rejected.current .rail-node {
  background: var(--brand-red);
  color: #ffffff;
  box-shadow: 0 0 18px rgba(255, 0, 31, 0.45);
}

.rail-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  max-width: 100%;
}

.rail-label {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 0.92rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rail-meta {
  font-size: 0.68rem;
  color: var(--text-dim);
}

.rail-item.rejected.reached .rail-meta {
  color: #ff5c6e;
}

.rail.planned .rail-btn {
  opacity: 0.6;
  cursor: default;
}

/* Legend */
.legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.4rem;
  padding: 0 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: var(--text-dim);
}

.legend li {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.swatch {
  width: 26px;
  height: 0;
  border-top: 2px solid;
}

.swatch-path {
  border-color: var(--brand-green);
}

.swatch-reject {
  border-color: var(--brand-red);
}

.swatch-idle {
  border-top-style: dashed;
  border-color: var(--grid-major);
}

.swatch-select {
  border-color: var(--accent-cyan);
}

.json-panel {
  padding: 1rem;
  max-height: 420px;
  overflow: auto;
  background: #040810;
}

.json-panel pre {
  font-size: 0.78rem;
  color: #cbd5e1;
  line-height: 1.45;
}

@media (prefers-reduced-motion: reduce) {
  .warm-pending .source-dot {
    animation: none;
  }
}

@media (max-width: 1100px) {
  .narrator {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .controls {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-subtle);
    padding-top: 0.8rem;
  }

  .chips {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .narrator {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .evidence {
    padding-left: 0;
    border-left: none;
    padding-top: 0.9rem;
    border-top: 1px solid var(--border-subtle);
  }

  .narr-title {
    font-size: 1.3rem;
  }

  .controls {
    min-width: 0;
  }

  .start-btn {
    font-size: 1rem;
    padding: 0.8rem 1.4rem;
  }

  .overlay {
    justify-content: flex-start;
    padding: 42vw 1rem 0 1rem;
    background: rgba(6, 13, 26, 0.72);
  }

  .overlay-meta {
    font-size: 0.7rem;
    text-align: center;
    white-space: normal;
  }
}

@media (max-width: 560px) {
  .rail {
    flex-direction: column;
    gap: 0.25rem;
  }

  .rail-item {
    padding: 0;
  }

  .rail-item:not(:last-child)::after {
    top: 36px;
    left: 16px;
    width: 2px;
    height: calc(100% - 36px);
  }

  .rail-btn {
    flex-direction: row;
    align-items: center;
    gap: 0.8rem;
    text-align: left;
    padding: 0.2rem 0;
  }

  .rail-text {
    align-items: flex-start;
  }

  .run-row {
    width: 100%;
  }

  .run-btn {
    flex: 1;
  }

  .readout {
    white-space: normal;
  }
}
</style>
