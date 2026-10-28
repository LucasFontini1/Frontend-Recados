
import { defineStore } from 'pinia'
import pastoralApi from '@/api/pastoralApi'
import { computed, reactive } from 'vue'
import { useTemplateStore } from './templateStore'

export const usePastoralStore = defineStore('pastoral', () => {
  const state = reactive({
    pastorals: [],
    selectedPastoralId: null,
    errorText: '',
    haveError: false,
  })

  const templateStore = useTemplateStore()

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
  async function getAllPastorals() {
    try {
      templateStore.loading = true
      state.haveError = false
      state.errorText = ''

      const response = await pastoralApi.getAll()

      state.pastorals = Array.isArray(response.data)
        ? response.data
        : response.data?.results ?? []

    } catch (error) {
      console.error('Erro ao buscar pastorais:', error)

      state.haveError = true
      state.errorText = 'Não foi possível carregar as pastorais.'
    } finally {
      templateStore.loading = false
    }
  }

  return {
    pastorals,
    selectedPastoralId,
    selectedPastoral,
    errorText,
    haveError,
    selectPastoral,
    getAllPastorals,
  }
})
