<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useLocale } from '../i18n/locale';
import { format } from '../i18n/messages';

/**
 * The concurrency race as a track (spec 007, REQ-181): two operators, one stored version, one
 * guard. It paints the phase the lab is in; the ETags come from the real run.
 */
export type RacePhase = 'idle' | 'read' | 'alpha_committed' | 'beta_rejected' | 'completed';

const props = defineProps<{
  phase: RacePhase;
  initialEtag: string;
  newEtag: string;
  reducedMotion: boolean;
  stacked: boolean;
}>();

const { t } = useLocale();

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Geometry {
  width: number;
  height: number;
  alpha: Box;
  beta: Box;
  guard: Box;
  db: Box;
  paths: { alphaToGuard: string; guardToDb: string; betaToGuard: string; betaBack: string };
  labels: { alpha: { x: number; y: number }; beta: { x: number; y: number }; untouched: { x: number; y: number } };
  guardBurst: { x: number; y: number };
  footer: { y: number };
}

/* Wide: operators left, guard centre, database right. Stacked: operators on top, flow downwards. */
const WIDE: Geometry = {
  width: 1000,
  height: 340,
  alpha: { x: 24, y: 48, w: 190, h: 88 },
  beta: { x: 24, y: 208, w: 190, h: 88 },
  guard: { x: 400, y: 52, w: 210, h: 240 },
  db: { x: 770, y: 112, w: 206, h: 120 },
  paths: {
    alphaToGuard: 'M214 92 L400 92',
    guardToDb: 'M610 172 L770 172',
    betaToGuard: 'M214 252 L400 252',
    betaBack: 'M400 274 L214 274',
  },
  labels: { alpha: { x: 307, y: 80 }, beta: { x: 307, y: 240 }, untouched: { x: 873, y: 258 } },
  guardBurst: { x: 594, y: 152 },
  footer: { y: 326 },
};

const STACKED: Geometry = {
  width: 400,
  height: 640,
  alpha: { x: 20, y: 24, w: 172, h: 92 },
  beta: { x: 208, y: 24, w: 172, h: 92 },
  guard: { x: 20, y: 196, w: 360, h: 176 },
  db: { x: 20, y: 452, w: 360, h: 120 },
  paths: {
    alphaToGuard: 'M106 116 L106 196',
    guardToDb: 'M200 372 L200 452',
    betaToGuard: 'M276 116 L276 196',
    betaBack: 'M322 196 L322 116',
  },
  labels: { alpha: { x: 106, y: 162 }, beta: { x: 300, y: 162 }, untouched: { x: 200, y: 598 } },
  guardBurst: { x: 362, y: 196 },
  footer: { y: 626 },
};

const G = computed<Geometry>(() => (props.stacked ? STACKED : WIDE));

const HOP_MS = 420;

const alphaRef = ref<SVGAnimateMotionElement | null>(null);
const dbRef = ref<SVGAnimateMotionElement | null>(null);
const betaRef = ref<SVGAnimateMotionElement | null>(null);
const travelling = ref<'alpha' | 'db' | 'beta' | null>(null);
let timers: number[] = [];

function clear() {
  for (const id of timers) window.clearTimeout(id);
  timers = [];
  travelling.value = null;
}

function play(sequence: Array<{ who: 'alpha' | 'db' | 'beta'; anim: SVGAnimateMotionElement | null }>) {
  clear();
  if (props.reducedMotion) return;
  sequence.forEach((hop, i) => {
    timers.push(
      window.setTimeout(() => {
        travelling.value = hop.who;
        hop.anim?.beginElement();
      }, i * HOP_MS)
    );
  });
  timers.push(window.setTimeout(() => (travelling.value = null), sequence.length * HOP_MS + 60));
}

watch(
  () => props.phase,
  (phase) => {
    if (phase === 'alpha_committed') play([{ who: 'alpha', anim: alphaRef.value }, { who: 'db', anim: dbRef.value }]);
    else if (phase === 'beta_rejected') play([{ who: 'beta', anim: betaRef.value }]);
    else if (phase === 'idle') clear();
  }
);

onBeforeUnmount(clear);

const after = (phase: RacePhase) => {
  const order: RacePhase[] = ['idle', 'read', 'alpha_committed', 'beta_rejected', 'completed'];
  return order.indexOf(props.phase) >= order.indexOf(phase);
};

const alphaDone = computed(() => after('alpha_committed'));
const betaDone = computed(() => after('beta_rejected'));
const hasRead = computed(() => after('read'));

function shortEtag(etag: string) {
  const raw = etag.replace(/"/g, '');
  return raw.length > 8 ? `…${raw.slice(-8)}` : raw;
}

const storedVersion = computed(() => (alphaDone.value ? props.newEtag : props.initialEtag));

const description = computed(() => t.value.race.phases[props.phase]);
</script>

<template>
  <svg :class="['race', { 'race-stacked': stacked }]" :viewBox="`0 0 ${G.width} ${G.height}`" role="img" aria-labelledby="race-title race-desc" preserveAspectRatio="xMidYMid meet">
    <title id="race-title">{{ t.views.concurrency.title }}</title>
    <desc id="race-desc">{{ description }}</desc>
    <defs>
      <marker id="race-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="arrow-head" />
      </marker>
      <filter id="race-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <pattern id="race-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f2243" stroke-width="1" />
      </pattern>
    </defs>

    <rect :width="G.width" :height="G.height" fill="#060d1a" />
    <rect :width="G.width" :height="G.height" fill="url(#race-grid)" opacity="0.7" />
    <rect x="8" y="8" :width="G.width - 16" :height="G.height - 16" fill="none" stroke="#1e3a8a" stroke-width="1.2" rx="3" />

    <!-- Edges -->
    <path :d="G.paths.alphaToGuard" :class="['edge', { lit: alphaDone, active: travelling === 'alpha' }]" marker-end="url(#race-arrow)" />
    <path :d="G.paths.guardToDb" :class="['edge', { lit: alphaDone, active: travelling === 'db' }]" marker-end="url(#race-arrow)" />
    <path :d="G.paths.betaToGuard" :class="['edge', 'edge-beta', { lit: betaDone, active: travelling === 'beta' }]" marker-end="url(#race-arrow)" />
    <path :d="G.paths.betaBack" :class="['edge', 'edge-back', { lit: betaDone }]" marker-end="url(#race-arrow)" />

    <!-- Packets -->
    <g :class="['packet', { on: travelling === 'alpha' }]"><circle r="11" class="halo ok" /><circle r="5" class="core" /><animateMotion ref="alphaRef" :path="G.paths.alphaToGuard" :dur="`${HOP_MS}ms`" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" /></g>
    <g :class="['packet', { on: travelling === 'db' }]"><circle r="11" class="halo ok" /><circle r="5" class="core" /><animateMotion ref="dbRef" :path="G.paths.guardToDb" :dur="`${HOP_MS}ms`" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" /></g>
    <g :class="['packet', { on: travelling === 'beta' }]"><circle r="11" class="halo bad" /><circle r="5" class="core" /><animateMotion ref="betaRef" :path="G.paths.betaToGuard" :dur="`${HOP_MS}ms`" begin="indefinite" fill="freeze" calcMode="spline" keySplines="0.3 0 0.2 1" /></g>

    <!-- Operator Alpha -->
    <g :class="['node', { lit: alphaDone, reading: hasRead && !alphaDone }]">
      <rect :x="G.alpha.x" :y="G.alpha.y" :width="G.alpha.w" :height="G.alpha.h" class="node-box" rx="4" />
      <text :x="G.alpha.x + 14" :y="G.alpha.y + 28" class="node-title">{{ t.race.alpha.name }}</text>
      <text :x="G.alpha.x + 14" :y="G.alpha.y + 46" class="node-plain">{{ t.race.alpha.role }}</text>
      <text :x="G.alpha.x + 14" :y="G.alpha.y + 70" class="node-mono">{{ hasRead ? format(t.race.holds, { etag: shortEtag(initialEtag) }) : '—' }}</text>
    </g>
    <text v-if="alphaDone" :x="G.labels.alpha.x" :y="G.labels.alpha.y" class="edge-label ok" text-anchor="middle">{{ t.race.track.saved }}</text>
    <text v-else-if="hasRead" :x="G.labels.alpha.x" :y="G.labels.alpha.y" class="edge-label dim" text-anchor="middle">{{ t.race.track.readsLabel }} {{ shortEtag(initialEtag) }}</text>

    <!-- Operator Beta -->
    <g :class="['node', 'node-beta', { lit: betaDone, reading: hasRead && !betaDone }]">
      <rect :x="G.beta.x" :y="G.beta.y" :width="G.beta.w" :height="G.beta.h" class="node-box" rx="4" />
      <text :x="G.beta.x + 14" :y="G.beta.y + 28" class="node-title">{{ t.race.beta.name }}</text>
      <text :x="G.beta.x + 14" :y="G.beta.y + 46" class="node-plain">{{ t.race.beta.role }}</text>
      <text :x="G.beta.x + 14" :y="G.beta.y + 70" :class="['node-mono', { stale: alphaDone }]">{{ hasRead ? format(t.race.holds, { etag: shortEtag(initialEtag) }) : '—' }}</text>
    </g>
    <text v-if="betaDone" :x="G.labels.beta.x" :y="G.labels.beta.y" class="edge-label bad" text-anchor="middle">{{ t.race.track.refused }}</text>
    <text v-else-if="hasRead" :x="G.labels.beta.x" :y="G.labels.beta.y" class="edge-label dim" text-anchor="middle">{{ t.race.track.readsLabel }} {{ shortEtag(initialEtag) }}</text>

    <!-- Guard -->
    <g :class="['node', 'node-guard', { lit: alphaDone, hit: betaDone }]">
      <rect :x="G.guard.x" :y="G.guard.y" :width="G.guard.w" :height="G.guard.h" class="node-box" rx="4" />
      <text :x="G.guard.x + 16" :y="G.guard.y + 30" class="node-title">{{ t.race.track.guard }}</text>
      <rect :x="G.guard.x + 16" :y="G.guard.y + G.guard.h / 2 - 20" :width="G.guard.w - 32" height="52" class="guard" rx="2" />
      <text :x="G.guard.x + 26" :y="G.guard.y + G.guard.h / 2 + 2" class="guard-title">concurrency guard</text>
      <text :x="G.guard.x + 26" :y="G.guard.y + G.guard.h / 2 + 22" class="guard-text">{{ t.race.track.guardRule }}</text>
      <g v-if="betaDone" class="burst">
        <circle :cx="G.guardBurst.x" :cy="G.guardBurst.y" r="20" class="burst-circle" />
        <text :x="G.guardBurst.x" :y="G.guardBurst.y + 5" class="burst-text" text-anchor="middle">412</text>
      </g>
    </g>

    <!-- SQL Server -->
    <g :class="['node', 'node-db', { lit: alphaDone }]">
      <rect :x="G.db.x" :y="G.db.y" :width="G.db.w" :height="G.db.h" class="node-box" rx="4" />
      <ellipse :cx="G.db.x + 30" :cy="G.db.y + 26" rx="16" ry="6" class="cylinder" />
      <text :x="G.db.x + 56" :y="G.db.y + 31" class="node-title">{{ t.race.track.database }}</text>
      <text :x="G.db.x + 16" :y="G.db.y + 62" class="node-plain">{{ t.race.track.version }}</text>
      <rect :x="G.db.x + 16" :y="G.db.y + 72" :width="G.db.w - 32" height="30" :class="['version', { bumped: alphaDone }]" rx="3" />
      <text :x="G.db.x + 26" :y="G.db.y + 92" class="version-text">{{ hasRead ? shortEtag(storedVersion) : '—' }}</text>
    </g>
    <text v-if="betaDone" :x="G.labels.untouched.x" :y="G.labels.untouched.y" class="edge-label ok" text-anchor="middle">{{ t.race.track.untouched }}</text>

    <text x="20" :y="G.footer.y" class="sheet-meta">{{ description.toUpperCase() }}</text>
  </svg>
</template>

<style scoped>
.race {
  width: 100%;
  height: auto;
  display: block;
  font-family: var(--font-mono);
}

.sheet-meta {
  font-size: 9.5px;
  letter-spacing: 0.12em;
  fill: #94a3b8;
}

.node-box {
  fill: #0a1628;
  stroke: #1b3b6f;
  stroke-width: 1.2;
  stroke-dasharray: 6 4;
  transition: stroke 0.25s ease, fill 0.25s ease;
}

.node.reading .node-box {
  stroke: #38bdf8;
  stroke-dasharray: none;
}

.node.lit .node-box {
  stroke: var(--brand-green);
  stroke-dasharray: none;
  fill: #0f2243;
  filter: url(#race-glow);
}

.node-beta.lit .node-box,
.node-guard.hit .node-box {
  stroke: var(--brand-red);
}

.node-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 800;
  fill: #ffffff;
}

.node-plain {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  fill: #a8b8d0;
}

.node-mono {
  font-size: 10.5px;
  fill: #cbd5e1;
}

.node-mono.stale {
  fill: #ff7a8a;
}

.edge {
  fill: none;
  stroke: #1b3b6f;
  stroke-width: 1.5;
  stroke-dasharray: 5 5;
  transition: stroke 0.25s ease, stroke-width 0.25s ease;
}

.arrow-head {
  fill: #1b3b6f;
}

.edge.lit {
  stroke: var(--brand-green);
  stroke-dasharray: none;
  stroke-width: 2;
}

.edge-beta.lit,
.edge-back.lit {
  stroke: var(--brand-red);
}

.edge.active {
  stroke-width: 3;
}

.edge-back {
  opacity: 0;
}

.edge-back.lit {
  opacity: 1;
}

.edge-label {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.edge-label.ok {
  fill: var(--brand-green);
}

.edge-label.bad {
  fill: #ff5c6e;
}

.edge-label.dim {
  fill: #7dd3fc;
}

.packet {
  opacity: 0;
  pointer-events: none;
}

.packet.on {
  opacity: 1;
}

.core {
  fill: #eaffc2;
  filter: url(#race-glow);
}

.halo {
  opacity: 0.35;
}

.halo.ok {
  fill: var(--brand-green);
}

.halo.bad {
  fill: var(--brand-red);
}

.guard {
  fill: rgba(0, 43, 102, 0.35);
  stroke: #38bdf8;
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.node-guard.hit .guard {
  stroke: var(--brand-red);
  stroke-dasharray: none;
  fill: rgba(255, 0, 31, 0.14);
}

.guard-title {
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  fill: #7dd3fc;
}

.guard-text {
  font-size: 10.5px;
  fill: #e2e8f0;
}

.burst-circle {
  fill: var(--brand-red);
  stroke: #060d1a;
  stroke-width: 2;
  transform-box: fill-box;
  transform-origin: center;
  animation: pop 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.burst-text {
  font-size: 11px;
  font-weight: 600;
  fill: #ffffff;
}

@keyframes pop {
  from { transform: scale(0.2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.cylinder {
  fill: rgba(0, 43, 102, 0.6);
  stroke: #1b3b6f;
  stroke-width: 1.2;
}

.node.lit .cylinder {
  stroke: var(--brand-green);
}

.version {
  fill: rgba(6, 13, 26, 0.7);
  stroke: #1b3b6f;
  transition: fill 0.3s ease, stroke 0.3s ease;
}

.version.bumped {
  fill: rgba(128, 255, 0, 0.14);
  stroke: var(--brand-green);
}

.version-text {
  font-size: 11px;
  fill: #ffffff;
}

.race-stacked .node-title { font-size: 16px; }
.race-stacked .node-plain { font-size: 12px; }
.race-stacked .node-mono,
.race-stacked .guard-text,
.race-stacked .version-text { font-size: 12px; }
.race-stacked .edge-label { font-size: 11px; }
.race-stacked .sheet-meta { font-size: 10px; }

@media (prefers-reduced-motion: reduce) {
  .burst-circle {
    animation: none;
  }
}
</style>
