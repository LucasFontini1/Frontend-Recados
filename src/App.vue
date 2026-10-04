<script setup>
import appHeader from './components/layout/appHeader.vue'
import { useTemplateStore } from './stores/templateStore.js'

const templateStore = useTemplateStore()

</script>

<template>
  <div class="tot">
    <appHeader />
    <RouterView />
  </div>
  <div
    v-if="templateStore.loading"
    class="manual-loading-overlay"
    role="status"
    aria-live="polite"
    aria-label="Carregando"
  >
    <span class="manual-loading-spinner" aria-hidden="true"></span>
    <span>Carregando...</span>
  </div>
</template>

<style>
@import url(/src/css/global.css);

.manual-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #0a4c34a1;
  color: #0a0a0a;
  font-size: 30px;
  font-family: 'comfortaa';
}

.manual-loading-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #d1d5db;
  border-top-color: #333;
  border-radius: 50%;
  animation: manual-loading-spin 0.8s linear infinite;
}

@keyframes manual-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
