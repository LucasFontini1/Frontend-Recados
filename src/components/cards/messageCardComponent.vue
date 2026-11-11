<script setup>
    const props = defineProps({
        message: {
            type: Object,
            required: true
        }
    })

    const message = props.message
</script>
<template>
    <div class="message-card">
        <img :src="message.image.url" :alt="message.title">
    </div>
</template>
<style scoped>
    .message-card {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px;
    }
</style>