import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const SITE_URL = 'https://nossa-senhora-dos-migrantes-recados.vercel.app'
const DEFAULT_DESCRIPTION = 'Confira eventos, celebrações, avisos e recados da Comunidade Nossa Senhora dos Migrantes, no Jardim Paraíso, em Joinville - SC.'

const pageSeo = {
  home: {
    title: 'Comunidade Nossa Senhora dos Migrantes | Joinville - SC',
    description: DEFAULT_DESCRIPTION,
  },
  terms: {
    title: 'Termos de Uso | Nossa Senhora dos Migrantes',
    description: 'Leia as condições de uso do portal Recados da Comunidade Nossa Senhora dos Migrantes, em Joinville - SC.',
  },
  privacy: {
    title: 'Política de Privacidade | Nossa Senhora dos Migrantes',
    description: 'Conheça a Política de Privacidade e o tratamento de dados no portal Recados da Comunidade Nossa Senhora dos Migrantes.',
  },
}

function setMeta(attribute, name, content) {
  let meta = document.head.querySelector(`meta[${attribute}="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function updateSeo(to) {
  const details = pageSeo[to.name]
  const title = details?.title || 'Recados - Nossa Senhora dos Migrantes'
  const description = details?.description || DEFAULT_DESCRIPTION
  const isPublic = Boolean(details)
  const canonicalUrl = SITE_URL + (to.path === '/' ? '/' : to.path)

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', isPublic ? 'index, follow' : 'noindex, nofollow')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', canonicalUrl)

  // Evita uma URL canônica apontando para a home em páginas legais.
  // Rotas privadas ou inexistentes não devem declarar URL canônica pública.
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (isPublic) {
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
  } else {
    canonical?.remove()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/homePageView.vue') },
    { path: '/perguntas', name: 'questions', component: () => import('@/views/questionPageView.vue') },
    {
      path: '/admin', name: 'admin',
      component: () => import('@/views/adminPageView.vue'),
      meta: { requiresAdmin: true },
    },
    { path: '/login', name: 'login', component: () => import('@/views/loginRegisterView.vue') },
    { path: '/termos-de-uso', name: 'terms', component: () => import('@/views/termsOfUseView.vue') },
    { path: '/politica-de-privacidade', name: 'privacy', component: () => import('@/views/privacyPolicyView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/notFoundView.vue') },
  ],
})

router.beforeEach(async to => {
  if (!to.meta.requiresAdmin) return true
  const auth = useAuthStore()
  try {
    await auth.refreshUserSession()
  } catch {
    return { name: 'login' }
  }
  const isAdmin = auth.user?.is_superuser ||
    auth.user?.groups?.some(group => ['admin', 'superadmin'].includes(group.name))
  return isAdmin ? true : { name: 'home' }
})

router.afterEach(to => {
  updateSeo(to)
})

export default router
