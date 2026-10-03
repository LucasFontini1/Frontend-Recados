import { createRouter, createWebHistory } from 'vue-router'
import homePageView from '@/views/homePageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: homePageView
    }
  ],
})

export default router
