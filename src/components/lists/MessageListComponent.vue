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
  const maxScroll = Math.max(0, list.scrollWidth - list.clientWidth)
  currentIndex.value = Math.min(Math.max(Math.round(list.scrollLeft / step), 0), Math.max(count - 1, 0))
  canPrevious.value = list.scrollLeft > 2
  canNext.value = list.scrollLeft < maxScroll - 2
}

function moveCards(direction) {
  const list = carousel.value
  const firstCard = list?.firstElementChild
  if (!firstCard) return
  const gap = parseFloat(getComputedStyle(list).columnGap) || 0
  const step = firstCard.getBoundingClientRect().width + gap
  const maxScroll = Math.max(0, list.scrollWidth - list.clientWidth)
  const target = direction > 0
    ? Math.min(Math.floor((list.scrollLeft + 2) / step + 1) * step, maxScroll)
    : Math.max(Math.ceil((list.scrollLeft - 2) / step - 1) * step, 0)
  list.scrollTo({
    left: target,
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
  const step = card.getBoundingClientRect().width + (parseFloat(getComputedStyle(list).columnGap) || 0)
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
  <div class="carousel-shell">
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
    <button v-if="canPrevious" class="overlay-arrow overlay-arrow--previous"
      type="button" aria-label="Recado anterior" @click="moveCards(-1)">
      <span class="mdi mdi-chevron-left" aria-hidden="true"></span>
    </button>
    <button v-if="canNext" class="overlay-arrow overlay-arrow--next"
      type="button" aria-label="Próximo recado" @click="moveCards(1)">
      <span class="mdi mdi-chevron-right" aria-hidden="true"></span>
    </button>
  </div>
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
.messages {
  max-width: 100%;
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
  scrollbar-width: none;
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
  flex: 0 0 clamp(250px, 31%, 340px);
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
    .messages { gap: 12px; scroll-padding-inline: 0; padding-inline: 0; }
  .messages > li { flex-basis: min(86vw, 320px); }
}

.carousel-shell { position: relative; min-width: 0; width: 100%; }
.overlay-arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid #e0e7e2;
  border-radius: 50%;
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 2px 12px #163a2c35;
  color: #184c36;
  font-size: 26px;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background .2s ease, box-shadow .2s ease;
}
.overlay-arrow:hover { background: #eff7f1; box-shadow: 0 3px 15px #163a2c45; }
.overlay-arrow:focus-visible { outline: 3px solid #0a6a4c; outline-offset: 2px; }
.overlay-arrow--previous { left: 10px; }
.overlay-arrow--next { right: 10px; }
.messages::-webkit-scrollbar { display: none; }
@media (max-width: 600px) {
  .overlay-arrow { width: 32px; height: 32px; font-size: 23px; }
  .overlay-arrow--previous { left: 5px; }
  .overlay-arrow--next { right: 5px; }
}
</style>