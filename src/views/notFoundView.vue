<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="not-found">
    <section class="not-found-card" aria-labelledby="not-found-title">
      <img
        class="community-logo"
        src="/img/logo-removebg-preview.png"
        alt="Logo da comunidade Nossa Senhora dos Migrantes"
        width="160"
        height="160"
      />

      <p class="error-code">404</p>
      <h1 id="not-found-title">Página não encontrada</h1>
      <p class="description">
        Não encontramos a página que você tentou acessar.
        O endereço pode estar incorreto ou o conteúdo pode ter sido movido.
      </p>

      <p class="missing-path">
        Endereço: <code>{{ route.fullPath }}</code>
      </p>

      <div class="actions">
        <RouterLink class="primary-action" to="/">
          <span class="mdi mdi-home-outline" aria-hidden="true"></span>
          Voltar para os recados
        </RouterLink>
        <button type="button" class="secondary-action" @click="$router.back()">
          <span class="mdi mdi-arrow-left" aria-hidden="true"></span>
          Página anterior
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  display: grid;
  place-items: center;
  width: min(900px, 94%);
  min-height: 65vh;
  margin: 0 auto;
  padding: 50px 16px 70px;
  font-family: 'Comfortaa', sans-serif;
}

.not-found-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: clamp(26px, 5vw, 50px);
  border: 1px solid #d6e1df;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 40px #123d2710;
  text-align: center;
}

.community-logo {
  width: clamp(105px, 24vw, 160px);
  height: auto;
  object-fit: contain;
}

.error-code {
  margin: 18px 0 0;
  color: #0a6a4c;
  font-size: clamp(54px, 12vw, 86px);
  font-weight: 700;
  line-height: 1.1;
}

h1 {
  margin: 10px 0 18px;
  color: #18332a;
  font-size: clamp(22px, 4vw, 30px);
}

.description {
  max-width: 530px;
  color: #526962;
  font-size: 14px;
  line-height: 1.85;
}

.missing-path {
  max-width: 100%;
  margin-top: 18px;
  color: #647273;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.missing-path code {
  font-family: ui-monospace, monospace;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 12px 18px;
  border: 1px solid #0a4c34;
  border-radius: 10px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-action {
  background: #0a4c34;
  color: #fff;
}

.secondary-action {
  background: #fff;
  color: #0a4c34;
}

.primary-action:hover {
  background: #0b6143;
}

.secondary-action:hover {
  background: #edf7f1;
}

.primary-action:focus-visible,
.secondary-action:focus-visible {
  outline: 3px solid #0a6a4c;
  outline-offset: 3px;
}

@media (max-width: 520px) {
  .actions {
    width: 100%;
    flex-direction: column;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }
}
</style>
