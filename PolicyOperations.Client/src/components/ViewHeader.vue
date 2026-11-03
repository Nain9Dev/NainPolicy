<script setup lang="ts">
/**
 * Plain-language opening of a secondary view (spec 006, REQ-160): what the tab demonstrates in one
 * sentence, then the controls. Styled like the narrator band of the blueprint.
 */
defineProps<{
  eyebrow: string;
  title: string;
  lede: string;
}>();
</script>

<template>
  <header class="glass-panel view-header">
    <div class="view-text">
      <span class="eyebrow">{{ eyebrow }}</span>
      <h2 class="view-title">{{ title }}</h2>
      <p class="view-lede">{{ lede }}</p>
    </div>
    <div v-if="$slots.default" class="view-actions">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.25rem 2rem;
  padding: 1.1rem 1.4rem;
  flex-wrap: wrap;
}

.view-text {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
  flex: 1 1 420px;
}

.view-title {
  font-family: var(--font-heading);
  font-size: 1.55rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: #ffffff;
  margin: 0;
}

.view-lede {
  font-size: 0.98rem;
  line-height: 1.5;
  color: #cbd5e1;
  max-width: 64ch;
}

.view-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

@media (max-width: 760px) {
  .view-header {
    padding: 1rem;
  }

  .view-title {
    font-size: 1.3rem;
  }

  .view-actions {
    width: 100%;
  }
}
</style>
