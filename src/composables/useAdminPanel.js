import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import pastoralApi from '@/api/pastoralApi'
import categoryApi from '@/api/categoryApi'
import messageApi from '@/api/messageApi'
import questionApi from '@/api/questionApi'
import userApi from '@/api/userApi'

export function useAdminPanel() {
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
  const imageFile = ref(null)
  const imagePreview = ref('')
  const removeImage = ref(false)
  const recordForm = ref(null)
  let localImageUrl = null

  function releaseLocalImage() {
    if (localImageUrl) URL.revokeObjectURL(localImageUrl)
    localImageUrl = null
  }
  function clearImage() {
    releaseLocalImage()
    imageFile.value = null
    imagePreview.value = ''
    removeImage.value = true
    recordForm.value?.resetImageInput()
  }
  function onImageSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      errorMessage.value = 'Use uma imagem JPG ou PNG.'
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'A imagem deve ter no máximo 5 MB.'
      event.target.value = ''
      return
    }
    releaseLocalImage()
    localImageUrl = URL.createObjectURL(file)
    imageFile.value = file
    imagePreview.value = localImageUrl
    removeImage.value = false
    errorMessage.value = ''
  }
  function onPublicationTypeChange() {
    if (form.is_notice) clearImage()
  }
  onBeforeUnmount(releaseLocalImage)
  const groupSelections = reactive({})
  const answers = reactive({})
  const form = reactive({
    name: '',
    color: '#0a6a4c',
    title: '',
    text: '',
    pastoral: '',
    category: '',
    event_date: '',
    is_notice: false,
  })

  const isAdmin = computed(
    () =>
      auth.user?.is_superuser ||
      auth.user?.groups?.some((group) => ['admin', 'superadmin'].includes(group.name)),
  )
  function can(permission) {
    return Boolean(auth.user?.is_superuser || auth.user?.permissions?.includes(permission))
  }
  function list(response) {
    return Array.isArray(response.data) ? response.data : (response.data?.results ?? [])
  }
  function permissionFor(action, model) {
    return can(`core.${action}_${model}`)
  }
  const isSuperadmin = computed(() =>
    Boolean(
      auth.user?.is_superuser || auth.user?.groups?.some((group) => group.name === 'superadmin'),
    ),
  )
  function isProtectedUser(person) {
    if (person.is_superuser || person.id === auth.user?.id) return true
    if (person.groups?.some((group) => group.name === 'superadmin')) return true
    if (person.groups?.some((group) => group.name === 'admin')) return !isSuperadmin.value
    return false
  }
  function getRole(person) {
    if (person.is_superuser) return 'Superusuário Django'
    if (person.groups?.some((group) => group.name === 'superadmin')) return 'superadmin'
    if (person.groups?.some((group) => group.name === 'admin')) return 'admin'
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
  const currentItems = computed(
    () =>
      ({
        messages: messages.value,
        pastorals: pastorals.value,
        categories: categories.value,
        questions: questions.value,
        users: users.value,
      })[activeTab.value] ?? [],
  )

  function normalized(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
  }
  const filteredItems = computed(() =>
    currentItems.value.filter((item) => {
      const term = normalized(search.value.trim())
      if (!term) return true
      const text =
        activeTab.value === 'messages'
          ? `${item.title} ${item.text}`
          : activeTab.value === 'users'
            ? `${item.name} ${item.email}`
            : activeTab.value === 'questions'
              ? `${item.subject} ${item.author_name} ${item.author_email}`
              : item.name
      return normalized(text).includes(term)
    }),
  )
  function reportError(error) {
    const data = error.response?.data
    if (typeof data?.detail === 'string') return data.detail
    if (data && typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join(' | ')
    }
    return error.message || 'Ocorreu um erro ao executar a operação.'
  }
  async function loadData() {
    if (!isAdmin.value) return
    loading.value = true
    errorMessage.value = ''
    const jobs = []
    // Evita consultar usuários, perguntas e publicações antes de abrir suas abas.
    if (['messages', 'pastorals', 'categories'].includes(activeTab.value)) {
      jobs.push(
        pastoralApi.getAll().then((r) => {
          pastorals.value = list(r)
        }),
      )
      jobs.push(
        categoryApi.getAll().then((r) => {
          categories.value = list(r)
        }),
      )
    }
    if (activeTab.value === 'messages' && permissionFor('view', 'message')) {
      jobs.push(
        messageApi.getAdminAll().then((r) => {
          messages.value = list(r)
        }),
      )
    }
    if (activeTab.value === 'questions' && permissionFor('view', 'question')) {
      jobs.push(
        questionApi.getAll().then((r) => {
          questions.value = list(r)
          questions.value.forEach((q) => {
            answers[q.id] = q.answer || ''
          })
        }),
      )
    }
    if (activeTab.value === 'users' && permissionFor('view', 'user')) {
      jobs.push(
        userApi.getAll().then((r) => {
          users.value = list(r)
          users.value.forEach((u) => {
            groupSelections[u.id] = getRole(u)
          })
        }),
      )
    }
    const results = await Promise.allSettled(jobs)
    if (results.some((r) => r.status === 'rejected')) {
      errorMessage.value =
        'Algumas informações não carregaram. Confira as permissões no Django Admin.'
    }
    loading.value = false
  }
  function resetForm() {
    releaseLocalImage()
    imageFile.value = null
    imagePreview.value = ''
    removeImage.value = false
    recordForm.value?.resetImageInput()
    editId.value = null
    Object.assign(form, {
      name: '',
      color: '#0a6a4c',
      title: '',
      text: '',
      pastoral: '',
      category: '',
      event_date: '',
      is_notice: false,
    })
  }
  function changeTab(tab) {
    activeTab.value = tab
    search.value = ''
    resetForm()
    feedback.value = ''
    errorMessage.value = ''
    loadData()
  }
  function localDate(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  function startEdit(item) {
    resetForm()
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
      if (!item.is_notice) {
        imagePreview.value = item.image?.url || ''
      }
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
        event_date:
          form.is_notice || !form.event_date ? null : new Date(form.event_date).toISOString(),
        is_notice: form.is_notice,
      }
      await execute(
        async () => {
          if (!form.is_notice && imageFile.value) {
            const response = await messageApi.uploadImage(imageFile.value)
            payload.attachment_key = response.data.attachment_key
          } else if (removeImage.value || form.is_notice) {
            // Remove a imagem ao excluir o anexo ou transformar recado em aviso.
            payload.attachment_key = null
          }
          return updating
            ? messageApi.updateMessage(id, payload)
            : messageApi.createMessage(payload)
        },
        updating ? 'Publicação atualizada.' : 'Publicação criada.',
      )
    } else if (activeTab.value === 'pastorals') {
      const payload = { name: form.name.trim(), color: form.color }
      await execute(
        () =>
          updating ? pastoralApi.updatePastoral(payload, id) : pastoralApi.createPastoral(payload),
        updating ? 'Pastoral atualizada.' : 'Pastoral criada.',
      )
    } else if (activeTab.value === 'categories') {
      const payload = { name: form.name.trim(), color: form.color }
      await execute(
        () =>
          updating ? categoryApi.updateCategory(id, payload) : categoryApi.createCategory(payload),
        updating ? 'Categoria atualizada.' : 'Categoria criada.',
      )
    }
  }
  async function deleteRecord(item) {
    const current = activeTab.value
    const label = item.title || item.name || item.email
    if (current === 'users' && isProtectedUser(item)) {
      errorMessage.value =
        'Esta conta é protegida. Somente superadmins podem gerenciar admins; superadmins e superusuários devem ser gerenciados no Django Admin.'
      return
    }
    const warning =
      current === 'pastorals' || current === 'categories' || current === 'users'
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

  return {
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
  }
}
