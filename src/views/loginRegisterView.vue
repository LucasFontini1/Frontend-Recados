<script setup>
import { RouterLink } from 'vue-router'
import AuthIntro from '@/components/auth/AuthIntro.vue'
import AuthForm from '@/components/auth/AuthForm.vue'
</script>

<template>
  <main class="auth-page">
    <RouterLink class="back-link" to="/">
      <span class="mdi mdi-arrow-left" aria-hidden="true"></span> Voltar para os recados
    </RouterLink>

    <section class="auth-card" aria-labelledby="auth-title">
      <AuthIntro />
      <AuthForm />
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
.public-note {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: #647273;
}
@media (max-width: 700px) {
  .auth-page {
    padding: 24px 16px 36px;
  }
  .auth-card {
    grid-template-columns: 1fr;
    border-radius: 18px;
  }
}
</style>
