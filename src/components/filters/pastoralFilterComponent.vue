<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePastoralStore } from '@/stores/pastoralStore'

const pastoralStore = usePastoralStore()
const filterActive = ref(null)
const isOpen = ref(false)
const dropdown = ref(null)

const pastorals = computed(() => {
  const data = pastoralStore.pastorals
  if (Array.isArray(data)) return data
  return Array.isArray(data?.results) ? data.results : []
})

const selectedPastoral = computed(() =>
  pastorals.value.find((pastoral) => pastoral.id === filterActive.value),
)

function selectPastoral(id) {
  filterActive.value = id
  isOpen.value = false
}

function closeOnOutsideClick(event) {
  if (!dropdown.value?.contains(event.target)) {
    isOpen.value = false
  }
}

function closeOnEscape(event) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  pastoralStore.getAllPastorals()
  document.addEventListener('pointerdown', closeOnOutsideClick)
  document.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutsideClick)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div class="total" v-if="!pastoralStore.haveError">
    <label class="pastorals" id="pastoral-filter-label">Pastorais</label>
    <div ref="dropdown" class="dropdown">
      <button
        class="dropdown-trigger"
        type="button"
        aria-labelledby="pastoral-filter-label"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span
          v-if="selectedPastoral"
          class="circle"
          :style="{ '--pastoral-color': selectedPastoral.color }"
          aria-hidden="true"
        ></span>
        <span class="selected-name">
          {{ selectedPastoral?.name ?? 'Todas as pastorais' }}
        </span>
        <span class="chevron" :class="{ open: isOpen }" aria-hidden="true"></span>
      </button>

      <ul v-if="isOpen" class="dropdown-menu" role="listbox" aria-label="Pastorais">
        <li>
          <button
            class="dropdown-option"
            type="button"
            role="option"
            :aria-selected="filterActive === null"
            @click="selectPastoral(null)"
          >
            Todas as pastorais
          </button>
        </li>
        <li v-for="pastoral in pastorals" :key="pastoral.id">
          <button
            class="dropdown-option"
            type="button"
            role="option"
            :aria-selected="filterActive === pastoral.id"
            @click="selectPastoral(pastoral.id)"
          >
            <span
              class="circle"
              :style="{ '--pastoral-color': pastoral.color }"
              aria-hidden="true"
            ></span>
            <span>{{ pastoral.name }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
  <div class="error" v-if="pastoralStore.haveError">
    <p class="err">{{ pastoralStore.errorText }}</p>
  </div>
</template>
<style scoped>
.total {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 25px;
  font-family: 'comfortaa';
}

.pastorals {
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 600;
}

.dropdown {
  position: relative;
  min-width: 220px;
}

.dropdown-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  color: #111827;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dropdown-trigger:hover,
.dropdown-trigger[aria-expanded='true'] {
  border-color: #9ca3af;
  box-shadow: 0 0 0 3px rgb(156 163 175 / 15%);
}

.selected-name {
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle {
  display: inline-block;
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  border-radius: 50%;
  background-color: var(--pastoral-color, #9ca3af);
}

.chevron {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(225deg) translate(-1px, -1px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  z-index: 20;
  max-height: 260px;
  overflow-y: auto;
  margin: 0;
  padding: 5px;
  list-style: none;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 10px 25px rgb(17 24 39 / 12%);
}

.dropdown-option {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #111827;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.dropdown-option:hover,
.dropdown-option[aria-selected='true'] {
  background: #f3f4f6;
}

.dropdown-option:focus-visible,
.dropdown-trigger:focus-visible {
  outline: 2px solid #6b7280;
  outline-offset: 2px;
}
</style>
