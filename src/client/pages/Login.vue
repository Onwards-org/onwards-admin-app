<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Onwards Admin
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your administrator credentials
        </p>
      </div>
      
      <form @submit.prevent="login" class="mt-8 space-y-6">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              required
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-onwards-blue focus:border-onwards-blue focus:z-10 sm:text-sm"
              placeholder="Username"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-onwards-blue focus:border-onwards-blue focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-onwards-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onwards-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/register"
            class="text-onwards-blue hover:text-blue-700"
          >
            Register as a new member
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const login = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login(form.value.username, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const needsSetup = await authStore.checkSetup()
    if (needsSetup) {
      router.push('/setup')
    }
  } catch (err) {
    console.error('Failed to check setup status:', err)
  }
})
</script>