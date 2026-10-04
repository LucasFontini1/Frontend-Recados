import { defineStore } from "pinia";
import pastoralApi from "@/api/pastoralApi";
import { computed, reactive } from "vue";
import { useTemplateStore } from "./templateStore";


export const usePastoralStore = defineStore('pastoral', () => {
    const state = reactive({
        pastorals: null,
        errorText: '',
        haveError: false,
    })

    //stores
    const templateStore = useTemplateStore()

    // Computeds, use just this in components
    const pastorals = computed(() => state.pastorals)
    const errorText = computed(() => state.errorText)
    const haveError = computed(() => state.haveError)


    // get all pastorals async function
    async function getAllPastorals() {
        try {
            templateStore.loading = true
            state.haveError = false
            state.pastorals = null

            const response = await pastoralApi.getAll()

            state.pastorals = response.data

            console.log(response.data)
        } catch(error) {
            console.error(error)
            state.haveError = true
            state.errorText = error
        } finally {
            templateStore.loading = false
        }
    }

    return {
        getAllPastorals,

        //computeds
        pastorals,
        errorText,
        haveError,
    }
})