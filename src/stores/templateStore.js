import { defineStore } from "pinia";
import { ref } from "vue";

export const useTemplateStore = ('template', () => {
    const loading = ref()

    return {
        loading
    }
})