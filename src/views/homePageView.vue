<script setup>
import { onMounted, ref } from 'vue'
import { useMessageStore } from '@/stores/messageStore'
import { usePastoralStore } from '@/stores/pastoralStore'
import { useCategoryStore } from '@/stores/categoryStore'
import homeApi from '@/api/homeApi'

const selectedMessage = ref(null)
const messageStore = useMessageStore()
const pastoralStore = usePastoralStore()
const categoryStore = useCategoryStore()

onMounted(async () => {
  try {
    const { data } = await homeApi.get()
    messageStore.hydrate(data)
    pastoralStore.hydrate(data.pastorals ?? [])
    categoryStore.hydrate(data.categories ?? [])
  } catch (error) {
    // O fallback mantém a home funcional enquanto o backend é publicado.
    console.error('Erro ao carregar home agregada:', error)
    await Promise.all([
      messageStore.getAllMessages(),
      pastoralStore.getAllPastorals(),
      categoryStore.getAllCategories(),
    ])
  }
})

import appWelcome from '@/components/layout/appWelcome.vue'
import pastoralFilterComponent from '@/components/filters/pastoralFilterComponent.vue'
import categoryFilterComponent from '@/components/filters/categoryFilterComponent.vue'
import MessageListComponent from '@/components/lists/MessageListComponent.vue';
import generalNoticesListComponent from '@/components/lists/generalNoticesListComponent.vue';
import messageDetailModal from '@/components/cards/messageDetailModal.vue'
</script>

<template>
  <div class="page">
    <appWelcome />
    <div class="filters">
      <pastoralFilterComponent />
      <categoryFilterComponent />
    </div>
    <MessageListComponent @open-detail="selectedMessage = $event" />
    <generalNoticesListComponent @open-detail="selectedMessage = $event" />
    <message-detail-modal :message="selectedMessage" @close="selectedMessage = null" />
  </div>
</template>

<style scoped>
.filters {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
}

@media (max-width: 600px) {
  .filters { flex-direction: column; align-items: stretch; gap: 12px; margin: 18px 0 24px; }
  .filters :deep(.pastoral-filter), .filters :deep(.category-filter) { width: 100%; min-width: 0; margin-top: 0; }
}
</style>
