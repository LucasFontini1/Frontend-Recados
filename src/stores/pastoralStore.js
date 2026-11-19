
import { defineStore } from 'pinia'
import pastoralApi from '@/api/pastoralApi'
import { computed, reactive } from 'vue'

export const usePastoralStore = defineStore('pastoral', () => {
  const state = reactive({
    pastorals: [],
    selectedPastoralId: null,
    errorText: '',
    haveError: false,
  })


  // Estados disponíveis para os componentes
  const pastorals = computed(() => state.pastorals)
  const errorText = computed(() => state.errorText)
  const haveError = computed(() => state.haveError)

  // ID da pastoral selecionada
  const selectedPastoralId = computed(
    () => state.selectedPastoralId,
  )

  // Encontra o objeto da pastoral selecionada
  const selectedPastoral = computed(() => {
    return state.pastorals.find(
      (pastoral) => pastoral.id === state.selectedPastoralId,
    ) ?? null
  })

  // Seleciona ou limpa a pastoral
  function selectPastoral(id) {
    state.selectedPastoralId = id
  }

  // Busca todas as pastorais no backend
  let lastLoaded = 0
  let pending = null

  async function getAllPastorals(force = false) {
    if (pending) return pending
    if (!force && lastLoaded && Date.now() - lastLoaded < 300_000) return
    pending = loadItems()
    try {
      await pending
    } finally {
      pending = null
    }
  }

  async function loadItems() {
    try {
      state.haveError = false
      state.errorText = ''

      const response = await pastoralApi.getAll()

      state.pastorals = Array.isArray(response.data)
        ? response.data
        : response.data?.results ?? []
      lastLoaded = Date.now()

    } catch (error) {
      console.error('Erro ao buscar pastorais:', error)

      state.haveError = true
      state.errorText = 'Não foi possível carregar as pastorais.'
    }
  }

  function hydrate(data) {
    state.pastorals = data
    state.haveError = false
    state.errorText = ''
    lastLoaded = Date.now()
  }
  return {
    hydrate,
    pastorals,
    selectedPastoralId,
    selectedPastoral,
    errorText,
    haveError,
    selectPastoral,
    getAllPastorals,
  }
})
