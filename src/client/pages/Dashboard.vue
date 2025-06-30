<template>
  <div class="min-h-screen" style="background-color: #eecbf5;">
    <AdminNavigation />

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Menu Column -->
          <div class="lg:col-span-1 flex flex-col">
            <div class="bg-white p-6 rounded-lg shadow flex-1 flex flex-col">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-medium text-gray-900">Menu</h3>
              </div>
              <div class="grid grid-cols-2 grid-rows-2 gap-3 flex-1">
                <!-- Force cache refresh -->
                <router-link
                  to="/attendance"
                  class="flex items-center justify-center w-full h-full text-white rounded hover:bg-purple-700 transition-colors text-xl font-medium" style="background-color: #a672b0;"
                >
                  Attendance
                </router-link>
                <router-link
                  to="/forms"
                  class="flex items-center justify-center w-full h-full border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xl font-medium"
                >
                  Onwards Forms
                </router-link>
                <router-link
                  to="/members"
                  class="flex items-center justify-center w-full h-full border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xl font-medium"
                >
                  View All Members
                </router-link>
                <router-link
                  to="/reports"
                  class="flex items-center justify-center w-full h-full border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xl font-medium"
                >
                  Generate Reports
                </router-link>
              </div>
            </div>
          </div>

          <!-- Stats Cards Column -->
          <div class="lg:col-span-1 flex flex-col">
            <div class="space-y-6 flex-1">
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
import AdminNavigation from '@/components/AdminNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()



const stats = ref({
  totalMembers: 0,
  weeklyAttendance: 0,
  monthlyAttendance: 0,
  newMembers: 0
})


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