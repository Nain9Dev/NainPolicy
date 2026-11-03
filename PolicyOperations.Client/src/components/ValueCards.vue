<script setup lang="ts">
import { computed } from 'vue';
import type { TabId } from '../architecture/tabRoute';
import { useLocale } from '../i18n/locale';
import { LINKS } from '../services/links';

/** Problem → what happens here → show me (spec 007, REQ-172). Card order matches the catalogue. */
const emit = defineEmits<{ (e: 'navigate', tab: TabId): void }>();
const { t } = useLocale();

interface Target {
  tab?: TabId;
  href?: string;
}

const TARGETS: Target[] = [{ tab: 'concurrency' }, { tab: 'audit' }, { href: LINKS.traceability }, { tab: 'resilience' }];

const cards = computed(() => t.value.value.cards.map((card, i) => ({ ...card, ...TARGETS[i] })));

function open(card: Target) {
  if (card.tab) emit('navigate', card.tab);
}
</script>

<template>
  <section class="value" aria-labelledby="value-title">
    <div class="value-head">
      <span class="eyebrow">{{ t.value.eyebrow }}</span>
      <h2 id="value-title" class="value-title">{{ t.value.title }}</h2>
    </div>
    <ul class="cards">
      <li v-for="(card, i) in cards" :key="card.problem" class="glass-panel card">
        <span class="card-index font-mono">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3 class="card-problem">{{ card.problem }}</h3>
        <p class="card-answer">{{ card.answer }}</p>
        <a v-if="card.href" :href="card.href" target="_blank" rel="noopener noreferrer" class="card-cta">{{ card.cta }} ↗</a>
        <button v-else type="button" class="card-cta" @click="open(card)">{{ card.cta }} ›</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.value {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 1rem;
}

.value-head {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0 0.25rem;
}

.value-title {
  font-family: var(--font-heading);
  font-size: 1.45rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
}

.cards {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.1rem 1.1rem 1rem;
  position: relative;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card:hover {
  border-color: var(--accent-cyan);
  transform: translateY(-2px);
}

.card-index {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: var(--brand-green);
}

.card-problem {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
  color: #ffffff;
  margin: 0;
}

.card-answer {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #cbd5e1;
  flex: 1;
}

.card-cta {
  align-self: flex-start;
  margin-top: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-green);
  padding: 0.35rem 0;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s ease;
}

.card-cta:hover {
  border-color: var(--brand-green);
}

@media (max-width: 1000px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
