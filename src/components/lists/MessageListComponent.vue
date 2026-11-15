<script setup>
import { useMessageStore } from '@/stores/messageStore'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import messageCardComponent from '../cards/messageCardComponent.vue'

const messageStore = useMessageStore()
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
  cancelAnimationFrame(animationFrame)
  isSettling.value = false
})

onMounted(async () => {
  await messageStore.getAllMessages()
})
</script>

<template>
  <ul
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
    @dragstart.prevent
  >
    <li v-for="m in messageStore.messages" :key="m.id">
      <message-card-component :message="m" />
    </li>
  </ul>
</template>

<style scoped>
.messages {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  width: 100%;
  min-width: 0;
  margin-top: 20px;
  padding: 4px 2px 16px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
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
  flex: 0 0 min(340px, 88%);
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
</style>
