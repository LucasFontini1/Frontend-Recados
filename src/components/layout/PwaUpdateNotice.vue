<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const CHECK_INTERVAL_MS = 30 * 60 * 1000
const RECHECK_NOTICE_MS = 60 * 1000
const SNOOZE_KEY = 'recados_pwa_update_snoozed_until'

const registration = ref(null)
const waitingWorker = ref(null)
const showNotice = ref(false)
const applying = ref(false)

let checkTimer = null
let noticeTimer = null
let observedInstallingWorker = null
let registrationWithListeners = null
let reloadOnControllerChange = false

function isSnoozed() {
  const until = Number(localStorage.getItem(SNOOZE_KEY) || 0)
  return Number.isFinite(until) && Date.now() < until
}

function refreshNotice() {
  const worker = registration.value?.waiting ?? null
  // Na instalação inicial, não há versão anterior para atualizar.
  waitingWorker.value = navigator.serviceWorker.controller ? worker : null
  showNotice.value = Boolean(waitingWorker.value) && !isSnoozed() && !applying.value
}

function watchInstallingWorker(worker) {
  if (!worker || worker === observedInstallingWorker) return
  observedInstallingWorker?.removeEventListener('statechange', refreshNotice)
  observedInstallingWorker = worker
  observedInstallingWorker.addEventListener('statechange', refreshNotice)
  refreshNotice()
}

function onUpdateFound() {
  watchInstallingWorker(registration.value?.installing)
  refreshNotice()
}

function onControllerChange() {
  if (reloadOnControllerChange) {
    window.location.reload()
    return
  }

  // Outro navegador/aba pode ter instalado uma versão sem nossa confirmação.
  refreshNotice()
}

async function checkForUpdates() {
  if (!registration.value || !navigator.onLine) return
  try {
    await registration.value.update()
    refreshNotice()
  } catch (error) {
    console.warn('Não foi possível verificar atualizações do Recados:', error)
  }
}

function onVisible() {
  if (document.visibilityState === 'visible') {
    checkForUpdates()
    refreshNotice()
  }
}

function remindLater() {
  localStorage.setItem(SNOOZE_KEY, String(Date.now() + CHECK_INTERVAL_MS))
  showNotice.value = false
}

function updateNow() {
  const worker = registration.value?.waiting
  if (!worker || applying.value) return

  // A próxima ativação dispara controllerchange e recarrega o aplicativo.
  // O clique não é perdido caso exista algum atraso entre abas.
  applying.value = true
  reloadOnControllerChange = true
  showNotice.value = false
  localStorage.removeItem(SNOOZE_KEY)
  worker.postMessage({ type: 'SKIP_WAITING' })
}

onMounted(async () => {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
  window.addEventListener('online', checkForUpdates)
  window.addEventListener('focus', checkForUpdates)
  document.addEventListener('visibilitychange', onVisible)

  try {
    registration.value = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    })
    registrationWithListeners = registration.value
    registrationWithListeners.addEventListener('updatefound', onUpdateFound)
    watchInstallingWorker(registrationWithListeners.installing)
    refreshNotice()

    // Verifica atualização ao abrir e periodicamente, inclusive no PWA instalado.
    await checkForUpdates()
    checkTimer = window.setInterval(checkForUpdates, CHECK_INTERVAL_MS)
    noticeTimer = window.setInterval(refreshNotice, RECHECK_NOTICE_MS)
  } catch (error) {
    console.warn('Não foi possível preparar as atualizações do Recados:', error)
  }
})

onBeforeUnmount(() => {
  if (checkTimer) window.clearInterval(checkTimer)
  if (noticeTimer) window.clearInterval(noticeTimer)
  registrationWithListeners?.removeEventListener('updatefound', onUpdateFound)
  observedInstallingWorker?.removeEventListener('statechange', refreshNotice)
  navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
  window.removeEventListener('online', checkForUpdates)
  window.removeEventListener('focus', checkForUpdates)
  document.removeEventListener('visibilitychange', onVisible)
})
</script>

<template>
  <aside v-if="showNotice" class="pwa-update-notice" role="status" aria-live="polite">
    <div class="update-icon" aria-hidden="true">
      <span class="mdi mdi-update"></span>
    </div>

    <div class="update-details">
      <strong>Nova versão do Recados disponível!</strong>
      <p>
        Atualize para receber as melhorias. Se estiver preenchendo algo,
        você pode escolher atualizar depois.
      </p>

      <div class="update-actions">
        <button class="later-button" type="button" @click="remindLater">
          Depois
        </button>
        <button class="update-button" type="button" @click="updateNow">
          <span class="mdi mdi-refresh" aria-hidden="true"></span>
          Atualizar agora
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.pwa-update-notice {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9000;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: min(410px, calc(100vw - 32px));
  padding: 18px;
  border: 1px solid #b9d5c5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 35px #153e2c30;
  color: #18332a;
  font-family: 'Comfortaa', sans-serif;
}

.update-icon {
  display: grid;
  flex: 0 0 40px;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e2eee8;
  color: #0a6a4c;
  font-size: 24px;
}

.update-details {
  min-width: 0;
}

.update-details strong {
  display: block;
  margin: 3px 0 8px;
  font-size: 13px;
  line-height: 1.5;
}

.update-details p {
  margin: 0;
  color: #526962;
  font-size: 12px;
  line-height: 1.7;
}

.update-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.update-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 38px;
  padding: 9px 12px;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.later-button {
  border: 1px solid #cbd8d1;
  background: #fff;
  color: #0a4c34;
}

.update-button {
  border: 1px solid #0a4c34;
  background: #0a4c34;
  color: #fff;
}

.update-actions button:hover {
  filter: brightness(.95);
}

.update-actions button:focus-visible {
  outline: 3px solid #0a6a4c;
  outline-offset: 3px;
}

@media (max-width: 520px) {
  .pwa-update-notice {
    right: 12px;
    bottom: 12px;
    gap: 10px;
    padding: 14px;
  }

  .update-icon {
    flex-basis: 32px;
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .update-actions button {
    flex: 1;
  }
}
</style>
