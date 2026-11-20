<script setup>
import { onMounted, ref } from 'vue'
import { useMessageStore } from '@/stores/messageStore'
import { usePastoralStore } from '@/stores/pastoralStore'
import { useCategoryStore } from '@/stores/categoryStore'
import homeApi from '@/api/homeApi'

import LoadingSkeleton from '@/components/layout/LoadingSkeleton.vue'

const selectedMessage = ref(null)
const loadingHome = ref(true)
const homeError = ref(false)
const messageStore = useMessageStore()
const pastoralStore = usePastoralStore()
const categoryStore = useCategoryStore()

onMounted(async () => {
  loadingHome.value = true
  homeError.value = false
  try {
    const { data } = await homeApi.get()
    messageStore.hydrate(data)
    pastoralStore.hydrate(data.pastorals ?? [])
    categoryStore.hydrate(data.categories ?? [])
  } catch (error) {
    // O fallback mantém a home funcional enquanto o backend é publicado.
    console.error('Erro ao carregar home agregada:', error)
    try {
      await Promise.all([
        messageStore.getAllMessages(),
        pastoralStore.getAllPastorals(),
        categoryStore.getAllCategories(),
      ])
      homeError.value = messageStore.haveError
    } catch {
      homeError.value = true
    }
  } finally {
    loadingHome.value = false
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
    <LoadingSkeleton v-if="loadingHome && !pastoralStore.pastorals.length && !categoryStore.categories.length" class="filter-skeleton" variant="filters" :count="2" />
    <div v-else class="filters">
      <pastoralFilterComponent />
      <categoryFilterComponent />
    </div>
    <p v-if="homeError" class="home-error" role="alert">
      Não foi possível atualizar todas as informações. Verifique a conexão e recarregue a página.
    </p>
    <MessageListComponent :loading="loadingHome && !messageStore.messages.length" @open-detail="selectedMessage = $event" />
    <generalNoticesListComponent :loading="loadingHome && !messageStore.notices.length" @open-detail="selectedMessage = $event" />
    <message-detail-modal :message="selectedMessage" @close="selectedMessage = null" />
  </div>
</template>

<style scoped>
.filter-skeleton { margin: 24px 0; }
.home-error { padding: 12px 16px; border-radius: 8px; color: #962d25; background: #fff0ef; font-size: 13px; line-height: 1.6; }

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
