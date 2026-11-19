<script setup>
import appWelcome from '@/components/layout/appWelcome.vue'
import pastoralFilterComponent from '@/components/filters/pastoralFilterComponent.vue'
import categoryFilterComponent from '@/components/filters/categoryFilterComponent.vue'
import MessageListComponent from '@/components/lists/MessageListComponent.vue';
import generalNoticesListComponent from '@/components/lists/generalNoticesListComponent.vue';
</script>

<template>
  <div class="page">
    <appWelcome />
    <div class="filters">
      <pastoralFilterComponent />
      <categoryFilterComponent />
    </div>
    <MessageListComponent />
    <generalNoticesListComponent />
  </div>
</template>

<style scoped>
.filters {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
}

@media (max-width: 600px) {
  .filters { flex-direction: column; align-items: stretch; gap: 12px; margin: 18px 0 24px; }
  .filters :deep(.pastoral-filter), .filters :deep(.category-filter) { width: 100%; min-width: 0; margin-top: 0; }
}
</style>
