<script setup>
import { useMessageStore } from '@/stores/messageStore'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import messageCardComponent from '../cards/messageCardComponent.vue'

const messageStore = useMessageStore()

const emit = defineEmits(['open-detail'])
const carousel = ref(null)
const canPrevious = ref(false)
const canNext = ref(false)
const currentIndex = ref(0)

function updateNavigation() {
  const list = carousel.value
  if (!list) return
  const firstCard = list.firstElementChild
  const count = list.children.length
  const gap = parseFloat(getComputedStyle(list).columnGap) || 0
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 1
  currentIndex.value = Math.min(Math.max(Math.round(list.scrollLeft / step), 0), Math.max(count - 1, 0))
  canPrevious.value = count > 1 && currentIndex.value > 0
  canNext.value = count > 1 && currentIndex.value < count - 1
}

function moveCards(direction) {
  const list = carousel.value
  const firstCard = list?.firstElementChild
  if (!firstCard) return
  const gap = parseFloat(getComputedStyle(list).columnGap) || 0
  const step = firstCard.getBoundingClientRect().width + gap
  const target = Math.max(0, Math.min(currentIndex.value + direction, list.children.length - 1))
  list.scrollTo({
    left: target * step,
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
  <section class="events-section" aria-labelledby="events-heading">
    <header class="section-header">
      <div class="heading-row">
        <span class="section-icon mdi mdi-calendar-range" aria-hidden="true"></span>
        <h1 id="events-heading">Próximos Eventos e Datas</h1>
        <span class="item-count" :aria-label="`${messageStore.messages.length} eventos e recados`">{{ messageStore.messages.length }}</span>
      </div>
      <div class="description-row">
        <p class="section-description">Acompanhe os próximos encontros e celebrações.</p>
      </div>
    </header>
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
  <nav class="carousel-navigation" aria-label="Navegar entre recados">
    <button class="carousel-arrow" type="button" aria-label="Recado anterior"
      :disabled="!canPrevious" @click="moveCards(-1)">
      <span aria-hidden="true">←</span>
    </button>
    <span class="carousel-position" role="status" aria-live="polite">
      {{ messageStore.messages.length ? currentIndex + 1 : 0 }}
      de {{ messageStore.messages.length }}
    </span>
    <button class="carousel-arrow" type="button" aria-label="Próximo recado"
      :disabled="!canNext" @click="moveCards(1)">
      <span aria-hidden="true">→</span>
    </button>
  </nav>
  </section>
</template>

<style scoped>
.events-section { min-width: 0; margin-top: 24px; font-family: 'Comfortaa', sans-serif; }
.section-header { margin-bottom: 14px; }
.heading-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
.section-icon { display: grid; place-items: center; flex-shrink: 0; width: 36px; height: 36px; border-radius: 6px; background: #e2eee8; color: #0a6a4c; font-size: 22px; }
h1 { margin: 0; min-width: 0; color: #0a6a4c; font-size: 28px; font-weight: 700; line-height: 1.4; }
.item-count { display: grid; flex-shrink: 0; place-items: center; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 20px; background: #e2eee8; color: #0a6a4c; font-size: 11px; font-weight: 700; }
.description-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 46px; margin-top: 6px; }
.section-description { min-width: 0; margin: 0; color: #647273; font-size: 12px; line-height: 20px; }
.carousel-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.carousel-controls button { display: grid; place-items: center; flex-shrink: 0; width: 42px; height: 42px; border: 1px solid #abcabc; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px #163a2c14; color: #0a4c34; font-size: 27px; cursor: pointer; }
.carousel-controls button:hover:not(:disabled) { border-color: #0a6a4c; background: #e6f1eb; }
.carousel-controls button:disabled { opacity: .48; cursor: not-allowed; }
.carousel-controls button:focus-visible { outline: 2px solid #0a6a4c; outline-offset: 3px; }
.messages {
  max-width: 400px;
  --visible-cards: 1;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  width: 100%;
  min-width: 0;
  margin-top: 10px;
  padding: 4px 0 12px;
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
  flex: 0 0 100%;
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

@media (max-width: 600px) {
  .events-section { margin-top: 22px; }
  .heading-row { gap: 8px; }
  h1 { font-size: 21px; }
  .section-icon { width: 32px; height: 32px; font-size: 19px; }
  .description-row { gap: 10px; }
  .carousel-controls { gap: 6px; }
  .carousel-controls button { width: 38px; height: 38px; font-size: 24px; }
  .messages { gap: 12px; scroll-padding-inline: 0; padding-inline: 0; }
  .messages > li { flex-basis: 100%; }
}


.carousel-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: min(100%, 400px);
  margin-top: 8px;
  padding: 10px 4px;
}
.carousel-arrow {
  display: grid;
  place-items: center;
  width: 52px;
  height: 48px;
  border: 1px solid #0a6a4c;
  border-radius: 12px;
  background: #0a4c34;
  color: #fff;
  font: 700 29px/1 system-ui, sans-serif;
  cursor: pointer;
  transition: background .18s ease;
}
.carousel-arrow:hover:not(:disabled) { background: #0a6a4c; }
.carousel-arrow:focus-visible { outline: 3px solid #0a6a4c; outline-offset: 3px; }
.carousel-arrow:disabled { opacity: .45; cursor: not-allowed; background: #e5ece7; color: #0a4c34; }
.carousel-position { color: #0a4c34; font-family: 'Comfortaa', sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap; }

</style>