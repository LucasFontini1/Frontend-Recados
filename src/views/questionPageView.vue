<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import LoadingSkeleton from '@/components/layout/LoadingSkeleton.vue'
import { useAuthStore } from '@/stores/authStore'
import questionApi from '@/api/questionApi'

const auth = useAuthStore()
const form = reactive({ subject: '', text: '' })
const saving = ref(false)
const feedback = ref('')
const errorMessage = ref('')
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
    myQuestions.value = Array.isArray(data) ? data : data.results ?? []
  } catch (error) {
    console.error('Erro ao carregar perguntas:', error)
  } finally {
    loadingQuestions.value = false
  }
}
onMounted(loadMyQuestions)
watch(() => auth.isAuthenticated, loadMyQuestions)

async function submit() {
  if (saving.value) return
  saving.value = true
  feedback.value = ''
  errorMessage.value = ''
  try {
    await questionApi.create({
      subject: form.subject.trim(),
      text: form.text.trim(),
    })
    form.subject = ''
    form.text = ''
    feedback.value = 'Pergunta enviada à diretoria com sucesso!'
    await loadMyQuestions()
  } catch (error) {
    errorMessage.value = error.response?.data?.detail ||
      'Não foi possível enviar a pergunta. Tente novamente.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="form-page">
    <RouterLink to="/" class="back-link">← Voltar aos recados</RouterLink>
    <section class="panel">
      <p class="eyebrow">COMUNIDADE</p>
      <h1>Pergunte à diretoria</h1>
      <p class="intro">Envie sua dúvida diretamente à diretoria. Somente a equipe com acesso autorizado poderá ler as perguntas.</p>
      <p v-if="!auth.isAuthenticated">
        Para enviar uma pergunta, <RouterLink to="/login">entre na sua conta</RouterLink>.
      </p>
      <form v-else @submit.prevent="submit">
        <label for="question-subject">Assunto</label>
        <input id="question-subject" v-model="form.subject" maxlength="150" required placeholder="Sobre o que você gostaria de perguntar?" />
        <label for="question-text">Sua pergunta</label>
        <textarea id="question-text" v-model="form.text" rows="6" maxlength="5000" required placeholder="Escreva aqui sua pergunta..." />
        <p v-if="feedback" role="status" class="success">{{ feedback }}</p>
        <p v-if="errorMessage" role="alert" class="error">{{ errorMessage }}</p>
        <button type="submit" :disabled="saving">{{ saving ? 'Enviando...' : 'Enviar pergunta' }}</button>
      </form>
    </section>
    <section v-if="auth.isAuthenticated" class="panel history">
      <h2>Minhas perguntas</h2>
      <p class="intro">Acompanhe aqui quando a diretoria responder. As respostas aparecem ao atualizar a página.</p>
      <LoadingSkeleton
        v-if="loadingQuestions && !myQuestions.length"
        variant="rows"
        :count="2"
      />
      <p v-else-if="!loadingQuestions && !myQuestions.length">Você ainda não enviou perguntas.</p>
      <article v-for="question in myQuestions" :key="question.id" class="question-item">
        <div class="question-title">
          <h3>{{ question.subject }}</h3>
          <span :class="question.answered_at ? 'answered' : 'pending'">
            {{ question.answered_at ? 'Respondida' : 'Aguardando resposta' }}
          </span>
        </div>
        <p class="question-text">{{ question.text }}</p>
        <div v-if="question.answered_at" class="answer">
          <strong>Resposta da diretoria</strong>
          <p>{{ question.answer }}</p>
          <small>Respondida em {{ new Date(question.answered_at).toLocaleString('pt-BR') }}</small>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.form-page { width: min(780px, 92%); margin: 30px auto 70px; font-family: 'Comfortaa', sans-serif; }
.back-link { color: #0a4c34; text-decoration: none; font-size: 14px; }
.panel { padding: clamp(22px, 5vw, 42px); margin-top: 22px; border-radius: 16px; border: 1px solid #d6e1df; background: white; box-shadow: 0 4px 18px #123d2710; }
.eyebrow { color: #0a6a4c; letter-spacing: 2px; font-size: 11px; font-weight: 700; }
h1 { margin: 10px 0 14px; color: #18332a; font-size: clamp(24px, 4vw, 32px); }
.intro { color: #647273; line-height: 1.7; margin-bottom: 24px; }
form { display: flex; flex-direction: column; gap: 12px; }
label { color: #294237; font-weight: 700; font-size: 13px; }
input, textarea { border: 1px solid #cbd8d1; border-radius: 8px; padding: 13px; font: inherit; font-size: 14px; resize: vertical; }
button { align-self: flex-start; padding: 13px 22px; border: 0; border-radius: 8px; background: #0a4c34; color: white; font: inherit; cursor: pointer; }
button:disabled { opacity: .6; cursor: wait; }
.success { color: #12613e; } .error { color: #af2f2f; }
.history { margin-top: 20px; }
.history h2 { color: #18332a; font-size: 20px; }
.question-item { padding: 20px 0; border-top: 1px solid #e1e9e6; overflow-wrap: anywhere; }
.question-title { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.question-title h3 { margin: 0; font-size: 16px; }
.question-text { white-space: pre-wrap; line-height: 1.6; font-size: 13px; color: #526962; margin: 12px 0; }
.answered, .pending { border-radius: 20px; padding: 6px 10px; font-size: 11px; }
.answered { background: #e2eee8; color: #0a6a4c; }
.pending { background: #fff2db; color: #956216; }
.answer { margin-top: 12px; padding: 16px; border-radius: 9px; background: #eef6f0; font-size: 13px; }
.answer p { white-space: pre-wrap; line-height: 1.6; }
.answer small { color: #647273; }
@media (max-width: 600px) {
  .form-page { width: 100%; box-sizing: border-box; padding: 0 14px; margin: 20px auto 48px; }
  .panel { padding: 18px 16px; border-radius: 12px; }
  h1 { font-size: 24px; }
  h2 { font-size: 19px; }
  input, textarea { box-sizing: border-box; width: 100%; min-width: 0; font-size: 16px; }
  form button { width: 100%; min-height: 44px; }
  .question-title { align-items: flex-start; flex-direction: column; }
  .answer { padding: 14px; }
}
</style>
