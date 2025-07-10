import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
      component: () => import('../pages/Setup.vue'),
      meta: { requiresNoAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue'),
      meta: { requiresNoAuth: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../pages/Register.vue'),
      meta: { public: true }
    },
    {
      path: '/register-success',
      name: 'RegisterSuccess',
      component: () => import('../pages/RegisterSuccess.vue'),
      meta: { public: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../pages/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/members',
      name: 'Members',
      component: () => import('../pages/Members.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/members/:id',
      name: 'MemberDetail',
      component: () => import('../pages/MemberDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/attendance',
      name: 'Attendance',
      component: () => import('../pages/Attendance.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import('../pages/Reports.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../pages/Admin.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forms',
      name: 'Forms',
      component: () => import('../pages/Forms.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forms/ucla-loneliness-scale',
      name: 'UCLALonelinessScale',
      component: () => import('../pages/UCLALonelinessScale.vue'),
      meta: { public: true }
    },
    {
      path: '/forms/member-registrations/submissions',
      name: 'MemberSubmissions',
      component: () => import('../pages/MemberSubmissions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forms/ucla-loneliness-scale/submissions',
      name: 'UCLASubmissions',
      component: () => import('../pages/UCLASubmissions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/photo-consent',
      name: 'PhotoConsent',
      component: () => import('../pages/PhotoConsent.vue'),
      meta: { public: true }
    },
    {
      path: '/photo-consent-success',
      name: 'PhotoConsentSuccess',
      component: () => import('../pages/PhotoConsentSuccess.vue'),
      meta: { public: true }
    },
    {
      path: '/forms/photo-consent/submissions',
      name: 'PhotoConsentSubmissions',
      component: () => import('../pages/PhotoConsentSubmissions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wellbeing-questionnaire',
      name: 'WellbeingIndex',
      component: () => import('../pages/WellbeingIndex.vue'),
      meta: { public: true }
    },
    {
      path: '/wellbeing-questionnaire-success',
      name: 'WellbeingIndexSuccess',
      component: () => import('../pages/WellbeingIndexSuccess.vue'),
      meta: { public: true }
    },
    {
      path: '/forms/wellbeing-questionnaire/submissions',
      name: 'WellbeingIndexSubmissions',
      component: () => import('../pages/WellbeingIndexSubmissions.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return '/login'
    }
    // Verify token and populate user data for authenticated routes
    const isValid = await authStore.verifyToken()
    if (!isValid) {
      return '/login'
    }
  }
  
  if (to.meta.requiresNoAuth && authStore.isAuthenticated) {
    return '/dashboard'
  }
})

export default router