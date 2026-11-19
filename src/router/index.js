import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

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

export default router
