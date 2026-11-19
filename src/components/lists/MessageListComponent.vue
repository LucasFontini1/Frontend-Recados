<script setup>
import { useMessageStore } from '@/stores/messageStore'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import messageCardComponent from '../cards/messageCardComponent.vue'

const messageStore = useMessageStore()

const emit = defineEmits(['open-detail'])
const carousel = ref(null)
const canPrevious = ref(false)
const canNext = ref(false)

function updateNavigation() {
  const list = carousel.value
  if (!list) return
  canPrevious.value = list.scrollLeft > 3
  canNext.value = list.scrollLeft + list.clientWidth < list.scrollWidth - 3
}

function moveCards(direction) {
  const list = carousel.value
  const firstCard = list?.firstElementChild
  if (!firstCard) return
  const gap = parseFloat(getComputedStyle(list).columnGap) || 0
  const distance = firstCard.getBoundingClientRect().width + gap
  list.scrollBy({
    left: distance * direction,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

watch(() => messageStore.messages.length, async () => {
  await nextTick()
  updateNavigation()
}, { immediate: true })
onMounted(() => window.addEventListener('resize', updateNavigation))

const isDragging = ref(false)
const isSettling = ref(false)
let animationFrame = null
let drag = null
let suppressClick = false

function startDrag(event) {
  if (event.pointerType !== 'mouse' || event.button !== 0) return
  const list = event.currentTarget
  // A barra de rolagem continua usando o comportamento nativo.
  if (event.clientY >= list.getBoundingClientRect().top + list.clientTop + list.clientHeight) return
  cancelAnimationFrame(animationFrame)
  isSettling.value = false
  suppressClick = false
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    scrollLeft: list.scrollLeft,
  }
}

function moveDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return
  const distance = event.clientX - drag.startX
  if (!isDragging.value && Math.abs(distance) < 6) return

  if (!isDragging.value) {
    event.currentTarget.setPointerCapture(event.pointerId)
    isDragging.value = true
    suppressClick = true
  }
  event.preventDefault()
  event.currentTarget.scrollLeft = drag.scrollLeft - distance
}

function settleOnCard(list, startScroll) {
  const card = list.firstElementChild
  if (!card) return
  const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(list).columnGap)
  const distance = list.scrollLeft - startScroll
  const threshold = Math.min(80, step * 0.22)
  const direction = Math.abs(distance) >= threshold ? Math.sign(distance) : 0
  const index = Math.round(startScroll / step) + direction
  const target = Math.max(0, Math.min(index * step, list.scrollWidth - list.clientWidth))
  const from = list.scrollLeft

  isSettling.value = true
  nextTick(() => {
    if (!isSettling.value) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      list.scrollLeft = target
      isSettling.value = false
      return
    }
    const start = performance.now()
    function animate(now) {
      const progress = Math.min((now - start) / 300, 1)
      const eased = 1 - (1 - progress) ** 3
      list.scrollLeft = from + (target - from) * eased
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        isSettling.value = false
        animationFrame = null
      }
    }
    animationFrame = requestAnimationFrame(animate)
  })
}

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return
  const list = event.currentTarget
  const startScroll = drag.scrollLeft
  const wasDragging = isDragging.value
  drag = null
  if (wasDragging) settleOnCard(list, startScroll)
  isDragging.value = false
  if (list.hasPointerCapture(event.pointerId)) {
    list.releasePointerCapture(event.pointerId)
  }
}

function leaveDrag(event) {
  if (!isDragging.value) endDrag(event)
}

function preventDragClick(event) {
  // Arrastar uma imagem nao deve abrir seu link ao soltar o mouse.
  if (suppressClick && event.detail !== 0) {
    event.preventDefault()
    event.stopPropagation()
    suppressClick = false
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', updateNavigation)
  cancelAnimationFrame(animationFrame)
  isSettling.value = false
})

</script>

<template>
  <div class="carousel-header">
    <h1><span class="mdi mdi-calendar-range"></span>Próximos Eventos e Datas</h1>
    <div class="carousel-controls" aria-label="Navegação dos recados">
      <button type="button" aria-label="Ver recado anterior" :disabled="!canPrevious" @click="moveCards(-1)">
        <span class="mdi mdi-chevron-left" aria-hidden="true"></span>
      </button>
      <button type="button" aria-label="Ver próximo recado" :disabled="!canNext" @click="moveCards(1)">
        <span class="mdi mdi-chevron-right" aria-hidden="true"></span>
      </button>
    </div>
  </div>
  <ul
    ref="carousel"
    class="messages"
    :class="{ 'is-dragging': isDragging, 'is-settling': isSettling }"
    tabindex="0"
    aria-label="Recados. Role para os lados para ver mais."
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @lostpointercapture="endDrag"
    @pointerleave="leaveDrag"
    @click.capture="preventDragClick"
    @scroll.passive="updateNavigation"
    @dragstart.prevent
  >
    <li v-for="m in messageStore.messages" :key="m.id">
      <message-card-component :message="m" @open-detail="emit('open-detail', $event)" />
    </li>
  </ul>
</template>

<style scoped>
.carousel-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.carousel-header h1 { flex: 1; min-width: 0; }
.carousel-controls { display: flex; align-items: center; gap: 8px; margin-top: 20px; }
.carousel-controls button { display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border: 1px solid #cbded3; border-radius: 50%; background: #fff; color: #0a4c34; font-size: 25px; cursor: pointer; }
.carousel-controls button:hover:not(:disabled) { background: #e6f1eb; border-color: #0a6a4c; }
.carousel-controls button:disabled { opacity: .35; cursor: not-allowed; }
.carousel-controls button:focus-visible { outline: 2px solid #0a6a4c; outline-offset: 3px; }
@media (max-width: 600px) {
  .carousel-header { gap: 8px; align-items: flex-end; }
  .carousel-header h1 { max-width: calc(100% - 96px); }
  .carousel-controls { gap: 6px; margin-top: 20px; }
  .carousel-controls button { width: 36px; height: 36px; font-size: 23px; }
}

.messages {
  --visible-cards: 1;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  width: 100%;
  min-width: 0;
  margin-top: 10px;
  padding: 4px 2px 16px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 2px;
  scrollbar-width: thin;
  scrollbar-color: #7ca99b #e1e9e6;
  list-style: none;
  cursor: grab;
}

.messages:focus-visible {
  outline: 2px solid #0a6a4c;
  outline-offset: 4px;
  border-radius: 6px;
}

.messages.is-dragging {
  cursor: grabbing;
}

.messages.is-dragging,
.messages.is-settling {
  scroll-snap-type: none;
}

.messages > li {
  box-sizing: border-box;
  flex: 0 0 calc((100% - (var(--visible-cards) - 1) * 20px) / var(--visible-cards));
  min-width: 0;
  scroll-snap-align: start;
}

.messages :deep(img),
.messages :deep(a) {
  -webkit-user-drag: none;
  user-select: none;
}

.messages.is-dragging :deep(*) {
  cursor: grabbing;
  user-select: none;
}

.messages::-webkit-scrollbar {
  height: 8px;
}

.messages::-webkit-scrollbar-track {
  border-radius: 8px;
  background: #e1e9e6;
}

.messages::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #7ca99b;
}

h1 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #0a6a4c;
  font-family: 'comfortaa', sans-serif;
  margin-top: 20px;
}

@media (max-width: 600px) {
  h1 { font-size: 21px; line-height: 1.4; align-items: flex-start; gap: 10px; }
  h1 .mdi { flex-shrink: 0; }
  .messages { gap: 12px; scroll-padding-inline: 0; padding-inline: 0; }
  .messages > li { flex-basis: 100%; }
}
@media (min-width: 800px) {
  .messages {
    --visible-cards: 2;
  }
}

@media (min-width: 1200px) {
  .messages {
    --visible-cards: 3;
  }
}

@media (min-width: 1600px) {
  .messages {
    --visible-cards: 4;
  }
}
</style>
