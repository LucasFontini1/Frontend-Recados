<script setup>
import router from '@/router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.is_superuser || auth.user?.groups?.some((group) => group.name === 'admin'))
onMounted(() => {
  auth.refreshUserSession().catch(() => {
    // Erros de conexão não impedem a leitura dos recados públicos.
  })
})

function logout() {
  auth.logout()
  router.push('/')
}
</script>
<template>
  <header>
    <div class="total">
      <div class="logo">
        <img src="/img/logo-removebg-preview.png" alt="logo" @click="router.push('/')" />
        <div class="text">
          <h1>Portal da comunicação</h1>
          <p>Da comunidade - Um lugar para se encontrar</p>
        </div>
      </div>
      <nav class="security" aria-label="Menu principal">
        <RouterLink to="/perguntas" class="header-link">Pergunte à diretoria</RouterLink>
        <RouterLink v-if="auth.isAuthenticated && isAdmin" to="/admin" class="header-link">Administração</RouterLink>
        <button v-if="!auth.isAuthenticated" @click="router.push('/login')">
          <span class="mdi mdi-security"></span><span class="enter">Entrar</span>
        </button>
        <button v-else @click="logout">
          <span class="mdi mdi-logout" aria-hidden="true"></span><span>Sair</span>
        </button>
      </nav>
    </div>
  </header>
</template>
<style scoped>
header {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #d6e1df;
}
div.total {
  display: flex;
  justify-content: space-between;
  width: 70%;
  padding: 10px;
  align-items: center;
}

div.logo {
  display: flex;
  align-items: center;
  gap: 20px;

  & img {
    width: 20%;
  }

  & h1 {
    font-size: 25px;
    margin-bottom: 5px;
  }
  & p {
    font-size: 15px;
    color: #647273;
  }
}

div.security {
  display: flex;
  align-items: center;
  gap: 10px;

  & button {
    background-color: #f8fafd;
    border: #d6e1df 1px solid;
    padding: 10px 20px;
    display: flex;
    gap: 10px;
    font-size: 15px;
    border-radius: 10px;
    transition: 0.2s;
  }

  & button:hover {
    background-color: #bbc5c3;
    cursor: pointer;
  }
}
.header-link {
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid #d6e1df;
  color: #0a4c34;
  background: #f8fafd;
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
}
.header-link:hover { background: #e8f0eb; }
@media (max-width: 700px) {
  div.security { flex-wrap: wrap; justify-content: flex-end; }
  .header-link { font-size: 11px; padding: 8px; }
  div.total {
    width: 100%;
    gap: 12px;
    padding: 12px 16px;
  }
  div.logo {
    gap: 10px;
  }
  div.logo img {
    width: 48px;
  }
  div.logo h1 {
    font-size: 16px;
  }
  div.logo p {
    font-size: 11px;
  }
  div.security button {
    padding: 10px;
    white-space: nowrap;
  }
}
</style>
