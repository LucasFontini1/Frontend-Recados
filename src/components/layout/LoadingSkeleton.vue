<script setup>
defineProps({
  variant: {
    type: String,
    default: 'cards',
    validator: (value) => ['cards', 'filters', 'rows'].includes(value),
  },
  count: {
    type: Number,
    default: 3,
  },
})
</script>

<template>
  <div
    class="skeleton"
    :class="`skeleton--${variant}`"
    role="status"
    aria-live="polite"
    aria-label="Carregando informações"
  >
    <span class="sr-only">Carregando informações...</span>

    <template v-if="variant === 'cards'">
      <div v-for="index in count" :key="index" class="skeleton-card" aria-hidden="true">
        <div class="skeleton-block skeleton-cover"></div>
        <div class="skeleton-content">
          <div class="skeleton-block skeleton-tag"></div>
          <div class="skeleton-block skeleton-title"></div>
          <div class="skeleton-block skeleton-line"></div>
          <div class="skeleton-block skeleton-line skeleton-line--short"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'filters'">
      <div v-for="index in count" :key="index" class="skeleton-field" aria-hidden="true">
        <div class="skeleton-block skeleton-label"></div>
        <div class="skeleton-block skeleton-input"></div>
      </div>
    </template>

    <template v-else>
      <div v-for="index in count" :key="index" class="skeleton-row" aria-hidden="true">
        <div class="skeleton-block skeleton-row-title"></div>
        <div class="skeleton-block skeleton-line"></div>
        <div class="skeleton-block skeleton-line skeleton-line--short"></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.skeleton {
  --shimmer-base: #e3eae6;
  --shimmer-light: #f5f8f6;
  min-width: 0;
}

.skeleton--cards {
  display: flex;
  gap: 20px;
  overflow: hidden;
  padding: 4px 0 12px;
}

.skeleton-card {
  flex: 0 0 clamp(250px, 31%, 340px);
  height: 410px;
  overflow: hidden;
  border: 1px solid #d6e1df;
  border-radius: 8px;
  background: #fff;
}

.skeleton-block {
  border-radius: 6px;
  background: linear-gradient(
    110deg,
    var(--shimmer-base) 8%,
    var(--shimmer-light) 18%,
    var(--shimmer-base) 33%
  );
  background-size: 250% 100%;
  animation: skeleton-shimmer 1.5s linear infinite;
}

.skeleton-cover {
  height: 158px;
  border-radius: 0;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 20px;
}

.skeleton-tag {
  width: 37%;
  height: 23px;
}
.skeleton-title {
  width: 77%;
  height: 20px;
}
.skeleton-line {
  width: 100%;
  height: 12px;
}
.skeleton-line--short {
  width: 58%;
}

.skeleton--filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.skeleton-field {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 100%;
  min-width: 0;
}

.skeleton-label {
  width: 76px;
  height: 16px;
}

.skeleton-input {
  width: 280px;
  max-width: 100%;
  height: 42px;
}

.skeleton--rows {
  display: grid;
  gap: 14px;
}

.skeleton-row {
  display: grid;
  gap: 12px;
  min-height: 100px;
  padding: 20px;
  border: 1px solid #e1e9e6;
  border-radius: 10px;
  background: #fff;
}

.skeleton-row-title {
  width: 42%;
  height: 18px;
}

@keyframes skeleton-shimmer {
  to {
    background-position-x: -250%;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 600px) {
  .skeleton--cards {
    gap: 12px;
  }
  .skeleton-card {
    flex-basis: min(86vw, 320px);
  }
  .skeleton--filters {
    flex-direction: column;
  }
  .skeleton-field {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .skeleton-label {
    width: 35%;
  }
  .skeleton-input {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}
</style>
