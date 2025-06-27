<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/dashboard" class="text-xl font-semibold text-white">
              Onwards Admin
            </router-link>
            <nav class="flex space-x-8">
              <router-link to="/dashboard" class="text-purple-200 hover:text-white">Dashboard</router-link>
              <router-link to="/members" class="text-purple-200 hover:text-white">Members</router-link>
              <router-link to="/attendance" class="text-purple-200 hover:text-white">Attendance</router-link>
              <router-link to="/reports" class="text-purple-200 hover:text-white">Reports</router-link>
              <router-link to="/admin" class="text-purple-200 hover:text-white">Admin</router-link>
              <router-link to="/forms" class="text-white font-medium">Forms</router-link>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-white">{{ authStore.user?.username }}</span>
            <button @click="logout" class="text-sm text-purple-200 hover:text-white">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Forms</h1>
          <p class="text-gray-600 mt-1">Access and manage Onwards forms and applications</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Registration Form Card -->
          <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-full bg-onwards-blue bg-opacity-10">
                <svg class="w-6 h-6 text-onwards-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Member Registration</h3>
              </div>
            </div>
            <p class="text-gray-600 mb-4 flex-grow">
              Complete member registration form for new community members joining Onwards.
            </p>
            <div class="flex justify-between items-center mt-auto">
              <span class="text-sm text-gray-500">Public form</span>
              <div class="flex space-x-2">
                <router-link
                  to="/register"
                  class="px-4 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Fill Out Form
                </router-link>
                <router-link
                  to="/forms/member-registrations/submissions"
                  class="px-4 py-2 border border-onwards-blue text-onwards-blue rounded hover:bg-blue-50 transition-colors"
                >
                  View Submissions
                </router-link>
              </div>
            </div>
          </div>

          <!-- UCLA Loneliness Scale Form Card -->
          <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-full bg-purple-100">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">UCLA Loneliness Scale</h3>
              </div>
            </div>
            <p class="text-gray-600 mb-4 flex-grow">
              Brief assessment to understand social experiences and feelings of loneliness or isolation.
            </p>
            <div class="flex justify-between items-center mt-auto">
              <span class="text-sm text-gray-500">Public form</span>
              <div class="flex space-x-2">
                <router-link
                  to="/forms/ucla-loneliness-scale"
                  class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Fill Out Form
                </router-link>
                <router-link
                  to="/forms/ucla-loneliness-scale/submissions"
                  class="px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                >
                  View Submissions
                </router-link>
              </div>
            </div>
          </div>

          <!-- Placeholder for future forms -->
          <div class="bg-white p-6 rounded-lg shadow border-2 border-dashed border-gray-300">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">More forms coming soon</h3>
              <p class="mt-1 text-sm text-gray-500">Additional forms will appear here as they're added to the system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>