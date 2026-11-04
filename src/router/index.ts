import { createRouter, createWebHistory } from '@ionic/vue-router'
import { supabase } from '../services/supabase'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/LoginPage.vue'), meta: { guestOnly: true } },
  { path: '/dashboard', component: () => import('../views/DashboardPage.vue'), meta: { requiresAuth: true } },
  { path: '/receitas', component: () => import('../views/TransactionsPage.vue'), meta: { requiresAuth: true, kind: 'receitas' } },
  { path: '/despesas', component: () => import('../views/TransactionsPage.vue'), meta: { requiresAuth: true, kind: 'despesas' } },
]
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })
router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (to.meta.requiresAuth && !session) return '/login'
  if (to.meta.guestOnly && session) return '/dashboard'
})
export default router
