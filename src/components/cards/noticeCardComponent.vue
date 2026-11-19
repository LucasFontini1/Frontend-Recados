<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const pastoral = computed(() => props.message.pastoral)
const accentColor = computed(() => pastoral.value?.color || props.message.category?.color || '#0a6a4c')
const publishedDate = computed(() => {
  if (!props.message.created_at) return ''
  const date = new Date(props.message.created_at)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date).replace(/\./g, '')
})
</script>

<template>
  <article class="notice-card" :style="{ '--notice-accent': accentColor }">
    <div class="card-content">
      <span class="notice-label">Avisos</span>
      <h2 class="card-title" :title="message.title">{{ message.title }}</h2>
      <p class="card-description">{{ message.text ?? message.content }}</p>
    </div>
    <footer class="card-footer">
      <div class="card-credit">
        <span v-if="pastoral?.name" class="pastoral" :title="pastoral.name">{{ pastoral.name }}</span>
        <span v-if="pastoral?.name && message.autor?.name" class="separator" aria-hidden="true">·</span>
        <span v-if="message.autor?.name" class="owner" :title="message.autor.name">{{ message.autor.name }}</span>
      </div>
      <time v-if="publishedDate" :datetime="message.created_at">{{ publishedDate }}</time>
    </footer>
  </article>
</template>

<style scoped>
.notice-card {
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 250px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid var(--notice-accent);
  border-left-width: 4px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 3px 8px #163a2c18;
  color: #18332a;
  font-family: 'Comfortaa', sans-serif;
}

.card-content {
  flex: 1;
  min-height: 0;
}

.notice-label {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 4px;
  background: #ffe8d6;
  color: #8a3d2a;
  font-size: 10px;
  font-weight: 700;
  line-height: 13px;
}

.card-title {
  display: -webkit-box;
  overflow: hidden;
  margin: 16px 0 8px;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.card-description {
  display: -webkit-box;
  overflow: hidden;
  color: #647273;
  font-size: 12px;
  line-height: 21px;
  white-space: pre-line;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.card-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #d6e1df;
  color: #647273;
  font-size: 10px;
  line-height: 16px;
}

.card-credit {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.pastoral,
.owner {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pastoral {
  color: var(--notice-accent);
  font-weight: 700;
}

.separator,
time {
  flex-shrink: 0;
}
</style>
