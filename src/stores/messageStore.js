import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import messageApi from '@/api/messageApi'
import { usePastoralStore } from '@/stores/pastoralStore'
import { useCategoryStore } from '@/stores/categoryStore'

const CACHE_TTL = 60_000

export const useMessageStore = defineStore('message', () => {
  const state = reactive({
    messages: [],
    notices: [],
    errorText: '',
    haveError: false,
    lastLoaded: 0,
  })
  let pending = null
  const messages = computed(() => state.messages)
  const notices = computed(() => state.notices)
  const pastoralStore = usePastoralStore()
  const categoryStore = useCategoryStore()

  function matchesFilters(item) {
    // Endpoints de leitura retornam objetos, mas IDs diretos também são aceitos.
    const pastoralId = item.pastoral?.id ?? item.pastoral
    const categoryId = item.category?.id ?? item.category
    return (pastoralStore.selectedPastoralId == null ||
      String(pastoralId) === String(pastoralStore.selectedPastoralId)) &&
      (categoryStore.selectedCategoryId == null ||
      String(categoryId) === String(categoryStore.selectedCategoryId))
  }

  const filteredMessages = computed(() => state.messages.filter(matchesFilters))
  const filteredNotices = computed(() => state.notices.filter(matchesFilters))
  const errorText = computed(() => state.errorText)
  const haveError = computed(() => state.haveError)

  async function getAllMessages(force = false) {
    if (pending) return pending
    if (!force && state.lastLoaded && Date.now() - state.lastLoaded < CACHE_TTL) return

    pending = (async () => {
      state.haveError = false
      state.errorText = ''
      const results = await Promise.allSettled([messageApi.getAll(), messageApi.getNotices()])
      const extract = response => Array.isArray(response.data) ? response.data : response.data?.results ?? []

      if (results[0].status === 'fulfilled') {
        state.messages = extract(results[0].value)
      }
      if (results[1].status === 'fulfilled') {
        state.notices = extract(results[1].value).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
      if (results.some(result => result.status === 'rejected')) {
        state.haveError = true
        state.errorText = 'Não foi possível carregar todas as publicações.'
        // Não descartar dados que já estavam visíveis se uma requisição falhar.
      } else {
        state.lastLoaded = Date.now()
      }
    })()

    try {
      await pending
    } finally {
      pending = null
    }
  }

  function hydrate(data) {
    state.messages = data.messages ?? []
    state.notices = data.notices ?? []
    state.haveError = false
    state.errorText = ''
    state.lastLoaded = Date.now()
  }
  function invalidate() {
    state.lastLoaded = 0
  }

  return { messages, notices, filteredMessages, filteredNotices, errorText, haveError, getAllMessages, invalidate, hydrate }
})
