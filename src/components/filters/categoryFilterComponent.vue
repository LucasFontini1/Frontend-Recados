<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'

const categoryStore = useCategoryStore()

// Estados visuais do componente
const search = ref('')
const isOpen = ref(false)

// Dados compartilhados que vêm da store
const categories = computed(() => categoryStore.categories)
const selectedCategory = computed(() => categoryStore.selectedCategory)

// Pesquisa as categorias pelo nome
const filteredCategories = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR')

  return categories.value.filter((category) =>
    category.name.toLocaleLowerCase('pt-BR').includes(term),
  )
})

// Seleciona uma categoria utilizando a store
function selectCategory(category) {
  categoryStore.selectCategory(category?.id ?? null)
  search.value = category?.name ?? ''
  isOpen.value = false
}

// Atualiza a pesquisa quando o usuário digita
function onSearch(value) {
  search.value = value
  categoryStore.selectCategory(null)
  isOpen.value = true
}

// Mantém o texto sincronizado com a store
watch(
  selectedCategory,
  (category) => {
    if (!isOpen.value) {
      search.value = category?.name ?? ''
    }
  },
  { immediate: true },
)

// Busca as categorias ao montar o componente
onMounted(() => {
  categoryStore.getAllCategories()
})
</script>

<template>
  <div class="category-filter">
    <label for="category-search">Categorias</label>

    <div class="search-container">
      <span
        v-if="selectedCategory"
        class="selected-circle"
        :style="{ backgroundColor: selectedCategory.color }"
      ></span>

      <input
        id="category-search"
        :value="search"
        type="text"
        placeholder="Pesquisar categoria..."
        autocomplete="off"
        :class="{ 'has-selection': selectedCategory }"
        :aria-expanded="isOpen"
        aria-controls="category-options"
        @input="onSearch($event.target.value)"
        @focus="isOpen = true"
        @keydown.esc="isOpen = false"
      />

      <button
        v-if="search || selectedCategory"
        type="button"
        class="clear-button"
        aria-label="Limpar filtro de categorias"
        @click="selectCategory(null)"
      >
        ×
      </button>

      <ul v-if="isOpen" id="category-options" class="options">
        <li>
          <button type="button" class="option-button" @click="selectCategory(null)">
            Todas as categorias
          </button>
        </li>

        <li v-for="category in filteredCategories" :key="category.id">
          <button type="button" class="option-button" @click="selectCategory(category)">
            <span
              class="circle"
              :style="{ backgroundColor: category.color }"
            ></span>
            {{ category.name }}
          </button>
        </li>

        <li v-if="filteredCategories.length === 0" class="empty">
          Nenhuma categoria encontrada
        </li>
      </ul>

      <p v-if="categoryStore.haveError" class="error">
        {{ categoryStore.errorText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 25px;
  font-family: 'Comfortaa', sans-serif;
}

.category-filter label {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

.search-container {
  position: relative;
  width: 280px;
}

.search-container input {
  width: 100%;
  padding: 12px 35px 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  background: white;
  font-family: inherit;
}

.search-container input:focus {
  border-color: #0a4c34;
  box-shadow: 0 0 0 3px #0a4c3420;
}

.search-container input.has-selection {
  padding-left: 38px;
}

.selected-circle {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}

.clear-button {
  position: absolute;
  right: 10px;
  top: 8px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  color: #647273;
}

.clear-button:hover {
  color: #0a4c34;
}

.options {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  list-style: none;
  z-index: 100;
  box-shadow: 0 8px 20px #00000015;
}

.options li {
  font-size: 13px;
}

.option-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: none;
  background: transparent;
  color: #111827;
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.option-button:hover,
.option-button:focus-visible {
  background: #eef5f1;
}

.circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.options .empty {
  padding: 12px;
  color: #6b7280;
  cursor: default;
}

.error {
  margin-top: 8px;
  color: #dc2626;
  font-size: 12px;
}

@media (max-width: 600px) {
  .category-filter {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-container {
    width: 100%;
  }
}
</style>
