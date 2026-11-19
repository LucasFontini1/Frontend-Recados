<script setup>
import { useMessageStore } from '@/stores/messageStore'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import noticeCardComponent from '../cards/noticeCardComponent.vue'

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

watch(() => messageStore.notices.length, async () => {
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
  <section class="notices-section" aria-labelledby="notices-heading">
    <header class="section-header">
      <div class="heading-row">
        <span class="section-icon mdi mdi-shield-check-outline" aria-hidden="true"></span>
        <h1 id="notices-heading">Avisos Gerais</h1>
        <span class="notice-count" :aria-label="`${messageStore.notices.length} avisos`">{{ messageStore.notices.length }}</span>
      </div>
      <div class="description-row">
        <p class="section-description">Informações importantes da nossa comunidade.</p>
        <div class="carousel-controls" aria-label="Navegação dos avisos">
          <button type="button" aria-label="Ver aviso anterior" :disabled="!canPrevious" @click="moveCards(-1)">
            <span class="mdi mdi-chevron-left" aria-hidden="true"></span>
          </button>
          <button type="button" aria-label="Ver próximo aviso" :disabled="!canNext" @click="moveCards(1)">
            <span class="mdi mdi-chevron-right" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </header>
    <ul
      ref="carousel"
      class="notices"
      :class="{ 'is-dragging': isDragging, 'is-settling': isSettling }"
      tabindex="0"
      aria-label="Avisos gerais. Role para os lados para ver mais."
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
      <li v-for="notice in messageStore.notices" :key="notice.id">
        <notice-card-component :message="notice" @open-detail="emit('open-detail', $event)" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.description-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.description-row .section-description { min-width: 0; }
.carousel-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.carousel-controls button { display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid #cbded3; border-radius: 50%; background: #fff; color: #0a4c34; font-size: 25px; cursor: pointer; }
.carousel-controls button:hover:not(:disabled) { background: #e6f1eb; border-color: #0a6a4c; }
.carousel-controls button:disabled { opacity: .35; cursor: not-allowed; }
.carousel-controls button:focus-visible { outline: 2px solid #0a6a4c; outline-offset: 3px; }
@media (max-width: 600px) {
  .description-row .section-description { flex: 1; }
  .carousel-controls { gap: 6px; }
  .carousel-controls button { width: 36px; height: 36px; font-size: 23px; }
}

.notices {
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

.notices:focus-visible {
  outline: 2px solid #0a6a4c;
  outline-offset: 4px;
  border-radius: 6px;
}

.notices.is-dragging {
  cursor: grabbing;
}

.notices.is-dragging,
.notices.is-settling {
  scroll-snap-type: none;
}

.notices > li {
  box-sizing: border-box;
  flex: 0 0 calc((100% - (var(--visible-cards) - 1) * 20px) / var(--visible-cards));
  min-width: 0;
  scroll-snap-align: start;
}

.notices :deep(img),
.notices :deep(a) {
  -webkit-user-drag: none;
  user-select: none;
}

.notices.is-dragging :deep(*) {
  cursor: grabbing;
  user-select: none;
}

.notices::-webkit-scrollbar {
  height: 8px;
}

.notices::-webkit-scrollbar-track {
  border-radius: 8px;
  background: #e1e9e6;
}

.notices::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #7ca99b;
}

.notices-section {
  min-width: 0;
  margin-top: 40px;
  font-family: 'Comfortaa', sans-serif;
}

.section-header {
  margin-bottom: 22px;
}

.heading-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  display: grid;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 6px;
  background: #e2eee8;
  color: #0a6a4c;
  font-size: 22px;
}

h1 {
  margin: 0;
  color: #0a6a4c;
  font-family: 'Comfortaa', sans-serif;
  font-size: 28px;
  font-weight: 700;
}

.notice-count {
  display: grid;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  place-items: center;
  border-radius: 20px;
  background: #e2eee8;
  color: #0a6a4c;
  font-size: 11px;
  font-weight: 700;
}

.section-description {
  margin: 8px 0 0 46px;
  color: #647273;
  font-size: 12px;
  line-height: 20px;
}

@media (max-width: 600px) {
  .notices-section { margin-top: 30px; }
  .heading-row { gap: 8px; align-items: center; }
  h1 { font-size: 21px; line-height: 1.4; }
  .section-icon { width: 32px; height: 32px; font-size: 19px; }
  .section-description { margin: 8px 0 0; font-size: 12px; }
  .notices { gap: 12px; scroll-padding-inline: 0; padding-inline: 0; }
  .notices > li { flex-basis: 100%; }
}
@media (min-width: 800px) {
  .notices {
    --visible-cards: 2;
  }
}

@media (min-width: 1200px) {
  .notices {
    --visible-cards: 3;
  }
}

@media (min-width: 1600px) {
  .notices {
    --visible-cards: 4;
  }
}
</style>
