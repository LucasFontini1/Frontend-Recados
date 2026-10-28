
<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { usePastoralStore } from '@/stores/pastoralStore'

const pastoralStore = usePastoralStore()

// Estados visuais do componente
const search = ref('')
const isOpen = ref(false)

// Dados compartilhados que vêm da store
const pastorals = computed(() => pastoralStore.pastorals)

const selectedPastoral = computed(
  () => pastoralStore.selectedPastoral,
)

// Pesquisa as pastorais pelo nome
const filteredPastorals = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('pt-BR')

  return pastorals.value.filter((pastoral) =>
    pastoral.name.toLocaleLowerCase('pt-BR').includes(term),
  )
})

// Seleciona uma pastoral utilizando a store
function selectPastoral(pastoral) {
  pastoralStore.selectPastoral(pastoral?.id ?? null)

  search.value = pastoral?.name ?? ''
  isOpen.value = false
}

// Atualiza a pesquisa quando o usuário digita
function onSearch(value) {
  search.value = value

  // Limpa a seleção anterior
  pastoralStore.selectPastoral(null)

  isOpen.value = true
}

// Mantém o texto sincronizado com a store
watch(
  selectedPastoral,
  (pastoral) => {
    if (!isOpen.value) {
      search.value = pastoral?.name ?? ''
    }
  },
  { immediate: true },
)

// Busca as pastorais ao montar o componente
onMounted(() => {
  pastoralStore.getAllPastorals()
})
</script>

<template>
  <div class="pastoral-filter">
    <label for="pastoral-search">Pastorais</label>

    <div class="search-container">
      <!-- Bolinha da pastoral selecionada -->
      <span
        v-if="selectedPastoral"
        class="selected-circle"
        :style="{
          backgroundColor: selectedPastoral.color,
        }"
      ></span>

      <!-- Campo de pesquisa -->
      <input
        id="pastoral-search"
        :value="search"
        type="text"
        placeholder="Pesquisar pastoral..."
        autocomplete="off"
        :class="{ 'has-selection': selectedPastoral }"
        :aria-expanded="isOpen"
        aria-controls="pastoral-options"
        @input="onSearch($event.target.value)"
        @focus="isOpen = true"
        @keydown.esc="isOpen = false"
      />

      <!-- Botão para limpar -->
      <button
        v-if="search || selectedPastoral"
        type="button"
        class="clear-button"
        aria-label="Limpar filtro"
        @click="selectPastoral(null)"
      >
        ×
      </button>

      <!-- Lista de pastorais -->
      <ul
        v-if="isOpen"
        id="pastoral-options"
        class="options"
      >
        <li>
          <button
            type="button"
            class="option-button"
            @click="selectPastoral(null)"
          >
            Todas as pastorais
          </button>
        </li>

        <li
          v-for="pastoral in filteredPastorals"
          :key="pastoral.id"
        >
          <button
            type="button"
            class="option-button"
            @click="selectPastoral(pastoral)"
          >
            <span
              class="circle"
              :style="{
                backgroundColor: pastoral.color,
              }"
            ></span>

            {{ pastoral.name }}
          </button>
        </li>

        <li
          v-if="filteredPastorals.length === 0"
          class="empty"
        >
          Nenhuma pastoral encontrada
        </li>
      </ul>

      <!-- Mensagem de erro -->
      <p v-if="pastoralStore.haveError" class="error">
        {{ pastoralStore.errorText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.pastoral-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 25px;
  font-family: 'Comfortaa', sans-serif;
}

.pastoral-filter label {
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

/* Espaço para a bolinha selecionada */
.search-container input.has-selection {
  padding-left: 38px;
}

/* Bolinha dentro do campo */
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

/* Botão de limpar */
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

/* Dropdown */
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

/* Bolinhas das opções */
.circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Nenhuma pastoral encontrada */
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
  .pastoral-filter {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-container {
    width: 100%;
  }
}
</style>
