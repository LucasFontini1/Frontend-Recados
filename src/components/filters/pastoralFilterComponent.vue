<script setup>
import { onMounted, ref } from 'vue'
import { usePastoralStore } from '@/stores/pastoralStore'

const pastoralStore = usePastoralStore()
const filterActive = ref(null)

onMounted(() => {
  pastoralStore.getAllPastorals()
})
</script>

<template>
  <ul>
    <li
      @click="filterActive = null"
      :class="{ active: filterActive === null }"
    >
      Todos
    </li>

    <li
      v-for="p in pastoralStore.pastorals?.results ?? []"
      :key="p.id"
      @click="filterActive = p.id"
      :class="{ active: filterActive === p.id }"
      :style="{ '--pastoral-color': p.color }"
    >
      <p><span class="circle"></span><span class="text">{{ p.name }}</span></p>
    </li>
  </ul>
</template>
<style scoped>
ul {
    display: flex;
    gap: 10px;
    list-style: none;
    padding: 0;
}

li{
    padding: 5px 10px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid transparent;
    box-shadow: 0 0 0 1px #d1d5db;
    transition: border-color 0.2s, box-shadow 0.2s;
}

li.active {
    border-color: var(--pastoral-color, #333);
    box-shadow: none;
}

li p {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
}

span.circle {
    display: inline-block;
    width: 10px;
    aspect-ratio: 1/1;
    flex: 0 0 20px;
    border-radius: 50%;
    background-color: var(--pastoral-color);
}
</style>
