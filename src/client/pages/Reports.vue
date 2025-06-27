<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/dashboard" class="text-xl font-semibold text-gray-900">
              Onwards Admin
            </router-link>
            <nav class="flex space-x-8">
              <router-link to="/dashboard" class="text-gray-500 hover:text-gray-700">Dashboard</router-link>
              <router-link to="/members" class="text-gray-500 hover:text-gray-700">Members</router-link>
              <router-link to="/attendance" class="text-gray-500 hover:text-gray-700">Attendance</router-link>
              <router-link to="/reports" class="text-onwards-blue font-medium">Reports</router-link>
              <router-link to="/admin" class="text-gray-500 hover:text-gray-700">Admin</router-link>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">{{ authStore.user?.username }}</span>
            <button @click="logout" class="text-sm text-gray-500 hover:text-gray-700">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Monthly Reports</h1>
          <p class="text-gray-600 mt-1">Generate demographic reports for funding authorities</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900">Generate Report</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            
            <div class="flex items-end">
              <button
                @click="generateReport"
                :disabled="loading"
                class="w-full px-4 py-2 bg-onwards-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {{ loading ? 'Generating...' : 'Generate Report' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="report" class="space-y-6">
          <!-- Report Header -->
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">
                Report for {{ getMonthName(selectedMonth) }} {{ selectedYear }}
              </h2>
              <button
                @click="downloadPDF"
                :disabled="downloading"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {{ downloading ? 'Downloading...' : 'Download PDF' }}
              </button>
            </div>
          </div>

          <!-- Statistics Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <!-- Gender Distribution -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Gender Distribution</h3>
              <div class="space-y-2">
                <div v-for="(count, gender) in report.stats.genders" :key="gender" class="flex justify-between">
                  <span class="text-gray-600">{{ gender }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Age Groups -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Age Groups</h3>
              <div class="space-y-2">
                <div v-for="(count, ageGroup) in report.stats.age_groups" :key="ageGroup" class="flex justify-between">
                  <span class="text-gray-600">{{ ageGroup }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Ethnicity -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Ethnicity</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div v-for="(count, ethnicity) in report.stats.ethnicities" :key="ethnicity" class="flex justify-between">
                  <span class="text-gray-600 text-sm">{{ ethnicity }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Employment Status -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Employment Status</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div v-for="(count, status) in report.stats.employment_status" :key="status" class="flex justify-between">
                  <span class="text-gray-600 text-sm">{{ status }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Sexual Orientation -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Sexual Orientation</h3>
              <div class="space-y-2">
                <div v-for="(count, orientation) in report.stats.sexual_orientations" :key="orientation" class="flex justify-between">
                  <span class="text-gray-600 text-sm">{{ orientation }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Medical Conditions -->
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Medical Conditions</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div v-for="(count, condition) in report.stats.disabilities" :key="condition" class="flex justify-between">
                  <span class="text-gray-600 text-sm">{{ condition }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Geographic Locations -->
          <div v-if="report.stats.locations && Object.keys(report.stats.locations).length > 0" class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Geographic Location</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(count, location) in report.stats.locations" :key="location" class="flex justify-between p-3 bg-gray-50 rounded">
                <span class="text-sm text-gray-700 font-medium">{{ location }}</span>
                <span class="font-semibold text-onwards-blue">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div v-if="!report && !loading && !error" class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          Select a month and year to generate a report.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const report = ref<any>(null)
const loading = ref(false)
const downloading = ref(false)
const error = ref('')

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
  authStore.logout()
  router.push('/login')
}

const getMonthName = (month: number) => {
  return months.find(m => m.value === month)?.label || ''
}

const generateReport = async () => {
  loading.value = true
  error.value = ''
  report.value = null

  try {
    const response = await fetch(`/api/attendance/report/${selectedYear.value}/${selectedMonth.value}`, {
      headers: authStore.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to generate report')
    }

    const data = await response.json()
    report.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

const downloadPDF = async () => {
  downloading.value = true

  try {
    const response = await fetch(`/api/attendance/report/${selectedYear.value}/${selectedMonth.value}/pdf`, {
      headers: authStore.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to download PDF')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `onwards-report-${selectedYear.value}-${selectedMonth.value.toString().padStart(2, '0')}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to download PDF'
  } finally {
    downloading.value = false
  }
}
</script>