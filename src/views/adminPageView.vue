<script setup>
import { RouterLink } from 'vue-router'
import AdminTabs from '@/components/admin/AdminTabs.vue'
import AdminRecordForm from '@/components/admin/AdminRecordForm.vue'
import AdminRecordList from '@/components/admin/AdminRecordList.vue'
import { useAdminPanel } from '@/composables/useAdminPanel'

const {
  auth,
  activeTab,
  search,
  loading,
  saving,
  feedback,
  errorMessage,
  pastorals,
  categories,
  editId,
  imagePreview,
  recordForm,
  groupSelections,
  answers,
  form,
  isAdmin,
  permissionFor,
  isProtectedUser,
  getRole,
  configurations,
  currentConfig,
  currentItems,
  filteredItems,
  clearImage,
  onImageSelected,
  onPublicationTypeChange,
  resetForm,
  changeTab,
  startEdit,
  saveRecord,
  deleteRecord,
  saveGroup,
  sendAnswer,
} = useAdminPanel()
</script>

<template>
  <main class="admin-page">
    <RouterLink to="/" class="back-link">← Voltar aos recados</RouterLink>
    <header class="page-heading">
      <p class="eyebrow">GESTÃO DA COMUNIDADE</p>
      <h1>Painel administrativo</h1>
      <p>Gerencie os registros e responda às dúvidas da comunidade.</p>
    </header>

    <section v-if="!isAdmin" class="panel">
      <h2>Acesso restrito</h2>
      <p>Somente integrantes do grupo admin podem acessar esta página.</p>
    </section>
    <template v-else>
      <AdminTabs :configurations="configurations" :active-tab="activeTab" @change="changeTab" />

      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
      <p v-if="feedback" class="success" role="status">{{ feedback }}</p>

      <AdminRecordForm
        ref="recordForm"
        v-model:form="form"
        :active-tab="activeTab"
        :current-config="currentConfig"
        :edit-id="editId"
        :saving="saving"
        :pastorals="pastorals"
        :categories="categories"
        :image-preview="imagePreview"
        :permission-for="permissionFor"
        @save="saveRecord"
        @reset="resetForm"
        @publication-type-change="onPublicationTypeChange"
        @image-selected="onImageSelected"
        @clear-image="clearImage"
      />
      <AdminRecordList
        v-model:search="search"
        v-model:answers="answers"
        v-model:group-selections="groupSelections"
        :active-tab="activeTab"
        :current-config="currentConfig"
        :current-items="currentItems"
        :filtered-items="filteredItems"
        :loading="loading"
        :saving="saving"
        :current-user-id="auth.user?.id"
        :permission-for="permissionFor"
        :get-role="getRole"
        :is-protected-user="isProtectedUser"
        @answer="sendAnswer"
        @save-group="saveGroup"
        @delete="deleteRecord"
        @edit="startEdit"
      />
    </template>
  </main>
</template>

<style scoped>
.admin-page {
  box-sizing: border-box;
  width: min(1100px, 94%);
  margin: 28px auto 70px;
  color: #18332a;
  font-family: 'Comfortaa', sans-serif;
}
.back-link {
  color: #0a4c34;
  font-size: 13px;
  text-decoration: none;
}
.page-heading {
  margin: 24px 0;
}
.eyebrow {
  color: #0a6a4c;
  letter-spacing: 1.5px;
  font-size: 11px;
  font-weight: 700;
}
h1 {
  margin: 10px 0;
  font-size: clamp(25px, 4vw, 34px);
}
h2 {
  margin: 0 0 12px;
  font-size: 19px;
}
.page-heading p:last-child {
  color: #647273;
  font-size: 13px;
  line-height: 1.7;
}
.panel {
  min-width: 0;
  overflow-wrap: anywhere;
  margin: 18px 0;
  background: white;
  border: 1px solid #d6e1df;
  border-radius: 14px;
  padding: clamp(18px, 3vw, 28px);
  box-shadow: 0 3px 12px #123d2710;
}
.status {
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 20px;
}
.status.pending {
  background: #fff2db;
  color: #956216;
}
.status.answered {
  background: #e2eee8;
  color: #0a6a4c;
}
.answer {
  white-space: pre-wrap;
  font-size: 13px;
}
.error,
.success {
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  font-size: 13px;
}
.error {
  background: #fff0ef;
  color: #962d25;
}
.success {
  background: #edf6ee;
  color: #175b35;
}
@media (max-width: 600px) {
  .admin-page {
    width: 100%;
    margin: 16px auto 40px;
    padding: 0 14px;
  }
  .page-heading {
    margin: 20px 0;
  }
  h1 {
    font-size: 25px;
    line-height: 1.3;
  }
  h2 {
    font-size: 17px;
  }
  .panel {
    padding: 16px;
    border-radius: 12px;
  }
  .status {
    align-self: flex-start;
  }
}
@media (max-width: 360px) {
  .admin-page {
    padding: 0 10px;
  }
}
.image-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-top: 5px;
}
.image-preview img {
  width: min(100%, 360px);
  max-height: 220px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #d6e1df;
  background: #fff;
}
.image-preview button {
  min-height: 40px;
}
@media (max-width: 600px) {
  .image-preview button {
    width: 100%;
  }
}
</style>
