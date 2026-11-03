<script setup lang="ts">
import { computed } from 'vue';
import type { TabId } from '../architecture/tabRoute';
import { useLocale } from '../i18n/locale';
import { DOCS_URL } from '../services/api';
import { LINKS } from '../services/links';

defineProps<{
  activeTab: TabId;
  hasToken: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', tab: TabId): void;
  (e: 'openTokenModal'): void;
}>();

const { t, toggleLocale } = useLocale();

const tabs = computed<{ id: TabId; label: string }[]>(() => [
  { id: 'scenario', label: t.value.nav.blueprint },
  { id: 'workbench', label: t.value.nav.lifecycle },
  { id: 'concurrency', label: t.value.nav.concurrency },
  { id: 'audit', label: t.value.nav.audit },
  { id: 'resilience', label: t.value.nav.resilience },
]);
</script>

<template>
  <header class="header glass-panel">
    <div class="top-row">
      <div class="brand">
        <svg class="logo" viewBox="0 0 440 440" aria-hidden="true">
          <defs>
            <mask id="logo-cut">
              <rect width="440" height="440" fill="white" />
              <polygon points="60,60 160,60 340,340 240,340" fill="none" stroke="black" stroke-width="24" stroke-linejoin="miter" />
            </mask>
          </defs>
          <g mask="url(#logo-cut)">
            <rect x="60" y="60" width="100" height="280" fill="#38BDF8" rx="8" />
            <rect x="240" y="60" width="100" height="280" fill="#38BDF8" rx="8" />
          </g>
          <polygon points="60,60 160,60 340,340 240,340" fill="#80FF00" />
        </svg>
        <div class="brand-text">
          <h1 class="gradient-title">NainPolicy</h1>
          <span class="eyebrow">{{ t.hero.eyebrow }}</span>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-secondary token-btn" @click="emit('openTokenModal')">
          <span :class="['status-dot', hasToken ? 'on' : 'off']" aria-hidden="true"></span>
          <span>{{ t.nav.jwt }}</span>
        </button>
        <a :href="DOCS_URL" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">{{ t.nav.openapi }}</a>
        <a :href="LINKS.repository" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">{{ t.nav.source }}</a>
        <button type="button" class="btn btn-secondary locale-btn" :title="t.nav.switchTitle" :aria-label="`${t.nav.switchLabel}: ${t.nav.switchTitle}`" @click="toggleLocale">{{ t.nav.switchLabel }}</button>
      </div>
    </div>

    <nav class="tabs" aria-label="Sections">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        :class="['tab', { active: activeTab === t.id }]"
        :aria-current="activeTab === t.id ? 'page' : undefined"
        @click="emit('update:activeTab', t.id)"
      >
        {{ t.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.header {
  margin-bottom: 0.75rem;
  padding: 0.85rem 1rem 0 1rem;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 0.75rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.brand-text h1 {
  font-size: 1.5rem;
  line-height: 1.1;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions .btn {
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}

.locale-btn {
  min-width: 44px;
  border-color: rgba(56, 189, 248, 0.45);
  color: var(--accent-cyan);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.on {
  background: var(--brand-green);
  box-shadow: 0 0 8px var(--brand-green);
}

.status-dot.off {
  background: var(--text-dim);
}

.tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  border-top: 1px solid var(--border-subtle);
}

.tab {
  padding: 0.7rem 0.9rem;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
}

.tab:hover {
  color: #ffffff;
}

.tab.active {
  color: var(--brand-green);
  border-bottom-color: var(--brand-green);
}

@media (max-width: 640px) {
  .top-row {
    align-items: flex-start;
  }

  .brand-text .eyebrow {
    font-size: 0.6rem;
    letter-spacing: 0.08em;
  }

  .actions {
    width: 100%;
  }
}
</style>
