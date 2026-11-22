<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import QuestionForm from '@/components/questions/QuestionForm.vue'
import QuestionHistory from '@/components/questions/QuestionHistory.vue'
import { useAuthStore } from '@/stores/authStore'
import questionApi from '@/api/questionApi'

const auth = useAuthStore()
const myQuestions = ref([])
const loadingQuestions = ref(false)

async function loadMyQuestions() {
  if (!auth.isAuthenticated) {
    myQuestions.value = []
    return
  }
  loadingQuestions.value = true
  try {
    const { data } = await questionApi.getMine()
    myQuestions.value = Array.isArray(data) ? data : (data.results ?? [])
  } catch (error) {
    console.error('Erro ao carregar perguntas:', error)
  } finally {
    loadingQuestions.value = false
  }
}
onMounted(loadMyQuestions)
watch(() => auth.isAuthenticated, loadMyQuestions)
</script>

<template>
  <main class="form-page">
    <RouterLink to="/" class="back-link">← Voltar aos recados</RouterLink>
    <QuestionForm :authenticated="auth.isAuthenticated" @submitted="loadMyQuestions" />
    <QuestionHistory
      v-if="auth.isAuthenticated"
      :my-questions="myQuestions"
      :loading-questions="loadingQuestions"
    />
  </main>
</template>

<style scoped>
.form-page {
  width: min(780px, 92%);
  margin: 30px auto 70px;
  font-family: 'Comfortaa', sans-serif;
}
.back-link {
  color: #0a4c34;
  text-decoration: none;
  font-size: 14px;
}
@media (max-width: 600px) {
  .form-page {
    width: 100%;
    box-sizing: border-box;
    padding: 0 14px;
    margin: 20px auto 48px;
  }
}
</style>
