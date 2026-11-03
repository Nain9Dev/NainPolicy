<script setup lang="ts">
import { ref, computed } from 'vue';
import ViewHeader from '../components/ViewHeader.vue';
import { useLocale } from '../i18n/locale';
import { format } from '../i18n/messages';
import { api, ApiError } from '../services/api';
import type { PolicyResponse } from '../types/contracts';

const { t } = useLocale();

const props = defineProps<{
  token: string;
}>();

const emit = defineEmits<{
  (e: 'openTokenModal'): void;
}>();

// Active policy state in workbench
const currentPolicy = ref<PolicyResponse | null>(null);
const currentEtag = ref<string | null>(null);
const isLoading = ref(false);
const errorFeedback = ref<string | null>(null);
const successFeedback = ref<string | null>(null);

// Form models
const createForm = ref({
  policyNumber: `SYNTH-${Date.now().toString().slice(-6)}`,
  insuredAmount: 150000,
  currency: 'EUR',
});

const activateForm = ref({
  insuredPartyReference: 'SYNTH-INSURED-ALPHA',
  coverageStartDate: new Date().toISOString().slice(0, 10),
  coverageEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  ifMatch: '',
});

const cancelForm = ref({
  reason: 'Customer initiated statutory cancellation',
  ifMatch: '',
});

const isDraft = computed(() => currentPolicy.value?.status === 'Draft');
const isActive = computed(() => currentPolicy.value?.status === 'Active');
const isCancelled = computed(() => currentPolicy.value?.status === 'Cancelled');

function resetMessages() {
  errorFeedback.value = null;
  successFeedback.value = null;
}

async function handleCreatePolicy() {
  if (!props.token) {
    emit('openTokenModal');
    return;
  }

  resetMessages();
  isLoading.value = true;
  try {
    const res = await api.createPolicy(createForm.value, props.token);
    currentPolicy.value = res.policy;
    currentEtag.value = res.etag;
    activateForm.value.ifMatch = res.etag || '';
    cancelForm.value.ifMatch = res.etag || '';
    successFeedback.value = format(t.value.lifecycle.msgCreated, { n: res.policy.policyNumber });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      errorFeedback.value = err.problem?.detail || err.message;
    } else {
      errorFeedback.value = String(err);
    }
  } finally {
    isLoading.value = false;
  }
}

async function handleActivatePolicy() {
  if (!currentPolicy.value || !props.token) return;

  resetMessages();
  isLoading.value = true;
  try {
    const res = await api.activatePolicy(
      currentPolicy.value.id,
      {
        insuredPartyReference: activateForm.value.insuredPartyReference,
        coverageStartDate: activateForm.value.coverageStartDate,
        coverageEndDate: activateForm.value.coverageEndDate,
      },
      activateForm.value.ifMatch || currentEtag.value || '',
      props.token
    );
    currentPolicy.value = res.policy;
    currentEtag.value = res.etag;
    cancelForm.value.ifMatch = res.etag || '';
    successFeedback.value = t.value.lifecycle.msgActive;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.status === 412) {
        errorFeedback.value = t.value.lifecycle.msgStale;
      } else {
        errorFeedback.value = err.problem?.detail || err.message;
      }
    } else {
      errorFeedback.value = String(err);
    }
  } finally {
    isLoading.value = false;
  }
}

async function handleCancelPolicy() {
  if (!currentPolicy.value || !props.token) return;

  resetMessages();
  isLoading.value = true;
  try {
    const res = await api.cancelPolicy(
      currentPolicy.value.id,
      { reason: cancelForm.value.reason },
      cancelForm.value.ifMatch || currentEtag.value || '',
      props.token
    );
    currentPolicy.value = res.policy;
    currentEtag.value = res.etag;
    successFeedback.value = t.value.lifecycle.msgCancelled;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      if (err.status === 412) {
        errorFeedback.value = t.value.lifecycle.msgStale;
      } else {
        errorFeedback.value = err.problem?.detail || err.message;
      }
    } else {
      errorFeedback.value = String(err);
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="lifecycle-view">
    <ViewHeader :eyebrow="t.views.lifecycle.eyebrow" :title="t.views.lifecycle.title" :lede="t.views.lifecycle.lede" />

    <!-- State machine -->
    <div class="glass-panel state-machine-panel">
      <div class="fsm-diagram">
        <div :class="['fsm-node', { current: isDraft, visited: isActive || isCancelled }]">
          <div class="fsm-dot"></div>
          <span class="fsm-name">{{ t.lifecycle.states.draft }}</span>
          <span class="fsm-desc">{{ t.lifecycle.stateHints.draft }}</span>
        </div>

        <div class="fsm-arrow">
          <span class="arrow-label">{{ t.lifecycle.activateArrow }}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>

        <div :class="['fsm-node', { current: isActive, visited: isCancelled }]">
          <div class="fsm-dot"></div>
          <span class="fsm-name">{{ t.lifecycle.states.active }}</span>
          <span class="fsm-desc">{{ t.lifecycle.stateHints.active }}</span>
        </div>

        <div class="fsm-arrow">
          <span class="arrow-label">{{ t.lifecycle.cancelArrow }}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>

        <div :class="['fsm-node', { current: isCancelled }]">
          <div class="fsm-dot"></div>
          <span class="fsm-name">{{ t.lifecycle.states.cancelled }}</span>
          <span class="fsm-desc">{{ t.lifecycle.stateHints.cancelled }}</span>
        </div>
      </div>
    </div>

    <!-- Token Missing Banner -->
    <div v-if="!token" class="glass-panel token-notice">
      <div class="notice-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <div class="notice-body">
        <h4>{{ t.lifecycle.tokenTitle }}</h4>
        <p>{{ t.lifecycle.tokenBody }}</p>
        <button type="button" class="btn btn-primary config-btn" @click="emit('openTokenModal')">
          {{ t.lifecycle.configure }}
        </button>
      </div>
    </div>

    <!-- Feedback messages -->
    <div v-if="errorFeedback" class="glass-panel feedback-error">
      {{ errorFeedback }}
    </div>
    <div v-if="successFeedback" class="glass-panel feedback-success">
      {{ successFeedback }}
    </div>

    <!-- Workbench Grid -->
    <div class="workbench-grid">
      <!-- Actions Column -->
      <div class="actions-column">
        <!-- Create Draft Card -->
        <div class="glass-panel form-card">
          <h4>{{ t.lifecycle.step1 }}</h4>
          <div class="form-group">
            <label>{{ t.lifecycle.policyNumber }}</label>
            <input v-model="createForm.policyNumber" type="text" class="input-field" placeholder="SYNTH-POL-XXXX" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t.lifecycle.insuredAmount }}</label>
              <input v-model.number="createForm.insuredAmount" type="number" class="input-field" />
            </div>
            <div class="form-group">
              <label>{{ t.lifecycle.currency }}</label>
              <select v-model="createForm.currency" class="input-field">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary full-btn"
            :disabled="isLoading || !token"
            @click="handleCreatePolicy"
          >
            {{ t.lifecycle.createDraft }}
          </button>
        </div>

        <!-- Activate Policy Card -->
        <div class="glass-panel form-card" :class="{ disabled: !isDraft }">
          <h4>{{ t.lifecycle.step2 }}</h4>
          <div class="form-group">
            <label>{{ t.lifecycle.insuredParty }}</label>
            <input v-model="activateForm.insuredPartyReference" type="text" class="input-field" :disabled="!isDraft" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t.lifecycle.startDate }}</label>
              <input v-model="activateForm.coverageStartDate" type="date" class="input-field" :disabled="!isDraft" />
            </div>
            <div class="form-group">
              <label>{{ t.lifecycle.endDate }}</label>
              <input v-model="activateForm.coverageEndDate" type="date" class="input-field" :disabled="!isDraft" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t.lifecycle.ifMatch }}</label>
            <input v-model="activateForm.ifMatch" type="text" class="input-field font-mono" :disabled="!isDraft" />
          </div>

          <button
            type="button"
            class="btn btn-indigo full-btn"
            :disabled="isLoading || !isDraft || !token"
            @click="handleActivatePolicy"
          >
            {{ t.lifecycle.activate }}
          </button>
        </div>

        <!-- Cancel Policy Card -->
        <div class="glass-panel form-card" :class="{ disabled: !isActive }">
          <h4>{{ t.lifecycle.step3 }}</h4>
          <div class="form-group">
            <label>{{ t.lifecycle.reason }}</label>
            <input v-model="cancelForm.reason" type="text" class="input-field" :disabled="!isActive" />
          </div>

          <div class="form-group">
            <label>{{ t.lifecycle.ifMatch }}</label>
            <input v-model="cancelForm.ifMatch" type="text" class="input-field font-mono" :disabled="!isActive" />
          </div>

          <button
            type="button"
            class="btn btn-danger full-btn"
            :disabled="isLoading || !isActive || !token"
            @click="handleCancelPolicy"
          >
            {{ t.lifecycle.cancel }}
          </button>
        </div>
      </div>

      <!-- Live Inspector Column -->
      <div class="inspector-column">
        <div class="glass-panel inspector-card">
          <div class="panel-header">
            <h3>{{ t.lifecycle.inspectorTitle }}</h3>
            <span v-if="currentPolicy" :class="['badge', isDraft ? 'badge-amber' : isActive ? 'badge-emerald' : 'badge-rose']">
              {{ currentPolicy.status }}
            </span>
          </div>

          <div v-if="!currentPolicy" class="empty-inspector">
            <p>{{ t.lifecycle.noPolicy }}</p>
            <p class="sub-text">{{ t.lifecycle.noPolicyHint }}</p>
          </div>

          <div v-else class="inspector-details">
            <div class="detail-row">
              <span class="detail-key">{{ t.lifecycle.identifier }}</span>
              <span class="detail-val font-mono">{{ currentPolicy.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">{{ t.lifecycle.policyNumber }}</span>
              <span class="detail-val font-mono bold">{{ currentPolicy.policyNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">{{ t.lifecycle.amount }}</span>
              <span class="detail-val">{{ currentPolicy.insuredAmount }} {{ currentPolicy.currency }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">{{ t.lifecycle.currentVersion }}</span>
              <span class="detail-val font-mono etag-pill">{{ currentEtag || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">{{ t.lifecycle.storedRowversion }}</span>
              <span class="detail-val font-mono text-dim">{{ currentPolicy.version }}</span>
            </div>
            <div v-if="currentPolicy.insuredPartyReference" class="detail-row">
              <span class="detail-key">{{ t.lifecycle.insuredPartyLabel }}</span>
              <span class="detail-val">{{ currentPolicy.insuredPartyReference }}</span>
            </div>
            <div v-if="currentPolicy.coverageStartDate" class="detail-row">
              <span class="detail-key">{{ t.lifecycle.coverage }}</span>
              <span class="detail-val">{{ currentPolicy.coverageStartDate }} → {{ currentPolicy.coverageEndDate }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">{{ t.lifecycle.created }}</span>
              <span class="detail-val font-mono text-dim">{{ currentPolicy.createdAtUtc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lifecycle-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.state-machine-panel {
  padding: 1.5rem 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-header h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
}

.fsm-diagram {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 0;
}

.fsm-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  min-width: 170px;
  text-align: center;
  transition: all 0.3s ease;
}

.fsm-node.current {
  border-color: var(--brand-green);
  background: rgba(128, 255, 0, 0.1);
  box-shadow: 0 0 20px rgba(128, 255, 0, 0.18);
}

.fsm-node.visited {
  border-color: #3c5f94;
}

.fsm-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-dim);
}

.fsm-node.current .fsm-dot {
  background: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan);
}

.fsm-name {
  font-weight: 700;
  font-size: 0.95rem;
  font-family: var(--font-heading);
}

.fsm-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.fsm-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-dim);
}

.arrow-label {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.token-notice {
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1.25rem;
  align-items: center;
  background: rgba(99, 102, 241, 0.08);
  border-left: 4px solid var(--accent-indigo);
}

.notice-icon {
  color: var(--accent-indigo);
  flex-shrink: 0;
}

.notice-body h4 {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  color: #c7d2fe;
}

.notice-body p {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.notice-body code {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  color: #7dd3fc;
}

.config-btn {
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
}

.feedback-error {
  padding: 1rem 1.25rem;
  background: rgba(244, 63, 94, 0.1);
  border-left: 4px solid var(--accent-rose);
  color: #fb7185;
  font-size: 0.88rem;
}

.feedback-success {
  padding: 1rem 1.25rem;
  background: rgba(16, 185, 129, 0.1);
  border-left: 4px solid var(--accent-emerald);
  color: #6ee7b7;
  font-size: 0.88rem;
}

.workbench-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.actions-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-card {
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
}

.form-card.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.form-card h4 {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.form-group label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.input-field {
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.88rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: var(--accent-cyan);
  outline: none;
}

.full-btn {
  width: 100%;
  margin-top: 0.5rem;
}

.inspector-card {
  padding: 1.5rem;
  height: 100%;
}

.empty-inspector {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-dim);
}

.empty-inspector .sub-text {
  font-size: 0.82rem;
  margin-top: 0.5rem;
}

.inspector-details {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.detail-key {
  font-size: 0.82rem;
  color: var(--text-dim);
}

.detail-val {
  font-size: 0.88rem;
}

.detail-val.bold {
  font-weight: 700;
}

.etag-pill {
  background: rgba(14, 165, 233, 0.15);
  color: #7dd3fc;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
}

.font-mono {
  font-family: var(--font-mono);
}

@media (max-width: 900px) {
  .workbench-grid {
    grid-template-columns: 1fr;
  }
}
</style>
