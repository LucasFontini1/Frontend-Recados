<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
})
const emit = defineEmits(['open-detail'])
const pastoral = computed(() => props.message.pastoral)
const category = computed(() => props.message.category)
const accentColor = computed(() => pastoral.value?.color || category.value?.color || '#0a6a4c')
const publishedDate = computed(() => {
  if (!props.message.created_at) return ''
  const date = new Date(props.message.created_at)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR')
})
</script>

<template>
  <article class="notice-card" :style="{ '--notice-accent': accentColor }">
    <div class="card-cover">
      <span class="cover-icon mdi mdi-bullhorn-outline" aria-hidden="true"></span>
      <span class="cover-caption">Aviso da comunidade</span>
    </div>

    <div class="card-content">
      <div class="card-tags">
        <span v-if="pastoral?.name" class="tag pastoral-tag" :title="pastoral.name">
          {{ pastoral.name }}
        </span>
        <span v-if="category?.name" class="tag category-tag" :title="category.name">
          {{ category.name }}
        </span>
      </div>

      <h2 class="card-title" :title="message.title">{{ message.title }}</h2>
      <p class="card-description" :title="message.text ?? message.content">
        {{ message.text ?? message.content }}
      </p>

      <button type="button" class="detail-button" @click="emit('open-detail', message)">
        Ver detalhes <span class="mdi mdi-arrow-top-right" aria-hidden="true"></span>
      </button>

      <footer class="card-footer">
        <span class="mdi mdi-bullhorn-outline" aria-hidden="true"></span>
        <span>{{ publishedDate ? `Publicado em ${publishedDate}` : 'Aviso da comunidade' }}</span>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.notice-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 364px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #d6e1df;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 3px 8px #163a2c12;
  color: #18332a;
  font-family: 'Comfortaa', sans-serif;
}
.card-cover {
  display: flex;
  flex: 0 0 158px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(140deg, #edf7f1, #d9ebe0);
  color: #0a6a4c;
}
.cover-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid #afd1be;
  border-radius: 50%;
  background: #fff;
  color: var(--notice-accent);
  font-size: 27px;
}
.cover-caption { font-size: 11px; font-weight: 700; }
.card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 20px 20px 16px;
}
.card-tags { display: flex; flex: 0 0 25px; align-items: flex-start; gap: 8px; min-width: 0; margin-bottom: 12px; }
.tag {
  min-width: 0;
  overflow: hidden;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #009ee9;
  font-size: 9px;
  font-weight: 700;
  line-height: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pastoral-tag { border-color: var(--notice-accent); color: var(--notice-accent); }
.category-tag { background: #ecf8ff; }
.card-title, .card-description {
  display: -webkit-box;
  flex-shrink: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
.card-title { max-height: 44px; margin: 0 0 6px; font-size: 16px; font-weight: 700; line-height: 22px; }
.card-description { max-height: 42px; margin: 0; color: #647273; font-size: 12px; line-height: 21px; white-space: pre-line; }
.detail-button {
  display: flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
  margin-top: auto;
  margin-bottom: 8px;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: #0a6a4c;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.detail-button:hover { text-decoration: underline; }
.detail-button:focus-visible { outline: 2px solid #0a6a4c; outline-offset: 3px; border-radius: 3px; }
.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  margin-top: 0;
  padding-top: 12px;
  border-top: 1px solid #d6e1df;
  color: #647273;
  font-size: 11px;
}
.card-footer .mdi { flex-shrink: 0; color: #0a6a4c; font-size: 15px; }
.card-footer span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
