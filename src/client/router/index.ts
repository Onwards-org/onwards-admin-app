import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/setup',
      name: 'Setup',
      component: () => import('@/pages/Setup.vue'),
      meta: { requiresNoAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue'),
      meta: { requiresNoAuth: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/Register.vue'),
      meta: { public: true }
    },
    {
      path: '/register-success',
      name: 'RegisterSuccess',
      component: () => import('@/pages/RegisterSuccess.vue'),
      meta: { public: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/members',
      name: 'Members',
      component: () => import('@/pages/Members.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/members/:id',
      name: 'MemberDetail',
      component: () => import('@/pages/MemberDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/attendance',
      name: 'Attendance',
      component: () => import('@/pages/Attendance.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('@/pages/Reports.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/pages/Admin.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forms',
      name: 'Forms',
      component: () => import('@/pages/Forms.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }
  
  if (to.meta.requiresNoAuth && authStore.isAuthenticated) {
    return '/dashboard'
  }
})

export default router