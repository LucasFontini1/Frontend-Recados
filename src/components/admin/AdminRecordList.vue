<script setup>
import LoadingSkeleton from '@/components/layout/LoadingSkeleton.vue'

const search = defineModel('search', { type: String, required: true })
const answers = defineModel('answers', { type: Object, required: true })
const groupSelections = defineModel('groupSelections', { type: Object, required: true })
defineProps({
  activeTab: { type: String, required: true },
  currentConfig: { type: Object, required: true },
  currentItems: { type: Array, required: true },
  filteredItems: { type: Array, required: true },
  loading: Boolean,
  saving: Boolean,
  currentUserId: { type: [Number, String], default: null },
  permissionFor: { type: Function, required: true },
  getRole: { type: Function, required: true },
  isProtectedUser: { type: Function, required: true },
})
const emit = defineEmits(['answer', 'save-group', 'delete', 'edit'])
</script>

<template>
  <section class="panel listing">
    <h2>{{ activeTab === 'questions' ? 'Perguntas recebidas' : 'Registros cadastrados' }}</h2>
    <p class="hint">
      Busca pelo nome ou título entre todos os registros disponíveis para sua conta.
    </p>
    <label for="admin-search">Pesquisar {{ currentConfig.name.toLowerCase() }}</label>
    <input
      id="admin-search"
      v-model="search"
      :placeholder="
        activeTab === 'users'
          ? 'Nome ou e-mail...'
          : activeTab === 'questions'
            ? 'Assunto ou autor...'
            : 'Digite um nome ou título...'
      "
    />

    <p v-if="!permissionFor('view', currentConfig.model)" class="info">
      Você precisa da permissão de visualização deste conteúdo.
    </p>
    <LoadingSkeleton v-else-if="loading && !currentItems.length" variant="rows" :count="3" />
    <p v-else-if="!loading && !filteredItems.length" class="hint">Nenhum resultado encontrado.</p>

    <template
      v-if="permissionFor('view', currentConfig.model) && (!loading || currentItems.length)"
    >
      <article v-for="item in filteredItems" :key="item.id" class="record">
        <template v-if="activeTab === 'questions'">
          <div class="record-heading">
            <div>
              <h3>{{ item.subject }}</h3>
              <small
                >{{ item.author_name || item.author_email }} ·
                {{ new Date(item.created_at).toLocaleString('pt-BR') }}</small
              >
            </div>
            <span :class="item.answered_at ? 'status answered' : 'status pending'">
              {{ item.answered_at ? 'Respondida' : 'Pendente' }}
            </span>
          </div>
          <p class="record-text">{{ item.text }}</p>
          <template v-if="permissionFor('change', 'question')">
            <label :for="'answer-' + item.id">Resposta à pergunta</label>
            <textarea
              :id="'answer-' + item.id"
              v-model="answers[item.id]"
              rows="3"
              maxlength="5000"
              placeholder="Escreva uma resposta para o usuário..."
            />
            <button
              type="button"
              :disabled="saving || !answers[item.id]?.trim()"
              @click="emit('answer', item)"
            >
              {{ item.answered_at ? 'Atualizar resposta' : 'Responder' }}
            </button>
          </template>
          <p v-else-if="item.answer" class="answer"><strong>Resposta:</strong> {{ item.answer }}</p>
        </template>

        <template v-else-if="activeTab === 'users'">
          <div class="record-heading">
            <div>
              <h3>{{ item.name || 'Sem nome' }}</h3>
              <small>{{ item.email }} · {{ getRole(item) }}</small>
              <small v-if="isProtectedUser(item)" class="protected-note"
                >Cargo protegido · sem permissão para alterar pelo portal</small
              >
            </div>
            <div class="actions">
              <select
                v-model="groupSelections[item.id]"
                :disabled="
                  !permissionFor('change', 'user') ||
                  isProtectedUser(item) ||
                  item.id === currentUserId
                "
              >
                <option value="viewer">viewer</option>
                <option value="admin">admin</option>
                <option v-if="getRole(item) === 'superadmin'" value="superadmin">superadmin</option>
                <option v-if="item.is_superuser" value="Superusuário Django">
                  Superusuário Django
                </option>
              </select>
              <button
                type="button"
                :disabled="saving || !permissionFor('change', 'user') || isProtectedUser(item)"
                @click="emit('save-group', item)"
              >
                Salvar grupo
              </button>
              <button
                type="button"
                class="danger"
                :disabled="
                  saving ||
                  !permissionFor('delete', 'user') ||
                  isProtectedUser(item) ||
                  item.id === currentUserId
                "
                @click="emit('delete', item)"
              >
                Excluir
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="record-heading">
            <div>
              <h3>{{ item.title || item.name }}</h3>
              <small v-if="activeTab === 'messages'">
                {{ item.is_notice ? 'Aviso' : 'Evento / recado' }} · Publicado em
                {{ new Date(item.created_at).toLocaleString('pt-BR') }}
              </small>
              <small v-else>
                <span class="color-dot" :style="{ backgroundColor: item.color }"></span>
                {{ item.color }}
              </small>
            </div>
            <div class="actions">
              <button
                type="button"
                class="secondary"
                :disabled="saving || !permissionFor('change', currentConfig.model)"
                @click="emit('edit', item)"
              >
                Editar
              </button>
              <button
                type="button"
                class="danger"
                :disabled="saving || !permissionFor('delete', currentConfig.model)"
                @click="emit('delete', item)"
              >
                Excluir
              </button>
            </div>
          </div>
          <p v-if="activeTab === 'messages'" class="record-text">{{ item.text }}</p>
        </template>
      </article>
    </template>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 12px;
  font-size: 19px;
}
h3 {
  margin: 0 0 8px;
  font-size: 15px;
  overflow-wrap: anywhere;
}
.hint {
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
label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin: 12px 0 6px;
}
input,
textarea,
select {
  width: 100%;
  min-width: 0;
  border: 1px solid #d6e1df;
  border-radius: 8px;
  padding: 12px;
  font: inherit;
  font-size: 13px;
  background: white;
}
input[type='color'] {
  height: 45px;
  padding: 5px;
}
textarea {
  resize: vertical;
}
button {
  border: 0;
  border-radius: 8px;
  padding: 12px 18px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: #0a4c34;
  color: white;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button.secondary {
  background: #e6f1eb;
  color: #0a4c34;
}
button.danger {
  background: #a33535;
  color: white;
}
.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.record {
  border-top: 1px solid #d6e1df;
  padding: 20px 0;
}
.record-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}
.record-heading > div:first-child {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.record small {
  color: #647273;
  font-size: 11px;
  line-height: 1.6;
}
.protected-note {
  display: block;
  margin-top: 5px;
  color: #9a5b15 !important;
}
.record-text {
  font-size: 13px;
  color: #526962;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.record textarea {
  margin-bottom: 10px;
}
.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
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
.info {
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  font-size: 13px;
}
.info {
  background: #eff4f5;
  color: #30566b;
}
@media (max-width: 720px) {
  .record-heading {
    align-items: flex-start;
  }
  .actions {
    width: 100%;
  }
}
@media (max-width: 600px) {
  h2 {
    font-size: 17px;
  }
  .panel {
    padding: 16px;
    border-radius: 12px;
  }
  input,
  textarea,
  select {
    box-sizing: border-box;
    font-size: 16px;
  }
  .record {
    padding: 16px 0;
  }
  .record-heading {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .record-heading > div:first-child {
    width: 100%;
  }
  .actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    gap: 8px;
  }
  .actions select {
    grid-column: 1 / -1;
  }
  .actions button {
    width: 100%;
    min-height: 44px;
    padding: 11px 8px;
  }
  .record > button {
    width: 100%;
    min-height: 44px;
  }
  .record textarea {
    width: 100%;
  }
  .status {
    align-self: flex-start;
  }
}
@media (max-width: 360px) {
  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
