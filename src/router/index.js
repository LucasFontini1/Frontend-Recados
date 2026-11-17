import { createRouter, createWebHistory } from 'vue-router'
import homePageView from '@/views/homePageView.vue'
import loginRegisterView from '@/views/loginRegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: homePageView
    },
    {
      path: '/login',
      name: 'login',
      component: loginRegisterView
    },
  ],
})

export default router
