<script setup>
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-main">
        <div class="community">
          <p class="footer-title">Nossa Senhora dos Migrantes</p>
          <p>Um espaço de encontro e comunicação da comunidade.</p>
          <a class="footer-link" href="https://www.instagram.com/nossasenhoradosmigrantesjp/"
            target="_blank" rel="noopener noreferrer">
            <span class="mdi mdi-instagram" aria-hidden="true"></span>
            Instagram da comunidade
          </a>
        </div>
        <div class="footer-address">
          <p class="footer-heading">Localização</p>
          <a class="footer-link" href="https://www.google.com/maps/search/?api=1&query=R.%20Crater%20Jardim%20Para%C3%ADso%20Joinville%20SC%2089226-634"
            target="_blank" rel="noopener noreferrer">
            <span class="mdi mdi-map-marker-outline" aria-hidden="true"></span>
            R. Crater - Jardim Paraíso, Joinville - SC, 89226-634
          </a>
        </div>
        <div class="footer-legal">
          <p class="footer-heading">Informações legais</p>
          <RouterLink class="footer-link" to="/termos-de-uso">Termos de Uso</RouterLink>
          <RouterLink class="footer-link" to="/politica-de-privacidade">Política de Privacidade</RouterLink>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ year }} Nossa Senhora dos Migrantes. Todos os direitos reservados.</span>
        <span>Desenvolvido por <strong>Lucas Fontini da Luz</strong></span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer { margin-top: auto; background: #103c2b; color: #e5eee8; font-family: 'Comfortaa', sans-serif; }
.footer-inner { width: min(1200px, 92%); margin: 0 auto; padding: 35px 0 18px; }
.footer-main { display: grid; grid-template-columns: 1.3fr 1.25fr 1fr; gap: 28px; }
.footer-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #fff; }
.community > p:nth-child(2) { font-size: 12px; line-height: 1.65; color: #c1d4ca; margin-bottom: 16px; }
.footer-heading { margin: 0 0 15px; color: #fff; font-size: 13px; font-weight: 700; }
.footer-link { display: flex; align-items: flex-start; gap: 9px; width: fit-content; max-width: 100%; margin-bottom: 12px; color: #d3e7dc; font-size: 12px; line-height: 1.65; text-decoration: none; overflow-wrap: anywhere; }
.footer-link .mdi { font-size: 18px; flex-shrink: 0; }
.footer-link:hover { color: #fff; text-decoration: underline; }
.footer-link:focus-visible { outline: 2px solid white; outline-offset: 4px; }
.footer-bottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 25px; padding-top: 19px; border-top: 1px solid #ffffff33; color: #b9d1c4; font-size: 11px; line-height: 1.6; }
.footer-bottom strong { color: #fff; }
@media (max-width: 760px) { .footer-main { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .footer-main { grid-template-columns: 1fr; gap: 20px; } .footer-inner { padding-top: 28px; } .footer-bottom { flex-direction: column; } }
</style>
