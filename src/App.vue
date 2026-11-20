<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import router from './router'
import appHeader from './components/layout/appHeader.vue'
import appFooter from './components/layout/appFooter.vue'
import LoadingSkeleton from './components/layout/LoadingSkeleton.vue'
import { useTemplateStore } from './stores/templateStore.js'

const templateStore = useTemplateStore()
const showLoader = ref(false)
const routerReady = ref(false)
const routeError = ref(false)

let loaderTimeout = null

watch(
  () => templateStore.loading,
  (loading) => {
    clearTimeout(loaderTimeout)

    if (loading) {
      loaderTimeout = setTimeout(() => {
        showLoader.value = true
      }, 150)
    } else {
      showLoader.value = false
    }
  },
  { immediate: true },
)

// O guarda de /admin consulta o perfil ao recarregar a página.
// Mostrar um skeleton enquanto essa consulta acontece evita a tela vazia.
router.onError((error) => {
  console.error('Erro ao carregar a página:', error)
  routeError.value = true
  routerReady.value = true
})

router.isReady()
  .then(() => {
    routerReady.value = true
  })
  .catch((error) => {
    console.error('Erro na navegação inicial:', error)
    routeError.value = true
    routerReady.value = true
  })

onBeforeUnmount(() => {
  clearTimeout(loaderTimeout)
})

function reloadPage() {
  window.location.reload()
}
</script>

<template>
  <div class="tot">
    <appHeader />

    <main v-if="!routerReady" class="route-loading" role="status" aria-live="polite">
      <div class="route-loading-inner">
        <div class="route-placeholder route-placeholder--heading"></div>
        <div class="route-placeholder route-placeholder--subtitle"></div>
        <LoadingSkeleton variant="rows" :count="3" />
        <span class="route-loading-label">Preparando a página...</span>
      </div>
    </main>

    <main v-else-if="routeError" class="route-loading">
      <div class="route-error">
        <h1>Não foi possível abrir esta página</h1>
        <p>Verifique sua conexão e tente novamente.</p>
        <button type="button" @click="reloadPage">Tentar novamente</button>
      </div>
    </main>

    <RouterView v-else />
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

.tot {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.tot > :not(header):not(footer) {
  flex-shrink: 0;
}

.route-loading {
  flex: 1 0 auto !important;
  width: min(1200px, 94%);
  margin: 0 auto;
  padding: 36px 0 56px;
}

.route-loading-inner {
  display: grid;
  gap: 18px;
}

.route-placeholder {
  border-radius: 8px;
  background: #e3eae6;
  animation: route-pulse 1.4s ease-in-out infinite alternate;
}

.route-placeholder--heading {
  width: min(320px, 80%);
  height: 32px;
}

.route-placeholder--subtitle {
  width: min(490px, 95%);
  height: 16px;
}

.route-loading-label {
  color: #647273;
  font-size: 13px;
}

.route-error {
  max-width: 550px;
  padding: 28px;
  border: 1px solid #d6e1df;
  border-radius: 12px;
  background: #fff;
}

.route-error h1 {
  margin-bottom: 12px;
  color: #18332a;
  font-size: 23px;
}

.route-error p {
  margin-bottom: 20px;
  color: #647273;
  line-height: 1.6;
}

.route-error button {
  padding: 11px 18px;
  border: 0;
  border-radius: 8px;
  background: #0a4c34;
  color: #fff;
  cursor: pointer;
}

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
  font-family: 'Comfortaa', sans-serif;
  font-size: 17px;
  font-weight: 700;
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

@keyframes route-pulse {
  to {
    background: #f0f4f1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-placeholder {
    animation: none;
  }
}
</style>
