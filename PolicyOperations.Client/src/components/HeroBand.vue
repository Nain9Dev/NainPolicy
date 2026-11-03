<script setup lang="ts">
import { useLocale } from '../i18n/locale';
import { LINKS } from '../services/links';

/** Value proposition above the blueprint (spec 007, REQ-170, REQ-171). Every proof chip is a verifiable fact. */
const emit = defineEmits<{ (e: 'run'): void }>();
const { t } = useLocale();

const PROOF_LINKS = [LINKS.repository, LINKS.ci, LINKS.repository, LINKS.repository];
</script>

<template>
  <section class="glass-panel hero" aria-labelledby="hero-title">
    <div class="hero-text">
      <span class="eyebrow">{{ t.hero.eyebrow }}</span>
      <h2 id="hero-title" class="hero-title">{{ t.hero.title }}</h2>
      <p class="hero-lede">{{ t.hero.lede }}</p>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary hero-run" @click="emit('run')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3" /></svg>
          <span>{{ t.hero.runCta }}</span>
        </button>
        <a :href="LINKS.services" target="_blank" rel="noopener noreferrer" class="btn btn-secondary hero-talk">{{ t.hero.talkCta }} ↗</a>
      </div>
    </div>
    <ul class="proofs" aria-label="Proof">
      <li v-for="(proof, i) in t.hero.proofs" :key="proof">
        <a :href="PROOF_LINKS[i]" target="_blank" rel="noopener noreferrer" class="proof">
          <span class="proof-dot" aria-hidden="true"></span>
          <span>{{ proof }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(220px, 1fr);
  gap: 1.25rem 2.5rem;
  padding: 1.4rem 1.6rem;
  align-items: center;
  background:
    radial-gradient(ellipse at 90% 10%, rgba(128, 255, 0, 0.08), transparent 55%),
    radial-gradient(ellipse at 10% 100%, rgba(0, 71, 171, 0.35), transparent 60%),
    var(--bg-surface);
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(1.6rem, 2.6vw, 2.2rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.015em;
  color: #ffffff;
  margin: 0;
  max-width: 22ch;
}

.hero-lede {
  font-size: 1rem;
  line-height: 1.55;
  color: #cbd5e1;
  max-width: 62ch;
}

.hero-actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

.hero-run {
  padding: 0.75rem 1.4rem;
  font-size: 0.98rem;
}

.hero-talk {
  padding: 0.75rem 1.2rem;
  font-size: 0.95rem;
}

.proofs {
  list-style: none;
  display: grid;
  gap: 0.5rem;
  align-content: center;
}

.proof {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: rgba(6, 13, 26, 0.5);
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.04em;
  color: #e2e8f0;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.proof:hover {
  border-color: var(--brand-green);
  transform: translateX(2px);
}

.proof-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  background: var(--brand-green);
  box-shadow: 0 0 8px var(--brand-green);
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 1.2rem 1.1rem;
  }

  .proofs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .proofs {
    grid-template-columns: 1fr;
  }

  .hero-actions .btn {
    flex: 1 1 100%;
  }
}
</style>
