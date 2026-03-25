import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/HomePage.vue'),
    },
    {
      path: '/generate',
      name: 'generate',
      component: () => import('./pages/GeneratePage.vue'),
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: () => import('./pages/EditorPage.vue'),
    },
  ],
})

export default router
