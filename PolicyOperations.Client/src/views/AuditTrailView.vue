<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SourceChip from '../components/SourceChip.vue';
import NextStep from '../components/NextStep.vue';
import ViewHeader from '../components/ViewHeader.vue';
import type { TabId } from '../architecture/tabRoute';
import { useLocale } from '../i18n/locale';
import { format } from '../i18n/messages';
import { api, ApiError } from '../services/api';
import { lastPolicy, lastRun, rememberRun } from '../services/session';
import type { PolicyTransitionResponse, ScenarioSource } from '../types/contracts';

const emit = defineEmits<{ (e: 'navigate', tab: TabId): void }>();
const { t } = useLocale();

const props = defineProps<{
  token: string;
}>();

const policyIdInput = ref('');
const transitions = ref<PolicyTransitionResponse[]>([]);
const isLoading = ref(false);
const errorFeedback = ref<string | null>(null);
const source = ref<ScenarioSource | null>(null);
const origin = ref<'practice' | 'run' | 'lookup' | null>(null);

const listTitle = computed(() => {
  if (origin.value === 'practice') return t.value.audit.fromPractice;
  if (origin.value === 'run') return t.value.audit.fromRun;
  return t.value.audit.listTitle;
});

function fail(err: unknown) {
  errorFeedback.value = err instanceof ApiError ? err.problem?.detail || err.message : String(err);
}

/** Explicit: one real demo run, on the visitor's click only (REQ-198). */
async function fetchFromDemo() {
  isLoading.value = true;
  errorFeedback.value = null;
  try {
    const run = await api.runScenario();
    rememberRun(run);
    showRun();
  } catch (err: unknown) {
    fail(err);
  } finally {
    isLoading.value = false;
  }
}

function showRun() {
  const run = lastRun.value;
  if (!run) return;
  origin.value = 'run';
  source.value = run.source;
  policyIdInput.value = run.response.policy.id;
  transitions.value = run.response.transitions;
}

async function handleFetchCustom() {
  const id = policyIdInput.value.trim();
  if (!id) return;

  isLoading.value = true;
  errorFeedback.value = null;
  try {
    const result = await api.listTransitions(id, props.token);
    origin.value = lastPolicy.value?.id === id ? 'practice' : 'lookup';
    source.value = result.source;
    transitions.value = result.transitions;
  } catch (err: unknown) {
    fail(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  // Continuity (REQ-197): what the visitor just did comes first; no request is made on its own.
  if (lastPolicy.value) {
    policyIdInput.value = lastPolicy.value.id;
    void handleFetchCustom();
  } else if (lastRun.value) {
    showRun();
  }
});
</script>

<template>
  <div class="audit-view">
    <!-- Header info card -->
    <ViewHeader :eyebrow="t.views.audit.eyebrow" :title="t.views.audit.title" :lede="t.views.audit.lede" />

    <div class="glass-panel info-card">
      <div class="search-bar">
        <div class="search-input-group">
          <label>{{ t.audit.idLabel }}</label>
          <input
            v-model="policyIdInput"
            type="text"
            class="input-field font-mono"
            placeholder="00000000-0000-0000-0000-000000000000"
          />
        </div>

        <button
          type="button"
          class="btn btn-secondary"
          :disabled="isLoading || !policyIdInput"
          @click="handleFetchCustom"
        >
          {{ t.audit.readHistory }}
        </button>

        <button
          type="button"
          class="btn btn-primary"
          :disabled="isLoading"
          @click="fetchFromDemo"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span>{{ isLoading ? t.audit.loading : t.audit.loadDemo }}</span>
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="errorFeedback" class="glass-panel error-card">
      <p>{{ errorFeedback }}</p>
    </div>

    <!-- Timeline Container -->
    <div class="glass-panel timeline-panel">
      <div class="panel-header">
        <div>
          <h3>{{ listTitle }}</h3>
          <span class="sub-hint">{{ format(t.audit.listHint, { n: transitions.length }) }}</span>
        </div>
        <SourceChip v-if="source" :source="source" />
      </div>

      <div v-if="transitions.length === 0 && !isLoading" class="empty-timeline">
        <p>{{ origin ? t.audit.empty : t.audit.emptyHint }}</p>
      </div>

      <div v-else class="timeline-container">
        <div
          v-for="(tr, idx) in transitions"
          :key="tr.id"
          class="timeline-item"
        >
          <div class="timeline-marker">
            <div class="marker-dot"></div>
            <div v-if="idx < transitions.length - 1" class="marker-line"></div>
          </div>

          <div class="timeline-content glass-panel">
            <div class="timeline-top">
              <div class="transition-pill-wrap">
                <span class="badge badge-slate font-mono">{{ tr.fromStatus }}</span>
                <span class="arrow-symbol">→</span>
                <span
                  :class="[
                    'badge',
                    tr.toStatus === 'Active' ? 'badge-emerald' : tr.toStatus === 'Cancelled' ? 'badge-rose' : 'badge-cyan'
                  ]"
                >
                  {{ tr.toStatus }}
                </span>
              </div>

              <span class="timestamp font-mono">{{ tr.occurredAtUtc }}</span>
            </div>

            <div class="timeline-grid">
              <div class="meta-field">
                <span class="field-label">{{ t.audit.actor }}</span>
                <span class="field-value font-mono">{{ tr.actorSubject }}</span>
              </div>
              <div class="meta-field">
                <span class="field-label">{{ t.audit.correlation }}</span>
                <span class="field-value font-mono">{{ tr.correlationId }}</span>
              </div>
              <div v-if="tr.reason" class="meta-field full-width">
                <span class="field-label">{{ t.audit.reason }}</span>
                <span class="field-value text-highlight">{{ tr.reason }}</span>
              </div>
              <div class="meta-field full-width">
                <span class="field-label">{{ t.audit.id }}</span>
                <span class="field-value font-mono text-dim">{{ tr.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NextStep tab="audit" @navigate="emit('navigate', $event)" />
  </div>
</template>

<style scoped>
.audit-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(12, 18, 32, 0.95) 100%);
}

.badge-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 280px;
}

.search-input-group label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.input-field {
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 0.88rem;
}

.input-field:focus {
  border-color: var(--accent-cyan);
  outline: none;
}

.error-card {
  padding: 1rem 1.25rem;
  background: rgba(244, 63, 94, 0.1);
  border-left: 4px solid var(--accent-rose);
  color: #fb7185;
}

.timeline-panel {
  padding: 1.5rem 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-header h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
}

.sub-hint {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.empty-timeline {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-dim);
}

.timeline-container {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  position: relative;
  padding-bottom: 1.75rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent-emerald);
  box-shadow: 0 0 10px var(--accent-emerald);
  flex-shrink: 0;
  margin-top: 0.4rem;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: rgba(16, 185, 129, 0.25);
  margin-top: 0.4rem;
}

.timeline-content {
  flex: 1;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.timeline-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.transition-pill-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.arrow-symbol {
  color: var(--text-dim);
  font-weight: 700;
}

.timestamp {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.timeline-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.meta-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field-value {
  font-size: 0.86rem;
  color: var(--text-main);
}

.text-highlight {
  color: #fcd34d;
}

.font-mono {
  font-family: var(--font-mono);
}

@media (max-width: 768px) {
  .timeline-grid {
    grid-template-columns: 1fr;
  }
}
</style>
