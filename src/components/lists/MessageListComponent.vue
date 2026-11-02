<script setup>
    import { useMessageStore } from '@/stores/messageStore'
    import { onMounted } from 'vue'
    import messageCardComponent from '../cards/messageCardComponent.vue'

    const messageStore = useMessageStore()

    onMounted(async () => {
        await messageStore.getAllMessages()
    })
</script>
<template>
    <ul class="messages">
        <li v-for="m in messageStore.messages" :key="m.id">
            <message-card-component :message="m" />
        </li>
    </ul>
</template>