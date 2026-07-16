import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import PDIList from '../pages/PDIList.vue'
import PDIRegister from '../pages/PDIRegister.vue'
import PDIUpdate from '../pages/PDIUpdate.vue'
import { clearSession, getCurrentUser, isAuthenticated } from '../services/api'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/pdi', component: PDIList, meta: { requiresAuth: true, role: 'user' } },
  { path: '/pdi/register', component: PDIRegister, meta: { requiresAuth: true, role: 'user' } },
  { path: '/pdi/update/:theme', component: PDIUpdate, props: true, meta: { requiresAuth: true, role: 'user' } },
  { path: '/admin', component: () => import('../pages/AdminUsers.vue'), meta: { requiresAuth: true, role: 'admin' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) return '/login'
  const user = getCurrentUser()
  if (to.meta.requiresAuth && !user) {
    clearSession()
    return '/login'
  }
  const home = user?.role === 'admin' ? '/admin' : '/pdi'
  if (to.meta.guestOnly && isAuthenticated()) {
    if (!user) clearSession()
    else return home
  }
  if (to.meta.role && user?.role !== to.meta.role) return home
})

export default router
