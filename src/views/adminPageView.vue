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
const activeTab = ref('messages')
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const feedback = ref('')
const errorMessage = ref('')
const pastorals = ref([])
const categories = ref([])
const messages = ref([])
const questions = ref([])
const users = ref([])
const editId = ref(null)
const groupSelections = reactive({})
const answers = reactive({})
const form = reactive({
  name: '', color: '#0a6a4c', title: '', text: '',
  pastoral: '', category: '', event_date: '', is_notice: false,
})

const isAdmin = computed(() =>
  auth.user?.is_superuser || auth.user?.groups?.some(group => ['admin', 'superadmin'].includes(group.name)),
)
function can(permission) {
  return Boolean(auth.user?.is_superuser || auth.user?.permissions?.includes(permission))
}
function list(response) {
  return Array.isArray(response.data) ? response.data : response.data?.results ?? []
}
function permissionFor(action, model) {
  return can(`core.${action}_${model}`)
}
function isProtectedUser(person) {
  return Boolean(person.is_superuser || person.groups?.some(group =>
    ['admin', 'superadmin'].includes(group.name)
  ))
}
function getRole(person) {
  if (person.is_superuser) return 'Superusuário Django'
  if (person.groups?.some(group => group.name === 'superadmin')) return 'superadmin'
  if (person.groups?.some(group => group.name === 'admin')) return 'admin'
  return 'viewer'
}
const configurations = {
  messages: { name: 'Publicações', singular: 'publicação', model: 'message' },
  pastorals: { name: 'Pastorais', singular: 'pastoral', model: 'pastoral' },
  categories: { name: 'Categorias', singular: 'categoria', model: 'category' },
  users: { name: 'Usuários', singular: 'usuário', model: 'user' },
  questions: { name: 'Perguntas', singular: 'pergunta', model: 'question' },
}
const currentConfig = computed(() => configurations[activeTab.value])
const currentItems = computed(() => ({
  messages: messages.value, pastorals: pastorals.value,
  categories: categories.value, questions: questions.value, users: users.value,
})[activeTab.value] ?? [])

function normalized(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}
const filteredItems = computed(() => currentItems.value.filter(item => {
  const term = normalized(search.value.trim())
  if (!term) return true
  const text = activeTab.value === 'messages'
    ? `${item.title} ${item.text}`
    : activeTab.value === 'users'
      ? `${item.name} ${item.email}`
      : activeTab.value === 'questions'
        ? `${item.subject} ${item.author_name} ${item.author_email}`
        : item.name
  return normalized(text).includes(term)
}))
function reportError(error) {
  const data = error.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (data && typeof data === 'object') {
    return Object.entries(data).map(([key, value]) =>
      `${key}: ${Array.isArray(value) ? value.join(', ') : value}`,
    ).join(' | ')
  }
  return error.message || 'Ocorreu um erro ao executar a operação.'
}
async function loadData() {
  if (!isAdmin.value) return
  loading.value = true
  errorMessage.value = ''
  const jobs = [
    pastoralApi.getAll().then(r => { pastorals.value = list(r) }),
    categoryApi.getAll().then(r => { categories.value = list(r) }),
  ]
  if (permissionFor('view', 'message')) {
    jobs.push(messageApi.getAdminAll().then(r => { messages.value = list(r) }))
  }
  if (permissionFor('view', 'question')) {
    jobs.push(questionApi.getAll().then(r => {
      questions.value = list(r)
      questions.value.forEach(q => { answers[q.id] = q.answer || '' })
    }))
  }
  if (permissionFor('view', 'user')) {
    jobs.push(userApi.getAll().then(r => {
      users.value = list(r)
      users.value.forEach(u => {
        groupSelections[u.id] = getRole(u)
      })
    }))
  }
  const results = await Promise.allSettled(jobs)
  if (results.some(r => r.status === 'rejected')) {
    errorMessage.value = 'Algumas informações não carregaram. Confira as permissões no Django Admin.'
  }
  loading.value = false
}
function resetForm() {
  editId.value = null
  Object.assign(form, {
    name: '', color: '#0a6a4c', title: '', text: '',
    pastoral: '', category: '', event_date: '', is_notice: false,
  })
}
function changeTab(tab) {
  activeTab.value = tab
  search.value = ''
  resetForm()
  feedback.value = ''
  errorMessage.value = ''
}
function localDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)
}
function startEdit(item) {
  editId.value = item.id
  if (activeTab.value === 'messages') {
    Object.assign(form, {
      title: item.title,
      text: item.text,
      pastoral: item.pastoral?.id ?? item.pastoral ?? '',
      category: item.category?.id ?? item.category ?? '',
      event_date: localDate(item.event_date),
      is_notice: item.is_notice,
    })
  } else {
    form.name = item.name
    form.color = item.color || '#0a6a4c'
  }
  feedback.value = ''
  errorMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function execute(action, message) {
  saving.value = true
  errorMessage.value = ''
  feedback.value = ''
  try {
    await action()
    resetForm()
    await loadData()
    feedback.value = message
    return true
  } catch (error) {
    errorMessage.value = reportError(error)
    return false
  } finally {
    saving.value = false
  }
}
async function saveRecord() {
  const updating = editId.value !== null
  const id = editId.value
  if (activeTab.value === 'messages') {
    const payload = {
      title: form.title.trim(),
      text: form.text.trim(),
      pastoral: Number(form.pastoral),
      category: Number(form.category),
      event_date: form.is_notice || !form.event_date ? null : new Date(form.event_date).toISOString(),
      is_notice: form.is_notice,
    }
    await execute(
      () => updating ? messageApi.updateMessage(id, payload) : messageApi.createMessage(payload),
      updating ? 'Publicação atualizada.' : 'Publicação criada.',
    )
  } else if (activeTab.value === 'pastorals') {
    const payload = { name: form.name.trim(), color: form.color }
    await execute(
      () => updating ? pastoralApi.updatePastoral(payload, id) : pastoralApi.createPastoral(payload),
      updating ? 'Pastoral atualizada.' : 'Pastoral criada.',
    )
  } else if (activeTab.value === 'categories') {
    const payload = { name: form.name.trim(), color: form.color }
    await execute(
      () => updating ? categoryApi.updateCategory(id, payload) : categoryApi.createCategory(payload),
      updating ? 'Categoria atualizada.' : 'Categoria criada.',
    )
  }
}
async function deleteRecord(item) {
  const current = activeTab.value
  const label = item.title || item.name || item.email
  if (current === 'users' && isProtectedUser(item)) {
    errorMessage.value = 'Administradores e superadmins só podem ser alterados pelo Django Admin.'
    return
  }
  const warning = current === 'pastorals' || current === 'categories' || current === 'users'
    ? ' Os dados relacionados também podem ser excluídos permanentemente.'
    : ''
  if (!window.confirm(`Excluir "${label}"? Essa ação não pode ser desfeita.${warning}`)) return
  const actions = {
    messages: () => messageApi.delete(item.id),
    pastorals: () => pastoralApi.delete(item.id),
    categories: () => categoryApi.delete(item.id),
    users: () => userApi.delete(item.id),
  }
  await execute(actions[current], 'Registro excluído com sucesso.')
}
async function saveGroup(person) {
  if (isProtectedUser(person)) {
    errorMessage.value = 'Administradores e superadmins só podem ser alterados pelo Django Admin.'
    return
  }
  await execute(
    () => userApi.setGroup(person.id, groupSelections[person.id]),
    'Grupo atualizado com sucesso.',
  )
}
async function sendAnswer(question) {
  const answer = answers[question.id]?.trim()
  if (!answer) return
  await execute(() => questionApi.answer(question.id, answer), 'Resposta enviada ao usuário.')
}
onMounted(loadData)
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
      <nav class="tabs" aria-label="Seções do painel">
        <button v-for="(config, key) in configurations" :key="key"
          type="button" :class="{ active: activeTab === key }"
          @click="changeTab(key)">{{ config.name }}</button>
      </nav>

      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
      <p v-if="feedback" class="success" role="status">{{ feedback }}</p>
      <p v-if="loading" class="info">Atualizando informações...</p>

      <section v-if="['messages', 'pastorals', 'categories'].includes(activeTab)" class="panel">
        <h2>{{ editId !== null ? 'Editar' : 'Criar' }} {{ currentConfig.singular }}</h2>
        <p v-if="!permissionFor(editId !== null ? 'change' : 'add', currentConfig.model)" class="info">
          Seu grupo não tem essa permissão no Django Admin.
        </p>
        <form v-else @submit.prevent="saveRecord">
          <template v-if="activeTab === 'messages'">
            <label for="record-type">Tipo</label>
            <select id="record-type" v-model="form.is_notice">
              <option :value="false">Evento / recado</option>
              <option :value="true">Aviso geral</option>
            </select>
            <label for="record-title">Título</label>
            <input id="record-title" v-model="form.title" maxlength="150" required />
            <label for="record-text">Texto</label>
            <textarea id="record-text" v-model="form.text" rows="5" required />
            <div class="two-cols">
              <div>
                <label for="record-pastoral">Pastoral</label>
                <select id="record-pastoral" v-model="form.pastoral" required>
                  <option disabled value="">Selecione uma pastoral</option>
                  <option v-for="p in pastorals" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div>
                <label for="record-category">Categoria</label>
                <select id="record-category" v-model="form.category" required>
                  <option disabled value="">Selecione uma categoria</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <template v-if="!form.is_notice">
              <label for="record-date">Data e hora do evento (opcional)</label>
              <input id="record-date" v-model="form.event_date" type="datetime-local" />
            </template>
          </template>
          <template v-else>
            <label for="record-name">Nome</label>
            <input id="record-name" v-model="form.name" maxlength="100" required />
            <label for="record-color">Cor</label>
            <input id="record-color" v-model="form.color" type="color" />
          </template>
          <div class="form-actions">
            <button type="submit" :disabled="saving || (activeTab === 'messages' && (!pastorals.length || !categories.length))">
              {{ saving ? 'Salvando...' : editId !== null ? 'Salvar alterações' : 'Criar' }}
            </button>
            <button v-if="editId !== null" type="button" class="secondary" @click="resetForm">Cancelar</button>
          </div>
        </form>
      </section>

      <section class="panel listing">
        <h2>{{ activeTab === 'questions' ? 'Perguntas recebidas' : 'Registros cadastrados' }}</h2>
        <p class="hint">Busca pelo nome ou título entre todos os registros disponíveis para sua conta.</p>
        <label for="admin-search">Pesquisar {{ currentConfig.name.toLowerCase() }}</label>
        <input id="admin-search" v-model="search"
          :placeholder="activeTab === 'users' ? 'Nome ou e-mail...' : activeTab === 'questions' ? 'Assunto ou autor...' : 'Digite um nome ou título...'" />

        <p v-if="!permissionFor('view', currentConfig.model)" class="info">
          Você precisa da permissão de visualização deste conteúdo.
        </p>
        <p v-else-if="!filteredItems.length" class="hint">Nenhum resultado encontrado.</p>

        <template v-if="permissionFor('view', currentConfig.model)">
          <article v-for="item in filteredItems" :key="item.id" class="record">
            <template v-if="activeTab === 'questions'">
              <div class="record-heading">
                <div>
                  <h3>{{ item.subject }}</h3>
                  <small>{{ item.author_name || item.author_email }} · {{ new Date(item.created_at).toLocaleString('pt-BR') }}</small>
                </div>
                <span :class="item.answered_at ? 'status answered' : 'status pending'">
                  {{ item.answered_at ? 'Respondida' : 'Pendente' }}
                </span>
              </div>
              <p class="record-text">{{ item.text }}</p>
              <template v-if="permissionFor('change', 'question')">
                <label :for="'answer-' + item.id">Resposta à pergunta</label>
                <textarea :id="'answer-' + item.id" v-model="answers[item.id]" rows="3"
                  maxlength="5000" placeholder="Escreva uma resposta para o usuário..." />
                <button type="button" :disabled="saving || !answers[item.id]?.trim()"
                  @click="sendAnswer(item)">{{ item.answered_at ? 'Atualizar resposta' : 'Responder' }}</button>
              </template>
              <p v-else-if="item.answer" class="answer"><strong>Resposta:</strong> {{ item.answer }}</p>
            </template>

            <template v-else-if="activeTab === 'users'">
              <div class="record-heading">
                <div>
                  <h3>{{ item.name || 'Sem nome' }}</h3>
                  <small>{{ item.email }} · {{ getRole(item) }}</small>
                  <small v-if="isProtectedUser(item)" class="protected-note">Cargo protegido · gerencie pelo Django Admin</small>
                </div>
                <div class="actions">
                  <select v-model="groupSelections[item.id]" :disabled="!permissionFor('change', 'user') || isProtectedUser(item) || item.id === auth.user?.id">
                    <option value="viewer">viewer</option>
                    <option value="admin">admin</option>
                    <option v-if="getRole(item) === 'superadmin'" value="superadmin">superadmin</option>
                    <option v-if="item.is_superuser" value="Superusuário Django">Superusuário Django</option>
                  </select>
                  <button type="button" :disabled="saving || !permissionFor('change', 'user') || item.is_superuser || item.id === auth.user?.id"
                    @click="saveGroup(item)">Salvar grupo</button>
                  <button type="button" class="danger" :disabled="saving || !permissionFor('delete', 'user') || isProtectedUser(item) || item.id === auth.user?.id"
                    @click="deleteRecord(item)">Excluir</button>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="record-heading">
                <div>
                  <h3>{{ item.title || item.name }}</h3>
                  <small v-if="activeTab === 'messages'">
                    {{ item.is_notice ? 'Aviso' : 'Evento / recado' }} · Publicado em {{ new Date(item.created_at).toLocaleString('pt-BR') }}
                  </small>
                  <small v-else>
                    <span class="color-dot" :style="{ backgroundColor: item.color }"></span>
                    {{ item.color }}
                  </small>
                </div>
                <div class="actions">
                  <button type="button" class="secondary" :disabled="saving || !permissionFor('change', currentConfig.model)"
                    @click="startEdit(item)">Editar</button>
                  <button type="button" class="danger" :disabled="saving || !permissionFor('delete', currentConfig.model)"
                    @click="deleteRecord(item)">Excluir</button>
                </div>
              </div>
              <p v-if="activeTab === 'messages'" class="record-text">{{ item.text }}</p>
            </template>
          </article>
        </template>
      </section>
    </template>
  </main>
</template>

<style scoped>
.admin-page { box-sizing: border-box; width: min(1100px, 94%); margin: 28px auto 70px; color: #18332a; font-family: 'Comfortaa', sans-serif; }
.back-link { color: #0a4c34; font-size: 13px; text-decoration: none; }
.page-heading { margin: 24px 0; }
.eyebrow { color: #0a6a4c; letter-spacing: 1.5px; font-size: 11px; font-weight: 700; }
h1 { margin: 10px 0; font-size: clamp(25px, 4vw, 34px); }
h2 { margin: 0 0 12px; font-size: 19px; }
h3 { margin: 0 0 8px; font-size: 15px; overflow-wrap: anywhere; }
.page-heading p:last-child, .hint { color: #647273; font-size: 13px; line-height: 1.7; }
.tabs { display: flex; gap: 8px; overflow-x: auto; margin: 26px 0; padding-bottom: 6px; }
.tabs button { white-space: nowrap; background: #ecf3ee; color: #0a4c34; }
.tabs button.active { color: white; background: #0a4c34; }
.panel { min-width: 0; overflow-wrap: anywhere; margin: 18px 0; background: white; border: 1px solid #d6e1df; border-radius: 14px; padding: clamp(18px, 3vw, 28px); box-shadow: 0 3px 12px #123d2710; }
form { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
label { display: block; font-size: 12px; font-weight: 700; margin: 12px 0 6px; }
input, textarea, select { width: 100%; min-width: 0; border: 1px solid #d6e1df; border-radius: 8px; padding: 12px; font: inherit; font-size: 13px; background: white; }
input[type=color] { height: 45px; padding: 5px; }
textarea { resize: vertical; }
button { border: 0; border-radius: 8px; padding: 12px 18px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; background: #0a4c34; color: white; }
button:disabled { opacity: .5; cursor: not-allowed; }
button.secondary { background: #e6f1eb; color: #0a4c34; }
button.danger { background: #a33535; color: white; }
.form-actions, .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.form-actions { margin-top: 12px; }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.record { border-top: 1px solid #d6e1df; padding: 20px 0; }
.record-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.record-heading > div:first-child { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.record small { color: #647273; font-size: 11px; line-height: 1.6; }
.protected-note { display: block; margin-top: 5px; color: #9a5b15 !important; }
.record-text { font-size: 13px; color: #526962; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.record textarea { margin-bottom: 10px; }
.color-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
.status { font-size: 11px; padding: 6px 10px; border-radius: 20px; }
.status.pending { background: #fff2db; color: #956216; }
.status.answered { background: #e2eee8; color: #0a6a4c; }
.answer { white-space: pre-wrap; font-size: 13px; }
.info, .error, .success { border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 13px; }
.info { background: #eff4f5; color: #30566b; }
.error { background: #fff0ef; color: #962d25; }
.success { background: #edf6ee; color: #175b35; }
@media (max-width: 720px) {
  .two-cols { grid-template-columns: 1fr; }
  .record-heading { align-items: flex-start; }
  .actions { width: 100%; }
}
@media (max-width: 600px) {
  .admin-page { width: 100%; margin: 16px auto 40px; padding: 0 14px; }
  .page-heading { margin: 20px 0; }
  h1 { font-size: 25px; line-height: 1.3; }
  h2 { font-size: 17px; }
  .tabs { margin: 18px -14px; padding: 0 14px 12px; gap: 8px; scroll-snap-type: x proximity; }
  .tabs button { flex: 0 0 auto; padding: 12px 14px; scroll-snap-align: start; }
  .panel { padding: 16px; border-radius: 12px; }
  input, textarea, select { box-sizing: border-box; font-size: 16px; }
  .record { padding: 16px 0; }
  .record-heading { flex-direction: column; align-items: stretch; gap: 12px; }
  .record-heading > div:first-child { width: 100%; }
  .actions, .form-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; gap: 8px; }
  .actions select { grid-column: 1 / -1; }
  .actions button, .form-actions button { width: 100%; min-height: 44px; padding: 11px 8px; }
  .record > button { width: 100%; min-height: 44px; }
  .record textarea { width: 100%; }
  .two-cols { gap: 8px; }
  .status { align-self: flex-start; }
}
@media (max-width: 360px) {
  .admin-page { padding: 0 10px; }
  .tabs { margin-inline: -10px; padding-inline: 10px; }
  .actions, .form-actions { grid-template-columns: 1fr; }
}
</style>
