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
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Wellbeing Index Submissions</h1>
            <p class="text-gray-600 mt-1">Manage wellbeing questionnaire responses from community members</p>
          </div>
          <div class="flex space-x-3 items-center">
            <div class="flex space-x-2">
              <select 
                v-model="selectedYear" 
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <select 
                v-model="selectedMonth" 
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option v-for="(month, index) in monthNames" :key="index" :value="index + 1">{{ month }}</option>
              </select>
            </div>
            <button
              @click="generateReport"
              :disabled="generatingReport"
              class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ generatingReport ? 'Generating...' : 'Download PDF Report' }}
            </button>
            <router-link
              to="/forms"
              class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Forms
            </router-link>
          </div>
        </div>

        <!-- Summary Stats -->
        <div v-if="!loading && submissions.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-2xl font-bold text-orange-600">{{ total }}</div>
            <div class="text-sm text-gray-600">Total Responses</div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-2xl font-bold text-green-600">{{ avgWellbeingScore }}</div>
            <div class="text-sm text-gray-600">Avg Wellbeing Score</div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-2xl font-bold text-blue-600">{{ thisMonthResponses }}</div>
            <div class="text-sm text-gray-600">This Month</div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-2xl font-bold text-purple-600">{{ uniqueRespondents }}</div>
            <div class="text-sm text-gray-600">Unique Respondents</div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p class="text-gray-600 mt-2">Loading submissions...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800">{{ error }}</p>
          <button @click="loadSubmissions" class="text-red-600 hover:text-red-800 text-sm mt-2">
            Try again
          </button>
        </div>

        <!-- Submissions List -->
        <div v-else-if="submissions.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">
              {{ total }} Total Submissions
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demographics
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wellbeing Score
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="submission in submissions" :key="submission.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ submission.full_name }}
                      </div>
                      <div v-if="submission.email" class="text-sm text-gray-500">
                        {{ submission.email }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm text-gray-900">
                        {{ submission.age_group }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ submission.gender || 'Not specified' }} • {{ submission.location || 'Not specified' }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="text-sm font-medium" :class="getScoreColor(submission.wellbeing_score)">
                        {{ submission.wellbeing_score }}/30
                      </span>
                      <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          class="h-2 rounded-full" 
                          :class="getScoreBarColor(submission.wellbeing_score)"
                          :style="{ width: `${(submission.wellbeing_score / 30) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(submission.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewSubmission(submission)"
                        class="text-orange-600 hover:text-orange-900"
                      >
                        View Details
                      </button>
                      <button
                        @click="deleteSubmission(submission.id)"
                        class="text-red-600 hover:text-red-900"
                        :disabled="deletingId === submission.id"
                      >
                        {{ deletingId === submission.id ? 'Deleting...' : 'Delete' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-700">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
                {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
                {{ pagination.total }} submissions
              </div>
              <div class="flex space-x-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="pagination.page <= 1"
                  class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="pagination.page >= pagination.pages"
                  class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-lg shadow p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No wellbeing questionnaire submissions yet</h3>
          <p class="mt-2 text-gray-500">When community members complete the wellbeing assessment, their responses will appear here.</p>
          <router-link
            to="/wellbeing-questionnaire"
            class="mt-4 inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Fill Out Sample Questionnaire
          </router-link>
        </div>
      </div>
    </div>

    <!-- View Submission Modal -->
    <div v-if="selectedSubmission" class="fixed inset-0 z-50 overflow-y-auto" @click="closeModal">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" @click.stop>
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Wellbeing Assessment Details - {{ selectedSubmission.full_name }}
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Personal Information -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Personal Information</h4>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Full Name</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.full_name }}</p>
                  </div>
                  <div v-if="selectedSubmission.email">
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.email }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Age Group</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.age_group }}</p>
                  </div>
                  <div v-if="selectedSubmission.gender">
                    <label class="block text-sm font-medium text-gray-700">Gender</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.gender }}</p>
                  </div>
                  <div v-if="selectedSubmission.location">
                    <label class="block text-sm font-medium text-gray-700">Location</label>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedSubmission.location }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Submitted</label>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(selectedSubmission.created_at) }}</p>
                  </div>
                </div>

                <!-- Wellbeing Scores -->
                <div class="space-y-4">
                  <h4 class="font-medium text-gray-900">Wellbeing Scores</h4>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Overall Score</label>
                    <p class="mt-1 text-sm font-medium" :class="getScoreColor(selectedSubmission.wellbeing_score)">
                      {{ selectedSubmission.wellbeing_score }}/30 ({{ Math.round((selectedSubmission.wellbeing_score / 30) * 100) }}%)
                    </p>
                  </div>
                  <div class="text-sm text-gray-600">
                    <p>This is a simplified wellbeing scale with 5 questions, each scored 1-6 points.</p>
                    <p class="mt-2">Score breakdown:</p>
                    <ul class="mt-1 list-disc list-inside space-y-1">
                      <li>Very Low: 5-10 points</li>
                      <li>Low: 11-15 points</li>
                      <li>Below Average: 16-20 points</li>
                      <li>Average: 21-25 points</li>
                      <li>High: 26-30 points</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Additional Comments -->
              <div v-if="selectedSubmission.additional_comments" class="mt-6">
                <label class="block text-sm font-medium text-gray-700">Additional Comments</label>
                <p class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{{ selectedSubmission.additional_comments }}</p>
              </div>

              <!-- Response Details -->
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Detailed Responses</label>
                <div class="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                  <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(selectedSubmission.responses, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface WellbeingSubmission {
  id: number
  full_name: string
  email?: string
  age_group: string
  gender?: string
  location?: string
  wellbeing_score: number
  mental_health_score: number
  social_score: number
  physical_health_score: number
  purpose_score: number
  responses: Record<string, number>
  additional_comments?: string
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const router = useRouter()
const authStore = useAuthStore()

const submissions = ref<WellbeingSubmission[]>([])
const loading = ref(true)
const error = ref('')
const selectedSubmission = ref<WellbeingSubmission | null>(null)
const deletingId = ref<number | null>(null)
const generatingReport = ref(false)
const total = ref(0)
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 2; year <= currentYear; year++) {
    years.push(year)
  }
  return years
})
const pagination = ref<Pagination>({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// Computed statistics
const avgWellbeingScore = computed(() => {
  if (submissions.value.length === 0) return '0'
  const avg = submissions.value.reduce((sum, s) => sum + s.wellbeing_score, 0) / submissions.value.length
  return avg.toFixed(1)
})

const thisMonthResponses = computed(() => {
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  return submissions.value.filter(s => {
    const date = new Date(s.created_at)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  }).length
})

const uniqueRespondents = computed(() => {
  const names = new Set(submissions.value.map(s => s.full_name.toLowerCase().trim()))
  return names.size
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const loadSubmissions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`/api/wellbeing-questionnaire?page=${pagination.value.page}&limit=${pagination.value.limit}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      submissions.value = data.submissions
      pagination.value = data.pagination
      total.value = data.pagination.total
    } else {
      const errorData = await response.json()
      error.value = errorData.error || 'Failed to load submissions'
    }
  } catch (err) {
    console.error('Error loading submissions:', err)
    error.value = 'Network error. Please check your connection.'
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadSubmissions()
}

const viewSubmission = (submission: WellbeingSubmission) => {
  selectedSubmission.value = submission
}

const closeModal = () => {
  selectedSubmission.value = null
}

const deleteSubmission = async (id: number) => {
  if (!confirm('Are you sure you want to delete this wellbeing assessment? This action cannot be undone.')) {
    return
  }
  
  deletingId.value = id
  
  try {
    const response = await fetch(`/api/wellbeing-questionnaire/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      submissions.value = submissions.value.filter(s => s.id !== id)
      total.value -= 1
    } else {
      const errorData = await response.json()
      alert('Failed to delete submission: ' + errorData.error)
    }
  } catch (err) {
    console.error('Error deleting submission:', err)
    alert('Network error. Please check your connection.')
  } finally {
    deletingId.value = null
  }
}

const generateReport = async () => {
  generatingReport.value = true
  
  try {
    const year = selectedYear.value
    const month = selectedMonth.value
    
    const response = await fetch(`/api/wellbeing-questionnaire/report/${year}/${month}/pdf`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `wellbeing-report-${year}-${month.toString().padStart(2, '0')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } else {
      const errorData = await response.json()
      alert('Failed to generate report: ' + errorData.error)
    }
  } catch (err) {
    console.error('Error generating report:', err)
    alert('Network error. Please check your connection.')
  } finally {
    generatingReport.value = false
  }
}

const getScoreColor = (score: number) => {
  const percentage = (score / 30) * 100
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  if (percentage >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getScoreBarColor = (score: number) => {
  const percentage = (score / 30) * 100
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  if (percentage >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-GB')
}

onMounted(() => {
  loadSubmissions()
})
</script>