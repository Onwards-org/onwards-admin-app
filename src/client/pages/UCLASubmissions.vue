<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <nav class="shadow" style="background-color: #a672b0;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/dashboard" class="text-xl font-semibold text-white">
              Onwards Admin
            </router-link>
            <div class="flex items-center space-x-2 text-sm text-purple-200">
              <router-link to="/forms" class="hover:text-white">Forms</router-link>
              <span>›</span>
              <span class="text-white">UCLA Loneliness Scale Submissions</span>
            </div>
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
        <div class="mb-6 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">UCLA Loneliness Scale Submissions</h1>
            <p class="text-gray-600 mt-1">View all UCLA loneliness scale form submissions</p>
          </div>
          <router-link
            to="/forms"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            ← Back to Forms
          </router-link>
        </div>

        <div class="bg-white shadow rounded-lg overflow-hidden">
          <!-- Table Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">All Submissions</h3>
              <div class="text-sm text-gray-500">
                Total: {{ submissions.length }} submissions
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="p-6 text-center text-gray-500">
            Loading submissions...
          </div>

          <!-- Table Content -->
          <div v-else-if="submissions.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feel Isolated
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feel Left Out
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lack Companionship
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="submission in submissions" :key="submission.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ submission.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span :class="getResponseColor(submission.isolated_response)" class="px-2 py-1 rounded-full text-xs">
                      {{ formatResponse(submission.isolated_response) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span :class="getResponseColor(submission.left_out_response)" class="px-2 py-1 rounded-full text-xs">
                      {{ formatResponse(submission.left_out_response) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span :class="getResponseColor(submission.lack_companionship_response)" class="px-2 py-1 rounded-full text-xs">
                      {{ formatResponse(submission.lack_companionship_response) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(submission.submission_date) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="p-6 text-center text-gray-500">
            No UCLA loneliness scale submissions found.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const submissions = ref<any[]>([])
const loading = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB')
}

const formatResponse = (response: string) => {
  return response.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getResponseColor = (response: string) => {
  switch (response) {
    case 'hardly_ever':
      return 'bg-green-100 text-green-800'
    case 'some_of_the_time':
      return 'bg-yellow-100 text-yellow-800'
    case 'often':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const loadSubmissions = async () => {
  loading.value = true
  
  try {
    const response = await fetch('/api/ucla-loneliness-scale/submissions', {
      headers: authStore.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to load UCLA submissions')
    }

    const data = await response.json()
    submissions.value = data.submissions || []
  } catch (error) {
    console.error('Error loading UCLA submissions:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await authStore.verifyToken()
  loadSubmissions()
})
</script>