<script setup>
import appHeader from './components/layout/appHeader.vue'
import appFooter from './components/layout/appFooter.vue'
import { useTemplateStore } from './stores/templateStore.js'
import { ref, watch, onBeforeUnmount } from 'vue'

const templateStore = useTemplateStore()
const showLoader = ref(false)
let loaderTimeout = null
watch(() => templateStore.loading, loading => {
  clearTimeout(loaderTimeout)
  if (loading) {
    loaderTimeout = setTimeout(() => { showLoader.value = true }, 150)
  } else {
    showLoader.value = false
  }
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(loaderTimeout))

</script>

<template>
  <div class="tot">
    <appHeader />
    <RouterView />
    <appFooter />
  </div>
  <div
    v-if="showLoader"
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

.tot { min-height: 100dvh; display: flex; flex-direction: column; }
.tot > :not(header):not(footer) { flex-shrink: 0; }

.manual-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(10, 45, 33, 0.76);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  font-family: 'Comfortaa', sans-serif;
  backdrop-filter: blur(3px);
}

.manual-loading-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: manual-loading-spin 0.8s linear infinite;
}

@keyframes manual-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
