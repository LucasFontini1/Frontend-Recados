<script setup>
import { ref } from 'vue'

const form = defineModel('form', { type: Object, required: true })
defineProps({
  activeTab: { type: String, required: true },
  currentConfig: { type: Object, required: true },
  editId: { type: [Number, String], default: null },
  saving: Boolean,
  pastorals: { type: Array, required: true },
  categories: { type: Array, required: true },
  imagePreview: { type: String, default: '' },
  permissionFor: { type: Function, required: true },
})
const emit = defineEmits([
  'save',
  'reset',
  'publication-type-change',
  'image-selected',
  'clear-image',
])
const imageInput = ref(null)
function resetImageInput() {
  if (imageInput.value) imageInput.value.value = ''
}
defineExpose({ resetImageInput })
</script>

<template>
  <section v-if="['messages', 'pastorals', 'categories'].includes(activeTab)" class="panel">
    <h2>{{ editId !== null ? 'Editar' : 'Criar' }} {{ currentConfig.singular }}</h2>
    <p v-if="!permissionFor(editId !== null ? 'change' : 'add', currentConfig.model)" class="info">
      Seu grupo não tem essa permissão no Django Admin.
    </p>
    <form v-else @submit.prevent="emit('save')">
      <template v-if="activeTab === 'messages'">
        <label for="record-type">Tipo</label>
        <select id="record-type" v-model="form.is_notice" @change="emit('publication-type-change')">
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
          <div class="image-upload-field">
            <label for="record-image">Imagem do evento ou recado (opcional)</label>
            <p class="image-help">
              JPG ou PNG, até 5 MB. A imagem aparece nos cartões e nos detalhes.
            </p>
            <input
              id="record-image"
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png"
              :disabled="saving"
              @change="emit('image-selected', $event)"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Prévia da imagem do recado" />
              <button
                class="secondary"
                type="button"
                :disabled="saving"
                @click="emit('clear-image')"
              >
                <span class="mdi mdi-delete-outline" aria-hidden="true"></span> Remover imagem
              </button>
            </div>
            <p v-else class="image-help">Sem imagem selecionada.</p>
          </div>
        </template>
      </template>
      <template v-else>
        <label for="record-name">Nome</label>
        <input id="record-name" v-model="form.name" maxlength="100" required />
        <label for="record-color">Cor</label>
        <input id="record-color" v-model="form.color" type="color" />
      </template>
      <div class="form-actions">
        <button
          type="submit"
          :disabled="
            saving || (activeTab === 'messages' && (!pastorals.length || !categories.length))
          "
        >
          {{ saving ? 'Enviando e salvando...' : editId !== null ? 'Salvar alterações' : 'Criar' }}
        </button>
        <button v-if="editId !== null" type="button" class="secondary" @click="emit('reset')">
          Cancelar
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 12px;
  font-size: 19px;
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
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
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
.form-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.form-actions {
  margin-top: 12px;
}
.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.record-text {
  font-size: 13px;
  color: #526962;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
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
  .two-cols {
    grid-template-columns: 1fr;
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
  .form-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    gap: 8px;
  }
  .form-actions button {
    width: 100%;
    min-height: 44px;
    padding: 11px 8px;
  }
  .two-cols {
    gap: 8px;
  }
}
@media (max-width: 360px) {
  .form-actions {
    grid-template-columns: 1fr;
  }
}
.image-upload-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding: 15px;
  border: 1px dashed #a8c9b6;
  border-radius: 10px;
  background: #f8fbf9;
}
.image-upload-field label {
  margin: 0;
}
.image-upload-field input[type='file'] {
  max-width: 100%;
  padding: 10px;
  font-size: 12px;
  background: white;
}
.image-help {
  margin: 0;
  font-size: 11px;
  color: #647273;
  line-height: 1.6;
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
  .image-upload-field {
    padding: 12px;
  }
  .image-preview button {
    width: 100%;
  }
}
</style>
