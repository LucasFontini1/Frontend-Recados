<script setup>
import { computed, nextTick, onBeforeUnmount, watch, ref } from 'vue'

const props = defineProps({
  message: { type: Object, default: null },
})
const emit = defineEmits(['close'])
const closeButton = ref(null)
let previousFocus = null
let previousOverflow = ''

const isNotice = computed(() => Boolean(props.message?.is_notice))
const imageUrl = computed(() => props.message?.image?.url || '')
const publishedDate = computed(() => formatDate(props.message?.created_at))
const eventDate = computed(() => formatDate(props.message?.event_date, true))

function formatDate(value, withTime = false) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', withTime
    ? { dateStyle: 'long', timeStyle: 'short' }
    : { dateStyle: 'long' }).format(date)
}

function close() { emit('close') }
function onKeydown(event) {
  if (event.key === 'Escape') close()
  if (event.key !== 'Tab') return
  const dialog = closeButton.value?.closest('[role="dialog"]')
  if (!dialog) return
  const targets = [...dialog.querySelectorAll('a[href], button:not([disabled])')]
  const first = targets[0]
  const last = targets[targets.length - 1]
  if (!first) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.message, async (message, oldMessage) => {
  if (message && !oldMessage) {
    previousFocus = document.activeElement
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else if (!message && oldMessage) {
    document.body.style.overflow = previousOverflow
    document.removeEventListener('keydown', onKeydown)
    previousFocus?.focus?.()
  }
})
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="message" class="modal-overlay" @click.self="close">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="recado-modal-title"
        class="modal-panel"
      >
        <header class="modal-topbar">
          <span class="modal-type">{{ isNotice ? 'Aviso geral' : 'Evento ou recado' }}</span>
          <button ref="closeButton" type="button" class="close-button" aria-label="Fechar detalhes" @click="close">
            <span class="mdi mdi-close" aria-hidden="true"></span>
          </button>
        </header>

        <div class="modal-body">
          <h2 id="recado-modal-title">{{ message.title }}</h2>
          <div v-if="message.pastoral || message.category" class="modal-tags">
            <span v-if="message.pastoral" class="modal-tag" :style="{ '--tag-color': message.pastoral.color || '#0a6a4c' }">
              {{ message.pastoral.name }}
            </span>
            <span v-if="message.category" class="modal-tag">
              {{ message.category.name }}
            </span>
          </div>

          <a v-if="imageUrl" :href="imageUrl" target="_blank" rel="noopener noreferrer" class="modal-image-link" aria-label="Abrir imagem em tamanho original">
            <img :src="imageUrl" :alt="message.title" class="modal-image" />
            <small>Toque na imagem para abrir em tamanho original</small>
          </a>

          <div v-if="eventDate && !isNotice" class="modal-event">
            <span class="mdi mdi-calendar-clock" aria-hidden="true"></span>
            <div><strong>Data do evento</strong><p>{{ eventDate }}</p></div>
          </div>

          <div class="modal-description">{{ message.text ?? message.content }}</div>
          <footer class="modal-footer">
            <span v-if="message.autor?.name">Publicado por {{ message.autor.name }}</span>
            <span v-if="publishedDate">Publicado em {{ publishedDate }}</span>
          </footer>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(14, 32, 24, .72); }
.modal-panel { display: flex; flex-direction: column; width: min(640px, 100%); max-height: min(90dvh, 900px); overflow: hidden; border-radius: 18px; background: #fff; color: #18332a; box-shadow: 0 18px 75px #0a1e1747; font-family: 'Comfortaa', sans-serif; }
.modal-topbar { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; padding: 14px 20px; border-bottom: 1px solid #e0e9e3; }
.modal-type { color: #0a6a4c; font-size: 12px; font-weight: 700; }
.close-button { display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #e9f3ed; color: #0a4c34; font-size: 23px; cursor: pointer; }
.close-button:hover, .close-button:focus-visible { background: #d0e7d9; }
.modal-body { min-height: 0; overflow-y: auto; padding: 22px 26px 28px; overscroll-behavior: contain; }
h2 { margin: 0 0 16px; font-size: clamp(21px, 4vw, 28px); line-height: 1.4; overflow-wrap: anywhere; }
.modal-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.modal-tag { padding: 7px 10px; border: 1px solid var(--tag-color, #d5e2dc); border-radius: 7px; color: var(--tag-color, #0a4c34); font-size: 11px; font-weight: 600; }
.modal-image-link { display: block; margin-bottom: 20px; color: #647273; text-align: center; text-decoration: none; }
.modal-image { display: block; max-width: 100%; max-height: 360px; width: 100%; object-fit: contain; border-radius: 10px; background: #edf3f0; }
.modal-image-link small { display: block; margin-top: 8px; font-size: 10px; }
.modal-event { display: flex; align-items: start; gap: 12px; margin-bottom: 20px; padding: 15px; border-radius: 10px; background: #edf6f1; color: #0a4c34; }
.modal-event .mdi { font-size: 24px; }
.modal-event strong { font-size: 12px; }
.modal-event p { margin-top: 6px; font-size: 13px; line-height: 1.6; }
.modal-description { font-size: 14px; line-height: 1.9; white-space: pre-wrap; overflow-wrap: anywhere; }
.modal-footer { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-top: 26px; padding-top: 16px; border-top: 1px solid #e0e9e3; color: #647273; font-size: 11px; line-height: 1.7; }
@media (max-width: 600px) {
  .modal-overlay { padding: 10px; align-items: center; }
  .modal-panel { max-height: 92dvh; border-radius: 13px; }
  .modal-topbar { padding: 10px 14px; }
  .modal-body { padding: 18px 16px 24px; }
  .modal-image { max-height: 240px; }
  .modal-description { font-size: 13px; }
}
</style>
