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
<style scoped>
ul {
    width: 100%;
    display: flex; 
    flex-wrap: wrap;
    gap: 1rem;  
    margin-top: 20px;
    list-style: none;
}
    li {
        width: 30%;
        border: 1px solid #E1E9E9;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 10px;
    }
</style>