<script setup>
defineProps({
  configurations: { type: Object, required: true },
  activeTab: { type: String, required: true },
})
const emit = defineEmits(['change'])
</script>

<template>
  <nav class="tabs" aria-label="Seções do painel">
    <button
      v-for="(config, key) in configurations"
      :key="key"
      type="button"
      :class="{ active: activeTab === key }"
      @click="emit('change', key)"
    >
      {{ config.name }}
    </button>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin: 26px 0;
  padding-bottom: 6px;
}
.tabs button {
  white-space: nowrap;
  background: #ecf3ee;
  color: #0a4c34;
}
.tabs button.active {
  color: white;
  background: #0a4c34;
}
button {
  border: 0;
  border-radius: 8px;
  padding: 12px 18px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: #0a4c34;
  color: white;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (max-width: 600px) {
  .tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 18px 0;
    padding: 0;
    gap: 8px;
    overflow: visible;
  }
  .tabs button {
    min-width: 0;
    width: 100%;
    white-space: normal;
    padding: 12px 8px;
    line-height: 1.35;
    min-height: 44px;
  }
}
@media (max-width: 360px) {
  .tabs {
    margin-inline: 0;
    padding-inline: 0;
  }
}
</style>
