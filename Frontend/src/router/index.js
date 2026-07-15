import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import PDIList from '../pages/PDIList.vue'
import PDIRegister from '../pages/PDIRegister.vue'
import PDIUpdate from '../pages/PDIUpdate.vue'
import { isAuthenticated } from '../services/api'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/pdi', component: PDIList, meta: { requiresAuth: true } },
  { path: '/pdi/register', component: PDIRegister, meta: { requiresAuth: true } },
  { path: '/pdi/update/:theme', component: PDIUpdate, props: true, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) return '/login'
  if (to.meta.guestOnly && isAuthenticated()) return '/pdi'
})

export default router
