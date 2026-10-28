import { defineStore } from 'pinia'
import categoryApi from '@/api/categoryApi'
import { computed, reactive } from 'vue'
import { useTemplateStore } from './templateStore'

export const useCategoryStore = defineStore('category', () => {
  const state = reactive({
    categories: [],
    selectedCategoryId: null,
    errorText: '',
    haveError: false,
  })

  const templateStore = useTemplateStore()

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

  async function getAllCategories() {
    try {
      templateStore.loading = true
      state.haveError = false
      state.errorText = ''

      const response = await categoryApi.getAll()

      state.categories = Array.isArray(response.data)
        ? response.data
        : response.data?.results ?? []
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      state.haveError = true
      state.errorText = 'Não foi possível carregar as categorias.'
    } finally {
      templateStore.loading = false
    }
  }

  return {
    categories,
    selectedCategoryId,
    selectedCategory,
    errorText,
    haveError,
    selectCategory,
    getAllCategories,
  }
})
