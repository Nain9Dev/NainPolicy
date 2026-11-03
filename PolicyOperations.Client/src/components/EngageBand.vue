<script setup lang="ts">
import { useLocale } from '../i18n/locale';
import { LINKS } from '../services/links';

/** Closing call to action (spec 007, REQ-173). States the method, not customers or outcomes. */
const { t } = useLocale();
</script>

<template>
  <section class="glass-panel engage" aria-labelledby="engage-title">
    <div class="engage-text">
      <span class="eyebrow">{{ t.engage.eyebrow }}</span>
      <h2 id="engage-title" class="engage-title">{{ t.engage.title }}</h2>
      <p class="engage-body">{{ t.engage.body }}</p>
    </div>
    <div class="engage-actions">
      <a :href="LINKS.services" target="_blank" rel="noopener noreferrer" class="btn btn-primary">{{ t.engage.primary }} ↗</a>
      <a :href="LINKS.repository" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">{{ t.engage.secondary }} ↗</a>
    </div>
  </section>
</template>

<style scoped>
.engage {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem 2.5rem;
  padding: 1.5rem 1.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  border-color: rgba(128, 255, 0, 0.35);
  background:
    radial-gradient(ellipse at 100% 0%, rgba(128, 255, 0, 0.1), transparent 50%),
    var(--bg-surface);
}

.engage-text {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1 1 420px;
  min-width: 0;
}

.engage-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
}

.engage-body {
  font-size: 0.98rem;
  line-height: 1.55;
  color: #cbd5e1;
  max-width: 70ch;
}

.engage-actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.engage-actions .btn {
  padding: 0.75rem 1.3rem;
  font-size: 0.95rem;
}

@media (max-width: 560px) {
  .engage {
    padding: 1.2rem 1.1rem;
  }

  .engage-actions {
    width: 100%;
  }

  .engage-actions .btn {
    flex: 1 1 100%;
  }
}
</style>
