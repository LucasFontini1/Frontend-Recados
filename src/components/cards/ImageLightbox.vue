<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: 'Imagem da publicação' },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])
const closeButton = ref(null)
const zoom = ref(1)
const offset = ref({ x: 0, y: 0 })
const pointers = new Map()
let previousFocus = null
let previousOverflow = ''
let dragOrigin = null
let pinchOrigin = null

const imageStyle = computed(() => ({
  transform: `translate3d(${offset.value.x}px, ${offset.value.y}px, 0) scale(${zoom.value})`,
  cursor: zoom.value > 1 ? 'grab' : 'zoom-in',
}))

function setZoom(value) {
  zoom.value = Math.max(1, Math.min(4, Math.round(value * 100) / 100))
  if (zoom.value === 1) offset.value = { x: 0, y: 0 }
}

function resetZoom() {
  setZoom(1)
}

function close() {
  emit('close')
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopImmediatePropagation()
    close()
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    setZoom(zoom.value + 0.25)
  } else if (event.key === '-') {
    event.preventDefault()
    setZoom(zoom.value - 0.25)
  } else if (event.key === '0') {
    event.preventDefault()
    resetZoom()
  } else if (event.key === 'Tab') {
    // Mantém os controles do visualizador acessíveis pelo teclado.
    const buttons = [...document.querySelectorAll('.lightbox-panel button')]
    if (!buttons.length) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

function onWheel(event) {
  event.preventDefault()
  setZoom(zoom.value + (event.deltaY < 0 ? 0.2 : -0.2))
}

function onPointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  event.currentTarget.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 1) {
    dragOrigin = { x: event.clientX - offset.value.x, y: event.clientY - offset.value.y }
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    pinchOrigin = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: zoom.value }
  }
}

function onPointerMove(event) {
  if (!pointers.has(event.pointerId)) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 2 && pinchOrigin) {
    const [a, b] = [...pointers.values()]
    const distance = Math.hypot(a.x - b.x, a.y - b.y)
    setZoom((pinchOrigin.zoom * distance) / (pinchOrigin.distance || 1))
  } else if (pointers.size === 1 && zoom.value > 1 && dragOrigin) {
    offset.value = { x: event.clientX - dragOrigin.x, y: event.clientY - dragOrigin.y }
  }
}

function onPointerUp(event) {
  pointers.delete(event.pointerId)
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
  pinchOrigin = null
  if (pointers.size === 1) {
    const [point] = [...pointers.values()]
    dragOrigin = { x: point.x - offset.value.x, y: point.y - offset.value.y }
  } else {
    dragOrigin = null
  }
}

watch(
  () => props.open,
  async (open) => {
    pointers.clear()
    pinchOrigin = null
    dragOrigin = null
    resetZoom()
    if (open) {
      previousFocus = document.activeElement
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      // Capture garante que o Escape feche só o zoom, não o modal de detalhes.
      document.addEventListener('keydown', onKeydown, true)
      await nextTick()
      closeButton.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown, true)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown, true)
  if (props.open) document.body.style.overflow = previousOverflow
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="lightbox-overlay" @click.self="close">
      <section
        class="lightbox-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Visualizador de imagem"
      >
        <header class="lightbox-toolbar">
          <span class="lightbox-title">Visualizar imagem</span>
          <div class="lightbox-actions">
            <button
              type="button"
              aria-label="Diminuir zoom"
              :disabled="zoom <= 1"
              @click="setZoom(zoom - 0.25)"
            >
              <span class="mdi mdi-minus" aria-hidden="true"></span>
            </button>
            <span class="zoom-value" aria-live="polite">{{ Math.round(zoom * 100) }}%</span>
            <button
              type="button"
              aria-label="Aumentar zoom"
              :disabled="zoom >= 4"
              @click="setZoom(zoom + 0.25)"
            >
              <span class="mdi mdi-plus" aria-hidden="true"></span>
            </button>
            <button type="button" aria-label="Restaurar zoom" @click="resetZoom">
              <span class="mdi mdi-fit-to-screen" aria-hidden="true"></span>
            </button>
            <button ref="closeButton" type="button" aria-label="Fechar visualizador" @click="close">
              <span class="mdi mdi-close" aria-hidden="true"></span>
            </button>
          </div>
        </header>

        <div
          class="image-viewport"
          @wheel="onWheel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @dblclick="zoom > 1 ? resetZoom() : setZoom(2)"
        >
          <img :src="src" :alt="alt" :style="imageStyle" draggable="false" />
        </div>
        <p class="lightbox-hint">
          Use a roda do mouse, os botões ou dois dedos para ampliar. Arraste para mover a imagem.
        </p>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: grid;
  place-items: center;
  padding: 12px;
  background: rgba(8, 21, 16, 0.94);
}

.lightbox-panel {
  display: flex;
  flex-direction: column;
  width: min(1250px, 100%);
  height: min(94dvh, 1000px);
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #14251e;
  color: #fff;
  font-family: 'Comfortaa', sans-serif;
}

.lightbox-toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #ffffff2b;
}

.lightbox-title {
  font-size: 12px;
  font-weight: 700;
}

.lightbox-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lightbox-actions button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid #ffffff50;
  border-radius: 8px;
  background: #ffffff16;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
}

.lightbox-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.lightbox-actions button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
.zoom-value {
  min-width: 50px;
  text-align: center;
  font-size: 12px;
}

.image-viewport {
  display: grid;
  flex: 1;
  min-height: 0;
  place-items: center;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.image-viewport img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center center;
  user-select: none;
  -webkit-user-drag: none;
}

.lightbox-hint {
  flex-shrink: 0;
  margin: 0;
  padding: 10px 14px;
  color: #c8d6cf;
  text-align: center;
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 540px) {
  .lightbox-overlay {
    padding: 0;
  }
  .lightbox-panel {
    width: 100%;
    height: 100dvh;
    border-radius: 0;
  }
  .lightbox-toolbar {
    padding: 8px;
  }
  .lightbox-title {
    display: none;
  }
  .lightbox-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .lightbox-hint {
    font-size: 10px;
  }
}
</style>
