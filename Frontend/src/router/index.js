import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import PDIList from '../pages/PDIList.vue'
import PDIRegister from '../pages/PDIRegister.vue'
import PDIUpdate from '../pages/PDIUpdate.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/pdi', component: PDIList },
  { path: '/pdi/register', component: PDIRegister },
  { path: '/pdi/update/:theme', component: PDIUpdate, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
