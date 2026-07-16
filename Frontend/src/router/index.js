import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import PDIList from '../pages/PDIList.vue'
import PDIRegister from '../pages/PDIRegister.vue'
import PDIUpdate from '../pages/PDIUpdate.vue'
import { clearSession, getCurrentUser, isAuthenticated } from '../services/api'
import { registrarPush } from "@/firebase"

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

// controla se já tentamos registrar o push nessa sessão do navegador
let pushJaRegistrado = false

router.beforeEach(async (to) => {
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

  // AQUI ⬇️ registra o push uma única vez, quando detecta usuário autenticado
  if (user && isAuthenticated() && !pushJaRegistrado) {
    pushJaRegistrado = true
    const token = localStorage.getItem('authToken') // ou o nome que você usa no services/api
    registrarPush(import.meta.env.VITE_API_URL, token) // sem await, não trava a navegação
  }
})

export default router