<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { BlueprintLayout } from '../architecture/blueprintLayout';
import { EDGE_IDS, NODE_IDS } from '../architecture/blueprintLayout';
import { LAYER_GUIDE } from '../architecture/narration';
import type { BlueprintFrame, EdgeId, NodeId } from '../architecture/blueprintTimeline';

export type BlueprintPhase = 'idle' | 'waiting' | 'replaying' | 'done' | 'error';

const props = defineProps<{
  frame: BlueprintFrame;
  visitedNodes: NodeId[];
  phase: BlueprintPhase;
  reducedMotion: boolean;
  layout: BlueprintLayout;
  selectedNode: NodeId | null;
}>();

const emit = defineEmits<{
  (e: 'selectNode', id: NodeId): void;
}>();

const HOP_MS = 360;

/* Technical chips per node. The plain-language line comes from LAYER_GUIDE. */
const CHIPS: Partial<Record<NodeId, string[]>> = {
  client: ['HTTPS · JSON', 'no token · no body'],
  api: ['JWT · roles · org scope', 'ETag / If-Match', 'Problem Details', '429 · 503 + Retry-After'],
  application: ['create / activate / cancel', 'one transaction per command'],
  infrastructure: ['EF Core · rowversion', 'retry · 60 s timeout'],
};

const FOOTERS: Partial<Record<NodeId, string>> = {
  client: 'policy.naindev.com',
  api: '/api/v1 · OpenAPI',
  application: 'framework-free',
};

const CHIP_H = 24;
/** Approximate advance of one mono glyph at chip size, used only to choose one or two columns. */
const CHAR_W = 6.2;
const CHIP_GAP = 8;
const PAD = 16;

interface ChipBox {
  x: number;
  y: number;
  w: number;
  text: string;
}

function chipsFor(id: NodeId): ChipBox[] {
  const texts = CHIPS[id] ?? [];
  const box = props.layout.nodes[id];
  const inner = box.w - PAD * 2;
  const longest = texts.reduce((max, t) => Math.max(max, t.length), 0);
  const cols = inner >= 300 && 2 * (longest * CHAR_W + 18) + CHIP_GAP <= inner ? 2 : 1;
  const w = (inner - (cols - 1) * CHIP_GAP) / cols;
  const top = box.y + 60;
  return texts.map((text, i) => ({
    x: box.x + PAD + (i % cols) * (w + CHIP_GAP),
    y: top + Math.floor(i / cols) * (CHIP_H + CHIP_GAP),
    w,
    text,
  }));
}

function chipsBottom(id: NodeId): number {
  const chips = chipsFor(id);
  if (chips.length === 0) return props.layout.nodes[id].y + 60;
  return chips[chips.length - 1].y + CHIP_H;
}

const nodeChips = computed(() => Object.fromEntries(NODE_IDS.map((id) => [id, chipsFor(id)])) as Record<NodeId, ChipBox[]>);

const guard = computed(() => {
  const box = props.layout.nodes.application;
  return { x: box.x + PAD, y: chipsBottom('application') + 14, w: box.w - PAD * 2, h: 54 };
});

const domainStates = ['Draft', 'Active', 'Cancelled'] as const;
const stateIndex: Record<string, number> = { Draft: 0, Active: 1, Cancelled: 2 };

const states = computed(() => {
  const box = props.layout.nodes.domain;
  return domainStates.map((state, i) => ({
    state,
    x: box.x + PAD,
    y: box.y + 62 + i * 38,
    w: box.w - PAD * 2,
    h: 30,
  }));
});

function stateClass(state: string) {
  const current = stateIndex[props.frame.domainState];
  const mine = stateIndex[state];
  if (current === undefined) return 'state-off';
  if (mine === current) return 'state-current';
  if (mine < current) return 'state-visited';
  return 'state-off';
}

const sqlGeom = computed(() => {
  const b = props.layout.nodes.sql;
  if (props.layout.id === 'wide') {
    const cx = b.x + b.w / 2;
    return {
      cyl: { cx, cy: b.y + 22 },
      title: { x: cx, y: b.y + 52, anchor: 'middle' as const },
      tag: { x: cx, y: b.y + 70 },
      policies: { x: b.x + 12, y: b.y + 92, w: b.w - 24 },
      ledger: { x: b.x + 12, y: b.y + 184, w: b.w - 24 },
      foot: { x: cx, y: b.y + 342, anchor: 'middle' as const },
    };
  }
  return {
    cyl: { cx: b.x + 42, cy: b.y + 26 },
    title: { x: b.x + 76, y: b.y + 32, anchor: 'start' as const },
    tag: { x: b.x + 76, y: b.y + 50 },
    policies: { x: b.x + PAD, y: b.y + 72, w: 152 },
    ledger: { x: b.x + 184, y: b.y + 72, w: 152 },
    foot: { x: b.x + PAD, y: b.y + 166, anchor: 'start' as const },
  };
});

const ledgerRows = [
  { id: 1, text: 'Draft → Active' },
  { id: 2, text: 'Active → Cancelled' },
];

const activeEdge = ref<EdgeId | null>(null);
const packetRefs = ref<Record<string, SVGAnimateMotionElement | null>>({});
let timers: number[] = [];

function clearTimers() {
  for (const t of timers) window.clearTimeout(t);
  timers = [];
  activeEdge.value = null;
}

function setPacketRef(edge: EdgeId, el: unknown) {
  packetRefs.value[edge] = (el as SVGAnimateMotionElement | null) ?? null;
}

function playPackets(edges: EdgeId[]) {
  clearTimers();
  if (props.reducedMotion || edges.length === 0) return;

  edges.forEach((edge, i) => {
    timers.push(
      window.setTimeout(() => {
        activeEdge.value = edge;
        const anim = packetRefs.value[edge];
        if (anim && typeof anim.beginElement === 'function') {
          anim.beginElement();
        }
      }, i * HOP_MS)
    );
  });
  timers.push(
    window.setTimeout(() => {
      activeEdge.value = null;
    }, edges.length * HOP_MS + 40)
  );
}

watch(
  () => props.frame,
  (frame) => {
    if (frame.index === 0) {
      clearTimers();
      return;
    }
    playPackets(frame.litEdges);
  }
);

onBeforeUnmount(clearTimers);

const isLit = (id: NodeId) => props.frame.litNodes.includes(id);
const isVisited = (id: NodeId) => props.visitedNodes.includes(id);
const edgeLit = (id: EdgeId) => props.frame.litEdges.includes(id);
const showFlow = computed(() => !props.reducedMotion && props.frame.index > 0);

const versionLabel = computed(() => {
  const etag = props.frame.etag;
  if (!etag) return '—';
  const raw = etag.replace(/"/g, '');
  return raw.length > 6 ? `…${raw.slice(-6)}` : raw;
});

function shortPath(path: string) {
  return path.replace(/\/api\/v1/, '').replace(/[0-9a-f-]{36}/, '{id}');
}

const description = computed(() => {
  const f = props.frame;
  if (f.index === 0) {
    return 'Request path from the browser through the API, Application, Domain and Infrastructure layers to SQL Server. No run in progress. Each layer can be selected to read what it does.';
  }
  const where = f.tone === 'rejected' ? 'stopped at the concurrency guard in Application' : `reached ${f.litNodes[f.litNodes.length - 1]}`;
  return `Step ${f.index}, ${f.label}: ${f.method} ${f.path} returned ${f.status} in ${f.durationMs} ms and ${where}. Policy state ${f.domainState}, ${f.ledgerRows} audit rows.`;
});

const headerLabel = computed(() =>
  props.layout.id === 'wide' ? 'NAINDEV ARCHITECTURAL BLUEPRINT // NAINPOLICY // CLEAN ARCHITECTURE' : 'NAINDEV BLUEPRINT // NAINPOLICY'
);

const readout = computed(() => {
  if (props.phase === 'waiting') return 'REQUEST IN FLIGHT · WAKING FREE-TIER DATABASE';
  const f = props.frame;
  if (f.index > 0) return `STEP ${String(f.index).padStart(2, '0')} · ${f.method} ${shortPath(f.path)} · ${f.status} · ${f.durationMs} ms`;
  return 'READY · RUN THE SCENARIO TO TRACE A REQUEST';
});

function nodeLabel(id: NodeId) {
  const guide = LAYER_GUIDE[id];
  const state = isLit(id) ? ', on the current request path' : '';
  return `${guide.name}: ${guide.tagline}${state}. Select to read what it does.`;
}

function onNodeKey(event: KeyboardEvent, id: NodeId) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('selectNode', id);
  }
}

const rootClass = computed(() => [
  'blueprint',
  `layout-${props.layout.id}`,
  `tone-${props.frame.tone}`,
  `phase-${props.phase}`,
  { 'reduced-motion': props.reducedMotion },
]);
</script>

<template>
  <svg
    :class="rootClass"
    :viewBox="`0 0 ${layout.width} ${layout.height}`"
    role="img"
    aria-labelledby="bp-title bp-desc"
    preserveAspectRatio="xMidYMid meet"
  >
    <title id="bp-title">NainPolicy architecture blueprint</title>
    <desc id="bp-desc">{{ description }}</desc>

    <defs>
      <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f2243" stroke-width="1" />
      </pattern>
      <pattern id="bp-grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
        <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#1b3b6f" stroke-width="1.2" />
      </pattern>
      <marker id="bp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="arrow-head" />
      </marker>
      <filter id="bp-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="bp-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="bp-node-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0f2243" />
        <stop offset="1" stop-color="#0a1628" />
      </linearGradient>
      <linearGradient id="bp-node-lit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#15305a" />
        <stop offset="1" stop-color="#0d1d3a" />
      </linearGradient>
      <radialGradient id="bp-spot" cx="50%" cy="50%" r="60%">
        <stop offset="0" stop-color="#0d2a52" stop-opacity="0.9" />
        <stop offset="1" stop-color="#060d1a" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Sheet -->
    <rect :width="layout.width" :height="layout.height" fill="#060d1a" />
    <rect :width="layout.width" :height="layout.height" fill="url(#bp-spot)" />
    <rect :width="layout.width" :height="layout.height" fill="url(#bp-grid)" opacity="0.7" />
    <rect :width="layout.width" :height="layout.height" fill="url(#bp-grid-major)" opacity="0.9" />
    <rect x="12" y="12" :width="layout.width - 24" :height="layout.height - 24" fill="none" stroke="#1e3a8a" stroke-width="1.5" rx="3" />
    <line x1="12" y1="34" :x2="layout.width - 12" y2="34" stroke="#1b3b6f" stroke-width="1" stroke-dasharray="4 4" />
    <text x="24" y="27" class="sheet-label">{{ headerLabel }}</text>
    <text v-if="layout.id === 'wide'" :x="layout.width - 24" y="27" class="sheet-meta" text-anchor="end">.NET 10 · EF CORE 10 · SQL SERVER · 52.0°</text>

    <!-- Edges -->
    <g class="edges">
      <path
        v-for="edge in EDGE_IDS"
        :key="edge"
        :d="layout.edges[edge]"
        :class="['edge', `edge-${edge}`, { lit: edgeLit(edge), active: activeEdge === edge }]"
        marker-end="url(#bp-arrow)"
      />
      <template v-if="showFlow">
        <path
          v-for="edge in EDGE_IDS.filter(edgeLit)"
          :key="`flow-${edge}`"
          :d="layout.edges[edge]"
          class="edge-flow"
        />
      </template>
      <!-- Reverse path for the rejected request -->
      <path
        :d="layout.rejectEdge"
        class="edge edge-reject"
        :class="{ lit: frame.guardHit }"
        marker-end="url(#bp-arrow)"
      />
    </g>

    <!-- Packets -->
    <g class="packets">
      <g
        v-for="edge in EDGE_IDS"
        :key="`packet-${edge}`"
        :class="['packet', { travelling: activeEdge === edge }]"
      >
        <circle r="12" class="packet-halo" />
        <circle r="5" class="packet-core" />
        <animateMotion
          :ref="(el) => setPacketRef(edge, el)"
          :path="layout.edges[edge]"
          :dur="`${HOP_MS}ms`"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.3 0 0.2 1"
        />
      </g>
    </g>

    <!-- Nodes -->
    <g
      v-for="id in NODE_IDS"
      :key="id"
      :class="['node', `node-${id}`, { lit: isLit(id), visited: isVisited(id), selected: selectedNode === id, guard: id === 'application' && frame.guardHit }]"
      role="button"
      tabindex="0"
      :aria-label="nodeLabel(id)"
      :aria-pressed="selectedNode === id"
      @click="emit('selectNode', id)"
      @keydown="onNodeKey($event, id)"
    >
      <rect :x="layout.nodes[id].x" :y="layout.nodes[id].y" :width="layout.nodes[id].w" :height="layout.nodes[id].h" class="node-box" rx="4" />

      <!-- SQL Server has its own header -->
      <template v-if="id === 'sql'">
        <ellipse :cx="sqlGeom.cyl.cx" :cy="sqlGeom.cyl.cy" rx="36" ry="9" class="cylinder" />
        <text :x="sqlGeom.title.x" :y="sqlGeom.title.y" class="node-title" :text-anchor="sqlGeom.title.anchor">SQL Server</text>
        <text :x="sqlGeom.tag.x" :y="sqlGeom.tag.y" class="node-plain" :text-anchor="sqlGeom.title.anchor">{{ LAYER_GUIDE.sql.tagline }}</text>
      </template>
      <template v-else>
        <text :x="layout.nodes[id].x + PAD" :y="layout.nodes[id].y + 28" class="node-title">{{ LAYER_GUIDE[id].name }}</text>
        <text :x="layout.nodes[id].x + PAD" :y="layout.nodes[id].y + 46" class="node-plain">{{ LAYER_GUIDE[id].tagline }}</text>
      </template>

      <!-- Chips -->
      <g class="chips">
        <template v-for="chip in nodeChips[id]" :key="chip.text">
          <rect :x="chip.x" :y="chip.y" :width="chip.w" :height="CHIP_H" class="chip" rx="2" />
          <text :x="chip.x + 9" :y="chip.y + 16" class="chip-text">{{ chip.text }}</text>
        </template>
      </g>

      <!-- Application: concurrency guard -->
      <template v-if="id === 'application'">
        <rect :x="guard.x" :y="guard.y" :width="guard.w" :height="guard.h" class="guard" rx="2" />
        <text :x="guard.x + 10" :y="guard.y + 21" class="guard-title">concurrency guard</text>
        <text :x="guard.x + 10" :y="guard.y + 41" class="guard-text">If-Match ≟ stored version</text>
        <g v-if="frame.guardHit" class="guard-burst">
          <circle :cx="guard.x + guard.w" :cy="guard.y" r="20" class="burst" />
          <text :x="guard.x + guard.w" :y="guard.y + 5" class="burst-text" text-anchor="middle">412</text>
        </g>
      </template>

      <!-- Domain: lifecycle states -->
      <template v-if="id === 'domain'">
        <template v-for="(s, i) in states" :key="s.state">
          <rect :x="s.x" :y="s.y" :width="s.w" :height="s.h" :class="['state', stateClass(s.state)]" rx="3" />
          <text :x="s.x + 10" :y="s.y + 20" :class="['state-text', stateClass(s.state)]">{{ s.state }}</text>
          <text v-if="i < 2" :x="s.x + s.w - 10" :y="s.y + 20" class="state-arrow" text-anchor="end">↓</text>
        </template>
      </template>

      <!-- SQL Server: tables -->
      <template v-if="id === 'sql'">
        <g class="table">
          <rect :x="sqlGeom.policies.x" :y="sqlGeom.policies.y" :width="sqlGeom.policies.w" height="22" class="table-head" rx="2" />
          <text :x="sqlGeom.policies.x + 8" :y="sqlGeom.policies.y + 15" class="table-title">Policies</text>
          <rect :x="sqlGeom.policies.x" :y="sqlGeom.policies.y + 22" :width="sqlGeom.policies.w" height="48" class="table-body" />
          <text :x="sqlGeom.policies.x + 8" :y="sqlGeom.policies.y + 40" class="table-cell">status {{ frame.domainState === 'None' ? '—' : frame.domainState }}</text>
          <text :x="sqlGeom.policies.x + 8" :y="sqlGeom.policies.y + 60" class="table-cell">version {{ versionLabel }}</text>
        </g>
        <g class="table ledger">
          <rect :x="sqlGeom.ledger.x" :y="sqlGeom.ledger.y" :width="sqlGeom.ledger.w" height="22" class="table-head" rx="2" />
          <text :x="sqlGeom.ledger.x + 8" :y="sqlGeom.ledger.y + 15" class="table-title">PolicyTransitions</text>
          <rect :x="sqlGeom.ledger.x" :y="sqlGeom.ledger.y + 22" :width="sqlGeom.ledger.w" height="94" class="table-body" />
          <template v-for="row in ledgerRows" :key="row.id">
            <g :class="['ledger-row', { present: frame.ledgerRows >= row.id }]">
              <rect :x="sqlGeom.ledger.x + 4" :y="sqlGeom.ledger.y + 28 + (row.id - 1) * 30" :width="sqlGeom.ledger.w - 8" height="24" class="ledger-cell" rx="2" />
              <text :x="sqlGeom.ledger.x + 10" :y="sqlGeom.ledger.y + 44 + (row.id - 1) * 30" class="ledger-text">{{ row.text }}</text>
            </g>
          </template>
          <text :x="sqlGeom.ledger.x + 8" :y="sqlGeom.ledger.y + 106" class="table-cell dim">append-only</text>
        </g>
        <text :x="sqlGeom.foot.x" :y="sqlGeom.foot.y" class="node-sub" :text-anchor="sqlGeom.foot.anchor">1 transaction</text>
        <text :x="sqlGeom.foot.x" :y="sqlGeom.foot.y + 18" class="node-sub" :text-anchor="sqlGeom.foot.anchor">policy + audit row</text>
      </template>

      <!-- Footer line -->
      <text v-if="FOOTERS[id]" :x="layout.nodes[id].x + PAD" :y="layout.nodes[id].y + layout.nodes[id].h - 14" class="node-sub">{{ FOOTERS[id] }}</text>
    </g>

    <!-- Status readout -->
    <g class="readout">
      <text x="24" :y="layout.height - 22" class="sheet-meta">{{ readout }}</text>
      <text v-if="layout.id === 'wide'" :x="layout.width - 24" :y="layout.height - 22" class="sheet-meta" text-anchor="end">SPEC-006 · SHEET 1/1</text>
    </g>
  </svg>
</template>

<style scoped>
.blueprint {
  width: 100%;
  height: auto;
  display: block;
  font-family: var(--font-mono);
}

.sheet-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.28em;
  fill: var(--brand-green);
}

.sheet-meta {
  font-size: 9.5px;
  letter-spacing: 0.12em;
  fill: #94a3b8;
}

/* Nodes */
.node {
  cursor: pointer;
  outline: none;
}

.node-box {
  fill: url(#bp-node-fill);
  stroke: #1b3b6f;
  stroke-width: 1.2;
  stroke-dasharray: 6 4;
  transition: stroke 0.25s ease, fill 0.25s ease, filter 0.25s ease;
}

.node:hover .node-box,
.node:focus-visible .node-box {
  stroke: #3c5f94;
  stroke-dasharray: none;
}

.node.visited .node-box {
  stroke: #3c5f94;
  stroke-dasharray: none;
}

.node.lit .node-box {
  stroke: var(--brand-green);
  stroke-dasharray: none;
  fill: url(#bp-node-lit);
  filter: url(#bp-glow);
}

.tone-rejected .node.lit .node-box {
  stroke: var(--brand-red);
}

.node.selected .node-box,
.node:focus-visible .node-box {
  stroke: var(--accent-cyan);
  stroke-width: 2;
  stroke-dasharray: none;
}

.node-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 800;
  fill: #ffffff;
}

.node-plain {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  fill: #a8b8d0;
}

.node.lit .node-plain {
  fill: var(--brand-green);
}

.node-sub {
  font-size: 10px;
  fill: #94a3b8;
}

.chip {
  fill: rgba(0, 43, 102, 0.45);
  stroke: #1b3b6f;
  stroke-width: 1;
}

.node.lit .chip {
  stroke: rgba(128, 255, 0, 0.45);
}

.chip-text {
  font-size: 9.5px;
  fill: #cbd5e1;
}

/* Edges */
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

.edge.active {
  stroke-width: 3;
}

.tone-rejected .edge.lit {
  stroke: var(--brand-red);
}

.edge-flow {
  fill: none;
  stroke: #d6ff8a;
  stroke-width: 2;
  stroke-dasharray: 6 12;
  stroke-linecap: round;
  opacity: 0.85;
  animation: flow 1.1s linear infinite;
  pointer-events: none;
}

.tone-rejected .edge-flow {
  stroke: #ff7a8a;
}

@keyframes flow {
  to { stroke-dashoffset: -18; }
}

.edge-reject {
  opacity: 0;
  stroke: var(--brand-red);
}

.edge-reject.lit {
  opacity: 1;
  stroke-dasharray: none;
  stroke-width: 2;
}

.phase-waiting .edge-client-api {
  stroke: #38bdf8;
  stroke-dasharray: 8 6;
  animation: march 0.6s linear infinite;
}

@keyframes march {
  to { stroke-dashoffset: -14; }
}

/* Packets */
.packet {
  opacity: 0;
  pointer-events: none;
}

.packet.travelling {
  opacity: 1;
}

.packet-core {
  fill: #eaffc2;
  filter: url(#bp-glow);
}

.packet-halo {
  fill: var(--brand-green);
  opacity: 0.35;
  filter: url(#bp-glow-soft);
}

.tone-rejected .packet-core {
  fill: #ffd6db;
}

.tone-rejected .packet-halo {
  fill: var(--brand-red);
}

/* Guard */
.guard {
  fill: rgba(0, 43, 102, 0.35);
  stroke: #38bdf8;
  stroke-width: 1;
  stroke-dasharray: 3 3;
  transition: stroke 0.25s ease, fill 0.25s ease;
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

.node.guard .guard {
  stroke: var(--brand-red);
  stroke-dasharray: none;
  fill: rgba(255, 0, 31, 0.14);
}

.burst {
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

/* Domain states */
.state {
  fill: rgba(0, 43, 102, 0.3);
  stroke: #1b3b6f;
  stroke-width: 1;
  transition: fill 0.3s ease, stroke 0.3s ease;
}

.state.state-visited {
  stroke: #3c5f94;
  fill: rgba(60, 95, 148, 0.2);
}

.state.state-current {
  fill: var(--brand-green);
  stroke: var(--brand-green);
  filter: url(#bp-glow);
}

.state-text {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 700;
  fill: #64748b;
  transition: fill 0.3s ease;
}

.state-text.state-visited {
  fill: #cbd5e1;
}

.state-text.state-current {
  fill: var(--brand-black);
}

.state-arrow {
  font-size: 12px;
  fill: #3c5f94;
}

/* SQL */
.cylinder {
  fill: rgba(0, 43, 102, 0.6);
  stroke: #1b3b6f;
  stroke-width: 1.2;
}

.node.lit .cylinder {
  stroke: var(--brand-green);
}

.table-head {
  fill: rgba(0, 43, 102, 0.7);
  stroke: #1b3b6f;
}

.table-title {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  fill: #ffffff;
}

.table-body {
  fill: rgba(6, 13, 26, 0.7);
  stroke: #1b3b6f;
  stroke-width: 1;
}

.table-cell {
  font-size: 9.5px;
  fill: #cbd5e1;
}

.table-cell.dim {
  fill: #64748b;
  letter-spacing: 0.08em;
}

.ledger-row {
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.ledger-row.present {
  opacity: 1;
  transform: translateX(0);
}

.ledger-cell {
  fill: rgba(128, 255, 0, 0.12);
  stroke: rgba(128, 255, 0, 0.5);
}

.ledger-text {
  font-size: 9px;
  fill: var(--brand-green);
}

/* Stacked layout: the sheet is narrower, so type scales up a little */
.layout-stacked .node-title { font-size: 19px; }
.layout-stacked .node-plain { font-size: 12.5px; }
.layout-stacked .chip-text,
.layout-stacked .table-cell,
.layout-stacked .table-title,
.layout-stacked .guard-title { font-size: 10.5px; }
.layout-stacked .guard-text { font-size: 11.5px; }
.layout-stacked .node-sub { font-size: 11px; }
.layout-stacked .state-text { font-size: 14px; }
.layout-stacked .ledger-text { font-size: 10px; }
.layout-stacked .sheet-label,
.layout-stacked .sheet-meta { font-size: 10px; }

/* Reduced motion: no travelling packets, no flow, instant states */
.reduced-motion .packet,
.reduced-motion .edge-flow,
.reduced-motion .phase-waiting .edge-client-api,
.reduced-motion .burst {
  animation: none;
}

.reduced-motion .node-box,
.reduced-motion .edge,
.reduced-motion .state,
.reduced-motion .ledger-row,
.reduced-motion .guard {
  transition: none;
}
</style>
