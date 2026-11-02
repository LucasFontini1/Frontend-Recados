<script setup>
import appWelcome from '@/components/layout/appWelcome.vue'
import pastoralFilterComponent from '@/components/filters/pastoralFilterComponent.vue'
import categoryFilterComponent from '@/components/filters/categoryFilterComponent.vue'
import MessageListComponent from '@/components/lists/MessageListComponent.vue';
</script>

<template>
  <div class="page">
    <appWelcome />
    <div class="filters">
      <pastoralFilterComponent />
      <categoryFilterComponent />
    </div>
    <MessageListComponent />
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
}

@media (max-width: 600px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
