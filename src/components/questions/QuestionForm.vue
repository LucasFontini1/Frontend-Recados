<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import questionApi from '@/api/questionApi'

defineProps({ authenticated: Boolean })
const emit = defineEmits(['submitted'])
const form = reactive({ subject: '', text: '' })
const saving = ref(false)
const feedback = ref('')
const errorMessage = ref('')
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
    emit('submitted')
  } catch (error) {
    errorMessage.value =
      error.response?.data?.detail || 'Não foi possível enviar a pergunta. Tente novamente.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="panel">
    <p class="eyebrow">COMUNIDADE</p>
    <h1>Pergunte à diretoria</h1>
    <p class="intro">
      Envie sua dúvida diretamente à diretoria. Somente a equipe com acesso autorizado poderá ler as
      perguntas.
    </p>
    <p v-if="!authenticated">
      Para enviar uma pergunta, <RouterLink to="/login">entre na sua conta</RouterLink>.
    </p>
    <form v-else @submit.prevent="submit">
      <label for="question-subject">Assunto</label>
      <input
        id="question-subject"
        v-model="form.subject"
        maxlength="150"
        required
        placeholder="Sobre o que você gostaria de perguntar?"
      />
      <label for="question-text">Sua pergunta</label>
      <textarea
        id="question-text"
        v-model="form.text"
        rows="6"
        maxlength="5000"
        required
        placeholder="Escreva aqui sua pergunta..."
      />
      <p v-if="feedback" role="status" class="success">{{ feedback }}</p>
      <p v-if="errorMessage" role="alert" class="error">{{ errorMessage }}</p>
      <button type="submit" :disabled="saving">
        {{ saving ? 'Enviando...' : 'Enviar pergunta' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.panel {
  padding: clamp(22px, 5vw, 42px);
  margin-top: 22px;
  border-radius: 16px;
  border: 1px solid #d6e1df;
  background: white;
  box-shadow: 0 4px 18px #123d2710;
}
.eyebrow {
  color: #0a6a4c;
  letter-spacing: 2px;
  font-size: 11px;
  font-weight: 700;
}
h1 {
  margin: 10px 0 14px;
  color: #18332a;
  font-size: clamp(24px, 4vw, 32px);
}
.intro {
  color: #647273;
  line-height: 1.7;
  margin-bottom: 24px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
label {
  color: #294237;
  font-weight: 700;
  font-size: 13px;
}
input,
textarea {
  border: 1px solid #cbd8d1;
  border-radius: 8px;
  padding: 13px;
  font: inherit;
  font-size: 14px;
  resize: vertical;
}
button {
  align-self: flex-start;
  padding: 13px 22px;
  border: 0;
  border-radius: 8px;
  background: #0a4c34;
  color: white;
  font: inherit;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: wait;
}
.success {
  color: #12613e;
}
.error {
  color: #af2f2f;
}
.question-text {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 13px;
  color: #526962;
  margin: 12px 0;
}
@media (max-width: 600px) {
  .panel {
    padding: 18px 16px;
    border-radius: 12px;
  }
  h1 {
    font-size: 24px;
  }
  input,
  textarea {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    font-size: 16px;
  }
  form button {
    width: 100%;
    min-height: 44px;
  }
}
</style>
