<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()
const mode = ref('login')
const isRegister = computed(() => mode.value === 'register')
const form = reactive({ name: '', email: '', password: '', confirmation: '', accept_terms: false, accept_privacy: false })
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const fieldLabels = { email: 'E-mail', name: 'Nome', password: 'Senha' }

function changeMode(nextMode) {
  if (loading.value) return
  mode.value = nextMode
  form.password = ''
  form.confirmation = ''
  form.accept_terms = false
  form.accept_privacy = false
  errorMessage.value = ''
  successMessage.value = ''
  showPassword.value = false
}

function describeError(error) {
  if (!error.response) {
    return error.request
      ? 'Não foi possível conectar ao servidor. Tente novamente em instantes.'
      : error.message || 'Não foi possível concluir a solicitação.'
  }
  if (error.response.status === 401) return 'E-mail ou senha incorretos.'
  const data = error.response.data
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data === 'object' && data) {
    const messages = Object.entries(data).flatMap(([field, value]) => {
      const text = (Array.isArray(value) ? value : [value]).filter(
        (item) => typeof item === 'string',
      )
      return text.map((item) => (fieldLabels[field] ? `${fieldLabels[field]}: ${item}` : item))
    })
    if (messages.length) return messages.join(' ')
  }
  return 'Não foi possível concluir a solicitação. Tente novamente.'
}

async function submit() {
  if (loading.value) return
  errorMessage.value = ''
  successMessage.value = ''
  if (isRegister.value && !form.name.trim()) {
    errorMessage.value = 'Informe seu nome.'
    return
  }
  if (isRegister.value && form.password !== form.confirmation) {
    errorMessage.value = 'As senhas precisam ser iguais.'
    return
  }
  if (isRegister.value && (!form.accept_terms || !form.accept_privacy)) {
    errorMessage.value = 'Leia e confirme os Termos de Uso e a Política de Privacidade para criar sua conta.'
    return
  }
  loading.value = true
  try {
    const credentials = { email: form.email.trim(), password: form.password }
    if (isRegister.value) {
      await auth.register({ ...credentials, name: form.name.trim(), accept_terms: form.accept_terms, accept_privacy: form.accept_privacy })
      await auth.login(credentials)
      form.password = ''
      form.confirmation = ''
      showPassword.value = false
      await router.push({ name: 'home' })
    } else {
      await auth.login(credentials)
      form.password = ''
      await router.push({ name: 'home' })
    }
  } catch (error) {
    errorMessage.value = describeError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <RouterLink class="back-link" to="/">
      <span class="mdi mdi-arrow-left" aria-hidden="true"></span> Voltar para os recados
    </RouterLink>

    <section class="auth-card" aria-labelledby="auth-title">
      <div class="auth-intro">
        <span class="intro-label">VIDA EM COMUNIDADE</span>
        <img src="/img/logo-removebg-preview.png" alt="" class="community-logo" />
        <h1>A comunidade se encontra aqui.</h1>
        <p>Um espaço para compartilhar recados, acompanhar os encontros e estar mais perto.</p>
        <div class="community-note">
          <span class="mdi mdi-account-group-outline" aria-hidden="true"></span>
          <span>Conectados pela fé e pelo cuidado com o próximo.</span>
        </div>
      </div>

      <div class="auth-content">
        <div class="mode-switch" aria-label="Acesso à conta">
          <button
            type="button"
            :class="{ active: !isRegister }"
            :aria-pressed="!isRegister"
            :disabled="loading"
            @click="changeMode('login')"
          >
            Entrar
          </button>
          <button
            type="button"
            :class="{ active: isRegister }"
            :aria-pressed="isRegister"
            :disabled="loading"
            @click="changeMode('register')"
          >
            Criar conta
          </button>
        </div>

        <h2 id="auth-title">
          {{ isRegister ? 'Faça parte da comunidade' : 'Que bom ter você aqui' }}
        </h2>
        <p class="form-description">
          {{
            isRegister
              ? 'Preencha seus dados para criar sua conta.'
              : 'Entre com seu e-mail e senha para continuar.'
          }}
        </p>

        <p v-if="errorMessage" class="feedback error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="feedback success" role="status">{{ successMessage }}</p>

        <form :aria-busy="loading" @submit.prevent="submit">
          <fieldset :disabled="loading">
            <div v-if="isRegister" class="form-field">
              <label for="auth-name">Nome</label>
              <input
                id="auth-name"
                v-model="form.name"
                name="name"
                autocomplete="name"
                placeholder="Como podemos chamar você?"
                maxlength="255"
                required
              />
            </div>
            <div class="form-field">
              <label for="auth-email">E-mail</label>
              <input
                id="auth-email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="voce@exemplo.com"
                maxlength="255"
                required
              />
            </div>
            <div class="form-field">
              <label for="auth-password">Senha</label>
              <div class="password-input">
                <input
                  id="auth-password"
                  v-model="form.password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  :autocomplete="isRegister ? 'new-password' : 'current-password'"
                  :minlength="isRegister ? 8 : undefined"
                  :aria-describedby="isRegister ? 'password-help' : undefined"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  :aria-pressed="showPassword"
                  @click="showPassword = !showPassword"
                >
                  <span
                    :class="['mdi', showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline']"
                    aria-hidden="true"
                  ></span>
                </button>
              </div>
              <small v-if="isRegister" id="password-help">Use pelo menos 8 caracteres.</small>
            </div>
            <div v-if="isRegister" class="form-field">
              <label for="auth-confirmation">Confirmar senha</label>
              <input
                id="auth-confirmation"
                v-model="form.confirmation"
                name="confirmation"
                type="password"
                autocomplete="new-password"
                placeholder="Digite sua senha novamente"
                minlength="8"
                required
              />
            </div>
            <div v-if="isRegister" class="legal-acceptance" aria-label="Confirmações obrigatórias de cadastro">
              <label class="accept-row" for="accept-terms">
                <input id="accept-terms" v-model="form.accept_terms" type="checkbox" name="accept_terms" required />
                <span>Li e concordo com os <RouterLink to="/termos-de-uso" target="_blank" rel="noopener noreferrer">Termos de Uso</RouterLink>.</span>
              </label>
              <label class="accept-row" for="accept-privacy">
                <input id="accept-privacy" v-model="form.accept_privacy" type="checkbox" name="accept_privacy" required />
                <span>Li a <RouterLink to="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</RouterLink> e estou ciente de como meus dados serão utilizados.</span>
              </label>
              <p class="legal-helper">As duas confirmações são necessárias para criar uma conta. Os documentos abrem em outra aba.</p>
            </div>
            <button class="submit-button" type="submit" :disabled="isRegister && (!form.accept_terms || !form.accept_privacy)">
              <span v-if="loading" class="mdi mdi-loading mdi-spin" aria-hidden="true"></span>
              {{ loading ? 'Aguarde...' : isRegister ? 'Criar minha conta' : 'Entrar' }}
              <span v-if="!loading" class="mdi mdi-arrow-right" aria-hidden="true"></span>
            </button>
          </fieldset>
        </form>
        <p class="switch-prompt">
          {{ isRegister ? 'Já tem uma conta?' : 'Ainda não tem uma conta?' }}
          <button
            type="button"
            :disabled="loading"
            @click="changeMode(isRegister ? 'login' : 'register')"
          >
            {{ isRegister ? 'Entrar' : 'Cadastre-se' }}
          </button>
        </p>
      </div>
    </section>
    <p class="public-note">Os recados da comunidade continuam disponíveis para todos.</p>
  </main>
</template>

<style scoped>
.auth-page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 36px 24px 48px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #526962;
  font-size: 14px;
  text-decoration: none;
  margin-bottom: 24px;
}
.back-link:hover {
  color: #0a4c34;
}
.auth-card {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  border: 1px solid #d6e1df;
  border-radius: 24px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 16px 48px #123d2710;
}
.auth-intro {
  padding: 42px 36px;
  background: #e8f0eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: #0a4c34;
}
.intro-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}
.community-logo {
  width: 106px;
  height: 106px;
  object-fit: contain;
  margin: 32px 0 24px;
}
.auth-intro h1 {
  font-family: 'Comfortaa', sans-serif;
  font-size: 30px;
  line-height: 1.45;
  margin-bottom: 18px;
}
.auth-intro > p {
  font-size: 15px;
  line-height: 1.8;
  color: #526962;
}
.community-note {
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid #cbdcd1;
  margin-top: 38px;
  padding-top: 24px;
  font-size: 13px;
  line-height: 1.6;
}
.community-note .mdi {
  font-size: 28px;
}
.auth-content {
  padding: 40px;
}
.mode-switch {
  display: flex;
  background: #f1f5f2;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 32px;
}
button,
input {
  font: inherit;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: wait;
  opacity: 0.65;
}
.mode-switch button {
  flex: 1;
  padding: 11px;
  border: 0;
  border-radius: 7px;
  color: #647273;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
}
.mode-switch button.active {
  background: white;
  color: #0a4c34;
  box-shadow: 0 2px 6px #0000000d;
}
.auth-content h2 {
  font-size: 23px;
  color: #153d2c;
  line-height: 1.4;
  margin-bottom: 8px;
}
.form-description {
  color: #647273;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 26px;
}
fieldset {
  border: 0;
  min-width: 0;
}
.form-field {
  margin-bottom: 18px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #294237;
}
input {
  width: 100%;
  min-width: 0;
  border: 1px solid #d6e1df;
  border-radius: 9px;
  padding: 13px 14px;
  background: #fdfefd;
  color: #172b23;
  font-size: 14px;
}
input::placeholder {
  color: #85928b;
}
input:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 3px solid #9fc5ad;
  outline-offset: 3px;
}
.password-input {
  position: relative;
}
.password-input input {
  padding-right: 50px;
}
.password-toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  padding: 8px;
  color: #647273;
  font-size: 21px;
}
small {
  display: block;
  margin-top: 7px;
  color: #647273;
  font-size: 12px;
}
.submit-button {
  width: 100%;
  border: 0;
  border-radius: 9px;
  padding: 14px;
  background: #0a4c34;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
}
.submit-button:hover:not(:disabled) {
  background: #083d2a;
}
.switch-prompt {
  margin-top: 24px;
  text-align: center;
  color: #647273;
  font-size: 13px;
  line-height: 1.8;
}
.switch-prompt button {
  border: 0;
  background: transparent;
  color: #0a4c34;
  font-weight: 700;
  margin-left: 4px;
}
.feedback {
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.error {
  background: #fff0ef;
  color: #962d25;
}
.success {
  background: #edf6ee;
  color: #175b35;
}
.public-note {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: #647273;
}
.legal-acceptance { margin: 18px 0; border: 1px solid #d6e1df; background: #f7faf8; border-radius: 10px; padding: 16px; }
.accept-row { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 13px; cursor: pointer; font-size: 12px; line-height: 1.65; }
.accept-row input[type='checkbox'] { flex: 0 0 18px; width: 18px; min-width: 18px; height: 18px; margin-top: 2px; accent-color: #0a6a4c; }
.accept-row span { flex: 1; }
.accept-row a { color: #0a6a4c; font-weight: 700; }
.legal-helper { margin: 0; color: #647273; font-size: 11px; line-height: 1.6; }
@media (max-width: 700px) {
  .auth-page {
    padding: 24px 16px 36px;
  }
  .auth-card {
    grid-template-columns: 1fr;
    border-radius: 18px;
  }
  .auth-intro {
    padding: 26px;
  }
  .community-logo,
  .community-note {
    display: none;
  }
  .auth-intro h1 {
    font-size: 23px;
    margin: 16px 0 10px;
  }
  .auth-intro > p {
    font-size: 14px;
  }
  .auth-content {
    padding: 26px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .mdi-spin {
    animation: none;
  }
}
</style>
