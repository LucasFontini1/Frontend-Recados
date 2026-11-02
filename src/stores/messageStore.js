import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import messageApi from '@/api/messageApi'

export const useMessageStore = defineStore('message', () => {
    const state = reactive({
        messages: [],
        errorText: '',
        haveError: false,
    })

    const messages = computed(() => state.messages)
    const errorText = computed(() => state.errorText)
    const haveError = computed(() => state.haveError)

    const getAllMessages = async () => {
        try {
            state.haveError = false
            state.errorText = ''
            const response = await messageApi.getAll()
            state.messages = Array.isArray(response.data)
                ? response.data
                : response.data?.results ?? []

            console.log('Mensagens carregadas com sucesso:', state.messages)
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error)
            state.haveError = true
            state.errorText = 'Não foi possível carregar as mensagens.'
        }
    }

    return {
        messages,
        errorText,
        haveError,
        getAllMessages,
    }
})