<script setup>
    import { usePastoralStore } from '@/stores/pastoralStore';
import { onMounted } from 'vue';

    const pastoralStore = usePastoralStore()

    onMounted(() => {
        pastoralStore.getAllPastorals()
    })
</script>
<template>
    <h1>{{ pastoralStore.errorText }}</h1>
</template>