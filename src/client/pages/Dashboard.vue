<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Onwards Admin</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">Welcome {{ authStore.user?.username }}!</span>
            <button
              @click="logout"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-onwards-blue bg-opacity-10">
                <svg class="w-6 h-6 text-onwards-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Members</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalMembers }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">This Week's Attendance</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.weeklyAttendance }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">This Month</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.monthlyAttendance }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-yellow-100">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">New This Month</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.newMembers }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <router-link
                to="/attendance"
                class="block w-full text-left px-4 py-3 bg-onwards-blue text-white rounded hover:bg-blue-600 transition-colors"
              >
                Record Today's Attendance
              </router-link>
              <router-link
                to="/members"
                class="block w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                View All Members
              </router-link>
              <router-link
                to="/reports"
                class="block w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Generate Monthly Report
              </router-link>
              <router-link
                to="/admin"
                class="block w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Manage Admins
              </router-link>
              <router-link
                to="/forms"
                class="block w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Onwards Forms
              </router-link>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div class="space-y-3">
              <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center text-sm">
                <div class="w-2 h-2 bg-onwards-blue rounded-full mr-3"></div>
                <span class="text-gray-600">{{ activity.description }}</span>
                <span class="ml-auto text-gray-500">{{ formatDate(activity.date) }}</span>
              </div>
            </div>
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

const stats = ref({
  totalMembers: 0,
  weeklyAttendance: 0,
  monthlyAttendance: 0,
  newMembers: 0
})

const recentActivity = ref([
  { id: 1, description: 'New member registered: John Smith', date: new Date() },
  { id: 2, description: 'Attendance recorded for Friday session', date: new Date(Date.now() - 86400000) },
  { id: 3, description: 'Monthly report generated', date: new Date(Date.now() - 172800000) }
])

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const formatDate = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}

const loadStats = async () => {
  try {
    // Load member count
    const memberResponse = await fetch('/api/members?limit=1', {
      headers: authStore.getAuthHeaders()
    })
    if (memberResponse.ok) {
      const memberData = await memberResponse.json()
      stats.value.totalMembers = memberData.pagination.total
    }

    // Load attendance statistics
    const attendanceResponse = await fetch('/api/attendance/stats', {
      headers: authStore.getAuthHeaders()
    })
    if (attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json()
      stats.value.weeklyAttendance = attendanceData.weeklyAttendance
      stats.value.monthlyAttendance = attendanceData.monthlyAttendance
      stats.value.newMembers = attendanceData.newMembers
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(async () => {
  await authStore.verifyToken()
  loadStats()
})
</script>