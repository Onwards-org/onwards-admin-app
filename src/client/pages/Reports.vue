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
              <router-link to="/reports" class="text-white font-medium">Reports</router-link>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <div class="relative" ref="profileDropdown">
              <button
                @click="showProfileDropdown = !showProfileDropdown"
                class="flex items-center space-x-3 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
              >
                <img 
                  :src="defaultProfileSvg" 
                  :alt="`${authStore.user?.username}'s profile picture`"
                  class="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                />
                <span class="text-sm text-white">{{ authStore.user?.username }}</span>
                <svg 
                  class="w-4 h-4 text-white/70 transition-transform"
                  :class="{ 'rotate-180': showProfileDropdown }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Profile Dropdown Menu -->
              <div
                v-if="showProfileDropdown"
                class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200"
              >
                <div class="py-1">
                  <!-- User Info Header -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                      <img 
                        :src="defaultProfileSvg" 
                        :alt="`${authStore.user?.username}'s profile picture`"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ authStore.user?.username }}</p>
                        <p class="text-xs text-gray-500">Administrator</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Menu Items -->
                  <router-link
                    to="/admin"
                    @click="showProfileDropdown = false"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </router-link>
                  
                  <div class="border-t border-gray-100 my-1"></div>
                  
                  <button
                    @click="logout"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Generate Reports</h1>
          <p class="text-gray-600 mt-2">Select a form and time period to generate a comprehensive PDF report</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <div class="space-y-6">
            <!-- Form Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Select report to create <span class="text-red-500">*</span>
              </label>
              <select
                v-model="selectedForm"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                required
              >
                <option value="">Choose a form...</option>
                <option v-for="form in availableForms" :key="form.value" :value="form.value">
                  {{ form.label }}
                </option>
              </select>
            </div>

            <!-- Date Selection (only show when form is selected) -->
            <div v-if="selectedForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    v-model="selectedMonth"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  >
                    <option v-for="month in months" :key="month.value" :value="month.value">
                      {{ month.label }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    v-model="selectedYear"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-onwards-blue focus:border-onwards-blue"
                  >
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Generate Button -->
              <div class="flex justify-end">
                <button
                  @click="generateReport"
                  :disabled="loading || !selectedForm"
                  class="px-6 py-3 bg-onwards-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading ? 'Generating PDF...' : 'Generate PDF Report' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Success/Error Messages -->
          <div v-if="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {{ successMessage }}
          </div>

          <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import defaultProfileSvg from '@/assets/images/default-profile.svg'

const router = useRouter()
const authStore = useAuthStore()

const selectedForm = ref('')
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const showProfileDropdown = ref(false)
const profileDropdown = ref<HTMLElement | null>(null)

// Available forms that can generate PDF reports
const availableForms = [
  { value: 'member-registration', label: 'Demographic Data' },
  { value: 'ucla-loneliness-scale', label: 'UCLA Loneliness Scale' },
  { value: 'wellbeing-questionnaire', label: 'Wellbeing Index Questionnaire' }
]

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i)
  }
  return years
})

const logout = () => {
  showProfileDropdown.value = false
  authStore.logout()
  router.push('/login')
}

const generateReport = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    let endpoint = ''
    let filename = ''

    // Determine API endpoint based on selected form
    switch (selectedForm.value) {
      case 'member-registration':
        endpoint = `/api/attendance/report/${selectedYear.value}/${selectedMonth.value}/pdf`
        filename = `member-registration-report-${selectedYear.value}-${selectedMonth.value.toString().padStart(2, '0')}.pdf`
        break
      case 'ucla-loneliness-scale':
        endpoint = `/api/ucla-loneliness-scale/report/${selectedYear.value}/${selectedMonth.value}/pdf`
        filename = `ucla-loneliness-scale-report-${selectedYear.value}-${selectedMonth.value.toString().padStart(2, '0')}.pdf`
        break
      case 'wellbeing-questionnaire':
        endpoint = `/api/wellbeing-questionnaire/report/${selectedYear.value}/${selectedMonth.value}/pdf`
        filename = `wellbeing-report-${selectedYear.value}-${selectedMonth.value.toString().padStart(2, '0')}.pdf`
        break
      default:
        throw new Error('Please select a form to generate report for')
    }

    const response = await fetch(endpoint, {
      headers: authStore.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF report')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    successMessage.value = 'PDF report generated and downloaded successfully!'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate report'
  } finally {
    loading.value = false
  }
}
</script>