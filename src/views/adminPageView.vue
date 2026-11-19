<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import pastoralApi from '@/api/pastoralApi'
import categoryApi from '@/api/categoryApi'
import messageApi from '@/api/messageApi'
import questionApi from '@/api/questionApi'
import userApi from '@/api/userApi'

const auth = useAuthStore()
const tab = ref('content')
const loading = ref(false)
const saving = ref(false)
const feedback = ref('')
const errorMessage = ref('')
const pastorals = ref([])
const categories = ref([])
const questions = ref([])
const users = ref([])
const selectedGroups = reactive({})
const pastoralForm = reactive({ name: '', color: '#0a6a4c' })
const categoryForm = reactive({ name: '', color: '#0a6a4c' })
const messageForm = reactive({
  title: '', text: '', pastoral: '', category: '', event_date: '', is_notice: false,
})

const groups = computed(() => auth.user?.groups?.map((group) => group.name) ?? [])
const isAdmin = computed(() => auth.user?.is_superuser || groups.value.includes('admin'))
function can(permission) {
  return auth.user?.is_superuser || auth.user?.permissions?.includes(permission)
}
function items(response) {
  return Array.isArray(response.data) ? response.data : response.data?.results ?? []
}
function showError(error) {
  const data = error.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (data && typeof data === 'object') return Object.entries(data).map(([k, v]) =>
    `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
  ).join(' | ')
  return 'Não foi possível completar a operação.'
}
async function loadData() {
  if (!isAdmin.value) return
  loading.value = true
  errorMessage.value = ''
  const operations = [
    pastoralApi.getAll().then((response) => { pastorals.value = items(response) }),
    categoryApi.getAll().then((response) => { categories.value = items(response) }),
  ]
  if (can('core.view_question')) {
    operations.push(questionApi.getAll().then((response) => { questions.value = items(response) }))
  }
  if (can('core.view_user')) {
    operations.push(userApi.getAll().then((response) => {
      users.value = items(response)
      users.value.forEach((user) => {
        selectedGroups[user.id] = user.groups?.some((g) => g.name === 'admin') ? 'admin' : 'viewer'
      })
    }))
  }
  const outcomes = await Promise.allSettled(operations)
  if (outcomes.some((result) => result.status === 'rejected')) {
    errorMessage.value = 'Alguns dados não puderam ser carregados. Verifique as permissões configuradas no Django.'
  }
  loading.value = false
}
async function runAction(action, success, refresh = false) {
  saving.value = true
  feedback.value = ''
  errorMessage.value = ''
  try {
    await action()
    feedback.value = success
    if (refresh) await loadData()
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    saving.value = false
  }
}
async function createPastoral() {
  await runAction(
    () => pastoralApi.createPastoral({ ...pastoralForm, name: pastoralForm.name.trim() }),
    'Pastoral criada com sucesso!',
    true,
  )
  if (feedback.value) pastoralForm.name = ''
}
async function createCategory() {
  await runAction(
    () => categoryApi.createCategory({ ...categoryForm, name: categoryForm.name.trim() }),
    'Categoria criada com sucesso!',
    true,
  )
  if (feedback.value) categoryForm.name = ''
}
async function createMessage() {
  const data = {
    title: messageForm.title.trim(),
    text: messageForm.text.trim(),
    pastoral: Number(messageForm.pastoral),
    category: Number(messageForm.category),
    is_notice: messageForm.is_notice,
    event_date: messageForm.is_notice || !messageForm.event_date
      ? null : new Date(messageForm.event_date).toISOString(),
  }
  await runAction(() => messageApi.createMessage(data), 'Publicação criada com sucesso!')
  if (feedback.value) {
    messageForm.title = ''
    messageForm.text = ''
    messageForm.event_date = ''
  }
}
async function updateGroup(user) {
  await runAction(
    () => userApi.setGroup(user.id, selectedGroups[user.id]),
    'Grupo atualizado com sucesso!',
    true,
  )
}
onMounted(loadData)
</script>

<template>
  <main class="admin-page">
    <RouterLink to="/" class="back-link">← Voltar aos recados</RouterLink>
    <header class="page-heading">
      <div>
        <p class="eyebrow">GESTÃO DA COMUNIDADE</p>
        <h1>Painel administrativo</h1>
        <p>Organize as publicações e acompanhe as perguntas enviadas à diretoria.</p>
      </div>
    </header>

    <section v-if="!isAdmin" class="panel">
      <h2>Acesso restrito</h2>
      <p>Somente integrantes do grupo admin podem acessar esta página.</p>
    </section>

    <template v-else>
      <nav class="tabs" aria-label="Seções do painel">
        <button :class="{ active: tab === 'content' }" @click="tab = 'content'">Publicações</button>
        <button :class="{ active: tab === 'catalog' }" @click="tab = 'catalog'">Pastorais e categorias</button>
        <button :class="{ active: tab === 'questions' }" @click="tab = 'questions'">Perguntas</button>
        <button :class="{ active: tab === 'users' }" @click="tab = 'users'">Usuários</button>
      </nav>
      <p v-if="loading" role="status" class="info">Carregando dados...</p>
      <p v-if="errorMessage" role="alert" class="error">{{ errorMessage }}</p>
      <p v-if="feedback" role="status" class="success">{{ feedback }}</p>

      <section v-if="tab === 'content'" class="panel">
        <h2>Nova publicação</h2>
        <p class="hint">Use o mesmo formulário para criar um evento ou um aviso geral.</p>
        <p v-if="!can('core.add_message')" class="info">Seu grupo precisa da permissão “Adicionar mensagem” no Django Admin.</p>
        <form v-else @submit.prevent="createMessage">
          <label for="type">Tipo da publicação</label>
          <select id="type" v-model="messageForm.is_notice">
            <option :value="false">Evento / recado</option>
            <option :value="true">Aviso geral</option>
          </select>
          <label for="message-title">Título</label>
          <input id="message-title" v-model="messageForm.title" maxlength="150" required />
          <label for="message-text">Texto</label>
          <textarea id="message-text" v-model="messageForm.text" rows="5" required />
          <div class="two-cols">
            <div>
              <label for="message-pastoral">Pastoral</label>
              <select id="message-pastoral" v-model="messageForm.pastoral" required>
                <option value="" disabled>Escolha uma pastoral</option>
                <option v-for="p in pastorals" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label for="message-category">Categoria</label>
              <select id="message-category" v-model="messageForm.category" required>
                <option value="" disabled>Escolha uma categoria</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <template v-if="!messageForm.is_notice">
            <label for="event-date">Data e hora do evento (opcional)</label>
            <input id="event-date" v-model="messageForm.event_date" type="datetime-local" />
          </template>
          <button type="submit" :disabled="saving || !pastorals.length || !categories.length">
            {{ saving ? 'Salvando...' : 'Publicar' }}
          </button>
        </form>
      </section>

      <section v-if="tab === 'catalog'" class="catalog">
        <div class="panel">
          <h2>Nova pastoral</h2>
          <p v-if="!can('core.add_pastoral')" class="info">Permissão “Adicionar pastoral” necessária.</p>
          <form v-else @submit.prevent="createPastoral">
            <label for="pastoral-name">Nome</label>
            <input id="pastoral-name" v-model="pastoralForm.name" maxlength="100" required />
            <label for="pastoral-color">Cor de identificação</label>
            <input id="pastoral-color" v-model="pastoralForm.color" type="color" />
            <button type="submit" :disabled="saving">Criar pastoral</button>
          </form>
        </div>
        <div class="panel">
          <h2>Nova categoria</h2>
          <p v-if="!can('core.add_category')" class="info">Permissão “Adicionar categoria” necessária.</p>
          <form v-else @submit.prevent="createCategory">
            <label for="category-name">Nome</label>
            <input id="category-name" v-model="categoryForm.name" maxlength="100" required />
            <label for="category-color">Cor de identificação</label>
            <input id="category-color" v-model="categoryForm.color" type="color" />
            <button type="submit" :disabled="saving">Criar categoria</button>
          </form>
        </div>
      </section>

      <section v-if="tab === 'questions'" class="panel">
        <h2>Perguntas à diretoria</h2>
        <p v-if="!can('core.view_question')" class="info">Seu grupo precisa da permissão “Visualizar pergunta à diretoria”.</p>
        <p v-else-if="!questions.length" class="hint">Nenhuma pergunta encontrada.</p>
        <article v-for="question in can('core.view_question') ? questions : []" :key="question.id" class="question">
          <div class="question-meta">
            <strong>{{ question.author_name || question.author_email }}</strong>
            <time :datetime="question.created_at">{{ new Date(question.created_at).toLocaleString('pt-BR') }}</time>
          </div>
          <h3>{{ question.subject }}</h3>
          <p>{{ question.text }}</p>
          <small>{{ question.author_email }}</small>
        </article>
      </section>

      <section v-if="tab === 'users'" class="panel">
        <h2>Grupos dos usuários</h2>
        <p class="hint">A alteração substitui os grupos atuais por viewer ou admin. Superusuários e sua própria conta não podem ser alterados por aqui.</p>
        <p v-if="!can('core.view_user')" class="info">Permissão “Visualizar usuário” necessária.</p>
        <div v-else class="user-list">
          <div v-for="person in users" :key="person.id" class="user-row">
            <div>
              <strong>{{ person.name || 'Sem nome' }}</strong>
              <p>{{ person.email }}</p>
            </div>
            <div class="user-actions">
              <select v-model="selectedGroups[person.id]" :disabled="!can('core.change_user') || person.is_superuser || person.id === auth.user?.id">
                <option value="viewer">viewer</option>
                <option value="admin">admin</option>
              </select>
              <button type="button" :disabled="saving || !can('core.change_user') || person.is_superuser || person.id === auth.user?.id" @click="updateGroup(person)">
                Salvar
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.admin-page { width: min(1100px, 94%); margin: 28px auto 70px; color: #18332a; font-family: 'Comfortaa', sans-serif; }
.back-link { color: #0a4c34; font-size: 13px; text-decoration: none; }
.page-heading { margin: 24px 0; }
.eyebrow { color: #0a6a4c; letter-spacing: 1.5px; font-size: 11px; font-weight: 700; }
h1 { margin: 10px 0; font-size: clamp(25px, 4vw, 34px); }
h2 { margin: 0 0 12px; font-size: 19px; }
.page-heading p:last-child, .hint { color: #647273; font-size: 13px; line-height: 1.7; }
.tabs { display: flex; gap: 8px; overflow-x: auto; margin: 26px 0; padding-bottom: 6px; }
.tabs button { white-space: nowrap; background: #ecf3ee; color: #0a4c34; }
.tabs button.active { color: white; background: #0a4c34; }
.panel { background: white; border: 1px solid #d6e1df; border-radius: 14px; padding: clamp(18px, 3vw, 28px); box-shadow: 0 3px 12px #123d2710; }
.catalog { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
form { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
label { font-size: 12px; font-weight: 700; margin-top: 8px; }
input, textarea, select { width: 100%; min-width: 0; border: 1px solid #d6e1df; border-radius: 8px; padding: 12px; font: inherit; font-size: 13px; background: white; }
input[type=color] { height: 45px; padding: 5px; }
textarea { resize: vertical; }
button { border: 0; border-radius: 8px; padding: 12px 18px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; background: #0a4c34; color: white; }
button:disabled { opacity: .5; cursor: not-allowed; }
form > button { align-self: flex-start; margin-top: 10px; }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.two-cols label { display: block; margin-bottom: 10px; }
.question { padding: 16px 0; border-top: 1px solid #d6e1df; overflow-wrap: anywhere; }
.question h3 { margin: 12px 0 8px; font-size: 16px; }
.question p { white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
.question small, .question-meta time { color: #647273; font-size: 11px; }
.question-meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 12px; }
.user-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-top: 1px solid #d6e1df; padding: 16px 0; font-size: 13px; }
.user-row p { color: #647273; margin-top: 4px; overflow-wrap: anywhere; }
.user-actions { display: flex; gap: 8px; align-items: center; }
.user-actions select { min-width: 110px; }
.info, .error, .success { border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 13px; }
.info { background: #eff4f5; color: #30566b; }
.error { background: #fff0ef; color: #962d25; }
.success { background: #edf6ee; color: #175b35; }
@media (max-width: 720px) {
  .catalog, .two-cols { grid-template-columns: 1fr; }
  .user-row { flex-direction: column; align-items: flex-start; }
  .user-actions { width: 100%; }
}
</style>
