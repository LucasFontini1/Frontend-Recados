import { createRouter, createWebHistory } from 'vue-router'
import homePageView from '@/views/homePageView.vue'
import loginRegisterView from '@/views/loginRegisterView.vue'
import { useAuthStore } from '@/stores/authStore'
import adminPageView from '@/views/adminPageView.vue'
import questionPageView from '@/views/questionPageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: homePageView
    },
    {
      path: '/perguntas',
      name: 'questions',
      component: questionPageView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: adminPageView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/login',
      name: 'login',
      component: loginRegisterView
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true
  const auth = useAuthStore()
  try {
    await auth.refreshUserSession()
  } catch {
    return { name: 'login' }
  }
  const isAdmin = auth.user?.is_superuser || auth.user?.groups?.some((group) => ['admin', 'superadmin'].includes(group.name))
  return isAdmin ? true : { name: 'home' }
})

export default router
