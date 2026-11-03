<script setup lang="ts">
import { computed } from 'vue';
import { describeSource } from '../architecture/narration';
import { useLocale } from '../i18n/locale';
import type { ScenarioSource } from '../types/contracts';

/** Honest origin of a result (ADR-007): the simulated label never uses the live colour. */
const props = defineProps<{ source: ScenarioSource }>();
const { locale } = useLocale();
const text = computed(() => describeSource(props.source, locale.value));
</script>

<template>
  <span :class="['source', `source-${source}`]" :title="text.title">
    <span class="source-dot" aria-hidden="true"></span>
    {{ text.label }}
  </span>
</template>

<style scoped>
.source {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid;
  white-space: nowrap;
}

.source-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.source-live {
  color: var(--brand-green);
  border-color: rgba(128, 255, 0, 0.5);
  background: rgba(128, 255, 0, 0.08);
}

.source-live .source-dot {
  box-shadow: 0 0 10px var(--brand-green);
}

.source-simulated {
  color: #ffd27a;
  border-color: rgba(255, 176, 32, 0.5);
  background: rgba(255, 176, 32, 0.08);
}
</style>
