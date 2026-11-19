import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTemplateStore = defineStore('template', () => {
  const pendingRequests = ref(0)
  const loading = computed(() => pendingRequests.value > 0)

  function beginLoading() {
    pendingRequests.value += 1
  }
  function endLoading() {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }

  return { loading, beginLoading, endLoading }
})
