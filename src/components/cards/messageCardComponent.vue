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
        <img :src="message.image.url" alt="">
    </div>
</template>
<style scoped>
    
</style>