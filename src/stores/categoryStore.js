import { defineStore } from 'pinia'
import categoryApi from '@/api/categoryApi'
import { computed, reactive } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  const state = reactive({
    categories: [],
    selectedCategoryId: null,
    errorText: '',
    haveError: false,
  })


  const categories = computed(() => state.categories)
  const errorText = computed(() => state.errorText)
  const haveError = computed(() => state.haveError)
  const selectedCategoryId = computed(() => state.selectedCategoryId)

  const selectedCategory = computed(() => {
    return state.categories.find(
      (category) => category.id === state.selectedCategoryId,
    ) ?? null
  })

  function selectCategory(id) {
    state.selectedCategoryId = id
  }

  let lastLoaded = 0
  let pending = null

  async function getAllCategories(force = false) {
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

      const response = await categoryApi.getAll()

      state.categories = Array.isArray(response.data)
        ? response.data
        : response.data?.results ?? []
      lastLoaded = Date.now()
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      state.haveError = true
      state.errorText = 'Não foi possível carregar as categorias.'
    }
  }

  function hydrate(data) {
    state.categories = data
    state.haveError = false
    state.errorText = ''
    lastLoaded = Date.now()
  }
  return {
    hydrate,
    categories,
    selectedCategoryId,
    selectedCategory,
    errorText,
    haveError,
    selectCategory,
    getAllCategories,
  }
})
