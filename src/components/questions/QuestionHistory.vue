<script setup>
import LoadingSkeleton from '@/components/layout/LoadingSkeleton.vue'

defineProps({
  myQuestions: { type: Array, required: true },
  loadingQuestions: Boolean,
})
</script>

<template>
  <section class="panel history">
    <h2>Minhas perguntas</h2>
    <p class="intro">
      Acompanhe aqui quando a diretoria responder. As respostas aparecem ao atualizar a página.
    </p>
    <LoadingSkeleton v-if="loadingQuestions && !myQuestions.length" variant="rows" :count="2" />
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
.intro {
  color: #647273;
  line-height: 1.7;
  margin-bottom: 24px;
}
.history {
  margin-top: 20px;
}
.history h2 {
  color: #18332a;
  font-size: 20px;
}
.question-item {
  padding: 20px 0;
  border-top: 1px solid #e1e9e6;
  overflow-wrap: anywhere;
}
.question-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.question-title h3 {
  margin: 0;
  font-size: 16px;
}
.question-text {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 13px;
  color: #526962;
  margin: 12px 0;
}
.answered,
.pending {
  border-radius: 20px;
  padding: 6px 10px;
  font-size: 11px;
}
.answered {
  background: #e2eee8;
  color: #0a6a4c;
}
.pending {
  background: #fff2db;
  color: #956216;
}
.answer {
  margin-top: 12px;
  padding: 16px;
  border-radius: 9px;
  background: #eef6f0;
  font-size: 13px;
}
.answer p {
  white-space: pre-wrap;
  line-height: 1.6;
}
.answer small {
  color: #647273;
}
@media (max-width: 600px) {
  .panel {
    padding: 18px 16px;
    border-radius: 12px;
  }
  h2 {
    font-size: 19px;
  }
  .question-title {
    align-items: flex-start;
    flex-direction: column;
  }
  .answer {
    padding: 14px;
  }
}
</style>
