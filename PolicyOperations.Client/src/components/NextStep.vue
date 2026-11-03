<script setup lang="ts">
import { computed } from 'vue';
import { journeyPosition, nextTab } from '../architecture/journey';
import type { TabId } from '../architecture/tabRoute';
import { useLocale } from '../i18n/locale';
import { format } from '../i18n/messages';
import { LINKS } from '../services/links';

/** The band that closes a tab: where the visitor is on the journey and where to go next (spec 010). */
const props = defineProps<{ tab: TabId }>();
const emit = defineEmits<{ (e: 'navigate', tab: TabId): void }>();
const { t } = useLocale();

const next = computed(() => nextTab(props.tab));
const position = computed(() => journeyPosition(props.tab));
const label = computed(() => (next.value ? t.value.journey.next[next.value] : t.value.journey.finish));
const progress = computed(() => format(t.value.journey.progress, { n: position.value, total: t.value.journey.total }));
</script>

<template>
  <nav class="glass-panel next-step" :aria-label="t.journey.ariaLabel">
    <div class="next-text">
      <span class="eyebrow">{{ progress }}</span>
      <p class="next-lede">{{ next ? t.journey.lede : t.journey.finishLede }}</p>
    </div>
    <button v-if="next" type="button" class="btn btn-primary" @click="emit('navigate', next)">{{ label }} ›</button>
    <a v-else :href="LINKS.services" target="_blank" rel="noopener noreferrer" class="btn btn-primary">{{ label }} ↗</a>
  </nav>
</template>

<style scoped>
.next-step {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem 2rem;
  padding: 1rem 1.4rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  border-color: rgba(128, 255, 0, 0.3);
}

.next-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 320px;
  min-width: 0;
}

.next-lede {
  font-size: 0.95rem;
  color: #cbd5e1;
}

.next-step .btn {
  padding: 0.7rem 1.2rem;
}

@media (max-width: 560px) {
  .next-step .btn {
    width: 100%;
  }
}
</style>
