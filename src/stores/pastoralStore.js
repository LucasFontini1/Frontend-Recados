import { defineStore } from "pinia";
import pastoralApi from "@/api/pastoralApi";
import { computed, reactive } from "vue";
import { useTemplateStore } from "./templateStore";


export const usePastoralStore = defineStore('pastoral', () => {
    const state = reactive({
        pastorals: null,
        errorText: '',
    })

    //stores
    const templateStore = useTemplateStore()

    // Computeds, use just this in components
    const pastorals = computed(() => state.pastorals)
    const errorText = computed(() => state.errorText)


    // get all pastorals async function
    async function getAllPastorals() {
        try {
            templateStore.loading.value = true
            state.pastorals = null

            const response = await pastoralApi.getAll()

            state.pastorals = response.data

            console.log(response.data)
            templateStore.loading.value = false
        } catch(error) {
            console.error(error)
            state.errorText = error
        } finally {
            templateStore.loading.value = false
        }
    }

    return {
        getAllPastorals,

        //computeds
        pastorals,
        errorText
    }
})