<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const installPrompt = ref(null)
const installed = ref(false)
const checkingInstallation = ref(true)
const knownInstalled = ref(false)
let displayModeQuery = null
const showInstructions = ref(false)
const isIOS = ref(false)
const isMobile = ref(false)

const hint = computed(() => {
  if (isIOS.value) {
    return 'No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.'
  }
  if (isMobile.value) {
    return 'Abra o menu do navegador (⋮) e escolha Instalar aplicativo ou Adicionar à tela inicial.'
  }
  return 'Procure o ícone de instalação na barra de endereços ou a opção Instalar no menu do navegador.'
})

async function checkInstalled() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true

  // getInstalledRelatedApps é suportado somente por alguns navegadores.
  // Em outros, não existe API que confirme se o PWA está instalado em
  // uma janela normal do navegador.
  let relatedInstalled = false
  if (typeof navigator.getInstalledRelatedApps === 'function') {
    try {
      const apps = await navigator.getInstalledRelatedApps()
      relatedInstalled = apps.some(app =>
        app.platform === 'webapp' ||
        app.url === window.location.origin + '/'
      )
    } catch {
      // A ausência dessa informação não deve impedir a instalação.
    }
  }

  const previouslyInstalled = localStorage.getItem('recados_pwa_installed') === 'true'
  knownInstalled.value = standalone || relatedInstalled || previouslyInstalled
  installed.value = knownInstalled.value
  checkingInstallation.value = false
}

function onInstallAvailable(event) {
  event.preventDefault()
  // Se o navegador oferecer uma nova instalação, a instalação anterior
  // pode ter sido removida. Permite instalar novamente nesse caso.
  knownInstalled.value = false
  installed.value = false
  localStorage.removeItem('recados_pwa_installed')
  installPrompt.value = event
  showInstructions.value = false
}

function onInstalled() {
  installed.value = true
  knownInstalled.value = true
  localStorage.setItem('recados_pwa_installed', 'true')
  installPrompt.value = null
  showInstructions.value = false
}

async function install() {
  if (installPrompt.value) {
    const prompt = installPrompt.value
    installPrompt.value = null
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice?.outcome === 'accepted') {
      onInstalled()
    }
    return
  }

  showInstructions.value = !showInstructions.value
}

onMounted(() => {
  isIOS.value = /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  isMobile.value = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  displayModeQuery = window.matchMedia('(display-mode: standalone)')
  displayModeQuery.addEventListener('change', checkInstalled)
  window.addEventListener('focus', checkInstalled)
  window.addEventListener('pageshow', checkInstalled)
  checkInstalled()

  window.addEventListener('beforeinstallprompt', onInstallAvailable)
  window.addEventListener('appinstalled', onInstalled)
})

onBeforeUnmount(() => {
  displayModeQuery?.removeEventListener('change', checkInstalled)
  window.removeEventListener('focus', checkInstalled)
  window.removeEventListener('pageshow', checkInstalled)
  window.removeEventListener('beforeinstallprompt', onInstallAvailable)
  window.removeEventListener('appinstalled', onInstalled)
})
</script>

<template>
  <div v-if="!installed && !checkingInstallation" class="pwa-install">
    <button
      type="button"
      class="install-button"
      :aria-expanded="showInstructions"
      @click="install"
    >
      <span class="mdi mdi-download" aria-hidden="true"></span>
      <span>Instalar aplicativo</span>
    </button>

    <div v-if="showInstructions" class="install-help" role="status">
      <p>{{ hint }}</p>
      <button type="button" class="close-help" @click="showInstructions = false">
        Fechar
      </button>
    </div>
  </div>
</template>

<style scoped>
.pwa-install {
  position: relative;
  min-width: 0;
}

.install-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  width: 100%;
  border: 1px solid #a5c8b4;
  border-radius: 10px;
  padding: 10px 13px;
  background: #e8f3ec;
  color: #0a4c34;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.install-button:hover {
  background: #d6e9dc;
}

.install-button:focus-visible,
.close-help:focus-visible {
  outline: 3px solid #0a6a4c;
  outline-offset: 2px;
}

.install-button .mdi {
  font-size: 18px;
}

.install-help {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 100;
  width: min(300px, calc(100vw - 28px));
  padding: 16px;
  border: 1px solid #d6e1df;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 25px #163a2c33;
  color: #18332a;
}

.install-help p {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.65;
}

.close-help {
  border: 0;
  background: transparent;
  color: #0a4c34;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 520px) {
  .install-help {
    right: auto;
    left: 0;
  }

  .install-button {
    padding: 9px 10px;
    font-size: 11px;
    white-space: normal;
  }
}
</style>
