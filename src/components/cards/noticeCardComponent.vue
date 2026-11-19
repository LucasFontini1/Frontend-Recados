<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
})
const emit = defineEmits(['open-detail'])
const pastoral = computed(() => props.message.pastoral)
const category = computed(() => props.message.category)
const accentColor = computed(() => pastoral.value?.color || category.value?.color || '#0a6a4c')
const authorName = computed(() => props.message.autor?.name || props.message.autor?.username || '')
const publishedDate = computed(() => {
  if (!props.message.created_at) return ''
  const date = new Date(props.message.created_at)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
})
</script>

<template>
  <article class="notice-card" :style="{ '--notice-accent': accentColor }">
    <div class="card-main">
      <span class="notice-label">Avisos</span>
      <h2 class="card-title" :title="message.title">{{ message.title }}</h2>
      <p class="card-description">{{ message.text ?? message.content }}</p>
      <button class="detail-button" type="button" @click="emit('open-detail', message)">
        Ver detalhes <span class="mdi mdi-arrow-top-right" aria-hidden="true"></span>
      </button>
    </div>

    <footer class="card-footer">
      <div class="footer-info">
        <span v-if="pastoral?.name" class="pastoral-name" :title="pastoral.name">{{ pastoral.name }}</span>
        <span v-if="pastoral?.name && (authorName || category?.name)" aria-hidden="true">·</span>
        <span v-if="authorName || category?.name" class="footer-description">
          {{ authorName || category.name }}
        </span>
      </div>
      <time v-if="publishedDate" :datetime="message.created_at">{{ publishedDate }}</time>
    </footer>
  </article>
</template>

<style scoped>
.notice-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 280px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--notice-accent);
  border-left: 4px solid var(--notice-accent);
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 3px 8px #163a2c12;
  color: #18332a;
  font-family: 'Comfortaa', sans-serif;
}
.card-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 18px 20px 10px;
}
.notice-label {
  align-self: flex-start;
  margin-bottom: 16px;
  padding: 6px 8px;
  border-radius: 4px;
  background: #ffebdc;
  color: #9e4829;
  font-size: 10px;
  font-weight: 700;
}
.card-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.card-description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  margin: 0;
  color: #647273;
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-line;
}
.detail-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: auto;
  padding: 8px 0 5px;
  border: 0;
  background: transparent;
  color: #0a6a4c;
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.detail-button:hover { text-decoration: underline; }
.detail-button:focus-visible { outline: 2px solid #0a6a4c; outline-offset: 3px; }
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 45px;
  margin: 0 20px;
  padding: 10px 0;
  border-top: 1px solid #d6e1df;
  color: #647273;
  font-size: 10px;
}
.footer-info {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}
.pastoral-name, .footer-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pastoral-name { flex-shrink: 0; max-width: 45%; color: var(--notice-accent); font-weight: 700; }
.footer-description { min-width: 0; }
.card-footer time { flex-shrink: 0; white-space: nowrap; }
@media (max-width: 600px) {
  .card-main { padding: 16px 15px 8px; }
  .card-footer { margin: 0 15px; }
}
</style>
